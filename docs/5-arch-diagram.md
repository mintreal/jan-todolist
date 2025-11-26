# Jan TodoList - 기술 아키텍처 다이어그램

## 문서 정보
- **버전**: 1.0
- **작성일**: 2025-11-26
- **최종 수정일**: 2025-11-26
- **작성자**: Development Team
- **문서 상태**: 최종
- **참조 문서**: [PRD](./2-prd.md), [도메인 정의서](./1-domain-definition.md)

---

## 1. 시스템 아키텍처

### 개요
Jan TodoList는 3계층 아키텍처를 기반으로 하는 웹 애플리케이션입니다. 프론트엔드(React SPA), 백엔드(Express API), 데이터베이스(PostgreSQL)로 구성됩니다.

```mermaid
graph TB
    User[사용자]

    subgraph Frontend["프론트엔드 (Vercel)"]
        React[React SPA<br/>Vite]
        Router[React Router]
        Axios[Axios Client]
    end

    subgraph Backend["백엔드 (Railway)"]
        Express[Express Server]
        Auth[인증 미들웨어<br/>JWT]
        API[REST API]
    end

    subgraph Database["데이터베이스 (Railway)"]
        Postgres[(PostgreSQL)]
    end

    User -->|HTTPS| React
    React --> Router
    Router --> Axios
    Axios -->|REST API<br/>HTTPS| Express
    Express --> Auth
    Auth --> API
    API -->|SQL| Postgres
```

### 핵심 컴포넌트
- **프론트엔드**: React 18 + Vite, Tailwind CSS
- **백엔드**: Node.js + Express, JWT 인증
- **데이터베이스**: PostgreSQL, 관계형 데이터 모델
- **배포**: Vercel (프론트엔드), Railway (백엔드 + DB)

---

## 2. 인증 플로우

### 개요
JWT 기반 토큰 인증 방식을 사용합니다. 회원가입/로그인 시 토큰을 발급받아 localStorage에 저장하고, 이후 모든 API 요청에 자동으로 포함시킵니다.

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Client as React Client
    participant Server as Express Server
    participant DB as PostgreSQL

    Note over User,DB: 1. 회원가입 플로우
    User->>Client: 회원가입 폼 제출
    Client->>Server: POST /api/auth/signup<br/>{email, password, name}
    Server->>DB: 이메일 중복 확인
    DB-->>Server: 중복 없음
    Server->>Server: bcrypt 비밀번호 해싱
    Server->>DB: 사용자 생성
    DB-->>Server: 생성 완료
    Server->>Server: JWT 토큰 생성
    Server-->>Client: {token, user}
    Client->>Client: localStorage 저장
    Client-->>User: 할일 목록 화면 이동

    Note over User,DB: 2. 로그인 플로우
    User->>Client: 로그인 폼 제출
    Client->>Server: POST /api/auth/login<br/>{email, password}
    Server->>DB: 사용자 조회
    DB-->>Server: 사용자 정보
    Server->>Server: bcrypt 비밀번호 검증
    Server->>Server: JWT 토큰 생성
    Server-->>Client: {token, user}
    Client->>Client: localStorage 저장
    Client-->>User: 할일 목록 화면 이동

    Note over User,DB: 3. 인증된 API 요청
    User->>Client: 할일 목록 조회
    Client->>Client: localStorage에서 토큰 가져오기
    Client->>Server: GET /api/todos<br/>Authorization: Bearer {token}
    Server->>Server: JWT 토큰 검증
    Server->>DB: 사용자별 할일 조회
    DB-->>Server: 할일 목록
    Server-->>Client: [{todo1}, {todo2}]
    Client-->>User: 할일 목록 표시
```

### 보안 사항
- 비밀번호는 bcrypt로 해싱 (10 rounds)
- JWT 토큰 만료 시간: 24시간
- HTTPS 필수 (토큰 탈취 방지)
- 토큰은 localStorage에 저장

---

## 3. 할일 CRUD 플로우

### 개요
할일 생성, 조회, 수정, 삭제의 전체 흐름을 보여줍니다. 모든 작업은 인증이 필요하며, 사용자는 자신의 할일만 관리할 수 있습니다.

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Client as React Client
    participant Server as Express Server
    participant DB as PostgreSQL

    Note over User,DB: 1. 할일 생성
    User->>Client: 할일 추가 (제목, 기한)
    Client->>Server: POST /api/todos<br/>{title, due_date}
    Server->>Server: JWT 검증
    Server->>Server: 입력 검증
    Server->>DB: 할일 생성
    DB-->>Server: 생성된 할일
    Server-->>Client: {id, title, due_date, ...}
    Client->>Client: 목록에 추가 (정렬)
    Client-->>User: 화면 업데이트

    Note over User,DB: 2. 할일 조회
    User->>Client: 할일 목록 요청
    Client->>Server: GET /api/todos
    Server->>Server: JWT 검증
    Server->>DB: 사용자별 할일 조회<br/>(기한 순 정렬)
    DB-->>Server: 할일 목록
    Server-->>Client: [{todo1}, {todo2}]
    Client->>Client: 기한별 정렬 및 표시
    Client-->>User: 할일 목록 표시

    Note over User,DB: 3. 할일 수정
    User->>Client: 할일 수정 (제목/기한/완료)
    Client->>Server: PUT /api/todos/:id<br/>{title, due_date, is_completed}
    Server->>Server: JWT 검증
    Server->>DB: 소유자 확인
    DB-->>Server: 권한 확인 완료
    Server->>DB: 할일 수정
    DB-->>Server: 수정된 할일
    Server-->>Client: {id, title, ...}
    Client->>Client: 목록 업데이트 (재정렬)
    Client-->>User: 화면 업데이트

    Note over User,DB: 4. 할일 삭제
    User->>Client: 할일 삭제 버튼 클릭
    Client->>Client: 확인 대화상자 표시
    User->>Client: 삭제 확인
    Client->>Server: DELETE /api/todos/:id
    Server->>Server: JWT 검증
    Server->>DB: 소유자 확인
    DB-->>Server: 권한 확인 완료
    Server->>DB: 할일 삭제
    DB-->>Server: 삭제 완료
    Server-->>Client: 204 No Content
    Client->>Client: 목록에서 제거
    Client-->>User: 화면 업데이트
```

### 권한 관리
- 모든 CRUD 작업은 JWT 인증 필요
- 사용자는 자신의 할일만 조회/수정/삭제 가능
- 소유자 검증은 서버에서 수행 (보안)

---

## 4. 데이터베이스 ERD

### 개요
간단한 2개 테이블 구조로, users와 todos가 1:N 관계를 갖습니다.

```mermaid
erDiagram
    users ||--o{ todos : "owns"

    users {
        int id PK "자동증가"
        varchar email UK "이메일 (고유)"
        varchar password "bcrypt 해시"
        varchar name "사용자 이름"
        timestamp created_at "생성일시"
    }

    todos {
        int id PK "자동증가"
        int user_id FK "소유자"
        varchar title "할일 제목"
        boolean is_completed "완료 여부"
        date due_date "기한 (선택)"
        timestamp created_at "생성일시"
        timestamp updated_at "수정일시"
    }
```

### 테이블 설명

#### users 테이블
- `id`: 기본키, 자동 증가
- `email`: 유니크 제약조건, 로그인 ID
- `password`: bcrypt 해시 (최소 10 rounds)
- `name`: 사용자 표시 이름
- `created_at`: 가입일시

#### todos 테이블
- `id`: 기본키, 자동 증가
- `user_id`: 외래키 (users.id), ON DELETE CASCADE
- `title`: 할일 제목 (1-200자)
- `is_completed`: 완료 여부 (기본값: false)
- `due_date`: 기한 (DATE 타입, NULL 허용)
- `created_at`: 생성일시
- `updated_at`: 최종 수정일시

### 인덱스
- `idx_todos_user_id`: 사용자별 조회 성능 향상
- `idx_todos_due_date`: 기한 기반 정렬 성능 향상

---

## 5. 배포 아키텍처

### 개요
프론트엔드는 Vercel, 백엔드와 데이터베이스는 Railway에 배포됩니다. 모든 통신은 HTTPS로 암호화됩니다.

```mermaid
graph TB
    User[사용자<br/>브라우저]

    subgraph Vercel["Vercel (CDN)"]
        Static[정적 파일<br/>React SPA]
        CDN[전역 CDN<br/>엣지 배포]
    end

    subgraph Railway["Railway Platform"]
        subgraph App["Express API"]
            API[Node.js<br/>Express Server]
            Middleware[미들웨어<br/>CORS, JWT, Helmet]
        end

        subgraph DB["PostgreSQL"]
            Database[(Database<br/>users, todos)]
            Backup[(자동 백업)]
        end
    end

    User -->|HTTPS| CDN
    CDN --> Static
    Static -->|API 요청<br/>HTTPS| Middleware
    Middleware --> API
    API -->|SQL| Database
    Database -.->|백업| Backup

    style Vercel fill:#000000,stroke:#ffffff,color:#ffffff
    style Railway fill:#7c3aed,stroke:#ffffff,color:#ffffff
```

### 배포 환경

#### Vercel (프론트엔드)
- **역할**: React SPA 정적 파일 호스팅
- **특징**:
  - 전역 CDN을 통한 빠른 응답
  - 자동 HTTPS 인증서
  - Git 기반 자동 배포
  - 환경 변수: `VITE_API_URL`

#### Railway (백엔드 + DB)
- **역할**: Express API 서버 + PostgreSQL 데이터베이스
- **특징**:
  - 컨테이너 기반 배포
  - 자동 스케일링
  - PostgreSQL 자동 백업
  - 환경 변수: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`

### 배포 흐름
```mermaid
graph LR
    Dev[개발자]
    Git[GitHub Repo]

    subgraph "프론트엔드 배포"
        VercelBuild[Vercel Build]
        VercelDeploy[Vercel Deploy]
    end

    subgraph "백엔드 배포"
        RailwayBuild[Railway Build]
        RailwayDeploy[Railway Deploy]
    end

    Dev -->|git push| Git
    Git -->|자동 트리거| VercelBuild
    Git -->|자동 트리거| RailwayBuild
    VercelBuild -->|빌드 성공| VercelDeploy
    RailwayBuild -->|빌드 성공| RailwayDeploy
```

### 환경 변수 관리

#### 프론트엔드 (Vercel)
- `VITE_API_URL`: 백엔드 API URL (예: https://api.jan-todolist.railway.app)

#### 백엔드 (Railway)
- `DATABASE_URL`: PostgreSQL 연결 문자열 (자동 생성)
- `JWT_SECRET`: JWT 서명 키 (수동 설정)
- `CORS_ORIGIN`: 허용할 프론트엔드 도메인 (예: https://jan-todolist.vercel.app)
- `NODE_ENV`: production

---

## 6. API 엔드포인트 구조

### 개요
RESTful API 설계 원칙을 따르며, 인증과 할일 관리로 구분됩니다.

```mermaid
graph TB
    API[API Server<br/>Express]

    subgraph Auth["인증 API"]
        Signup[POST /api/auth/signup<br/>회원가입]
        Login[POST /api/auth/login<br/>로그인]
    end

    subgraph Todos["할일 API (인증 필요)"]
        GetTodos[GET /api/todos<br/>할일 목록 조회]
        CreateTodo[POST /api/todos<br/>할일 생성]
        UpdateTodo[PUT /api/todos/:id<br/>할일 수정]
        DeleteTodo[DELETE /api/todos/:id<br/>할일 삭제]
    end

    API --> Auth
    API --> Todos

    Todos -.->|JWT 검증| AuthMiddleware[인증 미들웨어]
```

### API 엔드포인트 목록

#### 인증 API (인증 불필요)
- `POST /api/auth/signup`: 회원가입
- `POST /api/auth/login`: 로그인

#### 할일 API (인증 필요)
- `GET /api/todos`: 사용자별 할일 목록 조회 (기한 순 정렬)
- `POST /api/todos`: 새 할일 생성
- `PUT /api/todos/:id`: 할일 수정 (제목/기한/완료 상태)
- `DELETE /api/todos/:id`: 할일 삭제

---

## 7. 프론트엔드 구조

### 개요
React 컴포넌트 기반 SPA로, 페이지와 재사용 컴포넌트로 구성됩니다.

```mermaid
graph TB
    App[App.jsx<br/>라우팅 루트]

    subgraph Pages["페이지 컴포넌트"]
        Login[LoginPage<br/>/login]
        Signup[SignupPage<br/>/signup]
        TodoMain[TodoPage<br/>/todos]
        NotFound[NotFoundPage<br/>/*]
    end

    subgraph Components["공통 컴포넌트"]
        Header[Header<br/>로고, 로그아웃]
        TodoList[TodoList<br/>할일 목록]
        TodoItem[TodoItem<br/>할일 항목]
        TodoForm[TodoForm<br/>할일 추가]
    end

    subgraph Services["서비스 레이어"]
        AuthService[authService<br/>로그인/회원가입]
        TodoService[todoService<br/>할일 CRUD]
        AxiosInstance[Axios 인스턴스<br/>JWT 자동 첨부]
    end

    App --> Pages
    TodoMain --> Header
    TodoMain --> TodoForm
    TodoMain --> TodoList
    TodoList --> TodoItem

    Pages --> Services
    Components --> Services
    Services --> AxiosInstance
```

### 라우팅 구조
- `/login`: 로그인 화면
- `/signup`: 회원가입 화면
- `/todos`: 할일 목록 화면 (보호된 라우트)
- `/*`: 404 페이지

---

## 8. 데이터 흐름 다이어그램

### 개요
사용자 액션부터 데이터베이스 업데이트까지의 전체 데이터 흐름을 보여줍니다.

```mermaid
flowchart LR
    User[사용자 액션]

    subgraph Client["React Client"]
        UI[UI 컴포넌트]
        State[React State]
        Service[API Service]
    end

    subgraph Server["Express Server"]
        Router[라우터]
        Controller[컨트롤러]
        Model[모델]
    end

    DB[(PostgreSQL)]

    User -->|클릭/입력| UI
    UI -->|이벤트| State
    State -->|API 호출| Service
    Service -->|HTTP 요청| Router
    Router -->|처리| Controller
    Controller -->|쿼리| Model
    Model -->|SQL| DB
    DB -->|결과| Model
    Model -->|응답| Controller
    Controller -->|JSON| Router
    Router -->|HTTP 응답| Service
    Service -->|데이터| State
    State -->|리렌더링| UI
    UI -->|화면 갱신| User
```

---

## 9. 보안 아키텍처

### 개요
애플리케이션의 주요 보안 메커니즘을 보여줍니다.

```mermaid
graph TB
    Client[React Client]

    subgraph Security["보안 레이어"]
        HTTPS[HTTPS<br/>전송 암호화]
        CORS[CORS<br/>출처 검증]
        Helmet[Helmet.js<br/>보안 헤더]
        JWT[JWT 검증<br/>인증]
        Bcrypt[Bcrypt<br/>비밀번호 해싱]
        Validation[입력 검증<br/>express-validator]
        SQL[Prepared Statement<br/>SQL Injection 방지]
    end

    DB[(PostgreSQL)]

    Client -->|요청| HTTPS
    HTTPS --> CORS
    CORS --> Helmet
    Helmet --> JWT
    JWT --> Validation
    Validation --> SQL
    SQL --> DB

    Bcrypt -.->|비밀번호 저장| DB
```

### 보안 조치 목록

#### 전송 보안
- **HTTPS**: 모든 통신 암호화 (Vercel, Railway 자동 제공)
- **CORS**: 허용된 도메인만 API 접근 가능

#### 인증/인가
- **JWT**: 토큰 기반 인증 (만료 시간: 24시간)
- **bcrypt**: 비밀번호 해싱 (10 rounds)
- **권한 검증**: 서버에서 소유자 확인

#### 입력 검증
- **클라이언트**: React Hook Form 검증
- **서버**: express-validator 검증
- **SQL Injection 방지**: Prepared Statement 사용

#### 보안 헤더
- **Helmet.js**: XSS, Clickjacking 등 방지

---

## 부록

### A. 기술 스택 버전
- React: 18.2.0
- Node.js: 18.x
- Express: 4.18.2
- PostgreSQL: 14.x
- Vite: 5.x
- Tailwind CSS: 3.3.0

### B. 성능 목표
- API 응답 시간: 500ms 이내 (p95)
- 페이지 로드 시간: 2초 이내
- Lighthouse 점수: 80점 이상

### C. 확장 계획 (Phase 2)
- 알림 시스템 (WebSocket 또는 Server-Sent Events)
- 캘린더 뷰 (FullCalendar 라이브러리)
- 할일 공유 (새로운 API 엔드포인트)
- 외부 캘린더 연동 (Google Calendar API)

---

**문서 작성 완료일**: 2025-11-26
**다음 단계**: 이 아키텍처를 기반으로 개발 시작
