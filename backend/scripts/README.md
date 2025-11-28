# tcust 테이블 더미 데이터 생성

대규모 테스트용 더미 데이터를 생성하는 스크립트입니다.

## 📋 파일 목록

- `create-tcust-table.sql` - tcust 테이블 생성
- `generate-dummy-data.sql` - 10,000건 더미 데이터 생성
- `run-dummy-data.js` - Node.js 실행 스크립트

## 🚀 실행 방법

### 방법 1: Node.js로 실행 (권장)

```bash
cd backend
node scripts/run-dummy-data.js
```

### 방법 2: psql로 직접 실행

```bash
# 1. 테이블 생성
psql -U postgres -d todolist -f scripts/create-tcust-table.sql

# 2. 더미 데이터 생성
psql -U postgres -d todolist -f scripts/generate-dummy-data.sql
```

### 방법 3: PostgreSQL MCP 사용

```bash
# MCP 도구를 사용해서 실행
```

## 📊 생성되는 데이터

### tcust 테이블 구조

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| cust_id | SERIAL | 회원 ID (기본키) |
| cust_name | VARCHAR(100) | 회원 이름 (한국 이름) |
| cust_email | VARCHAR(200) | 이메일 (유니크) |
| cust_phone | VARCHAR(20) | 전화번호 (010-XXXX-XXXX) |
| cust_birth | DATE | 생년월일 (1950~2005) |
| cust_address | TEXT | 주소 (한국 주소) |
| created_at | TIMESTAMP | 가입일시 (최근 2년) |

### 더미 데이터 특징

- **총 10,000건** 생성
- **한국식 이름**: 20개 성씨 + 30개 이름 조합
- **이메일**: user{번호}_{랜덤}@example.com 형식
- **전화번호**: 010-XXXX-XXXX 형식
- **주소**: 실제 한국 도시/구 기반
- **생년월일**: 1950년 ~ 2005년 사이 랜덤
- **가입일시**: 최근 2년 이내 랜덤

## ⚙️ 설정 변경

더미 데이터 건수를 변경하려면 `generate-dummy-data.sql` 파일의 다음 부분을 수정하세요:

```sql
v_target INTEGER := 10000; -- 생성할 데이터 건수
v_batch_size INTEGER := 1000; -- 배치 크기
```

## 📌 주의사항

- 실행 시 **기존 tcust 테이블이 삭제**됩니다
- 10,000건 생성에 약 **5-10초** 소요
- 데이터베이스 연결 정보는 `.env` 파일에서 가져옵니다

## 🔍 데이터 확인

```sql
-- 총 건수 확인
SELECT COUNT(*) FROM tcust;

-- 샘플 데이터 확인
SELECT * FROM tcust LIMIT 10;

-- 통계 확인
SELECT
  COUNT(*) AS total,
  MIN(created_at) AS first_joined,
  MAX(created_at) AS last_joined,
  COUNT(DISTINCT cust_email) AS unique_emails
FROM tcust;
```

## 🗑️ 데이터 삭제

```sql
-- 모든 데이터 삭제
TRUNCATE TABLE tcust RESTART IDENTITY CASCADE;

-- 테이블 삭제
DROP TABLE IF EXISTS tcust CASCADE;
```
