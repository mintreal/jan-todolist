const { pool } = require('./src/config/database');

/**
 * Execute a database query
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Result of the query execution
 */
const executeQuery = async (query, params = []) => {
  const client = await pool.connect();
  
  try {
    console.log('Executing query:', query);
    if (params.length > 0) {
      console.log('Parameters:', params);
    }
    
    const result = await client.query(query, params);
    
    console.log('Query executed successfully');
    console.log('Rows affected:', result.rowCount);
    
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
 * Execute a simple query from command line arguments
 */
const executeSimpleQuery = async () => {
  // Get the SQL query from command line arguments
  const query = process.argv[2];
  
  if (!query) {
    console.log('Usage: node db_query.js "SQL_QUERY_HERE"');
    console.log('Example: node db_query.js "SELECT * FROM users;"');
    process.exit(1);
  }
  
  console.log('Executing query:', query);
  const result = await executeQuery(query);
  
  if (result.success) {
    console.log('Results:');
    console.table(result.rows);
  } else {
    console.error('Error executing query:', result.error);
  }
  
  // Close the connection pool before exiting
  await pool.end();
};

// If this file is run directly, execute the query from command line arguments
if (require.main === module) {
  executeSimpleQuery();
}

module.exports = {
  executeQuery
};