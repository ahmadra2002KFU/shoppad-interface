import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate self-signed SSL certificates for local development
 * Production environments should use proper CA-signed certificates
 */

const sslDir = join(__dirname, 'ssl');
const keyPath = join(sslDir, 'key.pem');
const certPath = join(sslDir, 'cert.pem');

console.log('🔐 Generating SSL certificates for HTTPS server...\n');

// Create ssl directory if it doesn't exist
if (!existsSync(sslDir)) {
  mkdirSync(sslDir, { recursive: true });
  console.log('✅ Created ssl directory');
}

// Check if certificates already exist
if (existsSync(keyPath) && existsSync(certPath)) {
  console.log('⚠️  SSL certificates already exist!');
  console.log('   Key:  ', keyPath);
  console.log('   Cert: ', certPath);
  console.log('\nTo regenerate, delete the existing files and run this script again.\n');
  process.exit(0);
}

try {
  // Generate private key and certificate
  const command = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=ShopPad/OU=Development/CN=localhost"`;
  
  console.log('Generating certificates (this may take a moment)...\n');
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ SSL certificates generated successfully!');
  console.log('   Key:  ', keyPath);
  console.log('   Cert: ', certPath);
  console.log('\n📝 Note: These are self-signed certificates for development only.');
  console.log('   For production, use certificates from a trusted CA.\n');
  
  console.log('🔧 ESP32 Configuration:');
  console.log('   - Set client.setInsecure() for development');
  console.log('   - Or use certificate fingerprint for better security\n');
  
} catch (error) {
  console.error('\n❌ Error generating certificates:');
  
  if (error.message.includes('openssl')) {
    console.error('\n⚠️  OpenSSL is not installed or not in PATH.');
    console.error('\nWindows users:');
    console.error('   1. Download OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html');
    console.error('   2. Install and add to PATH');
    console.error('   3. Or use Git Bash which includes OpenSSL\n');
    console.error('Alternative: Use the manual certificate generation below:\n');
    
    console.log('Manual steps using Git Bash or WSL:');
    console.log('1. Open Git Bash or WSL terminal');
    console.log('2. Navigate to the server directory');
    console.log('3. Run:');
    console.log(`   mkdir -p ssl`);
    console.log(`   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=ShopPad/OU=Development/CN=localhost"`);
  } else {
    console.error(error.message);
  }
  
  process.exit(1);
}

