# Supabase 마이그레이션 가이드

## 🎯 개요
로컬 PostgreSQL 데이터베이스를 Supabase로 마이그레이션하는 가이드입니다.

**프로젝트 ID**: `lgkxqjlhvfobxivufzec`

---

## 📋 사전 준비

1. **Supabase 계정 확인**
   - https://supabase.com/dashboard 접속
   - 프로젝트 `lgkxqjlhvfobxivufzec` 선택

2. **마이그레이션 파일 확인**
   - `database/supabase-migration.sql` 파일 준비

---

## 🚀 마이그레이션 실행 방법

### 방법 1: Supabase Dashboard (추천)

1. **SQL Editor 열기**
   ```
   Supabase Dashboard > SQL Editor
   ```

2. **새 쿼리 생성**
   - "New query" 버튼 클릭

3. **마이그레이션 스크립트 복사**
   - `database/supabase-migration.sql` 파일 내용 전체 복사
   - SQL Editor에 붙여넣기

4. **실행**
   - "Run" 버튼 클릭 (또는 Ctrl+Enter)

5. **결과 확인**
   - 오류가 없으면 성공!
   - 하단에 검증 쿼리 결과가 표시됩니다

---

### 방법 2: Supabase CLI 사용

```bash
# 1. Supabase CLI 설치 (아직 안 했다면)
npm install -g supabase

# 2. 프로젝트 연결
supabase link --project-ref lgkxqjlhvfobxivufzec

# 3. 마이그레이션 실행
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.lgkxqjlhvfobxivufzec.supabase.co:5432/postgres" < database/supabase-migration.sql
```

**비밀번호 찾기**:
- Supabase Dashboard > Settings > Database > Connection string에서 확인

---

## ✅ 마이그레이션 검증

마이그레이션 후 다음 쿼리를 실행해서 확인하세요:

```sql
-- 1. 테이블 목록 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 예상 결과: users, todos

-- 2. users 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. todos 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'todos'
ORDER BY ordinal_position;

-- 4. 인덱스 확인
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'todos')
ORDER BY tablename, indexname;

-- 5. 외래 키 확인
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('users', 'todos');
```

---

## 🔧 백엔드 설정 업데이트

마이그레이션 완료 후 백엔드 설정을 업데이트하세요:

### 1. Supabase Connection String 확인

Supabase Dashboard에서:
```
Settings > Database > Connection string > URI
```

예시:
```
postgresql://postgres.lgkxqjlhvfobxivufzec:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 2. backend/.env 파일 업데이트

```env
# 기존 로컬 DB (주석 처리)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todolist"

# Supabase DB (새로 추가)
DATABASE_URL="postgresql://postgres.lgkxqjlhvfobxivufzec:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"
```

**⚠️ 주의**: `[YOUR-PASSWORD]`를 실제 비밀번호로 변경하세요!

### 3. 백엔드 서버 재시작

```bash
cd backend
npm run dev
```

---

## 🔒 Row Level Security (RLS) 설정 (선택사항)

`database/supabase-migration.sql`에는 RLS 정책이 포함되어 있습니다.

### RLS 정책 설명:
- **users 테이블**: 사용자는 자신의 정보만 조회/수정 가능
- **todos 테이블**: 사용자는 자신의 할일만 CRUD 가능

### RLS 비활성화 (기존 백엔드 코드 그대로 사용)

RLS를 사용하지 않으려면 다음 SQL을 실행하세요:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own todos" ON todos;
DROP POLICY IF EXISTS "Users can create own todos" ON todos;
DROP POLICY IF EXISTS "Users can update own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
```

### RLS 활성화 (더 안전)

RLS를 사용하려면 백엔드 코드에서 다음을 추가하세요:

```javascript
// middleware/auth.js 또는 database connection 설정 부분
app.use((req, res, next) => {
  if (req.user) {
    // RLS 정책에 사용할 사용자 ID 설정
    req.dbClient.query(
      'SET LOCAL app.current_user_id = $1',
      [req.user.id]
    );
  }
  next();
});
```

---

## 📊 데이터 마이그레이션 (선택사항)

기존 로컬 DB에 데이터가 있다면 다음 방법으로 복사하세요:

### 방법 1: PostgreSQL MCP 사용

```bash
# 로컬 DB에서 데이터 export
npm run export-data

# Supabase로 import
npm run import-to-supabase
```

### 방법 2: pg_dump 사용

```bash
# 1. 로컬 DB 덤프
pg_dump -h localhost -U postgres -d todolist --data-only --table=users --table=todos > data-dump.sql

# 2. Supabase에 적용
psql "postgresql://postgres.lgkxqjlhvfobxivufzec:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres" < data-dump.sql
```

---

## 🐛 문제 해결

### 오류: "relation already exists"
- 테이블이 이미 존재합니다
- `IF NOT EXISTS`가 포함되어 있으므로 안전하게 무시 가능

### 오류: "permission denied"
- Supabase 대시보드에서 비밀번호를 재설정하세요
- Settings > Database > Reset Database Password

### 오류: "RLS policy violation"
- RLS가 활성화되어 있습니다
- 위의 "RLS 비활성화" 섹션 참고

### 연결 테스트

```bash
# psql로 Supabase DB 연결 테스트
psql "postgresql://postgres.lgkxqjlhvfobxivufzec:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

# 테이블 목록 확인
\dt

# 연결 종료
\q
```

---

## 📝 체크리스트

마이그레이션 완료 후 다음을 확인하세요:

- [ ] Supabase에 `users` 테이블 생성됨
- [ ] Supabase에 `todos` 테이블 생성됨
- [ ] 인덱스 생성됨 (`idx_todos_user_id`, `idx_todos_start_date`)
- [ ] 외래 키 제약조건 설정됨 (`fk_todos_user`)
- [ ] `updated_at` 트리거 작동 확인
- [ ] backend/.env 파일 업데이트됨
- [ ] 백엔드 서버 재시작 완료
- [ ] 기존 데이터 마이그레이션 완료 (선택)
- [ ] 프론트엔드에서 정상 작동 확인

---

## 🎉 완료!

마이그레이션이 성공적으로 완료되었습니다.

이제 Jan TodoList 앱이 Supabase를 사용합니다! 🚀

**다음 단계**:
1. 프론트엔드에서 회원가입/로그인 테스트
2. 할일 CRUD 기능 테스트
3. Supabase Dashboard에서 실시간 데이터 모니터링

**참고 링크**:
- Supabase Dashboard: https://supabase.com/dashboard/project/lgkxqjlhvfobxivufzec
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
