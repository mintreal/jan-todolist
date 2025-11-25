# Jan TodoList 기술 스택 및 아키텍처

## 1. 기술 스택

### 1.1 백엔드
- **런타임**: Node.js (LTS 버전)
- **프레임워크**: Express.js
- **언어**: TypeScript
- **데이터베이스**: PostgreSQL
- **ORM**: Prisma 또는 TypeORM
- **인증**: JWT (JSON Web Token)
- **비밀번호 암호화**: bcrypt
- **검증**: Joi 또는 Zod
- **환경변수**: dotenv

### 1.2 프론트엔드
- **라이브러리**: React 18+
- **언어**: TypeScript
- **빌드 도구**: Vite
- **라우팅**: React Router
- **상태관리**: Context API + Hooks (또는 Zustand)
- **HTTP 클라이언트**: Axios
- **UI 라이브러리**: Material-UI (MUI) 또는 Tailwind CSS
- **캘린더**: react-big-calendar 또는 FullCalendar
- **날짜 처리**: date-fns 또는 dayjs

### 1.3 개발 도구
- **패키지 매니저**: npm 또는 yarn
- **코드 포맷팅**: Prettier
- **린팅**: ESLint
- **Git Hooks**: Husky
- **API 테스트**: Postman 또는 Thunder Client
- **타입 체크**: TypeScript Compiler

### 1.4 배포 (선택사항)
- **백엔드**: Heroku, Railway, Render
- **프론트엔드**: Vercel, Netlify
- **데이터베이스**: Supabase, ElephantSQL

## 2. 프로젝트 구조 (모노레포)

```
jan-todolist/
├── docs/                           # 문서
│   ├── 0-domain-definition-request.md
│   ├── 1-domain-definition.md
│   ├── 2-tech-stack-and-architecture.md
│   ├── 3-database-schema.md
│   └── 4-api-specification.md
├── backend/                        # 백엔드
│   ├── src/
│   │   ├── config/                 # 설정 파일
│   │   ├── controllers/            # 요청 처리
│   │   ├── middleware/             # 인증, 에러 핸들링 등
│   │   ├── models/                 # 데이터 모델 (Prisma 스키마)
│   │   ├── routes/                 # API 라우트
│   │   ├── services/               # 비즈니스 로직
│   │   ├── utils/                  # 유틸리티 함수
│   │   ├── types/                  # TypeScript 타입 정의
│   │   └── app.ts                  # Express 앱 설정
│   │   └── server.ts               # 서버 시작
│   ├── prisma/                     # Prisma 스키마 및 마이그레이션
│   ├── tests/                      # 테스트
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # 프론트엔드
│   ├── public/                     # 정적 파일
│   ├── src/
│   │   ├── api/                    # API 호출 함수
│   │   ├── components/             # 재사용 가능한 컴포넌트
│   │   │   ├── auth/               # 인증 관련
│   │   │   ├── todo/               # 할일 관련
│   │   │   ├── calendar/           # 캘린더 관련
│   │   │   └── common/             # 공통 컴포넌트
│   │   ├── contexts/               # React Context
│   │   ├── hooks/                  # Custom Hooks
│   │   ├── pages/                  # 페이지 컴포넌트
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── TodoListPage.tsx
│   │   │   ├── CalendarPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── types/                  # TypeScript 타입
│   │   ├── utils/                  # 유틸리티
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
├── README.md
└── package.json                    # 루트 package.json (워크스페이스)
```

## 3. 아키텍처 패턴

### 3.1 백엔드 아키텍처
**레이어드 아키텍처 (Layered Architecture)**

```
Client Request
      ↓
  Routes Layer (라우팅)
      ↓
Controllers Layer (요청/응답 처리)
      ↓
 Services Layer (비즈니스 로직)
      ↓
  Models Layer (데이터 접근)
      ↓
   Database
```

**각 레이어 역할:**
- **Routes**: URL 엔드포인트 정의
- **Controllers**: 요청 받고 응답 반환, 검증
- **Services**: 핵심 비즈니스 로직
- **Models**: 데이터베이스 쿼리 및 스키마

### 3.2 프론트엔드 아키텍처
**컴포넌트 기반 아키텍처**

```
App (라우팅)
  ↓
Pages (페이지 단위)
  ↓
Components (기능 단위)
  ↓
Common Components (재사용)
```

**데이터 흐름:**
- Context API로 전역 상태 관리 (사용자 인증, 테마 등)
- Props drilling 최소화
- Custom Hooks로 로직 재사용

## 4. 인증 흐름

### 4.1 회원가입
1. 사용자가 이메일/비밀번호 입력
2. 프론트엔드에서 기본 검증
3. 백엔드로 POST /api/auth/register
4. 백엔드에서 이메일 중복 확인
5. 비밀번호 bcrypt로 해싱
6. 데이터베이스에 사용자 저장
7. JWT 토큰 생성 및 반환

### 4.2 로그인
1. 사용자가 이메일/비밀번호 입력
2. 백엔드로 POST /api/auth/login
3. 이메일로 사용자 조회
4. 비밀번호 검증
5. JWT 토큰 생성 및 반환
6. 프론트엔드에서 토큰을 localStorage에 저장
7. 이후 요청에 Authorization 헤더에 포함

### 4.3 인증 미들웨어
- 보호된 API 엔드포인트에 JWT 검증 미들웨어 적용
- 토큰에서 사용자 정보 추출
- req.user에 사용자 정보 저장

## 5. 데이터베이스 설계 원칙

### 5.1 정규화
- 3차 정규화 (3NF) 준수
- 데이터 중복 최소화

### 5.2 인덱싱
- 자주 조회되는 컬럼에 인덱스 설정
- user_id, due_date 등

### 5.3 관계
- User ↔ TodoItem: 1:N
- TodoItem ↔ TodoShare: 1:N
- User ↔ Notification: 1:N

## 6. API 설계 원칙

### 6.1 RESTful API
- 리소스 중심 설계
- HTTP 메서드 적절히 사용
  - GET: 조회
  - POST: 생성
  - PUT/PATCH: 수정
  - DELETE: 삭제

### 6.2 응답 형식
```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
}
```

에러 응답:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

### 6.3 상태 코드
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 401: 인증 필요
- 403: 권한 없음
- 404: 리소스 없음
- 500: 서버 에러

## 7. 보안 고려사항

### 7.1 백엔드
- **비밀번호**: bcrypt로 해싱 (salt rounds: 10)
- **JWT**: 비밀키 환경변수로 관리, 만료시간 설정
- **CORS**: 프론트엔드 도메인만 허용
- **SQL Injection**: Prisma/TypeORM 사용으로 방지
- **입력 검증**: Joi/Zod로 모든 입력 검증
- **Rate Limiting**: 무차별 대입 공격 방지

### 7.2 프론트엔드
- **XSS 방지**: React의 자동 이스케이핑 활용
- **토큰 저장**: localStorage (또는 httpOnly 쿠키)
- **HTTPS**: 배포 시 필수

## 8. 개발 순서

1. **Phase 1: 기반 구축**
   - 프로젝트 구조 생성
   - 백엔드/프론트엔드 초기화
   - 데이터베이스 연결

2. **Phase 2: 인증 구현**
   - 회원가입/로그인 API
   - JWT 미들웨어
   - 인증 UI

3. **Phase 3: 할일 CRUD**
   - 할일 API
   - 할일 리스트 UI

4. **Phase 4: 기한 관리**
   - 기한 정렬 로직
   - 알림 시스템

5. **Phase 5: 캘린더 뷰**
   - 캘린더 컴포넌트
   - 월간 뷰

6. **Phase 6: 공유 기능**
   - 공유 API
   - 공유 UI

7. **Phase 7: 외부 연동**
   - OAuth 구현
   - 캘린더 동기화
