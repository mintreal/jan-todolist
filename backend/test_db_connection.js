const { pool, testConnection } = require('./src/config/database');

async function testConnectionWithPool() {
  console.log('Testing database connection with pool...');
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Successfully connected to PostgreSQL database using pool!');
    
    // Check if our tables exist
    try {
      const tablesResult = await pool.query(`
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
      console.error('❌ Error checking tables:', err.message);
    }
  } else {
    console.log('❌ Failed to connect to database');
  }
  
  // 연결 풀 종료
  await pool.end();
}

testConnectionWithPool();