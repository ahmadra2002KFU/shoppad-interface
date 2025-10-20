import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Utility to clean old log files
 */

const logsDir = path.join(__dirname, 'logs');
const dataFile = path.join(__dirname, 'data', 'weight-data.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🧹 Log Cleanup Utility\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function cleanLogs() {
  try {
    let totalDeleted = 0;

    // Clean log files
    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.log'));
      
      if (files.length > 0) {
        console.log(`Found ${files.length} log file(s):\n`);
        files.forEach(file => console.log(`   - ${file}`));
        console.log();

        const answer = await question('Delete all log files? (yes/no): ');
        
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          files.forEach(file => {
            fs.unlinkSync(path.join(logsDir, file));
            totalDeleted++;
          });
          console.log(`✅ Deleted ${totalDeleted} log file(s)\n`);
        } else {
          console.log('❌ Cancelled\n');
        }
      } else {
        console.log('No log files found.\n');
      }
    }

    // Clean weight data
    if (fs.existsSync(dataFile)) {
      const fileContent = fs.readFileSync(dataFile, 'utf8');
      if (fileContent.trim()) {
        const data = JSON.parse(fileContent);
        console.log(`Found ${data.length} weight reading(s) in data file.\n`);

        const answer = await question('Delete all weight data? (yes/no): ');
        
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          fs.writeFileSync(dataFile, '[]');
          console.log('✅ Weight data cleared\n');
        } else {
          console.log('❌ Cancelled\n');
        }
      } else {
        console.log('Weight data file is already empty.\n');
      }
    } else {
      console.log('No weight data file found.\n');
    }

    console.log('✅ Cleanup complete!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  } finally {
    rl.close();
  }
}

cleanLogs();

