# Jan TodoList - 3일 스프린트 계획서

**문서 버전**: 1.0
**작성일**: 2025-11-25
**대상 독자**: 개발자
**목표**: 3일 내 작동하는 프로토타입 완성

---

## 📋 목차

1. [스프린트 개요](#1-스프린트-개요)
2. [MVP 범위 정의](#2-mvp-범위-정의)
3. [기술 스택 (단순화)](#3-기술-스택-단순화)
4. [데이터베이스 스키마 (최소)](#4-데이터베이스-스키마-최소)
5. [API 명세 (핵심만)](#5-api-명세-핵심만)
6. [3일 개발 일정](#6-3일-개발-일정)
7. [구현 우선순위](#7-구현-우선순위)
8. [Quick Start 가이드](#8-quick-start-가이드)

---

## 1. 스프린트 개요

### 1.1 목표
**3일 내 기본 동작하는 TodoList 웹 앱 완성**

### 1.2 제약사항
- **인원**: 1명 풀스택 개발자
- **기간**: 3일 (24시간 순수 개발 시간)
- **목표**: 프로토타입 (실사용 가능한 최소 기능)

### 1.3 성공 기준
- ✅ 회원가입/로그인 가능
- ✅ 할일 생성/조회/수정/삭제 가능
- ✅ 기한 설정 및 정렬 동작
- ✅ 로컬 또는 클라우드 배포 완료

---

## 2. MVP 범위 정의

### 2.1 ✅ 포함 기능 (MUST HAVE)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **회원가입** | 이메일 + 비밀번호 | P0 |
| **로그인** | JWT 인증 | P0 |
| **할일 생성** | 제목 + 기한 (선택) | P0 |
| **할일 조회** | 리스트 형식, 기한 순 정렬 | P0 |
| **할일 수정** | 제목, 기한, 완료 상태 | P0 |
| **할일 삭제** | 소유자만 삭제 | P0 |
| **기한 표시** | 날짜만 (시간 제외) | P0 |

### 2.2 ❌ 제외 기능 (LATER)

| 기능 | 이유 | 추가 예정 |
|------|------|----------|
| **캘린더 뷰** | 구현 시간 소요 | Phase 2 |
| **알림 시스템** | 백그라운드 작업 필요 | Phase 2 |
| **공유 기능** | 복잡도 높음 | Phase 2 |
| **외부 연동** | OAuth 설정 시간 소요 | Phase 3 |
| **설정 페이지** | 필수 아님 | Phase 2 |
| **우선순위** | 기한 정렬로 대체 | Phase 2 |
| **상세 설명** | 제목만으로 시작 | Phase 2 |
| **프로필 수정** | 필수 아님 | Phase 2 |

### 2.3 도메인 정의서 대비 축소 범위

**원본 도메인 정의서**: `docs/1-domain-definition.md` 참조

**축소 사항**:
- TodoItem: 제목 + 기한 + 상태만 (설명, 우선순위 제외)
- TodoShare: 전체 제외
- Notification: 전체 제외
- User: 이메일 + 비밀번호 + 이름만

---

## 3. 기술 스택 (단순화)

### 3.1 백엔드

| 항목 | 선택 | 이유 |
|------|------|------|
| **프레임워크** | **Express.js** | 빠른 설정 |
| **언어** | **JavaScript** (TypeScript 제외) | 타입 설정 시간 절약 |
| **데이터베이스** | **SQLite** | 설치/설정 불필요 |
| **ORM** | **없음** (직접 SQL) | Prisma 설정 시간 절약 |
| **인증** | **JWT** (라이브러리) | jsonwebtoken 패키지 |
| **비밀번호** | **bcrypt** | 최소 보안 |

### 3.2 프론트엔드

| 항목 | 선택 | 이유 |
|------|------|------|
| **프레임워크** | **React (Vite)** | 빠른 빌드 |
| **언어** | **JavaScript** | 타입 설정 시간 절약 |
| **상태관리** | **useState** (전역 상태 없음) | Context/Zustand 설정 생략 |
| **UI 라이브러리** | **Tailwind CSS** | 빠른 스타일링 |
| **HTTP** | **fetch API** | Axios 불필요 |
| **날짜** | **HTML input[type=date]** | 라이브러리 불필요 |

### 3.3 배포

| 항목 | 선택 | 이유 |
|------|------|------|
| **백엔드** | **Railway** 또는 **Render** | 무료, 간단 |
| **프론트엔드** | **Vercel** 또는 **Netlify** | 무료, Git 연동 자동 |
| **데이터베이스** | **Railway PostgreSQL** (배포 시) | SQLite → PostgreSQL 마이그레이션 |

---

## 4. 데이터베이스 스키마 (최소)

### 4.1 테이블 2개만

#### users 테이블
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### todos 테이블
```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  is_completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_due_date ON todos(due_date);
```

### 4.2 초기화 스크립트

```javascript
// backend/db/init.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    due_date DATE,
    is_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)`);
});

module.exports = db;
```

---

## 5. API 명세 (핵심만)

### 5.1 인증 API

#### POST /api/auth/register
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response (201):
{
  "token": "eyJhbG...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbG...",
  "user": { ... }
}
```

### 5.2 할일 API

#### GET /api/todos
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "todos": [
    {
      "id": 1,
      "title": "프로젝트 보고서 작성",
      "due_date": "2025-11-30",
      "is_completed": false,
      "created_at": "2025-11-25T10:00:00Z"
    }
  ]
}
```

#### POST /api/todos
```json
Request:
{
  "title": "새 할일",
  "due_date": "2025-12-01"
}

Response (201):
{
  "todo": { ... }
}
```

#### PATCH /api/todos/:id
```json
Request:
{
  "title": "수정된 제목",
  "is_completed": true
}

Response (200):
{
  "todo": { ... }
}
```

#### DELETE /api/todos/:id
```
Response (200):
{
  "message": "Todo deleted"
}
```

---

## 6. 3일 개발 일정

### Day 1: 백엔드 + 인증 (8시간)

| 시간 | 작업 | 상세 |
|------|------|------|
| **0-1h** | 프로젝트 초기화 | Express 설정, SQLite 연결 |
| **1-2h** | 데이터베이스 스키마 | users, todos 테이블 생성 |
| **2-4h** | 인증 API | register, login 구현 |
| **4-5h** | JWT 미들웨어 | 토큰 검증 미들웨어 |
| **5-7h** | 할일 CRUD API | GET, POST, PATCH, DELETE |
| **7-8h** | API 테스트 | Postman으로 테스트 |

**완료 기준**:
- [ ] 회원가입/로그인 API 동작
- [ ] 할일 CRUD API 동작
- [ ] JWT 인증 동작

---

### Day 2: 프론트엔드 (8시간)

| 시간 | 작업 | 상세 |
|------|------|------|
| **0-1h** | React 프로젝트 생성 | Vite + Tailwind CSS |
| **1-3h** | 로그인/회원가입 페이지 | 폼 + API 연동 |
| **3-4h** | 토큰 저장 로직 | localStorage + 라우팅 |
| **4-6h** | 할일 리스트 페이지 | 조회 + 추가 + 삭제 |
| **6-7h** | 할일 수정 기능 | 제목, 기한, 완료 토글 |
| **7-8h** | 스타일링 | Tailwind로 최소 디자인 |

**완료 기준**:
- [ ] 로그인 후 할일 페이지 이동
- [ ] 할일 추가/수정/삭제 동작
- [ ] 기한 순 정렬 표시

---

### Day 3: 통합 + 배포 (8시간)

| 시간 | 작업 | 상세 |
|------|------|------|
| **0-2h** | 버그 수정 | 전날 발견한 이슈 해결 |
| **2-3h** | 기한 정렬 로직 | 백엔드에서 ORDER BY 추가 |
| **3-4h** | 에러 처리 | 로딩/에러 메시지 표시 |
| **4-6h** | 배포 준비 | 환경변수, CORS 설정 |
| **6-7h** | Railway 배포 | 백엔드 배포 |
| **7-8h** | Vercel 배포 | 프론트엔드 배포 + 테스트 |

**완료 기준**:
- [ ] 배포 URL 접속 가능
- [ ] 회원가입 → 로그인 → 할일 관리 흐름 동작
- [ ] 데이터 영속성 확인

---

## 7. 구현 우선순위

### 7.1 P0 (필수 - Day 1-2)
1. **인증**: 회원가입, 로그인, JWT
2. **할일 CRUD**: 생성, 조회, 수정, 삭제
3. **기본 UI**: 리스트 뷰, 폼

### 7.2 P1 (중요 - Day 3)
4. **기한 정렬**: 날짜 가까운 순
5. **완료 상태**: 체크박스 토글
6. **배포**: Railway + Vercel

### 7.3 P2 (있으면 좋음 - 추가 시간)
7. **기한 강조**: 오늘/내일 기한 빨간색
8. **로딩 상태**: 스피너 표시
9. **에러 메시지**: Toast 알림

---

## 8. Quick Start 가이드

### 8.1 백엔드 실행 (5분)

```bash
# 프로젝트 생성
mkdir jan-todolist-backend
cd jan-todolist-backend
npm init -y

# 패키지 설치
npm install express sqlite3 jsonwebtoken bcrypt cors dotenv

# 디렉토리 구조
mkdir -p db routes middleware

# 서버 실행
node server.js
```

### 8.2 프론트엔드 실행 (5분)

```bash
# Vite 프로젝트 생성
npm create vite@latest jan-todolist-frontend -- --template react
cd jan-todolist-frontend

# Tailwind CSS 설치
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 개발 서버 실행
npm run dev
```

### 8.3 최소 구현 파일 리스트

**백엔드 (7개 파일)**:
```
backend/
├── server.js              # Express 서버
├── db/init.js             # SQLite 초기화
├── routes/auth.js         # 인증 라우트
├── routes/todos.js        # 할일 라우트
├── middleware/auth.js     # JWT 검증
├── .env                   # 환경변수
└── package.json
```

**프론트엔드 (8개 파일)**:
```
frontend/
├── src/
│   ├── App.jsx            # 메인 앱
│   ├── pages/
│   │   ├── Login.jsx      # 로그인 페이지
│   │   ├── Register.jsx   # 회원가입 페이지
│   │   └── TodoList.jsx   # 할일 리스트
│   ├── components/
│   │   ├── TodoItem.jsx   # 할일 항목
│   │   └── TodoForm.jsx   # 할일 추가 폼
│   └── main.jsx
├── index.html
└── package.json
```

**총 15개 파일**로 프로토타입 완성!

---

## 9. 참고 문서

- **전체 PRD**: [docs/3-product-requirements-document.md](./3-product-requirements-document.md)
- **도메인 정의서**: [docs/1-domain-definition.md](./1-domain-definition.md)
- **기술 스택**: [docs/2-tech-stack-and-architecture.md](./2-tech-stack-and-architecture.md)

---

## 10. 다음 단계 (Phase 2 이후)

3일 프로토타입 완성 후 추가할 기능:
1. **캘린더 뷰** (2-3일)
2. **알림 시스템** (2-3일)
3. **공유 기능** (2-3일)
4. **UI/UX 개선** (핑크 디자인 적용, 1-2일)
5. **테스트 코드** (2-3일)

---

**문서 종료**

이 계획서를 따라하면 **3일 안에 작동하는 TodoList 프로토타입**을 완성할 수 있습니다. 🚀
