#!/bin/bash

###############################################################################
# ShopPad Server Deployment Script for DigitalOcean
# This script automates the deployment process on a fresh Ubuntu server
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    print_info "Run as regular user with sudo privileges"
    exit 1
fi

print_header "ShopPad Server Deployment"

# Step 1: Update system
print_header "Step 1: Updating System"
sudo apt update
sudo apt upgrade -y
print_success "System updated"

# Step 2: Install Node.js
print_header "Step 2: Installing Node.js 18.x"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_warning "Node.js already installed: $NODE_VERSION"
    read -p "Do you want to reinstall? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
else
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi
print_success "Node.js installed: $(node --version)"
print_success "npm installed: $(npm --version)"

# Step 3: Install Git
print_header "Step 3: Installing Git"
if command -v git &> /dev/null; then
    print_warning "Git already installed: $(git --version)"
else
    sudo apt install -y git
    print_success "Git installed"
fi

# Step 4: Install PM2
print_header "Step 4: Installing PM2"
if command -v pm2 &> /dev/null; then
    print_warning "PM2 already installed: $(pm2 --version)"
else
    sudo npm install -g pm2
    print_success "PM2 installed"
fi

# Step 5: Install Nginx
print_header "Step 5: Installing Nginx"
if command -v nginx &> /dev/null; then
    print_warning "Nginx already installed"
else
    sudo apt install -y nginx
    print_success "Nginx installed"
fi

# Step 6: Install Certbot
print_header "Step 6: Installing Certbot"
if command -v certbot &> /dev/null; then
    print_warning "Certbot already installed"
else
    sudo apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
fi

# Step 7: Clone repository (if not already cloned)
print_header "Step 7: Setting Up Application"
if [ -d "$HOME/shoppad-interface" ]; then
    print_warning "Repository already exists"
    read -p "Do you want to pull latest changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd $HOME/shoppad-interface
        git pull origin main
        print_success "Repository updated"
    fi
else
    print_info "Cloning repository..."
    cd $HOME
    git clone https://github.com/ahmadra2002KFU/shoppad-interface.git
    print_success "Repository cloned"
fi

# Step 8: Install dependencies
print_header "Step 8: Installing Dependencies"
cd $HOME/shoppad-interface/server
npm install
print_success "Dependencies installed"

# Step 9: Configure environment
print_header "Step 9: Configuring Environment"
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cat > .env << EOF
NODE_ENV=production
PORT=5050
ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=info
MAX_LOG_SIZE=10485760
LOG_RETENTION_DAYS=30
EOF
    print_success ".env file created"
    print_warning "Please edit .env file with your domain name"
else
    print_warning ".env file already exists"
fi

# Step 10: Generate SSL certificates (self-signed for testing)
print_header "Step 10: Generating SSL Certificates"
if [ ! -d "ssl" ]; then
    npm run generate-certs
    print_success "SSL certificates generated"
else
    print_warning "SSL certificates already exist"
fi

# Step 11: Configure firewall
print_header "Step 11: Configuring Firewall"
print_info "Setting up UFW firewall..."
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5050/tcp
print_success "Firewall configured"

# Step 12: Start application with PM2
print_header "Step 12: Starting Application"
pm2 delete shoppad-server 2>/dev/null || true
pm2 start server.js --name shoppad-server
pm2 save
print_success "Application started with PM2"

# Step 13: Configure PM2 startup
print_header "Step 13: Configuring PM2 Startup"
pm2 startup | grep "sudo" | bash
print_success "PM2 startup configured"

# Final status
print_header "Deployment Complete!"
print_success "Server is running on port 5050"
print_info "PM2 Status:"
pm2 status

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Next Steps:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}1.${NC} Edit .env file with your domain: ${BLUE}nano ~/shoppad-interface/server/.env${NC}"
echo -e "${YELLOW}2.${NC} Configure Nginx (if using domain): ${BLUE}sudo nano /etc/nginx/sites-available/shoppad${NC}"
echo -e "${YELLOW}3.${NC} Get SSL certificate: ${BLUE}sudo certbot --nginx -d yourdomain.com${NC}"
echo -e "${YELLOW}4.${NC} Test server: ${BLUE}curl https://localhost:5050/status${NC}"
echo -e "${YELLOW}5.${NC} View logs: ${BLUE}pm2 logs shoppad-server${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

