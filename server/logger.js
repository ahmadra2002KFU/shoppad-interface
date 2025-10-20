import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Production-ready logging system with file rotation and retention
 */
class Logger {
  constructor(config) {
    this.logDir = config.logging.directory;
    this.dataFile = config.data.file;
    this.maxEntries = config.data.maxEntries;
    this.retentionDays = config.logging.retentionDays;
    
    this.ensureDirectories();
    this.cleanOldLogs();
  }

  /**
   * Ensure log and data directories exist
   */
  ensureDirectories() {
    const dirs = [
      this.logDir,
      path.dirname(this.dataFile),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get current date string for log files
   */
  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Get current timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Write to daily log file
   */
  writeLog(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const dateStr = this.getDateString();
    const logFile = path.join(this.logDir, `${dateStr}.log`);

    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Log info message
   */
  info(message, data = null) {
    this.writeLog('INFO', message, data);
    console.log(`[INFO] ${message}`, data || '');
  }

  /**
   * Log error message
   */
  error(message, data = null) {
    this.writeLog('ERROR', message, data);
    console.error(`[ERROR] ${message}`, data || '');
  }

  /**
   * Log warning message
   */
  warn(message, data = null) {
    this.writeLog('WARN', message, data);
    console.warn(`[WARN] ${message}`, data || '');
  }

  /**
   * Log debug message (only in development)
   */
  debug(message, data = null) {
    if (process.env.NODE_ENV !== 'production') {
      this.writeLog('DEBUG', message, data);
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Save weight data to persistent storage
   */
  saveWeightData(weightData) {
    try {
      let data = [];
      
      // Read existing data
      if (fs.existsSync(this.dataFile)) {
        const fileContent = fs.readFileSync(this.dataFile, 'utf8');
        if (fileContent.trim()) {
          data = JSON.parse(fileContent);
        }
      }

      // Add new entry
      data.push({
        timestamp: this.getTimestamp(),
        weight: weightData.weight,
        deviceId: weightData.deviceId || 'unknown',
      });

      // Trim to max entries (keep most recent)
      if (data.length > this.maxEntries) {
        data = data.slice(-this.maxEntries);
      }

      // Write back to file
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
      
      this.debug('Weight data saved', { weight: weightData.weight });
      return true;
    } catch (error) {
      this.error('Failed to save weight data', { error: error.message });
      return false;
    }
  }

  /**
   * Get recent weight data
   */
  getRecentData(limit = 100) {
    try {
      if (!fs.existsSync(this.dataFile)) {
        return [];
      }

      const fileContent = fs.readFileSync(this.dataFile, 'utf8');
      if (!fileContent.trim()) {
        return [];
      }

      const data = JSON.parse(fileContent);
      return data.slice(-limit);
    } catch (error) {
      this.error('Failed to read weight data', { error: error.message });
      return [];
    }
  }

  /**
   * Get statistics from weight data
   */
  getStats() {
    try {
      const data = this.getRecentData(1000);
      
      if (data.length === 0) {
        return {
          count: 0,
          min: 0,
          max: 0,
          average: 0,
          latest: null,
        };
      }

      const weights = data.map(d => d.weight);
      const sum = weights.reduce((a, b) => a + b, 0);

      return {
        count: data.length,
        min: Math.min(...weights),
        max: Math.max(...weights),
        average: sum / weights.length,
        latest: data[data.length - 1],
      };
    } catch (error) {
      this.error('Failed to calculate stats', { error: error.message });
      return null;
    }
  }

  /**
   * Clean old log files based on retention policy
   */
  cleanOldLogs() {
    try {
      if (!fs.existsSync(this.logDir)) {
        return;
      }

      const files = fs.readdirSync(this.logDir);
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - (this.retentionDays * 24 * 60 * 60 * 1000));

      files.forEach(file => {
        if (!file.endsWith('.log')) return;

        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }

  /**
   * Get log files list
   */
  getLogFiles() {
    try {
      if (!fs.existsSync(this.logDir)) {
        return [];
      }

      return fs.readdirSync(this.logDir)
        .filter(file => file.endsWith('.log'))
        .sort()
        .reverse();
    } catch (error) {
      this.error('Failed to list log files', { error: error.message });
      return [];
    }
  }

  /**
   * Read specific log file
   */
  readLogFile(filename) {
    try {
      const filePath = path.join(this.logDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      this.error('Failed to read log file', { error: error.message, filename });
      return null;
    }
  }
}

export default Logger;

