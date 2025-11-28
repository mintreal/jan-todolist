# 배포 가이드

## 문제 진단 결과

로컬 개발 환경과 Vercel 배포 환경에서 데이터베이스 연결 오류가 발생하는 이유:

**비밀번호에 특수문자 `?`와 `+`가 포함**되어 있어 URL 파싱 실패
- `9p+b9R73Jv?SzBa` ← 이 비밀번호에서 `?`는 URL 쿼리 스트링으로 해석됨
- pg 라이브러리가 URL을 올바르게 파싱하지 못함

## 해결 방법

### 1. Supabase 데이터베이스 마이그레이션 (필수)

현재 Supabase에 테이블이 생성되지 않았습니다. 다음 단계를 따라 마이그레이션하세요:

1. Supabase Dashboard 접속:
   ```
   https://supabase.com/dashboard/project/lgkxqjlhvfobxivufzec/sql/new
   ```

2. `database/migration-final.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣기

3. **Run** 버튼 클릭하여 실행

4. Table Editor에서 `users`와 `todos` 테이블이 생성되었는지 확인:
   ```
   https://supabase.com/dashboard/project/lgkxqjlhvfobxivufzec/editor
   ```

### 2. Vercel 환경 변수 설정 (필수)

Vercel Dashboard에서 다음 환경 변수를 설정하세요:

1. Vercel Dashboard 접속:
   ```
   https://vercel.com/dashboard
   ```

2. 프로젝트 선택 → Settings → Environment Variables

3. 다음 변수 추가:

   ```
   # DATABASE_URL - URL 인코딩된 연결 문자열 사용
   DATABASE_URL=postgresql://postgres.lgkxqjlhvfobxivufzec:9p%2Bb9R73Jv%3FSzBa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres

   # JWT 설정
   JWT_SECRET=your-jwt-secret-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # 환경 설정
   NODE_ENV=production
   CORS_ORIGIN=*
   ```

   **중요**: DATABASE_URL에서 비밀번호 특수문자를 반드시 URL 인코딩하세요:
   - `+` → `%2B`
   - `?` → `%3F`

4. 모든 환경(Production, Preview, Development)에 적용

5. 저장 후 자동 재배포 확인

### 3. 배포 확인

1. Vercel Dashboard → Deployments에서 배포 상태 확인

2. Function Logs 확인:
   - 오류가 없어야 함
   - "Server is running on port 3000" 메시지 확인

3. API 엔드포인트 테스트:
   ```bash
   curl https://your-app.vercel.app/api-docs/
   ```

## 로컬 개발 환경 참고사항

로컬에서는 Supabase 연결이 타임아웃될 수 있습니다 (네트워크 제한).
테스트를 위해 로컬 PostgreSQL을 사용하려면:

```env
# backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todolist"
```

## 문제 해결

### Vercel에서 500 오류 발생 시:

1. Function Logs 확인
2. DATABASE_URL이 올바르게 설정되었는지 확인 (URL 인코딩 포함)
3. Supabase에 테이블이 생성되었는지 확인
4. 환경 변수 변경 후 재배포되었는지 확인

### Supabase 연결 실패 시:

1. Supabase 프로젝트가 활성화되어 있는지 확인
2. 연결 문자열이 올바른지 확인
3. 방화벽이나 네트워크 제한 확인

## 다음 단계

1. ✅ database.js를 Vercel Serverless에 맞게 최적화 완료
2. ⏳ Supabase 마이그레이션 SQL 실행 필요
3. ⏳ Vercel 환경 변수 설정 필요
4. ⏳ 배포 후 테스트 필요
