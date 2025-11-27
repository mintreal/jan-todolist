const { verify } = require('../utils/jwtToken');

/**
 * 인증 미들웨어
 * Authorization 헤더에서 JWT 토큰을 추출하고 검증한 후,
 * req.user에 사용자 정보를 저장
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verify(token);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.message === 'Invalid token') {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = authenticateToken;