const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('마이그레이션 시작...');

    // 1. 새로운 컬럼 추가
    console.log('1. 새로운 컬럼 추가 중...');
    await client.query('ALTER TABLE todos ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT TRUE');
    await client.query('ALTER TABLE todos ADD COLUMN IF NOT EXISTS start_date TIMESTAMP');
    await client.query('ALTER TABLE todos ADD COLUMN IF NOT EXISTS end_date TIMESTAMP');

    // 2. 기존 데이터 마이그레이션
    console.log('2. 기존 데이터 마이그레이션 중...');
    const result = await client.query(`
      UPDATE todos
      SET
        start_date = due_date::timestamp,
        end_date = (due_date + INTERVAL '1 day')::timestamp,
        is_all_day = TRUE
      WHERE start_date IS NULL
    `);
    console.log(`   ${result.rowCount}개의 레코드가 업데이트되었습니다.`);

    // 3. NOT NULL 제약조건 추가
    console.log('3. NOT NULL 제약조건 추가 중...');
    await client.query('ALTER TABLE todos ALTER COLUMN start_date SET NOT NULL');
    await client.query('ALTER TABLE todos ALTER COLUMN end_date SET NOT NULL');

    // 4. 기존 컬럼 삭제
    console.log('4. 기존 due_date 컬럼 삭제 중...');
    await client.query('ALTER TABLE todos DROP COLUMN IF EXISTS due_date');

    // 5. 인덱스 재생성
    console.log('5. 인덱스 재생성 중...');
    await client.query('DROP INDEX IF EXISTS idx_todos_due_date');
    await client.query('CREATE INDEX IF NOT EXISTS idx_todos_start_date ON todos(start_date)');

    // 6. 컬럼 코멘트 업데이트
    console.log('6. 컬럼 코멘트 업데이트 중...');
    await client.query("COMMENT ON COLUMN todos.is_all_day IS '하루종일 여부 (true: 날짜만, false: 날짜+시간)'");
    await client.query("COMMENT ON COLUMN todos.start_date IS '시작 날짜/시간'");
    await client.query("COMMENT ON COLUMN todos.end_date IS '종료 날짜/시간'");

    console.log('\n✅ 마이그레이션 완료!');

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error(err);
  process.exit(1);
});
