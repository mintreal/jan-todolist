const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
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
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query executed successfully:', result.rows[0]);
    
    // Check if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'todos')
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Found tables:', tablesResult.rows.map(row => row.table_name));
    } else {
      console.log('ℹ️  Tables "users" and "todos" not found in the database');
    }

  } catch (err) {
    console.error('❌ Error connecting to PostgreSQL database:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();