# 백엔드 테스트 가이드

## 개요

Issue #4 "백엔드 프로젝트 초기화"를 검증하기 위한 종합 테스트 스위트입니다.

## 테스트 커버리지

- **전체 테스트**: 127개
- **코드 커버리지**: 100% (statements), 66.66% (branches), 100% (functions), 100% (lines)
- **성공률**: 100%

## 테스트 구조

### 1. setup.test.js - 프로젝트 초기화 검증 (25개 테스트)

**환경 변수 파일 검증**
- .env.example 파일 존재 여부
- DATABASE_URL, JWT_SECRET, PORT 정의 확인
- 환경 변수 값 유효성 검증

**폴더 구조 검증**
- backend, src, tests 디렉토리 존재 확인
- package.json, .gitignore 파일 확인
- .gitignore에 node_modules, .env 포함 확인

**package.json 검증**
- 필수 의존성 (express, dotenv) 확인
- 보안 의존성 (helmet, cors) 확인
- 인증 의존성 (jsonwebtoken, bcrypt) 확인
- 데이터베이스 의존성 (pg) 확인
- 스크립트 (start, test) 확인
- 메타데이터 (name, version) 검증

**서버 파일 검증**
- server.js 파일 존재
- Express, dotenv import 확인
- 포트 설정 및 서버 시작 로직 확인

### 2. server.test.js - Express 서버 통합 테스트 (58개 테스트)

**Health Check 엔드포인트** (6개)
- HTTP 200 상태 코드
- JSON 응답 형식
- status, timestamp, environment 필드 검증
- 응답 시간 (< 100ms)

**CORS 미들웨어** (4개)
- Access-Control-Allow-Origin 헤더
- credentials 옵션
- OPTIONS 요청 처리
- 다양한 Origin 처리

**Helmet 보안 헤더** (4개)
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security
- X-Download-Options

**JSON 파싱 미들웨어** (3개)
- JSON body 파싱
- 잘못된 JSON 처리
- 빈 body 처리

**404 에러 핸들러** (6개)
- 존재하지 않는 경로 처리
- JSON 형식 응답
- error, message 필드 포함
- 다양한 HTTP 메서드 지원
- 잘못된 API 경로 처리

**에러 핸들러** (3개)
- JSON 형식 에러 응답
- 적절한 필드 포함
- 서버 안정성 (500 에러 후에도 동작)

**미들웨어 순서** (3개)
- helmet 우선 적용
- CORS 순서
- JSON 파싱 순서

**성능 및 안정성** (3개)
- 동시 요청 처리 (10개)
- 순차 요청 처리 (20개)
- 혼합 요청 처리

**HTTP 메서드 지원** (5개)
- GET, POST, PUT, DELETE, PATCH

### 3. environment.test.js - 환경 변수 테스트 (26개 테스트)

**.env.example 파일 상세 검증** (5개)
- 파일 읽기 가능
- DATABASE_URL PostgreSQL 형식 확인
- JWT_SECRET 비어있지 않음
- 환경 변수 키 공백 없음
- 환경 변수 값 따옴표 처리

**환경 변수 로딩 테스트** (4개)
- dotenv 설치 확인
- 환경 변수 파싱 기능
- NODE_ENV 읽기
- PORT 읽기

**보안 관련 환경 변수** (4개)
- JWT_SECRET 복잡도
- DATABASE_URL 패스워드 포함
- .env gitignore 포함
- 실제 비밀정보 미포함

**환경별 설정** (3개)
- 개발 환경 설정
- 테스트 환경 설정
- 프로덕션 필수 변수

**환경 변수 타입 검증** (3개)
- PORT 숫자 변환
- DATABASE_URL 문자열
- JWT_SECRET 문자열

**환경 변수 기본값** (3개)
- PORT 기본값 3000
- NODE_ENV 기본값 development
- CORS_ORIGIN 기본값

**파일 형식 검증** (3개)
- UTF-8 인코딩
- 주석 # 처리
- 라인 형식

### 4. dependencies.test.js - 의존성 및 보안 테스트 (41개 테스트)

**필수 의존성 버전 검증** (7개)
- Express 5.x 이상
- dotenv 16.x 이상
- helmet 7.x 이상
- cors
- pg 8.x 이상
- jsonwebtoken 9.x 이상
- bcrypt 5.x 이상

**개발 의존성 검증** (3개)
- Jest 설치
- Supertest 설치
- devDependencies 분리

**package-lock.json 검증** (3개)
- 파일 존재
- 버전 일치
- 모든 의존성 포함

**보안 관련 의존성** (4개)
- helmet 프로덕션 의존성
- bcrypt 프로덕션 의존성
- jsonwebtoken 프로덕션 의존성
- express-validator 설치

**의존성 임포트 테스트** (8개)
- 모든 주요 패키지 import 가능 확인

**의존성 기능 테스트** (6개)
- Express 앱 생성
- helmet, cors 미들웨어 사용
- bcrypt 비밀번호 해싱
- JWT 토큰 생성
- PostgreSQL 클라이언트 생성

**Node.js 버전 호환성** (2개)
- Node.js 14 이상
- engines 필드 권장

**스크립트 검증** (3개)
- start 스크립트
- test 스크립트
- dev 스크립트 권장

**package.json 메타데이터** (4개)
- name 필드
- version semver 형식
- main 필드
- type 필드 (commonjs/module)

## 테스트 실행

### 전체 테스트 실행
```bash
npm test
```

### Watch 모드로 테스트 실행
```bash
npm run test:watch
```

### 커버리지 리포트 생성
```bash
npm run test:coverage
```

## 커버리지 임계값

Jest 설정 (jest.config.js):
- **statements**: 80%
- **branches**: 60%
- **functions**: 80%
- **lines**: 80%

## 테스트 결과

```
Test Suites: 4 passed, 4 total
Tests:       127 passed, 127 total
Snapshots:   0 total
Time:        < 1s
```

## 커버리지 리포트

```
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------|---------|----------|---------|---------|-------------------
All files  |     100 |    66.66 |     100 |     100 |
 server.js |     100 |    66.66 |     100 |     100 | 20-35
-----------|---------|----------|---------|---------|-------------------
```

## 테스트 환경

- **테스트 프레임워크**: Jest 30.2.0
- **HTTP 테스팅**: Supertest 7.1.4
- **Node.js**: 14 이상
- **타임아웃**: 10초

## 파일 구조

```
backend/
├── tests/
│   ├── setup.test.js           # 프로젝트 초기화 검증
│   ├── server.test.js          # Express 서버 통합 테스트
│   ├── environment.test.js     # 환경 변수 테스트
│   ├── dependencies.test.js    # 의존성 및 보안 테스트
│   └── README.md              # 이 파일
├── src/
│   └── server.js              # Express 서버 메인 파일
├── jest.config.js             # Jest 설정
├── package.json               # 프로젝트 의존성
└── .env.example               # 환경 변수 예시
```

## 검증 항목 체크리스트

- [x] .env.example 파일 환경 변수 정의
- [x] Express 서버 기본 구조 (미들웨어, health check)
- [x] 폴더 구조 존재 여부
- [x] package.json 스크립트
- [x] 커버리지 80% 이상
- [x] Jest 사용
- [x] 통합 테스트 및 단위 테스트 포함
- [x] Supertest로 HTTP 엔드포인트 테스트

## 추가 기능

### 성능 테스트
- 동시 요청 처리 (10개)
- 순차 요청 처리 (20개)
- 응답 시간 < 100ms

### 보안 테스트
- Helmet 보안 헤더 검증
- CORS 설정 검증
- 환경 변수 보안 검증
- JWT/bcrypt 기능 테스트

### 안정성 테스트
- 에러 핸들링
- 404 처리
- 잘못된 JSON 처리
- 서버 중단 방지

## 문제 해결

### 테스트 실행 시 서버가 종료되지 않는 경우
Jest 설정에 `forceExit: true` 옵션이 추가되어 있어 자동으로 종료됩니다.

### 커버리지가 낮은 경우
jest.config.js의 `collectCoverageFrom` 설정을 확인하세요. 현재는 `src/server.js`만 포함됩니다.

### 환경 변수 관련 테스트 실패
.env.example 파일이 올바른 형식인지 확인하세요.

## 참고사항

- 테스트는 실제 데이터베이스 연결 없이 실행됩니다
- 모든 테스트는 독립적으로 실행 가능합니다
- 테스트 실행 시 console.log 출력이 표시될 수 있습니다
- 에러 핸들러 테스트 시 의도적인 에러 메시지가 출력됩니다
