# Supabase 자동 마이그레이션 스크립트
# PostgreSQL MCP로 추출한 스키마를 Supabase에 적용합니다

Write-Host "=== Jan TodoList Supabase 마이그레이션 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Supabase CLI 확인
Write-Host "1. Supabase CLI 확인 중..." -ForegroundColor Yellow
$supabase = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabase) {
    Write-Host "❌ Supabase CLI가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "설치 방법:" -ForegroundColor Cyan
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Supabase CLI 발견" -ForegroundColor Green
Write-Host ""

# 2. 프로젝트 연결
Write-Host "2. Supabase 프로젝트 연결 중..." -ForegroundColor Yellow
$projectId = "lgkxqjlhvfobxivufzec"

# 3. 마이그레이션 파일 확인
Write-Host "3. 마이그레이션 파일 확인 중..." -ForegroundColor Yellow
$migrationFile = "database\supabase-auto-migration.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ 마이그레이션 파일을 찾을 수 없습니다: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 마이그레이션 파일 발견: $migrationFile" -ForegroundColor Green
Write-Host ""

# 4. 사용자에게 확인
Write-Host "다음 마이그레이션을 실행합니다:" -ForegroundColor Cyan
Write-Host "  - users 테이블 생성" -ForegroundColor White
Write-Host "  - todos 테이블 생성" -ForegroundColor White
Write-Host "  - 인덱스 생성 (idx_todos_user_id, idx_todos_start_date)" -ForegroundColor White
Write-Host "  - 트리거 생성 (update_todos_updated_at)" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "마이그레이션이 취소되었습니다." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "4. Supabase에 마이그레이션 적용 중..." -ForegroundColor Yellow
Write-Host ""

# 5. Connection string 입력 받기
Write-Host "Supabase Connection String이 필요합니다." -ForegroundColor Cyan
Write-Host "Supabase Dashboard > Settings > Database > Connection string (URI)" -ForegroundColor Gray
Write-Host ""
$connString = Read-Host "Connection String을 입력하세요"

if (-not $connString) {
    Write-Host "❌ Connection String이 필요합니다." -ForegroundColor Red
    exit 1
}

# 6. psql로 마이그레이션 실행
Write-Host ""
Write-Host "마이그레이션 실행 중..." -ForegroundColor Yellow

$env:PGPASSWORD = ""  # psql에서 비밀번호 프롬프트 방지

try {
    Get-Content $migrationFile | psql $connString

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 마이그레이션 완료!" -ForegroundColor Green
        Write-Host ""
        Write-Host "다음 단계:" -ForegroundColor Cyan
        Write-Host "  1. backend/.env 파일의 DATABASE_URL을 Supabase URL로 변경" -ForegroundColor White
        Write-Host "  2. 백엔드 서버 재시작" -ForegroundColor White
        Write-Host "  3. 프론트엔드에서 테스트" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ 마이그레이션 실패" -ForegroundColor Red
        Write-Host "위의 오류 메시지를 확인하세요." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ 오류 발생: $_" -ForegroundColor Red
    exit 1
}
