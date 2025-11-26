# GitHub Issues 생성 가이드

## 개요
`github-issues.json` 파일에는 37개의 GitHub 이슈 내용이 준비되어 있습니다.

## 자동 생성 방법

### PowerShell 사용 (권장)
```powershell
# PowerShell에서 실행
.\create-issues.ps1
```

### 수동 생성 방법
각 이슈를 수동으로 생성하려면:

1. GitHub 저장소의 Issues 탭으로 이동
2. "New issue" 클릭
3. `github-issues.json` 파일을 열어서 각 이슈의 내용 복사
   - `title`: 이슈 제목에 붙여넣기
   - `body`: 이슈 본문에 붙여넣기
   - `labels`: 라벨 추가 (없으면 먼저 생성 필요)

## 이슈 구조

각 이슈는 다음 정보를 포함합니다:

### Title 형식
```
[Stage] Task ID: Task 이름
```
예: `[데이터베이스] DB-001: PostgreSQL 데이터베이스 환경 구성`

### Body 구조
- 📋 작업 설명
- ✅ Todo (해야할 일)
- 🎯 완료 조건
- 🔧 기술적 고려사항
- 📦 의존성 (선행/후행 작업)
- 📝 참고사항

### Labels
4가지 카테고리의 라벨:
1. **종류**: `setup`, `feature`, `deployment`, `testing`
2. **영역**: `database`, `backend`, `frontend`, `devops`
3. **복잡도**: `complexity: low`, `complexity: medium`, `complexity: high`
4. **우선순위**: `P0`, `P1`, `P2`

## 이슈 목록

### 데이터베이스 (3개)
- DB-001: PostgreSQL 데이터베이스 환경 구성 (P0, medium)
- DB-002: 데이터베이스 스키마 생성 (P0, medium)
- DB-003: 샘플 데이터 삽입 (P2, low)

### 백엔드 (10개)
- BE-001: 백엔드 프로젝트 초기화 (P0, medium)
- BE-002: 데이터베이스 연결 설정 (P0, low)
- BE-003: JWT 유틸리티 및 인증 미들웨어 구현 (P0, medium)
- BE-004: 회원가입 API 구현 (P0, high)
- BE-005: 로그인 API 구현 (P0, medium)
- BE-006: 할일 생성 API 구현 (P0, medium)
- BE-007: 할일 조회 API 구현 (P0, medium)
- BE-008: 할일 수정 API 구현 (P1, high)
- BE-009: 할일 삭제 API 구현 (P1, medium)
- BE-010: CORS 및 보안 설정 (P1, medium)

### 프론트엔드 (14개)
- FE-001: 프론트엔드 프로젝트 초기화 (P0, medium)
- FE-002: React Router 설정 및 기본 레이아웃 (P0, medium)
- FE-003: Axios 인스턴스 및 인증 서비스 구현 (P0, medium)
- FE-004: 로그인 화면 구현 (P0, high)
- FE-005: 회원가입 화면 구현 (P0, high)
- FE-006: 할일 서비스 구현 (P1, medium)
- FE-007: 할일 목록 화면 - 기본 구조 (P1, high)
- FE-008: 할일 추가 기능 구현 (P1, high)
- FE-009: 할일 완료 토글 및 삭제 기능 (P1, high)
- FE-010: 할일 인라인 편집 기능 (P2, high)
- FE-011: 기한 표시 및 색상 구분 (P1, medium)
- FE-012: 반응형 디자인 적용 (P1, high)
- FE-013: UI 폴리싱 및 애니메이션 (P2, high)
- FE-014: 로그아웃 및 사용자 정보 표시 (P2, medium)

### 배포 및 테스트 (7개)
- DT-001: E2E 테스트 시나리오 실행 (P0, high)
- DT-002: 버그 수정 (P0, high)
- DT-003: 백엔드 배포 (Railway) (P0, high)
- DT-004: 프론트엔드 배포 (Vercel) (P0, high)
- DT-005: 최종 테스트 및 성능 검증 (P0, high)
- DT-006: README 및 문서화 (P1, high)
- DT-007: 코드 정리 및 최적화 (P2, medium)

## 주의사항

1. **라벨 미리 생성**: 이슈를 생성하기 전에 저장소에 필요한 라벨들을 먼저 생성해야 합니다.
2. **의존성 업데이트**: 이슈 생성 후 의존성 섹션의 Task ID를 실제 이슈 번호로 업데이트하세요.
3. **순서**: P0 우선순위 이슈부터 생성하는 것을 권장합니다.

## 라벨 생성 명령어

```bash
# 종류
gh label create "setup" --color "0E8A16" --description "초기 설정 작업"
gh label create "feature" --color "1D76DB" --description "기능 개발"
gh label create "deployment" --color "5319E7" --description "배포 관련"
gh label create "testing" --color "FBCA04" --description "테스트 관련"

# 영역
gh label create "database" --color "D93F0B" --description "데이터베이스"
gh label create "backend" --color "0052CC" --description "백엔드"
gh label create "frontend" --color "006B75" --description "프론트엔드"
gh label create "devops" --color "5319E7" --description "DevOps"

# 복잡도
gh label create "complexity: low" --color "C2E0C6" --description "복잡도: 낮음"
gh label create "complexity: medium" --color "FEF2C0" --description "복잡도: 중간"
gh label create "complexity: high" --color "F9D0C4" --description "복잡도: 높음"

# 우선순위
gh label create "P0" --color "D73A4A" --description "최우선"
gh label create "P1" --color "F9D0C4" --description "높음"
gh label create "P2" --color "C5DEF5" --description "중간"
```

## 문제 해결

### 이슈 생성 실패
- gh CLI 인증 확인: `gh auth status`
- 저장소 권한 확인: Issues 생성 권한이 있는지 확인

### 라벨 오류
- 라벨이 존재하지 않으면 먼저 라벨을 생성하세요
- 또는 `--label` 옵션을 제거하고 수동으로 라벨 추가

## 참고
- 생성된 이슈는 GitHub 저장소의 Issues 탭에서 확인할 수 있습니다
- 이슈 번호는 자동으로 할당됩니다
- 의존성 관리를 위해 GitHub Projects 사용을 권장합니다
