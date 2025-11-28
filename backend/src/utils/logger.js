const winston = require('winston');

// 로그 레벨 정의
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 환경별 로그 레벨
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production' ? 'info' : 'debug';
};

// 로그 색상
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// 콘솔 출력 포맷
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...meta } = info;
      let metaStr = '';

      if (Object.keys(meta).length > 0) {
        // 에러 스택 출력
        if (meta.stack) {
          metaStr = `\n${meta.stack}`;
        } else {
          metaStr = `\n${JSON.stringify(meta, null, 2)}`;
        }
      }

      return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }
  )
);

// Transport 설정 - 콘솔만 사용
const transports = [
  // 콘솔 출력
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Logger 생성
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // 예외 처리 - 콘솔로만 출력
  exceptionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  // Promise rejection 처리 - 콘솔로만 출력
  rejectionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

module.exports = logger;
