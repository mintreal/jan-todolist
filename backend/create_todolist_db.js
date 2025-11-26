const { Client } = require('pg');
require('dotenv').config();

async function createDatabaseAndSchema() {
  // Connect to the default postgres database first
  const defaultClient = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
  });

  try {
    await defaultClient.connect();
    console.log('✅ Connected to default postgres database');

    // Create the todolist database if it doesn't exist
    const dbExistsResult = await defaultClient.query(
      "SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'todolist'"
    );
    
    if (dbExistsResult.rowCount === 0) {
      await defaultClient.query('CREATE DATABASE todolist');
      console.log('✅ Created todolist database');
    } else {
      console.log('ℹ️  todolist database already exists');
    }

    // Connect to the newly created database to create tables
    const dbClient = new Client({
      connectionString: 'postgresql://postgres:postgres@localhost:5432/todolist'
    });

    try {
      await dbClient.connect();
      console.log('✅ Connected to todolist database');

      // Create users table
      await dbClient.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create todos table
      await dbClient.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(200) NOT NULL,
          is_completed BOOLEAN DEFAULT FALSE,
          due_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create indexes
      await dbClient.query(`
        CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
      `);
      
      await dbClient.query(`
        CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
      `);
      
      console.log('✅ Tables and indexes created successfully');

      // Add a trigger to update the updated_at column
      await dbClient.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      await dbClient.query(`
        CREATE TRIGGER update_todos_updated_at 
        BEFORE UPDATE ON todos 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
      `);

      console.log('✅ Trigger created successfully');
      
    } catch (dbError) {
      console.error('❌ Error with database operations:', dbError.message);
    } finally {
      await dbClient.end();
    }
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
  } finally {
    await defaultClient.end();
  }
}

createDatabaseAndSchema();