const { verify } = require('../utils/jwtToken');

/**
 * 인증 미들웨어
 * Authorization 헤더에서 JWT 토큰을 추출하고 검증한 후,
 * req.user에 사용자 정보를 저장
 */
const authenticateToken = (req, res, next) => {
  // Authorization 헤더에서 토큰 추출 (형식: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"에서 TOKEN 부분 추출

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // 토큰 검증
    const decoded = verify(token);
    
    // req.user에 사용자 정보 저장
    req.user = decoded;
    
    // 다음 미들웨어로 진행
    next();
  } catch (error) {
    if (error.message === 'Invalid token') {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = {
  authenticateToken
};