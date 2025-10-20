import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Utility to view recent weight data logs
 */

const dataFile = path.join(__dirname, 'data', 'weight-data.json');

console.log('📊 Weight Data Viewer\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

try {
  if (!fs.existsSync(dataFile)) {
    console.log('⚠️  No data file found. The server hasn\'t received any data yet.\n');
    process.exit(0);
  }

  const fileContent = fs.readFileSync(dataFile, 'utf8');
  
  if (!fileContent.trim()) {
    console.log('⚠️  Data file is empty.\n');
    process.exit(0);
  }

  const data = JSON.parse(fileContent);
  
  if (data.length === 0) {
    console.log('⚠️  No weight readings found.\n');
    process.exit(0);
  }

  // Get limit from command line args
  const limit = parseInt(process.argv[2]) || 20;
  const recentData = data.slice(-limit);

  console.log(`Showing last ${recentData.length} readings:\n`);

  // Display data in table format
  console.log('┌─────┬─────────────────────────┬───────────┬──────────────┐');
  console.log('│ No. │ Timestamp               │ Weight    │ Device ID    │');
  console.log('├─────┼─────────────────────────┼───────────┼──────────────┤');

  recentData.forEach((entry, index) => {
    const num = String(index + 1).padEnd(3);
    const timestamp = new Date(entry.timestamp).toLocaleString().padEnd(23);
    const weight = `${entry.weight.toFixed(2)} kg`.padEnd(9);
    const deviceId = (entry.deviceId || 'unknown').padEnd(12);
    
    console.log(`│ ${num} │ ${timestamp} │ ${weight} │ ${deviceId} │`);
  });

  console.log('└─────┴─────────────────────────┴───────────┴──────────────┘\n');

  // Calculate statistics
  const weights = recentData.map(d => d.weight);
  const sum = weights.reduce((a, b) => a + b, 0);
  const avg = sum / weights.length;
  const min = Math.min(...weights);
  const max = Math.max(...weights);

  console.log('📈 Statistics:');
  console.log(`   Total readings: ${data.length}`);
  console.log(`   Average weight: ${avg.toFixed(2)} kg`);
  console.log(`   Minimum weight: ${min.toFixed(2)} kg`);
  console.log(`   Maximum weight: ${max.toFixed(2)} kg`);
  console.log(`   Latest reading: ${recentData[recentData.length - 1].weight.toFixed(2)} kg`);
  console.log();

} catch (error) {
  console.error('❌ Error reading data:', error.message);
  process.exit(1);
}

