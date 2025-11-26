const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * JWT 토큰 생성 함수
 * @param {Object} payload - 토큰에 포함할 정보 (예: { userId: 1 })
 * @returns {string} 생성된 JWT 토큰
 */
const sign = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, jwtConfig.options);
};

/**
 * JWT 토큰 검증 함수
 * @param {string} token - 검증할 JWT 토큰
 * @returns {Object} 토큰에서 추출한 payload
 */
const verify = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  sign,
  verify
};