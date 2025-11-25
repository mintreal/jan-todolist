# Jan TodoList
## Product Requirements Document (개발자용)

**문서 버전**: 1.0
**작성일**: 2025-11-25
**대상 독자**: 개발팀
**작성자**: Development Team

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [API 명세](#5-api-명세)
6. [주요 기능 구현 가이드](#6-주요-기능-구현-가이드)
7. [UI/UX 요구사항](#7-uiux-요구사항)
8. [개발 작업 분할](#8-개발-작업-분할)
9. [테스트 계획](#9-테스트-계획)
10. [배포 및 운영](#10-배포-및-운영)
11. [부록](#11-부록)

---

## 1. 프로젝트 개요

### 1.1 제품 개요

**Jan TodoList**는 사용자 인증 기반의 할일 관리 웹 애플리케이션입니다. 개인 사용자와 소규모 팀이 할일을 체계적으로 관리하고, 기한을 시각적으로 파악하며, 다른 사용자와 공유할 수 있습니다.

### 1.2 MVP 범위

**Phase 1 (3개월)**
- ✅ 사용자 인증 (회원가입, 로그인, JWT)
- ✅ 할일 CRUD
- ✅ 리스트 뷰 (기한 임박 순 정렬)
- ✅ 캘린더 뷰 (월간)
- ✅ 기한 관리 및 알림 (브라우저 푸시)
- ✅ 기본 공유 기능 (읽기/쓰기 권한)

**Phase 2 (6개월)**
- 외부 캘린더 연동 (구글, 네이버)
- 고급 알림 (이메일)
- 검색 및 필터링
- 할일 아카이브

### 1.3 비기능 요구사항

- **성능**: 할일 목록 조회 1초 이내, API 응답 500ms 이내
- **확장성**: 10,000 MAU 지원
- **가용성**: 99.5% 이상
- **보안**: HTTPS, JWT, bcrypt, CORS, Rate Limiting

### 1.4 참조 문서

- [도메인 정의서](./1-domain-definition.md)
- [기술 스택 및 아키텍처](./2-tech-stack-and-architecture.md)
- [요구사항 정의서](./0-domain-definition-request.md)

---

## 2. 기술 스택

### 2.1 백엔드

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **런타임** | Node.js | 20 LTS | 서버 실행 환경 |
| **프레임워크** | Express.js | 4.x | 웹 프레임워크 |
| **언어** | TypeScript | 5.x | 타입 안정성 |
| **데이터베이스** | PostgreSQL | 15.x | 관계형 DB |
| **ORM** | Prisma | 5.x | 데이터베이스 ORM |
| **인증** | JWT | jsonwebtoken | 토큰 기반 인증 |
| **암호화** | bcrypt | 5.x | 비밀번호 해싱 |
| **검증** | Zod | 3.x | 입력 검증 |
| **환경변수** | dotenv | 16.x | 환경 설정 |

### 2.2 프론트엔드

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **라이브러리** | React | 18.x | UI 라이브러리 |
| **언어** | TypeScript | 5.x | 타입 안정성 |
| **빌드 도구** | Vite | 5.x | 빠른 빌드 |
| **라우팅** | React Router | 6.x | 클라이언트 라우팅 |
| **상태관리** | Zustand | 4.x | 경량 상태관리 |
| **HTTP 클라이언트** | Axios | 1.x | API 통신 |
| **UI 라이브러리** | Tailwind CSS | 3.x | 유틸리티 CSS |
| **캘린더** | react-big-calendar | 1.x | 캘린더 컴포넌트 |
| **날짜 처리** | date-fns | 3.x | 날짜 포맷팅 |

### 2.3 개발 도구

- **패키지 매니저**: npm
- **코드 포맷팅**: Prettier
- **린팅**: ESLint
- **Git Hooks**: Husky
- **테스트**: Jest (백엔드), Vitest (프론트엔드), Playwright (E2E)

### 2.4 인프라

- **호스팅**: Railway (백엔드), Vercel (프론트엔드)
- **데이터베이스**: Supabase PostgreSQL
- **모니터링**: Sentry (에러 추적)
- **도메인**: Namecheap

---

## 3. 시스템 아키텍처

### 3.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     React + TypeScript + Vite + Tailwind CSS         │   │
│  │  (Zustand for State, React Router for Navigation)   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    API Gateway / Load Balancer              │
│                         (Railway)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend Server (Node.js)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js + TypeScript + Prisma                    │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Routes    │  │ Controllers │  │  Services  │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │   │
│  │         │                 │                │          │   │
│  │         └─────────────────┴────────────────┘          │   │
│  │                          │                            │   │
│  │  ┌───────────────────────▼──────────────────────┐   │   │
│  │  │          Middleware Layer                     │   │   │
│  │  │  • JWT Auth                                   │   │   │
│  │  │  • Error Handler                              │   │   │
│  │  │  • Request Validator                          │   │   │
│  │  │  • Rate Limiter                               │   │   │
│  │  └───────────────────────┬──────────────────────┘   │   │
│  │                          │                            │   │
│  │  ┌───────────────────────▼──────────────────────┐   │   │
│  │  │         Prisma ORM (Data Access Layer)       │   │   │
│  │  └───────────────────────┬──────────────────────┘   │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   PostgreSQL Database                        │
│                       (Supabase)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables: users, todo_items, todo_shares,            │   │
│  │          notifications                               │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 백엔드 레이어드 아키텍처

```
┌────────────────────────────────────────────────────────┐
│                    Routes Layer                        │
│  (URL 라우팅 및 HTTP 메서드 정의)                      │
│  • /api/auth/*, /api/todos/*, /api/users/*           │
└────────────────────┬───────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────┐
│                 Controllers Layer                      │
│  (요청 처리, 응답 반환, 입력 검증)                     │
│  • authController, todoController, userController     │
└────────────────────┬───────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────┐
│                  Services Layer                        │
│  (비즈니스 로직, 트랜잭션 관리)                        │
│  • authService, todoService, notificationService      │
└────────────────────┬───────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────┐
│                  Data Access Layer                     │
│  (Prisma ORM, 데이터베이스 쿼리)                      │
│  • prisma.user, prisma.todoItem, prisma.todoShare     │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
              [PostgreSQL Database]
```

### 3.3 프론트엔드 컴포넌트 구조

```
src/
├── pages/                    # 페이지 컴포넌트
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx    # 할일 리스트 뷰
│   ├── CalendarPage.tsx     # 캘린더 뷰
│   └── SettingsPage.tsx
│
├── components/               # 재사용 컴포넌트
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── todo/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   └── TodoModal.tsx
│   ├── calendar/
│   │   └── TodoCalendar.tsx
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   └── notifications/
│       └── NotificationCenter.tsx
│
├── hooks/                    # Custom Hooks
│   ├── useAuth.ts
│   ├── useTodos.ts
│   └── useNotifications.ts
│
├── stores/                   # Zustand 상태관리
│   ├── authStore.ts
│   ├── todoStore.ts
│   └── notificationStore.ts
│
├── api/                      # API 클라이언트
│   ├── auth.ts
│   ├── todos.ts
│   └── users.ts
│
├── types/                    # TypeScript 타입 정의
│   ├── user.ts
│   ├── todo.ts
│   └── api.ts
│
└── utils/                    # 유틸리티 함수
    ├── dateFormat.ts
    ├── validation.ts
    └── storage.ts
```

### 3.4 인증 흐름

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└─────┬────┘                                    └────┬─────┘
      │                                              │
      │  POST /api/auth/register                    │
      │  { email, password, name }                  │
      ├─────────────────────────────────────────────>│
      │                                              │
      │                              1. Validate input
      │                              2. Hash password (bcrypt)
      │                              3. Save to DB
      │                              4. Generate JWT
      │                                              │
      │  { user, token }                            │
      │<─────────────────────────────────────────────┤
      │                                              │
      │  POST /api/auth/login                       │
      │  { email, password }                        │
      ├─────────────────────────────────────────────>│
      │                                              │
      │                              1. Find user by email
      │                              2. Verify password
      │                              3. Generate JWT
      │                                              │
      │  { user, token }                            │
      │<─────────────────────────────────────────────┤
      │                                              │
      │  Store token in localStorage                │
      │                                              │
      │  GET /api/todos                             │
      │  Headers: { Authorization: Bearer <token> } │
      ├─────────────────────────────────────────────>│
      │                                              │
      │                              1. Verify JWT
      │                              2. Extract user ID
      │                              3. Fetch todos
      │                                              │
      │  { todos: [...] }                           │
      │<─────────────────────────────────────────────┤
      │                                              │
```

---

## 4. 데이터베이스 설계

### 4.1 ERD (Entity Relationship Diagram)

```
┌─────────────────┐         ┌──────────────────┐
│      User       │────1:N──│    TodoItem      │
│─────────────────│         │──────────────────│
│ id (PK)         │         │ id (PK)          │
│ email (UNIQUE)  │         │ title            │
│ password        │         │ description      │
│ name            │         │ status           │
│ created_at      │         │ due_date         │
│ updated_at      │         │ priority         │
└─────────────────┘         │ user_id (FK)     │
       │                    │ created_at       │
       │                    │ updated_at       │
       │                    └──────────────────┘
       │                            │
       │                            │
       │                            │1
       │                            │
       │                            N
       │                    ┌──────────────────┐
       │                    │    TodoShare     │
       │                    │──────────────────│
       │                    │ id (PK)          │
       │                    │ todo_id (FK)     │
       └────────────────────│ shared_with (FK) │
                            │ permission       │
                            │ created_at       │
                            └──────────────────┘


┌─────────────────┐         ┌──────────────────┐
│      User       │────1:N──│  Notification    │
└─────────────────┘         │──────────────────│
                            │ id (PK)          │
                            │ user_id (FK)     │
                            │ todo_id (FK)     │
                            │ message          │
                            │ is_read          │
                            │ created_at       │
                            └──────────────────┘
```

### 4.2 Prisma 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  todos         TodoItem[]
  sharedTodos   TodoShare[]
  notifications Notification[]

  @@map("users")
}

model TodoItem {
  id          String    @id @default(uuid())
  title       String
  description String?
  status      Status    @default(PENDING)
  dueDate     DateTime? @map("due_date")
  priority    Int       @default(0)  // 0: Low, 1: Medium, 2: High
  userId      String    @map("user_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  shares        TodoShare[]
  notifications Notification[]

  @@index([userId])
  @@index([dueDate])
  @@index([status])
  @@map("todo_items")
}

model TodoShare {
  id         String     @id @default(uuid())
  todoId     String     @map("todo_id")
  sharedWith String     @map("shared_with")
  permission Permission @default(READ)
  createdAt  DateTime   @default(now()) @map("created_at")

  todo TodoItem @relation(fields: [todoId], references: [id], onDelete: Cascade)
  user User     @relation(fields: [sharedWith], references: [id], onDelete: Cascade)

  @@unique([todoId, sharedWith])
  @@index([todoId])
  @@index([sharedWith])
  @@map("todo_shares")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  todoId    String?  @map("todo_id")
  message   String
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")

  user User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  todo TodoItem? @relation(fields: [todoId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([isRead])
  @@map("notifications")
}

enum Status {
  PENDING
  COMPLETED
}

enum Permission {
  READ
  WRITE
}
```

### 4.3 마이그레이션 명령

```bash
# 초기 마이그레이션
npx prisma migrate dev --name init

# 스키마 변경 후 마이그레이션
npx prisma migrate dev --name add_priority_field

# Prisma Client 생성
npx prisma generate

# 데이터베이스 시드
npx prisma db seed
```

---

## 5. API 명세

### 5.1 Base URL

```
개발: http://localhost:3000/api
프로덕션: https://api.jan-todolist.com/api
```

### 5.2 공통 응답 형식

**성공 응답**
```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
}
```

**에러 응답**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

### 5.3 인증 API

#### POST /api/auth/register
회원가입

**Request**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-11-25T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation**
- `email`: 이메일 형식, 최대 255자, 중복 불가
- `password`: 최소 8자, 영문/숫자 포함
- `name`: 최소 2자, 최대 50자

**Error Codes**
- `EMAIL_ALREADY_EXISTS`: 이미 존재하는 이메일
- `VALIDATION_ERROR`: 입력 검증 실패

---

#### POST /api/auth/login
로그인

**Request**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Codes**
- `INVALID_CREDENTIALS`: 잘못된 이메일 또는 비밀번호
- `USER_NOT_FOUND`: 사용자 없음

---

#### GET /api/auth/me
현재 사용자 정보 조회

**Request**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-11-25T10:00:00Z"
    }
  }
}
```

---

### 5.4 할일 API

#### GET /api/todos
할일 목록 조회

**Request**
```http
GET /api/todos?status=PENDING&sort=dueDate&order=asc
Authorization: Bearer <token>
```

**Query Parameters**
- `status` (optional): `PENDING` | `COMPLETED` | `ALL` (default: ALL)
- `sort` (optional): `dueDate` | `createdAt` | `priority` (default: dueDate)
- `order` (optional): `asc` | `desc` (default: asc)

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": "uuid",
        "title": "프로젝트 보고서 작성",
        "description": "월말 보고서 작성",
        "status": "PENDING",
        "dueDate": "2025-11-30T17:00:00Z",
        "priority": 2,
        "userId": "uuid",
        "createdAt": "2025-11-25T10:00:00Z",
        "updatedAt": "2025-11-25T10:00:00Z",
        "shares": [
          {
            "id": "uuid",
            "sharedWith": "user2-uuid",
            "permission": "READ"
          }
        ]
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

---

#### GET /api/todos/:id
할일 상세 조회

**Request**
```http
GET /api/todos/uuid
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "todo": {
      "id": "uuid",
      "title": "프로젝트 보고서 작성",
      "description": "월말 보고서 작성",
      "status": "PENDING",
      "dueDate": "2025-11-30T17:00:00Z",
      "priority": 2,
      "userId": "uuid",
      "createdAt": "2025-11-25T10:00:00Z",
      "updatedAt": "2025-11-25T10:00:00Z",
      "shares": [],
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "user@example.com"
      }
    }
  }
}
```

**Error Codes**
- `TODO_NOT_FOUND`: 할일 없음
- `FORBIDDEN`: 접근 권한 없음

---

#### POST /api/todos
할일 생성

**Request**
```http
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "프로젝트 보고서 작성",
  "description": "월말 보고서 작성",
  "dueDate": "2025-11-30T17:00:00Z",
  "priority": 2
}
```

**Validation**
- `title`: 필수, 최소 1자, 최대 255자
- `description`: 선택, 최대 2000자
- `dueDate`: 선택, ISO 8601 형식, 과거 날짜 불가
- `priority`: 선택, 0-2 (default: 0)

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "todo": {
      "id": "uuid",
      "title": "프로젝트 보고서 작성",
      "description": "월말 보고서 작성",
      "status": "PENDING",
      "dueDate": "2025-11-30T17:00:00Z",
      "priority": 2,
      "userId": "uuid",
      "createdAt": "2025-11-25T10:00:00Z",
      "updatedAt": "2025-11-25T10:00:00Z"
    }
  }
}
```

---

#### PATCH /api/todos/:id
할일 수정

**Request**
```http
PATCH /api/todos/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "프로젝트 보고서 작성 (수정)",
  "status": "COMPLETED"
}
```

**Partial Update 지원** (변경할 필드만 전송)

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "todo": {
      "id": "uuid",
      "title": "프로젝트 보고서 작성 (수정)",
      "status": "COMPLETED",
      ...
    }
  }
}
```

**Error Codes**
- `TODO_NOT_FOUND`: 할일 없음
- `FORBIDDEN`: 수정 권한 없음 (읽기 전용 공유)

---

#### DELETE /api/todos/:id
할일 삭제

**Request**
```http
DELETE /api/todos/uuid
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

**Error Codes**
- `TODO_NOT_FOUND`: 할일 없음
- `FORBIDDEN`: 삭제 권한 없음 (소유자만 삭제 가능)

---

### 5.5 공유 API

#### POST /api/todos/:id/share
할일 공유

**Request**
```http
POST /api/todos/uuid/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "friend@example.com",
  "permission": "READ"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "share": {
      "id": "uuid",
      "todoId": "uuid",
      "sharedWith": "user2-uuid",
      "permission": "READ",
      "createdAt": "2025-11-25T10:00:00Z"
    }
  }
}
```

**Error Codes**
- `USER_NOT_FOUND`: 공유 대상 사용자 없음
- `ALREADY_SHARED`: 이미 공유됨
- `CANNOT_SHARE_WITH_SELF`: 자신에게 공유 불가

---

#### DELETE /api/todos/:id/share/:shareId
공유 해제

**Request**
```http
DELETE /api/todos/uuid/share/share-uuid
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Share removed successfully"
}
```

---

### 5.6 알림 API

#### GET /api/notifications
알림 목록 조회

**Request**
```http
GET /api/notifications?isRead=false
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "message": "프로젝트 보고서 작성 마감 1시간 전입니다",
        "isRead": false,
        "todoId": "uuid",
        "createdAt": "2025-11-30T16:00:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

---

#### PATCH /api/notifications/:id/read
알림 읽음 처리

**Request**
```http
PATCH /api/notifications/uuid/read
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "uuid",
      "isRead": true
    }
  }
}
```

---

### 5.7 HTTP 상태 코드

| 상태 코드 | 의미 | 사용 예 |
|----------|------|---------|
| 200 OK | 성공 | GET, PATCH 성공 |
| 201 Created | 생성 성공 | POST 성공 |
| 204 No Content | 성공 (응답 본문 없음) | DELETE 성공 (대안) |
| 400 Bad Request | 잘못된 요청 | 검증 실패 |
| 401 Unauthorized | 인증 필요 | 토큰 없음/만료 |
| 403 Forbidden | 권한 없음 | 접근 권한 부족 |
| 404 Not Found | 리소스 없음 | 존재하지 않는 ID |
| 409 Conflict | 충돌 | 중복 이메일 |
| 429 Too Many Requests | 요청 제한 초과 | Rate Limiting |
| 500 Internal Server Error | 서버 오류 | 예상치 못한 에러 |

---

## 6. 주요 기능 구현 가이드

### 6.1 인증 (JWT)

#### 토큰 생성
```typescript
// backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
};
```

#### 인증 미들웨어
```typescript
// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided'
        }
      });
    }

    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};
```

### 6.2 비밀번호 해싱

```typescript
// backend/src/utils/password.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### 6.3 기한 정렬 로직

```typescript
// backend/src/services/todoService.ts
import { prisma } from '../config/prisma';

export const getTodosSortedByDueDate = async (userId: string) => {
  const todos = await prisma.todoItem.findMany({
    where: {
      OR: [
        { userId },
        {
          shares: {
            some: { sharedWith: userId }
          }
        }
      ]
    },
    include: {
      shares: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: [
      { dueDate: 'asc' },      // 기한 가까운 순
      { priority: 'desc' },     // 우선순위 높은 순
      { createdAt: 'desc' }     // 최신 생성 순
    ]
  });

  // 기한 없는 할일은 하단으로
  const withDueDate = todos.filter(todo => todo.dueDate);
  const withoutDueDate = todos.filter(todo => !todo.dueDate);

  return [...withDueDate, ...withoutDueDate];
};
```

### 6.4 알림 스케줄러

```typescript
// backend/src/services/notificationService.ts
import { prisma } from '../config/prisma';
import { addHours, isBefore, isAfter } from 'date-fns';

export const checkAndCreateNotifications = async () => {
  const now = new Date();
  const in24Hours = addHours(now, 24);
  const in1Hour = addHours(now, 1);

  // 24시간 전 알림
  const todosFor24h = await prisma.todoItem.findMany({
    where: {
      status: 'PENDING',
      dueDate: {
        gte: now,
        lte: in24Hours
      }
    },
    include: { user: true }
  });

  for (const todo of todosFor24h) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        todoId: todo.id,
        message: { contains: '24시간' }
      }
    });

    if (!existingNotification) {
      await prisma.notification.create({
        data: {
          userId: todo.userId,
          todoId: todo.id,
          message: `"${todo.title}" 마감 24시간 전입니다`
        }
      });
    }
  }

  // 1시간 전 알림 (동일한 로직)
  // ...
};

// Cron job 설정 (node-cron 사용)
import cron from 'node-cron';

// 매 10분마다 실행
cron.schedule('*/10 * * * *', () => {
  checkAndCreateNotifications();
});
```

### 6.5 공유 권한 검증

```typescript
// backend/src/middleware/todoAuth.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../config/prisma';

export const checkTodoAccess = (requiredPermission: 'READ' | 'WRITE' = 'READ') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const todoId = req.params.id;
    const userId = req.userId!;

    const todo = await prisma.todoItem.findUnique({
      where: { id: todoId },
      include: {
        shares: {
          where: { sharedWith: userId }
        }
      }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: { code: 'TODO_NOT_FOUND', message: 'Todo not found' }
      });
    }

    // 소유자는 모든 권한
    if (todo.userId === userId) {
      return next();
    }

    // 공유된 경우 권한 확인
    const share = todo.shares[0];
    if (!share) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'No access to this todo' }
      });
    }

    if (requiredPermission === 'WRITE' && share.permission === 'READ') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Read-only access' }
      });
    }

    next();
  };
};
```

---

## 7. UI/UX 요구사항

### 7.1 디자인 원칙 및 스타일 가이드

#### 디자인 컨셉
- **현대적이고 미니멀한 디자인**: 깔끔하고 직관적인 인터페이스
- **따뜻한 색감**: 핑크/마젠타 계열의 친근한 컬러 팔레트
- **카드 기반 레이아웃**: 정보를 시각적으로 그룹화

#### 컬러 팔레트
```
Primary Color (메인):      #FF4081 (핑크/마젠타)
Secondary Color (보조):    #FF80AB (연한 핑크)
Accent Color (강조):       #F50057 (진한 핑크)
Background:               #FFFFFF (화이트)
Surface:                  #F5F5F5 (연한 회색)
Text Primary:             #212121 (진한 회색)
Text Secondary:           #757575 (중간 회색)
Border:                   #E0E0E0 (연한 회색)
Success:                  #4CAF50 (초록)
Warning:                  #FF9800 (주황)
Error:                    #F44336 (빨강)
```

#### 타이포그래피
- **폰트 패밀리**: 'Inter', 'Pretendard', 'Apple SD Gothic Neo', sans-serif
- **제목 (H1)**: 24px, Bold (700)
- **부제목 (H2)**: 20px, SemiBold (600)
- **본문 (Body)**: 16px, Regular (400)
- **캡션 (Caption)**: 14px, Regular (400)
- **시간 표시**: 12px, Medium (500)

#### 디자인 요소
- **Border Radius**: 12px (카드), 8px (버튼), 20px (원형 뱃지)
- **Shadow**:
  - Card: 0 2px 8px rgba(0, 0, 0, 0.08)
  - Elevated: 0 4px 12px rgba(0, 0, 0, 0.12)
- **Spacing**: 8px 기준 (8, 16, 24, 32, 40px)
- **Icon Size**: 24px (기본), 20px (작은 아이콘)

#### 캘린더 뷰 디자인 참고
- 상단에 연도/월 표시 (대형 타이포그래피)
- 날짜 그리드: 7×6 레이아웃, 각 셀 패딩 12px
- 선택된 날짜: 핑크 원형 배경 (#FF4081), 흰색 텍스트
- 오늘 날짜: 핑크 테두리 원형
- 하단 "UPCOMING" 섹션: 핑크 배경 카드에 예정된 할일 리스트 표시
  - 각 할일 항목: 좌측 날짜 뱃지 + 제목 + 시간
  - 점선으로 시간 경과 표시

### 7.2 주요 화면 목록

| 화면 | 경로 | 설명 | 우선순위 |
|------|------|------|----------|
| 로그인 | `/login` | 이메일/비밀번호 로그인 | P0 |
| 회원가입 | `/register` | 이메일 회원가입 | P0 |
| 대시보드 (리스트 뷰) | `/` | 할일 목록 (기한 임박 순) | P0 |
| 캘린더 뷰 | `/calendar` | 월간 캘린더 + UPCOMING 섹션 | P0 |
| 할일 상세/수정 | Modal | 할일 상세 보기 및 수정 | P0 |
| 알림 센터 | `/notifications` | 알림 목록 | P1 |
| 설정 | `/settings` | 사용자 설정 | P1 |

### 7.3 주요 UI 요구사항

#### 대시보드 (할일 리스트)
- **레이아웃**: 카드 기반 리스트 형식
- **할일 카드**:
  - 좌측: 체크박스 (완료/미완료 토글)
  - 중앙: 제목 + 설명 (선택)
  - 우측: 기한 + 우선순위 아이콘
- **색상 구분**:
  - 기한 오늘: 빨강 (#F44336) 강조
  - 기한 임박 (3일 이내): 주황 (#FF9800)
  - 일반: 회색 (#757575)
  - 완료: 연한 회색 (#BDBDBD), 취소선
- **버튼**: 우측 하단 플로팅 버튼 (+) - 핑크 원형
- **정렬**: 기한 임박 순 → 우선순위 순 → 생성일 순

#### 캘린더 뷰
- **상단**:
  - 연도 표시 (대형, 32px, Bold)
  - 월 탭 (JAN, FEB, MAR, APR...) - 선택된 월 하단에 핑크 언더라인
  - 메뉴 아이콘 (좌측), 알림 아이콘 (우측)
- **캘린더 그리드**:
  - 월간 7×6 레이아웃
  - 요일 헤더 (S, M, T, W, T, F, S)
  - 선택된 날짜: 핑크 원형 배경 + 흰색 텍스트
  - 오늘 날짜: 핑크 원형 테두리
  - 할일 있는 날짜: 작은 점 표시 (하단)
- **UPCOMING 섹션**:
  - 핑크 배경 카드 (#FF4081)
  - 흰색 텍스트
  - 각 할일 항목:
    - 좌측: 날짜 뱃지 (원형, 흰색 배경, 날짜 숫자)
    - 중앙: 할일 제목 + 시간
    - 우측: 정보 아이콘 (i), 추가 아이콘 (+)
  - 항목 간 점선 구분
  - 최대 4개 표시, 스크롤 가능

#### 할일 상세/수정 모달
- **배경**: 반투명 다크 오버레이
- **모달 카드**: 흰색, 중앙 정렬, 둥근 모서리 (16px)
- **폼 요소**:
  - 제목 입력: 단일 라인, 대형 텍스트
  - 설명 입력: 멀티라인 (3-5줄)
  - 기한 선택: 날짜/시간 피커
  - 우선순위 선택: 라디오 버튼 또는 세그먼트 컨트롤
- **버튼**: 하단 고정, "저장" (핑크), "취소" (회색)

#### 반응형 디자인
- **데스크톱** (1920x1080):
  - 좌측 사이드바 (240px): 네비게이션
  - 메인 컨텐츠: 최대 너비 1200px, 중앙 정렬
- **태블릿** (768px 이상):
  - 사이드바 축소 또는 햄버거 메뉴
  - 2열 그리드 레이아웃
- **모바일** (375px 이상, Phase 2):
  - 단일 열 레이아웃
  - 하단 탭 네비게이션
  - 스와이프 제스처 지원

---

## 8. 개발 작업 분할

### 8.1 Epic 및 Story 구조

#### Epic 1: 프로젝트 초기 설정
- **Story 1.1**: 모노레포 구조 생성
  - Task: 루트 package.json 설정
  - Task: backend/ 디렉토리 구조 생성
  - Task: frontend/ 디렉토리 구조 생성

- **Story 1.2**: 백엔드 초기화
  - Task: Express + TypeScript 설정
  - Task: Prisma 초기화
  - Task: 환경변수 설정 (.env.example)
  - Task: ESLint, Prettier 설정

- **Story 1.3**: 프론트엔드 초기화
  - Task: Vite + React + TypeScript 설정
  - Task: Tailwind CSS 설정
  - Task: React Router 설정
  - Task: Zustand 설정

**예상 소요 시간**: 3-5일

---

#### Epic 2: 데이터베이스 및 인증
- **Story 2.1**: 데이터베이스 설계
  - Task: Prisma 스키마 작성
  - Task: 초기 마이그레이션 실행
  - Task: 시드 데이터 작성

- **Story 2.2**: 인증 API 구현
  - Task: JWT 유틸리티 작성
  - Task: 비밀번호 해싱 유틸리티
  - Task: POST /auth/register 구현
  - Task: POST /auth/login 구현
  - Task: GET /auth/me 구현
  - Task: 인증 미들웨어 구현

- **Story 2.3**: 인증 UI 구현
  - Task: 로그인 페이지
  - Task: 회원가입 페이지
  - Task: 토큰 저장 로직 (localStorage)
  - Task: useAuth Hook 구현

**예상 소요 시간**: 5-7일

---

#### Epic 3: 할일 CRUD
- **Story 3.1**: 할일 API 구현
  - Task: GET /todos 구현
  - Task: GET /todos/:id 구현
  - Task: POST /todos 구현
  - Task: PATCH /todos/:id 구현
  - Task: DELETE /todos/:id 구현
  - Task: 입력 검증 (Zod)

- **Story 3.2**: 할일 리스트 UI 구현
  - Task: TodoList 컴포넌트
  - Task: TodoItem 컴포넌트
  - Task: TodoForm 컴포넌트 (생성/수정)
  - Task: useTodos Hook
  - Task: todoStore (Zustand)

- **Story 3.3**: 할일 상세 모달 구현
  - Task: TodoModal 컴포넌트
  - Task: 수정 기능
  - Task: 삭제 확인 다이얼로그

**예상 소요 시간**: 7-10일

---

#### Epic 4: 기한 관리 및 정렬
- **Story 4.1**: 기한 설정 기능
  - Task: 날짜/시간 피커 컴포넌트
  - Task: 기한 없는 할일 처리
  - Task: 과거 날짜 검증

- **Story 4.2**: 기한 임박 정렬
  - Task: 백엔드 정렬 로직 구현
  - Task: 프론트엔드 그룹화 (긴급/이번 주/기한 없음)
  - Task: 색상 코딩 (빨강/파랑/회색)

- **Story 4.3**: 우선순위 기능
  - Task: 우선순위 선택 UI
  - Task: 우선순위별 정렬
  - Task: 우선순위 아이콘 표시

**예상 소요 시간**: 4-6일

---

#### Epic 5: 알림 시스템
- **Story 5.1**: 알림 백엔드 구현
  - Task: Notification 모델 활용
  - Task: 알림 생성 스케줄러 (node-cron)
  - Task: GET /notifications API
  - Task: PATCH /notifications/:id/read API

- **Story 5.2**: 브라우저 푸시 알림
  - Task: 브라우저 알림 권한 요청
  - Task: 알림 표시 로직
  - Task: 알림 클릭 처리

- **Story 5.3**: 알림 센터 UI
  - Task: NotificationCenter 컴포넌트
  - Task: 알림 목록
  - Task: 읽음/안 읽음 표시
  - Task: 알림 개수 뱃지 (헤더)

**예상 소요 시간**: 5-7일

---

#### Epic 6: 캘린더 뷰
- **Story 6.1**: 캘린더 백엔드
  - Task: 날짜별 할일 조회 API
  - Task: 월간 데이터 최적화

- **Story 6.2**: 캘린더 UI 구현
  - Task: react-big-calendar 통합
  - Task: 할일 표시 (날짜별)
  - Task: 날짜 클릭 → 할일 목록 표시
  - Task: 이전/다음 달 네비게이션

**예상 소요 시간**: 4-6일

---

#### Epic 7: 공유 기능
- **Story 7.1**: 공유 백엔드 구현
  - Task: POST /todos/:id/share API
  - Task: DELETE /todos/:id/share/:shareId API
  - Task: 권한 검증 미들웨어
  - Task: 공유된 할일 조회 로직

- **Story 7.2**: 공유 UI 구현
  - Task: 공유 버튼 및 모달
  - Task: 이메일 입력 및 검증
  - Task: 권한 선택 (읽기/쓰기)
  - Task: 공유 목록 표시
  - Task: 공유 해제 기능

**예상 소요 시간**: 5-7일

---

#### Epic 8: 설정 및 기타
- **Story 8.1**: 설정 페이지
  - Task: 프로필 수정
  - Task: 알림 설정
  - Task: 테마 설정 (라이트/다크)

- **Story 8.2**: 에러 처리 및 로딩 상태
  - Task: 글로벌 에러 핸들러
  - Task: 로딩 스피너 컴포넌트
  - Task: Toast 알림

**예상 소요 시간**: 3-5일

---

#### Epic 9: 테스트 및 최적화
- **Story 9.1**: 백엔드 테스트
  - Task: 인증 API 테스트
  - Task: 할일 API 테스트
  - Task: 공유 API 테스트

- **Story 9.2**: 프론트엔드 테스트
  - Task: 컴포넌트 단위 테스트
  - Task: Hook 테스트

- **Story 9.3**: E2E 테스트
  - Task: 회원가입/로그인 플로우
  - Task: 할일 CRUD 플로우
  - Task: 공유 플로우

**예상 소요 시간**: 7-10일

---

#### Epic 10: 배포 및 마무리
- **Story 10.1**: 배포 설정
  - Task: Railway 백엔드 배포
  - Task: Vercel 프론트엔드 배포
  - Task: Supabase 데이터베이스 설정
  - Task: 환경변수 설정

- **Story 10.2**: 모니터링 및 로깅
  - Task: Sentry 통합
  - Task: 에러 로깅
  - Task: 성능 모니터링

**예상 소요 시간**: 3-5일

---

### 8.2 전체 일정

| Phase | Epic | 기간 | 완료 기준 |
|-------|------|------|-----------|
| **Phase 1** | Epic 1-2 | Week 1-2 | 프로젝트 초기화, 인증 완료 |
| **Phase 2** | Epic 3-4 | Week 3-4 | 할일 CRUD, 기한 관리 완료 |
| **Phase 3** | Epic 5-7 | Week 5-8 | 알림, 캘린더, 공유 완료 |
| **Phase 4** | Epic 8-10 | Week 9-12 | 설정, 테스트, 배포 완료 |

**총 예상 기간**: 12주 (3개월)

---

## 9. 테스트 계획

### 9.1 테스트 전략

#### 테스트 피라미드

```
         ┌─────────────┐
         │  E2E Tests  │ (10%)
         │   Playwright│
         └─────────────┘
       ┌───────────────────┐
       │ Integration Tests │ (30%)
       │   API Tests       │
       └───────────────────┘
   ┌─────────────────────────────┐
   │      Unit Tests             │ (60%)
   │  Jest / Vitest              │
   └─────────────────────────────┘
```

### 9.2 백엔드 테스트

#### 단위 테스트 (Jest)
```typescript
// backend/src/utils/__tests__/jwt.test.ts
import { generateToken, verifyToken } from '../jwt';

describe('JWT Utils', () => {
  it('should generate and verify token', () => {
    const userId = 'test-user-id';
    const token = generateToken(userId);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(userId);
  });

  it('should throw error for invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });
});
```

#### API 통합 테스트 (Supertest)
```typescript
// backend/src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../app';

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.token).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    // 첫 번째 가입
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    // 중복 가입 시도
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password456',
        name: 'Another User'
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });
});
```

### 9.3 프론트엔드 테스트

#### 컴포넌트 테스트 (Vitest + Testing Library)
```typescript
// frontend/src/components/todo/__tests__/TodoItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoItem from '../TodoItem';

describe('TodoItem', () => {
  const mockTodo = {
    id: '1',
    title: 'Test Todo',
    status: 'PENDING',
    priority: 1,
    dueDate: new Date('2025-12-01'),
  };

  it('should render todo title', () => {
    render(<TodoItem todo={mockTodo} onToggle={() => {}} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox clicked', () => {
    const onToggle = vi.fn();
    render(<TodoItem todo={mockTodo} onToggle={onToggle} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith('1');
  });
});
```

#### Hook 테스트
```typescript
// frontend/src/hooks/__tests__/useTodos.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTodos } from '../useTodos';

describe('useTodos', () => {
  it('should fetch todos on mount', async () => {
    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.todos).toHaveLength(3);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

### 9.4 E2E 테스트 (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register and login', async ({ page }) => {
    // 회원가입
    await page.goto('http://localhost:5173/register');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="name"]', 'Test User');
    await page.click('button[type="submit"]');

    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.locator('text=Test User')).toBeVisible();

    // 로그아웃
    await page.click('button:has-text("로그아웃")');

    // 로그인
    await page.goto('http://localhost:5173/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 대시보드 확인
    await expect(page).toHaveURL('http://localhost:5173/');
  });
});

// e2e/todo.spec.ts
test.describe('Todo Management', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('http://localhost:5173/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should create, update, and delete todo', async ({ page }) => {
    // 할일 생성
    await page.click('button:has-text("새 할일")');
    await page.fill('[name="title"]', 'Test Todo');
    await page.fill('[name="description"]', 'Test Description');
    await page.click('button:has-text("저장")');

    // 생성 확인
    await expect(page.locator('text=Test Todo')).toBeVisible();

    // 할일 수정
    await page.click('text=Test Todo');
    await page.fill('[name="title"]', 'Updated Todo');
    await page.click('button:has-text("저장")');

    // 수정 확인
    await expect(page.locator('text=Updated Todo')).toBeVisible();

    // 할일 완료
    await page.check('input[type="checkbox"]');
    await expect(page.locator('text=Updated Todo')).toHaveCSS('text-decoration', 'line-through');

    // 할일 삭제
    await page.click('text=Updated Todo');
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');

    // 삭제 확인
    await expect(page.locator('text=Updated Todo')).not.toBeVisible();
  });
});
```

### 9.5 테스트 커버리지 목표

| 레이어 | 목표 커버리지 | 도구 |
|--------|--------------|------|
| 백엔드 유틸리티 | 90% | Jest |
| 백엔드 API | 80% | Jest + Supertest |
| 프론트엔드 컴포넌트 | 70% | Vitest + Testing Library |
| E2E | 주요 플로우 | Playwright |

### 9.6 테스트 실행 명령

```bash
# 백엔드 단위 테스트
cd backend && npm test

# 백엔드 테스트 (watch 모드)
cd backend && npm test -- --watch

# 백엔드 커버리지
cd backend && npm test -- --coverage

# 프론트엔드 테스트
cd frontend && npm test

# E2E 테스트
npx playwright test

# E2E 테스트 (UI 모드)
npx playwright test --ui
```

---

## 10. 배포 및 운영

### 10.1 환경 구성

#### 개발 환경
- **백엔드**: http://localhost:3000
- **프론트엔드**: http://localhost:5173
- **데이터베이스**: 로컬 PostgreSQL

#### 프로덕션 환경
- **백엔드**: https://api.jan-todolist.com (Railway)
- **프론트엔드**: https://jan-todolist.com (Vercel)
- **데이터베이스**: Supabase PostgreSQL

### 10.2 환경변수

**Backend (.env)**
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/jan_todolist

# JWT
JWT_SECRET=your-secret-key-here

# CORS
ALLOWED_ORIGINS=https://jan-todolist.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env)**
```env
VITE_API_URL=https://api.jan-todolist.com
```

### 10.3 배포 프로세스

#### 백엔드 배포 (Railway)
```bash
# 1. Railway CLI 설치
npm install -g @railway/cli

# 2. 로그인
railway login

# 3. 프로젝트 연결
railway link

# 4. 환경변수 설정
railway variables set DATABASE_URL=...
railway variables set JWT_SECRET=...

# 5. 배포
railway up
```

#### 프론트엔드 배포 (Vercel)
```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 로그인
vercel login

# 3. 배포
cd frontend && vercel --prod
```

### 10.4 CI/CD (GitHub Actions)

**.github/workflows/backend.yml**
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test
      - name: Run linter
        run: cd backend && npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### 10.5 모니터링

#### Sentry 통합 (에러 추적)
```typescript
// backend/src/config/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// frontend/src/config/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### 10.6 백업 및 복구

#### 데이터베이스 백업 (자동화)
```bash
# Supabase에서 자동 백업 설정
# - 일일 자동 백업
# - 30일 보관
# - Point-in-time recovery 가능
```

---

## 11. 부록

### 11.1 코딩 컨벤션

#### TypeScript/JavaScript
- **네이밍**: camelCase (변수/함수), PascalCase (클래스/컴포넌트)
- **들여쓰기**: 2 spaces
- **세미콜론**: 사용
- **따옴표**: 싱글 쿼트 ('') 사용
- **Import 순서**: 외부 라이브러리 → 내부 모듈 → 타입

#### Git Commit 메시지
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

**Examples:**
```
feat(auth): implement JWT authentication

Add JWT token generation and verification
Add auth middleware for protected routes

Closes #12
```

### 11.2 참고 자료

#### 공식 문서
- [Node.js](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Prisma](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs/)

#### 튜토리얼
- [JWT Authentication in Node.js](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs)
- [React State Management with Zustand](https://github.com/pmndrs/zustand)
- [Testing Node.js APIs with Jest](https://jestjs.io/docs/getting-started)

### 11.3 용어 사전

| 용어 | 설명 |
|------|------|
| **MVP** | Minimum Viable Product (최소 기능 제품) |
| **CRUD** | Create, Read, Update, Delete |
| **JWT** | JSON Web Token |
| **ORM** | Object-Relational Mapping |
| **API** | Application Programming Interface |
| **E2E** | End-to-End (테스트) |
| **CI/CD** | Continuous Integration/Continuous Deployment |
| **MAU** | Monthly Active Users |

---

**문서 종료**

이 PRD를 기반으로 Jan TodoList MVP를 3개월 내에 개발 완료할 수 있습니다. 추가 질문이나 명확히 할 사항이 있으면 개발팀에 문의하세요.
