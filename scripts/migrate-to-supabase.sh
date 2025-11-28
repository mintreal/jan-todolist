#!/bin/bash
# Supabase 자동 마이그레이션 스크립트
# PostgreSQL MCP로 추출한 스키마를 Supabase에 적용합니다

echo "=== Jan TodoList Supabase 마이그레이션 ==="
echo ""

# 1. Supabase CLI 확인
echo "1. Supabase CLI 확인 중..."
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI가 설치되어 있지 않습니다."
    echo ""
    echo "설치 방법:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI 발견"
echo ""

# 2. 프로젝트 ID
PROJECT_ID="lgkxqjlhvfobxivufzec"
echo "2. 프로젝트 ID: $PROJECT_ID"
echo ""

# 3. 마이그레이션 파일 확인
echo "3. 마이그레이션 파일 확인 중..."
MIGRATION_FILE="database/supabase-auto-migration.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ 마이그레이션 파일을 찾을 수 없습니다: $MIGRATION_FILE"
    exit 1
fi

echo "✅ 마이그레이션 파일 발견: $MIGRATION_FILE"
echo ""

# 4. 사용자에게 확인
echo "다음 마이그레이션을 실행합니다:"
echo "  - users 테이블 생성"
echo "  - todos 테이블 생성"
echo "  - 인덱스 생성 (idx_todos_user_id, idx_todos_start_date)"
echo "  - 트리거 생성 (update_todos_updated_at)"
echo ""

read -p "계속하시겠습니까? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "마이그레이션이 취소되었습니다."
    exit 0
fi

echo ""
echo "4. Supabase에 마이그레이션 적용 중..."
echo ""

# 5. Connection string 입력 받기
echo "Supabase Connection String이 필요합니다."
echo "Supabase Dashboard > Settings > Database > Connection string (URI)"
echo ""
read -p "Connection String을 입력하세요: " CONN_STRING

if [ -z "$CONN_STRING" ]; then
    echo "❌ Connection String이 필요합니다."
    exit 1
fi

# 6. psql로 마이그레이션 실행
echo ""
echo "마이그레이션 실행 중..."

if psql "$CONN_STRING" < "$MIGRATION_FILE"; then
    echo ""
    echo "✅ 마이그레이션 완료!"
    echo ""
    echo "다음 단계:"
    echo "  1. backend/.env 파일의 DATABASE_URL을 Supabase URL로 변경"
    echo "  2. 백엔드 서버 재시작"
    echo "  3. 프론트엔드에서 테스트"
    echo ""
else
    echo ""
    echo "❌ 마이그레이션 실패"
    echo "위의 오류 메시지를 확인하세요."
    exit 1
fi
