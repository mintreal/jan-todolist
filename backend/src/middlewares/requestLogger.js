const logger = require('../utils/logger');

// HTTP 요청 로깅 미들웨어
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // 요청 로그
  logger.http(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // 응답 완료 후 로그
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'http';

    logger.log(logLevel, `${req.method} ${req.originalUrl} ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
}

module.exports = requestLogger;
