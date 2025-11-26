require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'fallback_secret_for_development',
  options: {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h', // 토큰 만료 시간: 24시간
  }
};