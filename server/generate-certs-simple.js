import selfsigned from 'selfsigned';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate self-signed SSL certificates using selfsigned package
 * Works cross-platform without requiring OpenSSL
 */

const sslDir = join(__dirname, 'ssl');
const keyPath = join(sslDir, 'key.pem');
const certPath = join(sslDir, 'cert.pem');

console.log('🔐 Generating SSL certificates (cross-platform method)...\n');

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
  console.log('Generating self-signed certificate...\n');

  // Certificate attributes
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'US' },
    { shortName: 'ST', value: 'State' },
    { name: 'localityName', value: 'City' },
    { name: 'organizationName', value: 'ShopPad' },
    { shortName: 'OU', value: 'Development' }
  ];

  // Certificate options
  const options = {
    keySize: 4096,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 2, // DNS
            value: 'localhost'
          },
          {
            type: 7, // IP
            ip: '127.0.0.1'
          }
        ]
      }
    ]
  };

  // Generate certificate
  const pems = selfsigned.generate(attrs, options);

  // Write files
  writeFileSync(keyPath, pems.private);
  writeFileSync(certPath, pems.cert);

  console.log('✅ SSL certificates generated successfully!');
  console.log('   Key:  ', keyPath);
  console.log('   Cert: ', certPath);
  console.log('\n📝 Note: These are self-signed certificates for development only.');
  console.log('   For production, use certificates from a trusted CA.\n');
  
  console.log('🔧 ESP32 Configuration:');
  console.log('   - Set client.setInsecure() for development');
  console.log('   - Or use certificate fingerprint for better security\n');

} catch (error) {
  console.error('\n❌ Error generating certificates:');
  console.error(error.message);
  console.error('\nPlease install dependencies first:');
  console.error('   npm install\n');
  process.exit(1);
}

