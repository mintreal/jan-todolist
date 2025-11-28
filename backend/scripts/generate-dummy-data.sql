-- tcust 테이블에 대규모 더미 데이터 생성
-- 10,000건 이상의 테스트 데이터를 생성합니다

-- 더미 데이터 생성 시작
DO $$
DECLARE
  v_count INTEGER := 0;
  v_target INTEGER := 10000; -- 생성할 데이터 건수
  v_batch_size INTEGER := 1000; -- 배치 크기

  -- 한국 성씨 배열
  v_surnames TEXT[] := ARRAY['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '전'];

  -- 한국 이름 배열
  v_first_names TEXT[] := ARRAY['민준', '서연', '지우', '하은', '도윤', '서준', '예은', '시우', '지훈', '수빈', '현우', '지민', '준서', '수아', '건우', '하윤', '우진', '채원', '선우', '지아', '유준', '다은', '지호', '윤서', '연우', '소율', '준혁', '지안', '민재', '예린'];

  -- 도시 배열
  v_cities TEXT[] := ARRAY['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도'];

  -- 구 배열
  v_districts TEXT[] := ARRAY['강남구', '서초구', '송파구', '강동구', '강서구', '양천구', '구로구', '영등포구', '동작구', '관악구', '마포구', '서대문구', '은평구', '노원구', '도봉구', '강북구', '성북구', '중랑구', '동대문구', '성동구'];

BEGIN
  RAISE NOTICE '더미 데이터 생성 시작: % 건', v_target;

  -- 배치로 데이터 생성
  FOR i IN 0..(v_target / v_batch_size - 1) LOOP
    INSERT INTO tcust (cust_name, cust_email, cust_phone, cust_birth, cust_address, created_at)
    SELECT
      -- 이름: 성 + 이름
      v_surnames[1 + (random() * (array_length(v_surnames, 1) - 1))::int] ||
      v_first_names[1 + (random() * (array_length(v_first_names, 1) - 1))::int] AS cust_name,

      -- 이메일: user{숫자}@example.com
      'user' || (i * v_batch_size + n) || '_' || floor(random() * 10000)::text || '@example.com' AS cust_email,

      -- 전화번호: 010-XXXX-XXXX
      '010-' ||
      lpad(floor(random() * 10000)::text, 4, '0') || '-' ||
      lpad(floor(random() * 10000)::text, 4, '0') AS cust_phone,

      -- 생년월일: 1950년 ~ 2005년
      (DATE '1950-01-01' + (random() * 365 * 55)::int) AS cust_birth,

      -- 주소: 도시 + 구 + 상세주소
      v_cities[1 + (random() * (array_length(v_cities, 1) - 1))::int] || ' ' ||
      v_districts[1 + (random() * (array_length(v_districts, 1) - 1))::int] || ' ' ||
      (100 + floor(random() * 900))::text || '번길 ' ||
      (1 + floor(random() * 100))::text AS cust_address,

      -- 가입일시: 최근 2년 이내
      (NOW() - (random() * INTERVAL '730 days')) AS created_at

    FROM generate_series(1, v_batch_size) AS n;

    v_count := v_count + v_batch_size;

    -- 진행상황 출력
    IF (i + 1) % 5 = 0 THEN
      RAISE NOTICE '진행: % / % (%.1f%%)', v_count, v_target, (v_count::float / v_target * 100);
    END IF;
  END LOOP;

  RAISE NOTICE '더미 데이터 생성 완료: % 건', v_count;
  RAISE NOTICE '실제 저장된 데이터: % 건', (SELECT COUNT(*) FROM tcust);
END $$;

-- 데이터 통계 확인
SELECT
  COUNT(*) AS "총 데이터 건수",
  MIN(created_at) AS "최초 가입일",
  MAX(created_at) AS "최근 가입일",
  COUNT(DISTINCT cust_email) AS "유니크 이메일 수",
  COUNT(DISTINCT cust_phone) AS "유니크 전화번호 수"
FROM tcust;

-- 샘플 데이터 확인 (10건)
SELECT * FROM tcust ORDER BY cust_id LIMIT 10;
