import { sql } from '@vercel/postgres';

/**
 * Execute a query and return all rows
 * @param {string} text - SQL query with $1, $2, etc. placeholders
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} - Array of row objects
 */
export async function query(text, params = []) {
  try {
    const result = await sql.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a query and return first row only
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} - Single row object or null
 */
export async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}

/**
 * Execute a query without returning rows (INSERT, UPDATE, DELETE)
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result with rowCount
 */
export async function execute(text, params = []) {
  try {
    const result = await sql.query(text, params);
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

/**
 * Generate a UUID v4
 * @returns {string} - UUID string
 */
export function generateId() {
  return crypto.randomUUID();
}
