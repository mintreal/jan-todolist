# 캘린더 UI 스타일 가이드

## 색상 팔레트

### 주요 색상
- **Primary Green**: `#00C73C` (네이버 그린, 로고 및 브랜드 컬러)
- **Primary Purple**: `#6B46E5` (주요 액션 버튼)
- **Primary Blue**: `#5B5FDF` (보조 액션)

### 상태 색상
- **Red**: `#FF0000` (휴일, 중요 일정, 경고)
- **Pink**: `#FF6B9D` (개인일정 표시)
- **Purple Background**: `#C299FF` (일정 블록 배경)

### 중립 색상
- **Background**: `#FFFFFF` (메인 배경)
- **Border**: `#E5E5E5` (구분선, 테두리)
- **Text Primary**: `#000000` (주요 텍스트)
- **Text Secondary**: `#767676` (보조 텍스트)
- **Text Disabled**: `#CCCCCC` (비활성 텍스트)

## 타이포그래피

### 폰트 패밀리
```css
font-family: -apple-system, BlinkMacSystemFont, "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif;
```

### 폰트 크기
- **제목 (H1)**: 24px / font-weight: 700
- **서브 제목 (H2)**: 18px / font-weight: 600
- **본문**: 14px / font-weight: 400
- **캡션**: 12px / font-weight: 400
- **날짜 숫자**: 16px / font-weight: 500

## 레이아웃

### 그리드 시스템
- **사이드바 너비**: 240px (고정)
- **여백 (Spacing)**:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px

### 반응형 브레이크포인트
```css
mobile: 320px - 767px
tablet: 768px - 1023px
desktop: 1024px +
```

## 컴포넌트

### 버튼

#### Primary Button (일정 쓰기)
```css
background: linear-gradient(135deg, #7B5BFF 0%, #6B46E5 100%);
color: #FFFFFF;
border-radius: 8px;
padding: 12px 24px;
font-size: 14px;
font-weight: 600;
border: none;
box-shadow: 0 2px 4px rgba(107, 70, 229, 0.2);
```

#### Secondary Button (가님별 정리)
```css
background: #F7F7F7;
color: #333333;
border-radius: 8px;
padding: 10px 20px;
font-size: 14px;
font-weight: 500;
border: 1px solid #E5E5E5;
```

### 캘린더 셀
```css
width: 100%;
min-height: 100px;
border: 1px solid #E5E5E5;
background: #FFFFFF;
padding: 8px;
```

#### 토요일
```css
color: #3B5998;
```

#### 일요일/공휴일
```css
color: #FF0000;
```

#### 오늘 날짜
```css
background: #FFF4E5;
border: 2px solid #FF9900;
font-weight: 700;
```

### 일정 블록
```css
background: #C299FF;
color: #FFFFFF;
border-radius: 4px;
padding: 4px 8px;
font-size: 12px;
margin: 2px 0;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

### 사이드바

#### 메뉴 아이템
```css
padding: 12px 16px;
font-size: 14px;
color: #333333;
border-radius: 6px;
cursor: pointer;
transition: background 0.2s;
```

#### 메뉴 아이템 (호버)
```css
background: #F5F5F5;
```

#### 메뉴 아이템 (선택됨)
```css
background: #E8F5E9;
color: #00C73C;
font-weight: 600;
```

### 체크박스
```css
width: 18px;
height: 18px;
border: 2px solid #CCCCCC;
border-radius: 4px;
```

#### 체크박스 (선택됨)
```css
background: #FF6B9D;
border-color: #FF6B9D;
```

## 아이콘

### 크기
- **Small**: 16x16px
- **Medium**: 20x20px
- **Large**: 24x24px

### 스타일
- Line style 아이콘 사용
- Stroke width: 2px
- Color: 텍스트 색상과 동일하게 사용

## 상호작용

### 호버 효과
```css
transition: all 0.2s ease-in-out;
```

### 클릭 효과
```css
transform: scale(0.98);
transition: transform 0.1s;
```

### 포커스 효과
```css
outline: 2px solid #6B46E5;
outline-offset: 2px;
```

## 그림자

### 카드 그림자
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

### 버튼 그림자
```css
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
```

### 드롭다운 그림자
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
```

## 애니메이션

### 기본 트랜지션
```css
transition-duration: 0.2s;
transition-timing-function: ease-in-out;
```

### 페이드 인
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 0.3s;
```

## 접근성

- 최소 텍스트 대비율: 4.5:1 (WCAG AA 기준)
- 포커스 표시: 모든 인터랙티브 요소에 명확한 포커스 스타일
- 키보드 탐색: Tab, Enter, Space, Arrow keys 지원
- 스크린 리더: aria-label, role 속성 사용

## 모바일 최적화

- 터치 타겟 최소 크기: 44x44px
- 스와이프 제스처: 월/주 전환 지원
- 반응형 텍스트: 화면 크기에 따라 조정
- 모바일에서 사이드바: 햄버거 메뉴로 숨김
