# 데이터베이스 쿼리 실행 도구

이 프로젝트에는 데이터베이스 쿼리를 실행할 수 있는 유틸리티 스크립트가 포함되어 있습니다.

## 설치 및 설정

1. 먼저 의존성 패키지를 설치합니다:
   ```bash
   cd backend
   npm install
   ```

2. PostgreSQL 데이터베이스를 설정합니다:

   옵션 1: 기존 스크립트를 사용 (todolist 데이터베이스 생성 및 스키마 생성)
   ```bash
   node create_todolist_db.js
   ```
   
   옵션 2: create_schema.js 사용 (todolist 데이터베이스가 이미 존재해야 함)
   ```bash
   node create_schema.js
   ```

3. 환경 변수 파일을 설정합니다. `backend/.env` 파일을 생성하고 다음 내용을 추가합니다:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todolist"
   JWT_SECRET="your-jwt-secret-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3000
   NODE_ENV="development"
   CORS_ORIGIN="http://localhost:5173"
   POSTGRES_CONNECTION_STRING="postgresql://postgres:postgres@localhost:5432/postgres"
   ```

## 사용법

### 1. 간단한 쿼리 실행

직접 SQL 쿼리를 실행할 수 있습니다:

```bash
node db_query.js "SELECT * FROM users;"
```

```bash
node db_query.js "INSERT INTO users (email, password, name) VALUES ('test@example.com', 'hashed_password', 'Test User');"
```

### 2. 특정 작업 유형별 실행

쿼리 유형별로 실행하는 방법:

```bash
# SELECT 쿼리 실행
node db_operations.js select "SELECT * FROM users WHERE id = $1;" 1

# INSERT 쿼리 실행
node db_operations.js insert "INSERT INTO users (email, password, name) VALUES ($1, $2, $3);" "test@example.com" "hashed_password" "Test User"

# UPDATE 쿼리 실행
node db_operations.js update "UPDATE users SET name = $1 WHERE id = $2;" "New Name" 1

# DELETE 쿼리 실행
node db_operations.js delete "DELETE FROM users WHERE id = $1;" 1

# 임의의 SQL 쿼리 실행
node db_operations.js raw "CREATE INDEX idx_test ON todos(due_date);"
```

### 3. npm 스크립트를 통한 실행

package.json에 정의된 스크립트를 사용할 수 있습니다:

```bash
npm run db:query "SELECT * FROM users;"
```

```bash
# db_operations.js는 npm 스크립트로 실행할 수 없습니다 (인수가 전달되지 않음)
# 직접 node 명령어를 사용해야 합니다
```

## 예제

일부 예제 쿼리:

1. 모든 사용자 조회:
   ```bash
   node db_query.js "SELECT * FROM users;"
   ```

2. 특정 사용자의 할일 목록 조회:
   ```bash
   node db_query.js "SELECT * FROM todos WHERE user_id = 1;"
   ```

3. 새로운 할일 추가:
   ```bash
   node db_query.js "INSERT INTO todos (user_id, title, due_date) VALUES (1, '새로운 할일', '2025-12-31');"
   ```

4. 할일 완료 상태 업데이트:
   ```bash
   node db_query.js "UPDATE todos SET is_completed = true WHERE id = 1;"
   ```

5. 완료된 할일만 조회:
   ```bash
   node db_query.js "SELECT * FROM todos WHERE is_completed = true;"
   ```

## 주의사항

- 프로덕션 환경에서는 보안을 위해 실제 데이터베이스 URL을 별도의 보안 저장소에서 관리하세요.
- 민감한 정보나 중요한 데이터를 다룰 때는 SQL 인젝션 방지를 위해 파라미터화된 쿼리를 사용하세요.
- 쿼리 실행 전에 항상 백업을 고려하세요.