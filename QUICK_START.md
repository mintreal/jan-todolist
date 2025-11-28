# 빠른 시작 가이드

## ⚠️ 중요: 로컬 환경에서 Supabase 연결 불가

로컬 환경에서 Supabase pooler에 연결이 타임아웃됩니다 (네트워크 제한).
**Supabase Dashboard에서 직접 SQL을 실행**해야 합니다.

---

## 🎯 1단계: Supabase 테이블 생성 (필수)

### 방법 1: SQL Editor 사용 (추천)

1. **Supabase SQL Editor 열기:**
   ```
   https://supabase.com/dashboard/project/lgkxqjlhvfobxivufzec/sql/new
   ```

2. **아래 SQL 전체 복사 후 붙여넣기:**

```sql
-- users 테이블
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- todos 테이블
CREATE TABLE IF NOT EXISTS todos (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_all_day BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT todos_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_start_date ON todos(start_date);

-- 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. **`Run` 버튼 클릭**

4. **Table Editor에서 확인:**
   ```
   https://supabase.com/dashboard/project/lgkxqjlhvfobxivufzec/editor
   ```
   - `users` 테이블 확인
   - `todos` 테이블 확인

---

## 🚀 2단계: Vercel 환경 변수 설정

1. **Vercel Dashboard 접속**

2. **Settings → Environment Variables**

3. **다음 변수 추가:**

```
DATABASE_URL=postgresql://postgres.lgkxqjlhvfobxivufzec:ZMMfsKZ7uhueHQA8@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres

JWT_SECRET=your-jwt-secret-key-change-this-in-production

JWT_EXPIRES_IN=7d

NODE_ENV=production

CORS_ORIGIN=*
```

**중요**: 모든 환경(Production, Preview, Development)에 체크

4. **저장 후 Deployments → Redeploy**

---

## ✅ 3단계: 배포 확인

1. **Function Logs 확인:**
   - "Server is running on port 3000" 메시지 확인
   - 오류 없어야 함

2. **API 테스트:**
   ```
   https://your-app.vercel.app/api-docs/
   ```

---

## 📝 참고사항

### 로컬 개발
- 로컬에서는 Supabase 연결이 타임아웃됨
- Vercel 배포 환경에서만 정상 작동

### 새 비밀번호
- 이전 비밀번호: `9p+b9R73Jv?SzBa` (특수문자 포함, URL 인코딩 필요)
- 새 비밀번호: `ZMMfsKZ7uhueHQA8` (특수문자 없음, 인코딩 불필요)

### 파일 위치
- SQL 스크립트: `database/migration-final.sql`
- 환경 설정: `backend/.env`
- 상세 가이드: `DEPLOYMENT_GUIDE.md`
