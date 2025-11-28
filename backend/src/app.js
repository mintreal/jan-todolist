require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger/swagger.json');
const logger = require('./utils/logger');
const requestLogger = require('./middlewares/requestLogger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

logger.info('Swagger Document Loaded:', { loaded: !!swaggerDocument });

const app = express();

// CORS 옵션 설정
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // 환경 변수 또는 모든 출처 허용
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP 요청 로깅
app.use(requestLogger);

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API 라우트
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// 404 핸들러
app.use(notFoundHandler);

// 전역 에러 핸들러
app.use(errorHandler);

module.exports = app;
