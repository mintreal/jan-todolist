// Node.js를 사용한 더미 데이터 생성 스크립트
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runScript(filename) {
  const client = await pool.connect();
  try {
    console.log(`\n📄 ${filename} 실행 중...\n`);

    const sql = fs.readFileSync(
      path.join(__dirname, filename),
      'utf-8'
    );

    await client.query(sql);
    console.log(`✅ ${filename} 실행 완료!\n`);
  } catch (error) {
    console.error(`❌ 에러 발생:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 tcust 테이블 더미 데이터 생성 시작');
  console.log('='.repeat(60));

  try {
    // 1. 테이블 생성
    await runScript('create-tcust-table.sql');

    // 2. 더미 데이터 생성
    await runScript('generate-dummy-data.sql');

    console.log('='.repeat(60));
    console.log('🎉 모든 작업이 완료되었습니다!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 작업 실패:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
