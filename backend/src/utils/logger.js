const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

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

// 로그 포맷 정의
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 콘솔 출력 포맷 (개발 환경용)
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

// 로그 저장 디렉토리
const logDir = path.join(__dirname, '../../logs');

// Transport 설정
const transports = [
  // 콘솔 출력
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // 에러 로그 파일 (일별 로테이션)
  new DailyRotateFile({
    level: 'error',
    dirname: logDir,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: format,
  }),

  // 전체 로그 파일 (일별 로테이션)
  new DailyRotateFile({
    dirname: logDir,
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: format,
  }),
];

// Logger 생성
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // 예외 처리
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  // Promise rejection 처리
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

module.exports = logger;
