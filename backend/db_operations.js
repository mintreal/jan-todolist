#!/usr/bin/env node

const path = require('path');
const { selectQuery, insertQuery, updateQuery, deleteQuery, rawQuery } = require('./utils/db_operations');

/**
 * Show usage information
 */
const showUsage = () => {
  console.log(`
Usage: node db_operations.js [operation] [parameters]

Operations:
  select    Execute a SELECT query
  insert    Execute an INSERT query  
  update    Execute an UPDATE query
  delete    Execute a DELETE query
  raw       Execute any raw SQL query

Examples:
  node db_operations.js select "SELECT * FROM users;"
  node db_operations.js insert "INSERT INTO users (email, password, name) VALUES ($1, $2, $3);" "test@example.com" "hashed_password" "Test User"
  node db_operations.js update "UPDATE users SET name = $1 WHERE id = $2;" "New Name" "1"
  node db_operations.js delete "DELETE FROM users WHERE id = $1;" "1"
  node db_operations.js raw "CREATE INDEX idx_test ON todos(due_date);"
  `);
};

/**
 * Main function to handle command line operations
 */
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    showUsage();
    process.exit(1);
  }
  
  const operation = args[0].toLowerCase();
  const query = args[1];
  const params = args.slice(2); // All remaining arguments are parameters
  
  let result;
  
  switch (operation) {
    case 'select':
      result = await selectQuery(query, params);
      break;
    case 'insert':
      result = await insertQuery(query, params);
      break;
    case 'update':
      result = await updateQuery(query, params);
      break;
    case 'delete':
      result = await deleteQuery(query, params);
      break;
    case 'raw':
      result = await rawQuery(query, params);
      break;
    default:
      console.error(`Unknown operation: ${operation}`);
      showUsage();
      process.exit(1);
  }
  
  if (result.success) {
    console.log('Query executed successfully!');
    if (result.rows && result.rows.length > 0) {
      console.log('Results:');
      console.table(result.rows);
    } else if (result.rowCount !== undefined) {
      console.log(`Rows affected: ${result.rowCount}`);
    }
  } else {
    console.error('Error executing query:', result.error);
  }
  
  // Close the connection pool before exiting
  const { pool } = require('./src/config/database');
  await pool.end();
};

// Run the main function
main().catch(err => {
  console.error('An error occurred:', err);
  process.exit(1);
});