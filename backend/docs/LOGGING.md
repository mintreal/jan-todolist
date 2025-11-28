# 로깅 시스템 가이드

Winston 기반의 강력한 로깅 시스템입니다.

## 📚 로그 레벨

| 레벨 | 설명 | 사용 시기 |
|------|------|----------|
| **error** | 에러 발생 | 애플리케이션 에러, 예외 |
| **warn** | 경고 | 잠재적 문제, 4xx 응답 |
| **info** | 정보 | 중요한 비즈니스 이벤트 |
| **http** | HTTP 요청 | API 요청/응답 |
| **debug** | 디버깅 | 개발 중 상세 정보 |

## 🔧 설정

### 환경별 로그 레벨

- **개발 환경**: DEBUG 레벨 (모든 로그 출력)
- **운영 환경**: INFO 레벨 (중요한 로그만)

### 로그 저장 위치

```
backend/logs/
├── combined-2025-11-27.log     # 모든 로그
├── error-2025-11-27.log        # 에러만
├── exceptions.log              # 처리되지 않은 예외
└── rejections.log              # 처리되지 않은 Promise rejection
```

### 로그 로테이션

- **일별 로테이션**: 매일 새로운 파일 생성
- **최대 크기**: 20MB
- **보관 기간**: 30일

## 💻 사용 방법

### 기본 사용

```javascript
const logger = require('./utils/logger');

// 정보 로그
logger.info('사용자 로그인 성공', { userId: 123 });

// 경고 로그
logger.warn('비정상적인 접근 시도', { ip: '1.2.3.4' });

// 에러 로그
logger.error('데이터베이스 연결 실패', {
  error: err.message,
  stack: err.stack
});

// 디버그 로그 (개발 환경에서만)
logger.debug('쿼리 실행', { sql: 'SELECT * FROM users' });
```

### HTTP 요청 로깅 (자동)

HTTP 요청은 자동으로 로깅됩니다:

```
[2025-11-27 16:30:15] http: POST /api/auth/login
[2025-11-27 16:30:15] http: POST /api/auth/login 200 {
  method: 'POST',
  url: '/api/auth/login',
  statusCode: 200,
  duration: '145ms',
  ip: '::1'
}
```

### 에러 로깅 (자동)

에러는 자동으로 상세하게 로깅됩니다:

```javascript
// 컨트롤러에서
try {
  // 작업 수행
} catch (error) {
  // 에러를 throw하면 errorHandler가 자동 로깅
  throw error;
}
```

## 📖 실전 예제

### 1. 인증 로깅

```javascript
// src/routes/auth.js
const logger = require('../utils/logger');

router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    // 로그인 시도 로그
    logger.info('로그인 시도', { email });

    // 로그인 로직...

    // 성공 로그
    logger.info('로그인 성공', {
      email,
      userId: user.id
    });

    res.json({ success: true });
  } catch (error) {
    // 실패 로그
    logger.warn('로그인 실패', {
      email: req.body.email,
      reason: error.message
    });
    throw error;
  }
});
```

### 2. 데이터베이스 쿼리 로깅

```javascript
const logger = require('../utils/logger');

async function findUser(id) {
  logger.debug('사용자 조회 시작', { userId: id });

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    logger.debug('사용자 조회 성공', {
      userId: id,
      found: result.rows.length > 0
    });

    return result.rows[0];
  } catch (error) {
    logger.error('데이터베이스 쿼리 실패', {
      userId: id,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### 3. 비즈니스 로직 로깅

```javascript
const logger = require('../utils/logger');

async function createOrder(orderData) {
  logger.info('주문 생성 시작', {
    userId: orderData.userId,
    itemCount: orderData.items.length
  });

  try {
    // 주문 생성 로직...

    logger.info('주문 생성 완료', {
      orderId: order.id,
      totalAmount: order.total
    });

    return order;
  } catch (error) {
    logger.error('주문 생성 실패', {
      userId: orderData.userId,
      error: error.message
    });
    throw error;
  }
}
```

## 🔍 로그 조회

### 실시간 로그 모니터링

```bash
# 전체 로그
tail -f backend/logs/combined-*.log

# 에러만
tail -f backend/logs/error-*.log

# 실시간 필터링 (에러만)
tail -f backend/logs/combined-*.log | grep "error"
```

### 로그 검색

```bash
# 특정 사용자 로그 검색
grep "userId.*123" backend/logs/combined-*.log

# 특정 날짜 로그 검색
cat backend/logs/combined-2025-11-27.log | grep "로그인"

# 에러 개수 세기
grep -c "\"level\":\"error\"" backend/logs/combined-*.log
```

## 🎯 베스트 프랙티스

### ✅ 좋은 예

```javascript
// 충분한 컨텍스트 정보 포함
logger.info('결제 처리 완료', {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  paymentMethod: 'card'
});

// 에러는 stack trace 포함
logger.error('API 호출 실패', {
  url: apiUrl,
  method: 'POST',
  error: error.message,
  stack: error.stack
});
```

### ❌ 나쁜 예

```javascript
// 정보 부족
logger.info('완료');

// 민감한 정보 로깅
logger.info('로그인', {
  password: user.password  // ❌ 비밀번호 노출
});

// 과도한 로깅
for (let i = 0; i < 10000; i++) {
  logger.debug(`Processing ${i}`);  // ❌ 성능 저하
}
```

## 🛡️ 보안 주의사항

### 로그에 포함하지 말아야 할 정보

- ❌ 비밀번호
- ❌ 토큰 (JWT, API Key)
- ❌ 신용카드 번호
- ❌ 개인정보 (주민번호, 전화번호 전체)

### 안전한 로깅

```javascript
// 이메일 마스킹
const maskedEmail = email.replace(/(.{3}).*@/, '$1***@');
logger.info('로그인', { email: maskedEmail });

// 전화번호 마스킹
const maskedPhone = phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
logger.info('인증', { phone: maskedPhone });
```

## 📊 로그 분석

### 에러율 모니터링

```bash
# 오늘 에러 개수
grep -c "\"level\":\"error\"" backend/logs/combined-$(date +%Y-%m-%d).log

# API 응답 시간 분석
grep "duration" backend/logs/combined-*.log | grep -oP 'duration.*\d+ms'
```

### 성능 모니터링

```bash
# 느린 API 찾기 (500ms 이상)
grep "duration" backend/logs/combined-*.log | awk -F'"duration":"' '{print $2}' | awk -F'ms' '$1 > 500 {print $0}'
```

## 🔧 설정 커스터마이징

로그 설정을 변경하려면 `src/utils/logger.js` 파일을 수정하세요:

```javascript
// 로그 레벨 변경
const level = () => {
  return 'info'; // 또는 'debug', 'warn', 'error'
};

// 파일 로테이션 설정 변경
new DailyRotateFile({
  maxSize: '50m',   // 50MB로 증가
  maxFiles: '90d',  // 90일로 연장
});
```

## 🎉 완료!

로깅 시스템이 모든 HTTP 요청, 에러, 중요한 비즈니스 이벤트를 자동으로 기록합니다.
