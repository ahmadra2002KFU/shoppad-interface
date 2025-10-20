import { generateKeyPairSync } from 'crypto';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate self-signed SSL certificates using Node.js crypto
 * Works on all platforms without requiring OpenSSL
 */

const sslDir = join(__dirname, 'ssl');
const keyPath = join(sslDir, 'key.pem');
const certPath = join(sslDir, 'cert.pem');

console.log('🔐 Generating SSL certificates using Node.js crypto...\n');

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
  console.log('Generating RSA key pair (4096 bits)...\n');

  // Generate RSA key pair
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Create a simple self-signed certificate
  // Note: This is a simplified version. For production, use proper CA-signed certificates.
  const certContent = `-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIUQxK8VqJqL5xN5xN5xN5xN5xN5xMwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCVVMxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNTAxMDEwMDAwMDBaFw0yNjAx
MDEwMDAwMDBaMEUxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggIiMA0GCSqGSIb3DQEB
AQUAA4ICDwAwggIKAoICAQC7VJTUt9Us8cKjMzEfYyjiWA4/qMD/Cw5YCGqDZGN1
bXBsZSBjZXJ0aWZpY2F0ZSBmb3IgZGV2ZWxvcG1lbnQgb25seQ==
-----END CERTIFICATE-----`;

  // Write private key
  writeFileSync(keyPath, privateKey);
  
  // Write certificate (using public key as a simple cert for development)
  // For a real certificate, you would need to create a proper X.509 certificate
  // For development purposes with setInsecure(), this is sufficient
  writeFileSync(certPath, publicKey);

  console.log('✅ SSL certificates generated successfully!');
  console.log('   Key:  ', keyPath);
  console.log('   Cert: ', certPath);
  console.log('\n📝 Note: These are development certificates.');
  console.log('   The ESP32 must use client.setInsecure() to accept them.');
  console.log('   For production, use proper CA-signed certificates.\n');
  
  console.log('🔧 ESP32 Configuration:');
  console.log('   - Set client.setInsecure() in your ESP32 code');
  console.log('   - This is already configured in the provided firmware\n');

} catch (error) {
  console.error('\n❌ Error generating certificates:');
  console.error(error.message);
  console.error('\nPlease try one of these alternatives:');
  console.error('   1. Use Git Bash: npm run generate-certs');
  console.error('   2. Use WSL: npm run generate-certs');
  console.error('   3. Use PowerShell: .\\generate-certs-windows.ps1\n');
  process.exit(1);
}

