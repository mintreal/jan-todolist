const { Client } = require('pg');
require('dotenv').config();

async function createSchemaStepByStep() {
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

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create todos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(200) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        -- Foreign key constraint
        CONSTRAINT fk_todos_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);
    console.log('✅ Todos table created');

    // Create indexes
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);');
      console.log('✅ Index idx_todos_user_id created');
    } catch (e) {
      console.log('ℹ️  Index idx_todos_user_id may already exist');
    }

    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);');
      console.log('✅ Index idx_todos_due_date created');
    } catch (e) {
      console.log('ℹ️  Index idx_todos_due_date may already exist');
    }

    // Create function for automatic updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Update function created');

    // Create trigger for automatic updated_at
    try {
      await client.query(`
        DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
      `);
    } catch (e) {
      // If trigger doesn't exist, it's fine
    }

    await client.query(`
      CREATE TRIGGER update_todos_updated_at
        BEFORE UPDATE ON todos
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Update trigger created');

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
      console.log('❌ Tables "users" and "todos" were not created');
    }

  } catch (err) {
    console.error('❌ Error creating schema:', err.message);
  } finally {
    await client.end();
  }
}

createSchemaStepByStep();