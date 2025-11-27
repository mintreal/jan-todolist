const { pool } = require('./src/config/database');

async function getTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('테이블 목록:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // 각 테이블에 대한 상세 정보 조회
    for (const row of result.rows) {
      console.log(`\n[${row.table_name} 테이블 상세 정보]`);
      
      // 컬럼 정보 조회
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [row.table_name]);
      
      console.log('컬럼 정보:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}), NULL 허용: ${col.is_nullable}, 기본값: ${col.column_default}`);
      });
    }
  } catch (err) {
    console.error('에러 발생:', err);
  } finally {
    await pool.end();
  }
}

getTables();