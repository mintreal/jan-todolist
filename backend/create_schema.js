const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function createSchema() {
  const connectionString = process.env.POSTGRES_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('POSTGRES_CONNECTION_STRING is not defined in .env');
    return;
  }

  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database!');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema_clean.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into statements and execute them
    // Note: This is a simple approach, in production you might want a more robust SQL parser
    const statements = schemaSQL
      .split(/;(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/) // Split on semicolons that are not within quotes
      .filter(stmt => stmt.trim() !== '')
      .map(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement && !statement.startsWith('--')) {
        // Skip the DROP statements since this is for initial setup
        if (!statement.includes('DROP TABLE') || statement.includes('-- DROP TABLE')) {
          try {
            // For the CREATE DATABASE statement, we need a different connection
            if (statement.includes('CREATE DATABASE')) {
              console.log('ℹ️  Skipping CREATE DATABASE statement (would require separate connection)');
              continue;
            }
            
            await client.query(statement);
            console.log(`✅ Executed: ${statement.substring(0, 60)}${statement.length > 60 ? '...' : ''}`);
          } catch (err) {
            // Some statements might fail if they already exist (like functions/triggers), which is OK
            if (err.message.includes('already exists') || err.message.includes('already exists')) {
              console.log(`ℹ️  Skipped (already exists): ${statement.substring(0, 60)}...`);
            } else {
              console.log(`⚠️  Could not execute: ${statement.substring(0, 60)}... - ${err.message}`);
            }
          }
        }
      }
    }
    
    console.log('✅ Schema creation completed!');
    
    // Verify that our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'todos')
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Found created tables:', tablesResult.rows.map(row => row.table_name));
    } else {
      console.log('ℹ️  Tables "users" and "todos" may not have been created');
    }

  } catch (err) {
    console.error('❌ Error creating schema:', err.message);
  } finally {
    await client.end();
  }
}

createSchema();