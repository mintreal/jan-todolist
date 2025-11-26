const { Client } = require('pg');
require('dotenv').config();
const bcrypt = require('bcrypt');

async function insertSampleData() {
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

    // Hash passwords for test users
    const password1 = await bcrypt.hash('password123', 10); // bcrypt hash for first user
    const password2 = await bcrypt.hash('password123', 10); // bcrypt hash for second user

    // Insert 2 test users
    const user1 = await client.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      ['test1@example.com', password1, '테스트1']
    );
    
    console.log('✅ User 1 created:', user1.rows[0]);

    const user2 = await client.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      ['test2@example.com', password2, '테스트2']
    );
    
    console.log('✅ User 2 created:', user2.rows[0]);

    // Get user IDs
    const userId1 = user1.rows[0].id;
    const userId2 = user2.rows[0].id;

    // Define sample todos for user 1
    const todosUser1 = [
      {
        title: '프로젝트 제출',
        is_completed: false,
        due_date: '2025-11-27' // tomorrow
      },
      {
        title: '회의 준비',
        is_completed: true,
        due_date: '2025-11-26' // today
      },
      {
        title: '운동하기',
        is_completed: false,
        due_date: '2025-12-03' // next week
      },
      {
        title: '일기 쓰기',
        is_completed: false,
        due_date: null // no due date
      }
    ];

    // Define sample todos for user 2
    const todosUser2 = [
      {
        title: '기획서 작성',
        is_completed: false,
        due_date: '2025-11-28' // day after tomorrow
      },
      {
        title: '코드 리뷰',
        is_completed: true,
        due_date: '2025-11-25' // yesterday (will be set to today to avoid "past" errors in app)
      },
      {
        title: '업무 정리',
        is_completed: false,
        due_date: '2025-12-10' // later next week
      },
      {
        title: '점심 약속',
        is_completed: false,
        due_date: null // no due date
      }
    ];

    // Insert todos for user 1
    for (const todo of todosUser1) {
      const result = await client.query(
        'INSERT INTO todos (user_id, title, is_completed, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId1, todo.title, todo.is_completed, todo.due_date]
      );
      console.log('✅ Todo created for user 1:', result.rows[0].title);
    }

    // Insert todos for user 2
    for (const todo of todosUser2) {
      const result = await client.query(
        'INSERT INTO todos (user_id, title, is_completed, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId2, todo.title, todo.is_completed, todo.due_date]
      );
      console.log('✅ Todo created for user 2:', result.rows[0].title);
    }

    console.log('✅ Sample data insertion completed!');

    // Verify the data by running the query mentioned in the implementation plan
    console.log('\\n📋 Verifying data with the query from implementation plan:');
    const verificationResult = await client.query(`
      SELECT u.name, t.title, t.due_date, t.is_completed
      FROM users u
      LEFT JOIN todos t ON u.id = t.user_id
      ORDER BY
        CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
        t.due_date ASC,
        t.created_at DESC;
    `);

    console.log('📋 Sample data verification results:');
    console.log(verificationResult.rows);

  } catch (err) {
    console.error('❌ Error inserting sample data:', err.message);
  } finally {
    await client.end();
  }
}

insertSampleData();