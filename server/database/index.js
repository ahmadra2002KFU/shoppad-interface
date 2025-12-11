/**
 * Database Connection Module
 * SQLite database using better-sqlite3
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseConnection {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize the database connection and schema
   */
  init() {
    if (this.initialized) {
      return this;
    }

    const dbPath = process.env.DATABASE_PATH ||
      path.join(__dirname, '..', 'data', 'shoppad.db');

    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    console.log(`[Database] Connecting to: ${dbPath}`);

    // Create database connection
    this.db = new Database(dbPath);

    // Enable WAL mode for better concurrent access
    this.db.pragma('journal_mode = WAL');

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Initialize schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    this.db.exec(schema);

    // Run migrations for existing databases
    this.runMigrations();

    this.initialized = true;
    console.log('[Database] Initialized successfully');

    return this;
  }

  /**
   * Run database migrations for existing databases
   */
  runMigrations() {
    try {
      // Check if nfc_uid column exists in users table
      const columns = this.db.pragma('table_info(users)');
      const hasNfcUid = columns.some(col => col.name === 'nfc_uid');

      if (!hasNfcUid) {
        console.log('[Database] Running migration: Adding nfc_uid column to users table');
        this.db.exec('ALTER TABLE users ADD COLUMN nfc_uid TEXT UNIQUE');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_nfc_uid ON users(nfc_uid)');
        console.log('[Database] Migration completed: nfc_uid column added');
      }
    } catch (error) {
      console.error('[Database] Migration error:', error.message);
      // Don't throw - migrations should be non-blocking
    }
  }

  /**
   * Get the database instance
   */
  get() {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  /**
   * Close the database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      console.log('[Database] Connection closed');
    }
  }

  /**
   * Run a transaction with multiple statements
   */
  transaction(fn) {
    return this.db.transaction(fn)();
  }

  /**
   * Check if database is initialized
   */
  isInitialized() {
    return this.initialized;
  }
}

// Export singleton instance
const db = new DatabaseConnection();
export default db;
