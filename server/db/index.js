/**
 * PostgreSQL Database Connection Module
 * Uses connection pooling for efficient database connections
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
};

// Create connection pool
let pool = null;

/**
 * Initialize database connection pool
 */
export function initializePool() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Database features will be disabled.');
    return null;
  }

  pool = new Pool(dbConfig);

  pool.on('connect', () => {
    console.log('New client connected to PostgreSQL');
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });

  return pool;
}

/**
 * Get the database pool
 */
export function getPool() {
  if (!pool) {
    pool = initializePool();
  }
  return pool;
}

/**
 * Execute a query with parameters
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<QueryResult>}
 */
export async function query(text, params = []) {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database not configured');
  }

  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<PoolClient>}
 */
export async function getClient() {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database not configured');
  }
  return pool.connect();
}

/**
 * Execute a transaction
 * @param {Function} callback - Async function that receives the client
 * @returns {Promise<any>}
 */
export async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run database migrations
 */
export async function runMigrations() {
  const pool = getPool();
  if (!pool) {
    console.warn('Database not configured. Skipping migrations.');
    return;
  }

  const migrationsDir = path.join(__dirname, 'migrations');

  try {
    // Create migrations tracking table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get list of executed migrations
    const { rows: executedMigrations } = await query('SELECT name FROM _migrations');
    const executedSet = new Set(executedMigrations.map(m => m.name));

    // Get migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Run pending migrations
    for (const file of files) {
      if (!executedSet.has(file)) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

        await transaction(async (client) => {
          await client.query(sql);
          await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        });

        console.log(`Migration ${file} completed successfully`);
      }
    }

    console.log('All migrations completed');
  } catch (error) {
    console.error('Migration error:', error.message);
    throw error;
  }
}

/**
 * Check database connection
 */
export async function checkConnection() {
  const pool = getPool();
  if (!pool) {
    return { connected: false, error: 'Database not configured' };
  }

  try {
    const result = await query('SELECT NOW() as time, current_database() as database');
    return {
      connected: true,
      database: result.rows[0].database,
      serverTime: result.rows[0].time,
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

/**
 * Close database connections
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('PostgreSQL connection pool closed');
  }
}

// Default export for convenience
export default {
  initializePool,
  getPool,
  query,
  getClient,
  transaction,
  runMigrations,
  checkConnection,
  closePool,
};
