-- ============================================
-- Jan TodoList Database Schema
-- Phase 1 (3일 스프린트)
-- ============================================
-- 작성일: 2025-11-26
-- 데이터베이스: PostgreSQL 12+
-- 인코딩: UTF-8
-- ============================================

-- 데이터베이스 생성 (필요 시 주석 해제)
-- CREATE DATABASE jan_todolist
--   ENCODING 'UTF8'
--   LC_COLLATE 'ko_KR.UTF-8'
--   LC_CTYPE 'ko_KR.UTF-8';

-- ============================================
-- 1. 기존 테이블 삭제 (개발 환경 전용)
-- ============================================
-- 주의: 프로덕션 환경에서는 주석 처리할 것!

-- DROP TABLE IF EXISTS todos CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 2. users 테이블 생성
-- ============================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. todos 테이블 생성
-- ============================================

CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- 외래 키 제약조건
  CONSTRAINT fk_todos_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- ============================================
-- 4. 인덱스 생성
-- ============================================

-- 사용자별 할일 조회 최적화
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- 기한별 정렬 최적화
CREATE INDEX idx_todos_due_date ON todos(due_date);

-- ============================================
-- 5. 테이블 및 컬럼 코멘트 (문서화)
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
COMMENT ON COLUMN todos.due_date IS '기한 (날짜만, 시간 제외)';
COMMENT ON COLUMN todos.created_at IS '생성일시';
COMMENT ON COLUMN todos.updated_at IS '최종 수정일시';

-- ============================================
-- 6. updated_at 자동 업데이트 트리거
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
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. 스키마 검증 쿼리
-- ============================================

-- 테이블 목록 확인
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 제약조건 확인
-- SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name IN ('users', 'todos');

-- 인덱스 확인
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
