# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - heading "Jan TodoList" [level=1] [ref=e7]
      - generic [ref=e8]:
        - generic [ref=e9]: 하루종일테스트님
        - button "로그아웃" [ref=e10] [cursor=pointer]
  - generic [ref=e11]:
    - heading "할일 목록" [level=2] [ref=e12]
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]: 할일
        - textbox "할일" [ref=e17]:
          - /placeholder: 할일을 입력하세요
          - text: 하루종일 할일
      - generic [ref=e19]:
        - checkbox "하루종일" [checked] [ref=e20]
        - generic [ref=e21]: 하루종일
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]: 시작 날짜
          - textbox "시작 날짜" [ref=e25]: 2025-11-27
        - generic [ref=e26]:
          - generic [ref=e27]: 종료 날짜
          - textbox "종료 날짜" [ref=e28]: 2025-11-27
      - paragraph [ref=e30]: 할일 추가에 실패했습니다
      - button "추가하기" [ref=e31] [cursor=pointer]
    - paragraph [ref=e33]: 할일을 추가해보세요!
```