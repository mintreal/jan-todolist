const { pool } = require('../src/config/database');

/**
 * Execute a database query
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Result of the query execution
 */
const executeQuery = async (query, params = []) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(query, params);
    
    return {
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields
    };
  } catch (err) {
    console.error('Query execution failed:', err.message);
    return {
      success: false,
      error: err.message
    };
  } finally {
    client.release();
  }
};

/**
 * Execute a SELECT query
 * @param {string} query - SELECT SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Result of the SELECT query
 */
const selectQuery = async (query, params = []) => {
  if (!query.toUpperCase().trim().startsWith('SELECT')) {
    return {
      success: false,
      error: 'This function only supports SELECT queries'
    };
  }
  
  return await executeQuery(query, params);
};

/**
 * Execute an INSERT query
 * @param {string} query - INSERT SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Result of the INSERT query
 */
const insertQuery = async (query, params = []) => {
  if (!query.toUpperCase().trim().startsWith('INSERT')) {
    return {
      success: false,
      error: 'This function only supports INSERT queries'
    };
  }
  
  return await executeQuery(query, params);
};

/**
 * Execute an UPDATE query
 * @param {string} query - UPDATE SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Result of the UPDATE query
 */
const updateQuery = async (query, params = []) => {
  if (!query.toUpperCase().trim().startsWith('UPDATE')) {
    return {
      success: false,
      error: 'This function only supports UPDATE queries'
    };
  }
  
  return await executeQuery(query, params);
};

/**
 * Execute a DELETE query
 * @param {string} query - DELETE SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Result of the DELETE query
 */
const deleteQuery = async (query, params = []) => {
  if (!query.toUpperCase().trim().startsWith('DELETE')) {
    return {
      success: false,
      error: 'This function only supports DELETE queries'
    };
  }
  
  return await executeQuery(query, params);
};

/**
 * Execute a raw query without checking the type
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Result of the query execution
 */
const rawQuery = async (query, params = []) => {
  return await executeQuery(query, params);
};

module.exports = {
  selectQuery,
  insertQuery,
  updateQuery,
  deleteQuery,
  rawQuery
};