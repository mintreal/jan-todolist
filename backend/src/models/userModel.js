const { query } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * User 모델
 * 사용자 관련 데이터베이스 쿼리 함수들
 */

/**
 * 이메일로 사용자 조회
 * @param {string} email - 조회할 사용자의 이메일
 * @returns {Promise<Object|null>} 사용자 객체 또는 null
 */
const findByEmail = async (email) => {
  const result = await query('SELECT id, email, password, name, created_at FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

/**
 * ID로 사용자 조회
 * @param {number} id - 조회할 사용자의 ID
 * @returns {Promise<Object|null>} 사용자 객체 또는 null
 */
const findById = async (id) => {
  const result = await query('SELECT id, email, name, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

/**
 * 새로운 사용자 생성
 * @param {Object} userData - 사용자 데이터 { email, password, name }
 * @returns {Promise<Object>} 생성된 사용자 객체
 */
const create = async (userData) => {
  // 비밀번호 해싱 (10 rounds)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  const result = await query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
    [userData.email, hashedPassword, userData.name]
  );
  
  return result.rows[0];
};

module.exports = {
  findByEmail,
  findById,
  create,
};