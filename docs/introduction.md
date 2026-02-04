# 노션과 연결되는 프롬프터 (Prompter Connected with Notion)

웹 기술을 활용하여 Notion을 CMS(콘텐츠 관리 시스템)로 사용하고, 별도의 디바이스(PC/태블릿)에서 실행되는 프롬프터 화면을 원격 제어한다.

## 기술 스택 (Tech Stack)

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **CMS (Data Source)**: Notion API (Database)
- **Realtime Signal**: Supabase Realtime (Broadcast)
- **Deployment**: Vercel

## 요약

- **구조**: `Controller`(제어기)와 `Prompter`(뷰어)로 구성된다.
- **제어 방식**:
    - 프롬프터 디바이스는 스크린 가까이 위치하므로 직접 조작하지 않는다.
    - 별도의 디바이스(노트북/태블릿)에서 컨트롤러 페이지를 열어 프롬프터를 원격 제어한다.
    - 두 클라이언트 간의 통신은 Supabase Realtime을 통해 중계된다.
- **데이터 흐름**: 사용자는 Notion에서 자막을 작성/수정하고, 앱은 이를 읽어와 보여준다.

## 상세 스펙

### 1. 컨트롤러 (Controller)
* **진입 및 인증 (Entry & Auth)**
    * `/controller` 경로로 진입한다.
    * Notion Access Token이 없다면 'Notion과 연결하기' 버튼(OAuth)만 보여준다.
    * 별도의 자체 회원가입은 없으며, Notion 인증 여부로 사용자를 식별한다.
* **연결 관리 (Connection Manager)**
    * 프롬프터 연결을 위한 **'세션 ID(Room ID)'**를 생성한다.
    * 연결 편의를 위해 **QR 코드** (URL+RoomID)를 화면에 띄워준다.
* **프롬프터 제어 (Remote Control)**
    * **재생 제어**: Start, Pause, Resume.
    * **속도 조절**: 스크롤 속도 조절 (Slider UI).
    * **모양 조절**: 폰트 크기, 사이드 마진 조절.
    * **특수 기능**: 미러링(Mirroring) 토글 (거울 반사 모드).
* **데이터 관리**:
    * 설정에서 연결할 Notion `Database ID`를 입력받는다.
    * 지정된 Database의 글 목록을 리스트로 보여준다.

### 2. 프롬프터 (Prompter / Viewer)
* **진입 화면 (Landing)**
    * `/prompter` 경로로 진입한다.
    * 로그인 없이 **'접속 코드(Room ID) 입력'** 창이 뜬다.
    * URL 파라미터(`?room=xyz`)가 있다면 입력 단계를 건너뛰고 즉시 연결한다.
* **화면 구성**: 검은 배경, 흰 글씨의 고대비 UI.
* **실시간 반응**:
    * 입력된 Room ID에 해당하는 Supabase 채널을 구독(Subscribe)한다.
    * 컨트롤러의 신호(스크롤, 멈춤, 스타일 변경)를 지연 없이 반영한다.
* **텍스트 파싱**:
    * 필수 지원: Heading 1~3, Paragraph, Bulleted List.
    * 색상/배경색 제외.

## 기술 이슈 및 해결 전략

- **실시간 통신**: Supabase Realtime (Broadcast) 사용. `Room ID`를 토픽으로 사용하여 1:1 매칭한다.
- **QR 코드**: `react-qr-code` 등의 라이브러리를 사용하여 컨트롤러에서 즉석 생성한다.
- **Notion API 제한**: Next.js API Routes에서 캐싱 처리.

---

## Phases (개발 로드맵)

### Phase 1: Notion 연결 및 뷰어 기초 (MVP Foundation)
> **목표**: 내 노션의 데이터를 불러와서 화면에 텍스트로 뿌릴 수 있다.
- [ ] Notion 통합(Integration) 토큰 발급 및 환경 설정.
- [ ] Notion API 연동 (`@notionhq/client`) API Route 구현.
- [ ] `/controller` 페이지: Notion 로그인(OAuth) 처리 및 토큰 저장.
- [ ] 자막 리스트 및 상세 보기(Raw Data) 구현.
- [ ] **Block Parser**: 제목, 본문, 리스트 HTML 변환 로직.

### Phase 2: 프롬프터 화면 및 실시간 연결 (Core Feature)
> **목표**: QR코드로 프롬프터를 연결하고, 스크롤을 제어한다.
- [ ] Supabase 프로젝트 생성 및 설정.
- [ ] **연결 로직 구현**:
    - Controller: 임의의 Room ID 생성 및 QR 코드 표시 기능.
    - Prompter: URL 파라미터(`?room=...`) 파싱 및 채널 접속 기능.
- [ ] **단방향 통신 구현**:
    - Controller: Play/Pause 버튼 -> `supa.send('play')`
    - Prompter: `supa.on('play')` -> 스크롤 시작.
- [ ] 미러링(Mirroring) CSS 토글 기능.

### Phase 3: 정교한 제어 및 UI 동기화 (Enhancement)
> **목표**: 스크롤 속도, 폰트 크기 등을 미세 조정한다.
- [ ] **상태 동기화**: 속도, 폰트 크기, 마진 값을 실시간 반영 (Broadcast payload 활용).
- [ ] **스크롤 엔진 고도화**: `requestAnimationFrame` 적용.
- [ ] 반응형 UI 점검.

### Phase 4: 편의성 및 운영 (Polish)
> **목표**: 실제 사용 편의성 증대.
- [ ] **LocalStorage**: 최근 접속한 Room ID, Notion DB ID 저장.
- [ ] Notion 데이터 리로드(새로고침) 버튼.
- [ ] 배포 및 에러 핸들링.