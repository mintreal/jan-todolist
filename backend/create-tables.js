const { Client } = require('pg');

const connectionString = 'postgresql://postgres.lgkxqjlhvfobxivufzec:ZMMfsKZ7uhueHQA8@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function createTables() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Supabase에 연결 중...');
    await client.connect();
    console.log('✅ 연결 성공!\n');

    // 1. users 테이블 생성
    console.log('📝 users 테이블 생성 중...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ users 테이블 생성 완료');

    // 2. todos 테이블 생성
    console.log('📝 todos 테이블 생성 중...');
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
    console.log('✅ todos 테이블 생성 완료');

    // 3. 인덱스 생성
    console.log('📝 인덱스 생성 중...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_todos_start_date ON todos(start_date)');
    console.log('✅ 인덱스 생성 완료');

    // 4. 트리거 함수 및 트리거 생성
    console.log('📝 트리거 생성 중...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await client.query('DROP TRIGGER IF EXISTS update_todos_updated_at ON todos');
    await client.query(`
      CREATE TRIGGER update_todos_updated_at
        BEFORE UPDATE ON todos
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ 트리거 생성 완료');

    // 5. 검증
    console.log('\n📊 테이블 목록 확인:');
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

    console.log('\n📊 데이터 확인:');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const todoCount = await client.query('SELECT COUNT(*) FROM todos');

    console.log(`  - users: ${userCount.rows[0].count}명`);
    console.log(`  - todos: ${todoCount.rows[0].count}개`);

    console.log('\n🎉 마이그레이션 완료!');
    console.log('\nSupabase Dashboard에서 확인:');
    console.log('https://supabase.com/dashboard/project/lgkxqjlhvfobxivufzec/editor\n');

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
    console.error('상세:', error.stack);
    throw error;
  } finally {
    await client.end();
  }
}

createTables().catch(err => {
  console.error(err);
  process.exit(1);
});
