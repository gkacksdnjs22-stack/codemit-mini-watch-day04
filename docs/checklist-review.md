# 제출 전 체크리스트 검토

2026-10-07, [과제 원문](https://classroom.codemit.kr/classes/5/problems/49/submit)의 필수 20개와 대조했습니다.
소스 검토, 실제 PostgreSQL 통합 검증, 브라우저 확인, 새 폴더·임시 DB에서의 설치 재현 결과입니다.

| 번호 | 필수 항목 | 결과와 근거 |
|---|---|---|
| 1 | Flask·React 실행 및 API 연결 | PASS — Vite 프록시와 실제 서비스에서 로그인/기록/메모 확인 |
| 2 | psycopg와 SQL 매개변수 바인딩 | PASS — 서비스별 db.py, repositories의 고정 SQL과 %s 매개변수 |
| 3 | 저장·수정 결과 재실행 후 유지 | PASS — verify_dashboard.py에서 새 Python 프로세스로 저장 결과 조회 |
| 4 | React state 입력과 Flask API 전송 | PASS — 실제 사용되는 LoginForm.jsx와 login-main.jsx, api/portal.js의 JSON POST /api/auth/login |
| 5 | DB 계정과 비밀번호 해시 검증 | PASS — 서버의 check_password_hash, 정상200/빈 값400/틀린 계정401 검증 |
| 6 | 성공 시 대시보드·로그아웃 시 로그인 | PASS — 운영자 자동 이동, 세션 복원, 로그아웃 후 공통 로그인 화면을 브라우저에서 확인 |
| 7 | 실제 요청의 메서드·경로·상태 코드 | PASS — 일반 서비스의 GET /board/2147483647 기록과404를 실제 감시 API에서 비교 |
| 8 | 메모 목록과 상세 | PASS — DB 목록/단건 API, NoteList/NoteDetail, 선택한 메모 내용 표시 |
| 9 | 새 메모 저장·목록 반영 | PASS — 작성201, DB·목록·상세 검증과 브라우저 작성 확인 |
| 10 | 기존 메모 수정·DB·화면 반영 | PASS — 기존 값으로 시작하는 NoteForm, 수정200, 실패 시 원본 보존 |
| 11 | 삭제 확인·취소·확정 | PASS — DeleteConfirm의 취소/확정, 확인창·취소 보존을 브라우저 확인, DELETE200와 삭제 후404 검증 |
| 12 | 메모·기록 새로고침 | PASS — 각각 새로고침 버튼, 변경 성공 후 목록 API 재조회 |
| 13 | 공백 작성·수정400와 원본 유지 | PASS — 서버 검증과 DB 비교, 브라우저 오류·취소 후 원본 확인 |
| 14 | 없는 메모 조회·수정·삭제404 | PASS — 삭제한 번호와 없는 번호의 GET/PUT/DELETE 검증 |
| 15 | 로그인·API 오류 표시 | PASS — 틀린 로그인 오류와 공백 수정 오류 표시, DB 장애503 검증 |
| 16 | React 컴포넌트와 props 분리 | PASS — LoginForm, Dashboard, EventsPanel, NotesPanel, NoteList, NoteDetail, NoteForm, DeleteConfirm |
| 17 | API 함수 별도 파일 | PASS — src/api/client.js, auth.js, portal.js, events.js, notes.js |
| 18 | Flask 라우터·DB 분리 | PASS — app.py 등록, routes, repositories, db.py 역할 분리 |
| 19 | 예시 설정 제공·실제 .env 제외 | PASS — .env.example, 공유 키 생성 도구, Git/패키지 제외 검사 |
| 20 | 의존성·README로 새 설치 가능 | PASS — requirements, package-lock, CMD 안내, 새 폴더에서 npm ci/build·임시 DB·계정·통합 검증 재현 |

필수 20/20 충족으로 검토했습니다. 실제 강의실 채점 결과와는 별개인 제출 전 검토입니다.

선택 기능 네 가지를 모두 구현했습니다: 경로/상태 필터, 조회 목록의 요청·오류 건수,
메모 처리 상태, 세션 유지·보호 API 접근 제한.
처리 상태는 확인 전·확인 중·완료를 작성/수정 폼에서 선택하며 목록과 상세에 표시합니다.
DB에 저장되고 새로고침·새 Python 프로세스 실행 후에도 유지됨을 검증했습니다.
잘못된 상태400, 상태 변경 취소, 기존 상태 보존, DB CHECK 제약을 확인했습니다.
회원과 운영자는 로그인 시 서버가 판단하며 화면에서 역할을 선택하지 않습니다.

실행한 검증:

```cmd
.venv\Scripts\python.exe verify_submission.py
.venv\Scripts\python.exe package_submission.py
.venv\Scripts\python.exe verify_reproduction.py
```

대시보드 10개 통합 그룹, 통합 로그인·권한·공동 로그아웃, 게시판 CRUD를 통과했습니다.
새 환경 재현은 임시 DB 두 개를 생성하고 검증 후 제거합니다. 기존 서비스의 게시글/메모는 보존합니다.
`backend-validation.json`, `ui-validation.json`, `package-validation.json`과 화면 이미지에서 근거를 확인할 수 있습니다.
