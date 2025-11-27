const { query } = require('../config/database');

/**
 * Todo 모델
 * 할일 관련 데이터베이스 쿼리 함수들
 */
const todoModel = {
  /**
   * 새로운 할일 생성
   * @param {Object} todoData - 할일 데이터 { title, due_date, user_id }
   * @returns {Promise<Object>} 생성된 할일 객체
   */
  async create({ title, due_date, user_id }) {
    const result = await query(
      'INSERT INTO todos (title, due_date, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, due_date, user_id]
    );
    return result.rows[0];
  },

  /**
   * 사용자 ID로 할일 목록 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Array>} 할일 객체 배열
   */
  async findByUserId(userId) {
    const sql = `
      SELECT * FROM todos
      WHERE user_id = $1
      ORDER BY
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
        due_date ASC,
        created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  },

  /**
   * ID로 특정 할일 조회
   * @param {number} id - 할일 ID
   * @returns {Promise<Object>} 할일 객체
   */
  async findById(id) {
    const result = await query('SELECT * FROM todos WHERE id = $1', [id]);
    return result.rows[0];
  },

  /**
   * 할일 수정
   * @param {number} id - 할일 ID
   * @param {Object} data - 수정할 데이터 { title, due_date, is_completed }
   * @returns {Promise<Object>} 수정된 할일 객체
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // 동적으로 수정할 필드와 값을 구성
    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.due_date !== undefined) {
      fields.push(`due_date = $${paramIndex++}`);
      values.push(data.due_date);
    }
    if (data.is_completed !== undefined) {
      fields.push(`is_completed = $${paramIndex++}`);
      values.push(data.is_completed);
    }

    if (fields.length === 0) {
      // 수정할 내용이 없으면 기존 데이터를 반환하거나 에러 처리
      return this.findById(id);
    }
    
    // updated_at 필드 추가
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const sql = `
      UPDATE todos
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    const result = await query(sql, values);
    return result.rows[0];
  },

  /**
   * ID로 할일 삭제
   * @param {number} id - 할일 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteById(id) {
    const result = await query('DELETE FROM todos WHERE id = $1', [id]);
    return result;
  },
};

module.exports = todoModel;
