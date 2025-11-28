const logger = require('../utils/logger');

// 전역 에러 핸들러
function errorHandler(err, req, res, next) {
  // 에러 로깅
  logger.error('에러 발생', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // 클라이언트 응답
  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 에러가 발생했습니다';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
}

// 404 핸들러
function notFoundHandler(req, res, next) {
  logger.warn(`404 - ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다',
  });
}

module.exports = { errorHandler, notFoundHandler };
