-- tcust 테이블 생성 스크립트
-- 회원 정보를 저장하는 테이블

-- 기존 테이블이 있으면 삭제 (주의: 데이터 손실됨)
DROP TABLE IF EXISTS tcust CASCADE;

-- tcust 테이블 생성
CREATE TABLE tcust (
  cust_id SERIAL PRIMARY KEY,
  cust_name VARCHAR(100) NOT NULL,
  cust_email VARCHAR(200) UNIQUE NOT NULL,
  cust_phone VARCHAR(20) NOT NULL,
  cust_birth DATE,
  cust_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_tcust_email ON tcust(cust_email);
CREATE INDEX idx_tcust_phone ON tcust(cust_phone);
CREATE INDEX idx_tcust_created_at ON tcust(created_at);

-- 코멘트 추가
COMMENT ON TABLE tcust IS '회원 정보 테이블';
COMMENT ON COLUMN tcust.cust_id IS '회원 ID (기본키)';
COMMENT ON COLUMN tcust.cust_name IS '회원 이름';
COMMENT ON COLUMN tcust.cust_email IS '이메일 (유니크)';
COMMENT ON COLUMN tcust.cust_phone IS '전화번호';
COMMENT ON COLUMN tcust.cust_birth IS '생년월일';
COMMENT ON COLUMN tcust.cust_address IS '주소';
COMMENT ON COLUMN tcust.created_at IS '가입일시';

-- 테이블 생성 완료 메시지
SELECT 'tcust 테이블이 성공적으로 생성되었습니다.' AS result;
