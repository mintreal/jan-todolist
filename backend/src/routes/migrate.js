const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.post('/run', async (req, res) => {
  const client = await pool.connect();

  try {
    console.log('🔧 마이그레이션 시작...');

    // users 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // todos 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        title VARCHAR(200) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        is_all_day BOOLEAN DEFAULT TRUE,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT todos_user_id_fkey
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    // 인덱스
    await client.query(`CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_todos_start_date ON todos(start_date)`);

    // 트리거
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await client.query(`DROP TRIGGER IF EXISTS update_todos_updated_at ON todos`);
    await client.query(`
      CREATE TRIGGER update_todos_updated_at
        BEFORE UPDATE ON todos
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // 검증
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const todoCount = await client.query('SELECT COUNT(*) FROM todos');

    res.json({
      success: true,
      message: '마이그레이션 완료!',
      tables: tables.rows.map(r => r.table_name),
      data: {
        users: userCount.rows[0].count,
        todos: todoCount.rows[0].count
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
