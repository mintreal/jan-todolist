const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.lgkxqjlhvfobxivufzec:9p+b9R73Jv?SzBa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Supabase에 연결 중...');
    await client.connect();
    console.log('✅ 연결 성공!');
    console.log('');

    // 마이그레이션 SQL 읽기
    const sqlPath = path.join(__dirname, '..', 'database', 'migration-final.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 마이그레이션 실행 중...');
    const result = await client.query(sql);
    console.log('✅ 마이그레이션 완료!');
    console.log('');

    // 테이블 목록 확인
    console.log('📊 테이블 목록 확인:');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    console.log('');

    // 데이터 확인
    console.log('📊 데이터 확인:');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const todoCount = await client.query('SELECT COUNT(*) FROM todos');

    console.log(`  - users: ${userCount.rows[0].count}명`);
    console.log(`  - todos: ${todoCount.rows[0].count}개`);
    console.log('');

    console.log('🎉 마이그레이션 완료!');
    console.log('');
    console.log('Supabase Dashboard에서 확인하세요:');
    console.log('https://supabase.com/dashboard/project/lgkxqjlhvfobxivufzec');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (error.detail) {
      console.error('상세:', error.detail);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
