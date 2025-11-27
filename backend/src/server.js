const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
let swaggerDocument = JSON.parse(fs.readFileSync(path.resolve(__dirname, './swagger.json'), 'utf8'));

// 환경 변수를 기반으로 서버 URL 동적으로 설정
const isProduction = process.env.NODE_ENV === 'production';
const serverUrl = isProduction
  ? 'https://jan-todolist-api.railway.app/api'
  : `http://localhost:${process.env.PORT || 3000}/api`;

// Swagger 문서의 servers 배열을 현재 환경에 맞게 수정
swaggerDocument.servers = [
  {
    url: serverUrl,
    description: isProduction ? 'Production Server' : 'Development Server'
  }
];

require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5173;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API 라우트
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '요청한 리소스를 찾을 수 없습니다'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || '서버 오류가 발생했습니다'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
