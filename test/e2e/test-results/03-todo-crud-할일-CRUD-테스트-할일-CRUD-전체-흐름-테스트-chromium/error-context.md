# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "회원가입" [level=2] [ref=e6]
  - generic [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: 이메일
        - textbox "이메일" [active] [ref=e11]:
          - /placeholder: 이메일 주소
        - paragraph [ref=e12]: 이메일을 입력해주세요
      - generic [ref=e13]:
        - generic [ref=e14]: 비밀번호
        - textbox "비밀번호" [ref=e15]:
          - /placeholder: 비밀번호 (최소 8자)
          - text: password1234
      - generic [ref=e16]:
        - generic [ref=e17]: 이름
        - textbox "이름" [ref=e18]: CRUD테스트
    - button "가입하기" [ref=e20] [cursor=pointer]
    - link "로그인" [ref=e22] [cursor=pointer]:
      - /url: /login
```