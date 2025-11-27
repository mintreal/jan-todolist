-- ============================================
-- 데이터베이스 마이그레이션: 하루종일 기능 추가
-- due_date -> start_date, end_date 변경
-- is_all_day 컬럼 추가
-- ============================================

-- 1. 새로운 컬럼 추가
ALTER TABLE todos ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT TRUE;
ALTER TABLE todos ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;
ALTER TABLE todos ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;

-- 2. 기존 데이터 마이그레이션 (due_date -> start_date, end_date)
UPDATE todos
SET
  start_date = due_date::timestamp,
  end_date = (due_date + INTERVAL '1 day')::timestamp,
  is_all_day = TRUE
WHERE start_date IS NULL;

-- 3. start_date, end_date를 NOT NULL로 변경
ALTER TABLE todos ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE todos ALTER COLUMN end_date SET NOT NULL;

-- 4. 기존 due_date 컬럼 삭제
ALTER TABLE todos DROP COLUMN IF EXISTS due_date;

-- 5. 인덱스 재생성
DROP INDEX IF EXISTS idx_todos_due_date;
CREATE INDEX IF NOT EXISTS idx_todos_start_date ON todos(start_date);

-- 6. 컬럼 코멘트 업데이트
COMMENT ON COLUMN todos.is_all_day IS '하루종일 여부 (true: 날짜만, false: 날짜+시간)';
COMMENT ON COLUMN todos.start_date IS '시작 날짜/시간';
COMMENT ON COLUMN todos.end_date IS '종료 날짜/시간';

-- 완료 메시지
SELECT '마이그레이션 완료!' as message;
