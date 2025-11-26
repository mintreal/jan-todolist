const { Pool } = require('pg');
require('dotenv').config();

// 환경 변수에서 DATABASE_URL 읽기
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// PostgreSQL 연결 풀 설정
const pool = new Pool({
  connectionString: databaseUrl,
  // 연결 풀 관련 설정
  max: 20, // 최대 연결 수
  min: 5,  // 최소 연결 수
  idleTimeoutMillis: 30000, // 연결이 idle 상태로 유지될 수 있는 최대 시간 (밀리초)
  connectionTimeoutMillis: 2000, // 연결 시도 시간 초과 (밀리초)
});

// 연결 오류 핸들링
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// 연결 테스트 함수
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', res.rows[0]);
    return true;
  } catch (err) {
    console.error('Database connection test failed:', err);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params),
};