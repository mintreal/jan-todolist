const { executeQuery } = require('./db_query');

/**
 * Test script to verify database connection and basic operations
 */
async function testDatabaseOperations() {
  console.log('Testing database operations...\n');
  
  // Test 1: Check if connection works
  console.log('1. Testing basic connection and querying users table...');
  const usersResult = await executeQuery('SELECT * FROM users LIMIT 5;');
  
  if (usersResult.success) {
    console.log('✅ Users query successful');
    if (usersResult.rows.length > 0) {
      console.log('Sample users:');
      console.table(usersResult.rows);
    } else {
      console.log('ℹ️  No users found in the database');
    }
  } else {
    console.log('❌ Users query failed:', usersResult.error);
  }
  
  console.log('\n2. Testing basic querying on todos table...');
  const todosResult = await executeQuery('SELECT * FROM todos LIMIT 5;');
  
  if (todosResult.success) {
    console.log('✅ Todos query successful');
    if (todosResult.rows.length > 0) {
      console.log('Sample todos:');
      console.table(todosResult.rows);
    } else {
      console.log('ℹ️  No todos found in the database');
    }
  } else {
    console.log('❌ Todos query failed:', todosResult.error);
  }
  
  console.log('\n3. Testing INSERT operation...');
  // First check if test user already exists
  const testUserResult = await executeQuery("SELECT id FROM users WHERE email = 'test@example-db-ops@test.com';");
  
  let userId;
  if (testUserResult.success && testUserResult.rows.length > 0) {
    userId = testUserResult.rows[0].id;
    console.log('ℹ️  Using existing test user with ID:', userId);
  } else {
    // Create a test user
    const insertUserResult = await executeQuery(
      "INSERT INTO users (email, password, name) VALUES ('test@example-db-ops@test.com', 'hashed_password', 'Test User for DB Ops') RETURNING id;"
    );
    
    if (insertUserResult.success && insertUserResult.rows.length > 0) {
      userId = insertUserResult.rows[0].id;
      console.log('✅ Test user created with ID:', userId);
    } else {
      console.log('❌ Failed to create test user:', insertUserResult.error);
      return;
    }
  }
  
  // Test inserting a todo for the test user
  const insertTodoResult = await executeQuery(
    'INSERT INTO todos (user_id, title, due_date) VALUES ($1, $2, $3) RETURNING *;',
    [userId, 'Test todo from db_operations test', '2025-12-31']
  );
  
  if (insertTodoResult.success) {
    console.log('✅ Test todo inserted successfully');
  } else {
    console.log('❌ Failed to insert test todo:', insertTodoResult.error);
  }
  
  console.log('\n4. Testing UPDATE operation...');
  // Update the inserted todo
  if (insertTodoResult.success && insertTodoResult.rows.length > 0) {
    const todoId = insertTodoResult.rows[0].id;
    const updateResult = await executeQuery(
      'UPDATE todos SET is_completed = true WHERE id = $1 RETURNING *;',
      [todoId]
    );
    
    if (updateResult.success) {
      console.log('✅ Test todo updated successfully');
    } else {
      console.log('❌ Failed to update test todo:', updateResult.error);
    }
  }
  
  // Clean up: remove the test todo (but keep the user for future tests)
  if (insertTodoResult.success && insertTodoResult.rows.length > 0) {
    const todoId = insertTodoResult.rows[0].id;
    const deleteResult = await executeQuery(
      'DELETE FROM todos WHERE id = $1;',
      [todoId]
    );
    
    if (deleteResult.success) {
      console.log('✅ Test todo cleaned up successfully');
    } else {
      console.log('❌ Failed to clean up test todo:', deleteResult.error);
    }
  }
  
  console.log('\n✅ Database operations test completed!');
}

// Run the test
testDatabaseOperations().catch(console.error).finally(() => {
  const { pool } = require('./src/config/database');
  pool.end();
});