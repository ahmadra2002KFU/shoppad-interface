#!/bin/bash

###############################################################################
# Production Start Script
# Quick script to start the server in production mode
###############################################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Starting ShopPad Server in Production Mode${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${GREEN}Creating .env from .env.production template...${NC}"
    cp .env.production .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${GREEN}⚠ Please edit .env file with your domain and settings${NC}\n"
fi

# Stop existing PM2 process
echo -e "${GREEN}Stopping existing process...${NC}"
pm2 delete shoppad-server 2>/dev/null || true

# Start with PM2
echo -e "${GREEN}Starting server with PM2...${NC}"
pm2 start server.js --name shoppad-server --env production

# Save PM2 process list
pm2 save

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Server Started Successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Show status
pm2 status

echo -e "\n${BLUE}Useful commands:${NC}"
echo -e "  View logs:    ${GREEN}pm2 logs shoppad-server${NC}"
echo -e "  Restart:      ${GREEN}pm2 restart shoppad-server${NC}"
echo -e "  Stop:         ${GREEN}pm2 stop shoppad-server${NC}"
echo -e "  Monitor:      ${GREEN}pm2 monit${NC}"
echo -e "  Status:       ${GREEN}pm2 status${NC}\n"

