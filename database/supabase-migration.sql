-- ============================================
-- Jan TodoList - Supabase Migration Script
-- ============================================
-- 작성일: 2025-11-28
-- 대상: Supabase (PostgreSQL 15+)
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
-- ============================================

-- ============================================
-- 1. users 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. todos 테이블 생성
-- ============================================

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

  -- 외래 키 제약조건
  CONSTRAINT fk_todos_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- ============================================
-- 3. 인덱스 생성
-- ============================================

-- 사용자별 할일 조회 최적화
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- 시작 날짜별 정렬 최적화
CREATE INDEX IF NOT EXISTS idx_todos_start_date ON todos(start_date);

-- 복합 인덱스: 사용자별 시작일 정렬 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_todos_user_start ON todos(user_id, start_date);

-- ============================================
-- 4. updated_at 자동 업데이트 트리거
-- ============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- todos 테이블에 트리거 적용
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Row Level Security (RLS) 설정
-- ============================================
-- Supabase 권장 보안 설정
-- 각 사용자는 자신의 데이터만 조회/수정 가능

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- users 테이블 RLS 정책
-- 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (id = (current_setting('app.current_user_id', TRUE))::BIGINT);

-- 사용자는 자신의 정보만 수정 가능
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (id = (current_setting('app.current_user_id', TRUE))::BIGINT);

-- todos 테이블 RLS 정책
-- 사용자는 자신의 할일만 조회 가능
CREATE POLICY "Users can view own todos"
  ON todos
  FOR SELECT
  USING (user_id = (current_setting('app.current_user_id', TRUE))::BIGINT);

-- 사용자는 자신의 할일만 생성 가능
CREATE POLICY "Users can create own todos"
  ON todos
  FOR INSERT
  WITH CHECK (user_id = (current_setting('app.current_user_id', TRUE))::BIGINT);

-- 사용자는 자신의 할일만 수정 가능
CREATE POLICY "Users can update own todos"
  ON todos
  FOR UPDATE
  USING (user_id = (current_setting('app.current_user_id', TRUE))::BIGINT);

-- 사용자는 자신의 할일만 삭제 가능
CREATE POLICY "Users can delete own todos"
  ON todos
  FOR DELETE
  USING (user_id = (current_setting('app.current_user_id', TRUE))::BIGINT);

-- ============================================
-- 6. 테이블 및 컬럼 코멘트 (문서화)
-- ============================================

-- users 테이블
COMMENT ON TABLE users IS '애플리케이션 사용자 정보';
COMMENT ON COLUMN users.id IS '사용자 고유 식별자';
COMMENT ON COLUMN users.email IS '사용자 이메일 (로그인 ID)';
COMMENT ON COLUMN users.password IS 'bcrypt 해시된 비밀번호 (최소 10 rounds)';
COMMENT ON COLUMN users.name IS '사용자 이름';
COMMENT ON COLUMN users.created_at IS '계정 생성일시';

-- todos 테이블
COMMENT ON TABLE todos IS '사용자의 할일 목록';
COMMENT ON COLUMN todos.id IS '할일 고유 식별자';
COMMENT ON COLUMN todos.user_id IS '소유자 (users.id 참조)';
COMMENT ON COLUMN todos.title IS '할일 제목 (1-200자)';
COMMENT ON COLUMN todos.is_completed IS '완료 여부 (true/false)';
COMMENT ON COLUMN todos.is_all_day IS '하루종일 여부 (true: 날짜만, false: 날짜+시간)';
COMMENT ON COLUMN todos.start_date IS '시작 날짜/시간';
COMMENT ON COLUMN todos.end_date IS '종료 날짜/시간';
COMMENT ON COLUMN todos.created_at IS '생성일시';
COMMENT ON COLUMN todos.updated_at IS '최종 수정일시';

-- ============================================
-- 7. 실시간 구독 활성화 (선택사항)
-- ============================================
-- Supabase Realtime 기능을 사용하려면 주석 해제

-- ALTER PUBLICATION supabase_realtime ADD TABLE todos;

-- ============================================
-- 8. 스키마 검증 쿼리
-- ============================================

-- 테이블 목록 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 제약조건 확인
SELECT
  tc.constraint_name,
  tc.constraint_type,
  tc.table_name
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('users', 'todos')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 인덱스 확인
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'todos')
ORDER BY tablename, indexname;

-- RLS 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('users', 'todos')
ORDER BY tablename, policyname;

-- ============================================
-- 마이그레이션 완료!
-- ============================================
-- 다음 단계:
-- 1. Supabase Dashboard > SQL Editor에서 이 스크립트를 실행하세요
-- 2. 검증 쿼리 결과를 확인하세요
-- 3. 백엔드 .env 파일의 DATABASE_URL을 Supabase URL로 변경하세요
--    예: postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
-- 4. 백엔드 서버를 재시작하세요
-- ============================================
