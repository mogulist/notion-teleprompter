# 노션과 연결되는 프롬프터 (Prompter Connected with Notion)

Notion을 CMS로 쓰고, 별도 디바이스(PC/태블릿)에서 띄운 프롬프터 화면을 원격으로 제어하는 웹 앱입니다.

- **Controller(제어기)**: Notion OAuth로 연결한 뒤, Database에서 자막 목록을 불러와 선택·제어합니다. 프롬프터와는 Room ID(QR 코드 등)로 연결합니다.
- **Prompter(뷰어)**: Room ID로 접속해 컨트롤러에서 보내는 신호(스크롤, 재생/일시정지, 스타일 등)를 실시간으로 반영합니다.

자막은 Notion에서 작성·수정하고, 앱이 Notion API로 읽어와 보여줍니다. 자세한 스펙과 로드맵은 [docs/introduction.md](docs/introduction.md)를 참고하세요.

## 실행 방법

1. 의존성 설치  
   ```bash
   bun install
   ```

2. 환경 변수 설정  
   `.env.example`을 참고해 `.env.local`에 Notion OAuth 값을 넣습니다.  
   - [Notion 연동](https://www.notion.so/my-integrations)에서 Public OAuth 연동을 만들고  
   - `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_OAUTH_REDIRECT_URI`를 설정합니다.

3. 개발 서버 실행  
   ```bash
   bun run dev
   ```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 후 `/controller`로 이동해 Notion과 연결합니다.

---

Vibe coded with [Cursor](https://cursor.com) and [Antigravity](https://antigravity.dev).
