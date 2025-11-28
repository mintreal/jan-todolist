const { Pool } = require('pg');
require('dotenv').config();

// 환경 변수에서 DATABASE_URL 읽기
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// PostgreSQL 연결 풀 설정
// Vercel Serverless 환경에 최적화된 설정
const pool = new Pool({
  connectionString: databaseUrl,
  // Serverless 환경: 각 function instance당 1개 연결만
  max: process.env.NODE_ENV === 'production' ? 1 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Serverless에서는 더 긴 timeout 필요
  // Supabase SSL 설정
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 연결 오류 핸들링
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Serverless 환경에서는 process.exit 대신 에러 로깅만
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
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