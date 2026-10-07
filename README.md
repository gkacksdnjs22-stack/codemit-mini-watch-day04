# Mini Watch · React + Flask 감시 대시보드

코드밋 [React와 Flask로 감시 대시보드 완성하기](https://classroom.codemit.kr/classes/5/problems/49/submit) 과제입니다.
일반 게시판과 운영자 감시 화면을 하나의 로그인으로 연결했습니다.
아이디와 비밀번호로 로그인하면 일반 회원은 게시판, 운영자는 감시 대시보드로 자동 이동합니다.
회원가입은 로그인 화면에서 시작하고, 게시판과 대시보드 양쪽에서 로그아웃할 수 있습니다.

## 시작 자료와 직접 구현한 부분

수업 `C:\work\mini-watch-day03-start`에서 가져와 이전 게시글 CRUD 과제를 진행한
`mini-watch/general`과 `mini-watch/monitor/backend`를 시작 자료로 사용했습니다.

- 유지: 일반 게시판의 HTML/Jinja2 CRUD, 자동 요청 기록 전송, 기존 DB 자료.
- 이번 구현: React/Vite 프론트 전체, 운영자 로그인 API, 계정/메모 테이블, 메모 API와 입력 검사,
  Flask 라우터/저장소 분리, DB·계정 준비 도구, 통합 검증, CMD 실행 안내.
- 선택 구현: 요청 경로 검색, 상태 코드 필터, 현재 목록의 요청·오류 건수 요약, 메모 처리 상태, 세션/API 보호.

## 구성과 주소

```text
브라우저 → 일반 Flask :5100 → 요청 기록 JSON → 감시 Flask :5200 → codemit_monitor_db
브라우저 → React/Vite :5173 → /api 프록시 → 감시 Flask :5200 → codemit_monitor_db
일반 Flask → codemit_general_db (게시글·수업용 사용자)
```

| 서비스 | 접속 주소 | DB |
|---|---|---|
| 일반 게시판 | http://127.0.0.1:5100/ | codemit_general_db |
| 감시 대시보드 | http://127.0.0.1:5173/ | Flask API를 거쳐 codemit_monitor_db |
| 감시 API | http://127.0.0.1:5200/api/events | codemit_monitor_db |

프론트는 DB에 직접 접속하지 않습니다. 일반 서비스의 요청 기록 전송은 기존대로 유지하며,
감시 서버가 꺼져 있어도 게시판 응답은 유지합니다.

## 수업 실습과 분리한 이 PC의 설정

수업 폴더 `C:\work\mini-watch-day04`는 기존 `general_db`와 `monitor_db`,
포트5100/5200/5173을 사용합니다. 이 과제는 별도 `codemit_general_db`와
`codemit_monitor_db`로 분리했습니다. 기존 과제 자료는 새 DB와 비공개 백업에 보관했습니다.

이 PC의 과제 `.env`와 프론트 `.env.local`은 일반 서비스5000, 감시 API5210,
React5174로 설정했습니다. 로그인은 http://127.0.0.1:5000/login,
일반 게시판은 http://127.0.0.1:5000/board,
감시 대시보드는 http://127.0.0.1:5174/에서 확인합니다.

제출물에는 실제 `.env`와 `.env.local`을 넣지 않습니다. 새 설치에서는 아래 안내의
과제 전용 DB와 과제에서 지정한 기본 포트5100/5200/5173을 사용합니다.
프론트 포트와 프록시를 별도로 지정하려면 `monitor/frontend/.env.example`을
`.env.local`로 복사하고 `VITE_DEV_PORT`, `VITE_API_TARGET`, `VITE_GENERAL_URL`을 설정합니다.

## 설치부터 실행까지 · Windows CMD

아래 명령은 **압축을 푼 프로젝트 폴더**(이 README가 있는 폴더)에서 시작합니다.
Python 3.11 이상, Node.js 22.12 이상(또는 20.19 이상), PostgreSQL 16 이상을 준비합니다.
PostgreSQL 서비스가 실행 중이어야 합니다.

### 1. 패키지 설치

```cmd
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r general\requirements.txt
.venv\Scripts\python.exe -m pip install -r monitor\backend\requirements.txt
cd monitor\frontend
npm ci
npm run build
cd ..\..
```

`npm run build`는 감시 화면을 빌드하고 공통 로그인용 React 파일을
`general/static/portal`에 준비합니다. 로그인 컴포넌트를 수정하면 다시 실행합니다.
생성 파일은 Git에서 제외하며 설치 과정에서 재생성합니다.

### 2. 환경 설정

처음 실행할 때만 예시 파일을 복사합니다. 기존 `.env`가 있으면 유지합니다.

```cmd
.venv\Scripts\python.exe init_env.py
notepad general\.env
notepad monitor\backend\.env
```

`init_env.py`는 예시 파일에서 환경 파일을 준비하고 두 서비스에 동일한 무작위 `SECRET_KEY`를 설정합니다.
기존 DB/포트 설정과 유효한 키는 보존합니다. 두 `.env`의 `DB_PASSWORD`를 본인 PostgreSQL 비밀번호로 바꿉니다.

| 설정 | 용도 |
|---|---|
| DB_HOST | PostgreSQL 주소, 기본 localhost/127.0.0.1 |
| DB_PORT | PostgreSQL 포트, 기본5432 |
| DB_NAME | 일반 서비스는 codemit_general_db, 감시 서비스는 codemit_monitor_db |
| DB_USER | 해당 DB에 접속할 사용자, 예시 postgres |
| DB_PASSWORD | 본인의 실제 DB 비밀번호, Git/ZIP에 넣지 않음 |
| MONITOR_URL | 일반 서비스가 기록을 보낼 주소, http://127.0.0.1:5200/api/events |
| PORT | 일반 서비스5100, 감시 API5200 |
| SECRET_KEY | 두 서비스의 동일한 비공개 세션 서명 키, init_env.py로 준비 |
| MONITOR_API_URL | 일반 서비스가 운영자 계정을 확인할 API, http://127.0.0.1:5200 |
| DASHBOARD_URL | 운영자 로그인 성공 후 이동할 주소, http://127.0.0.1:5173/ |

이전 과제의 `.env`를 이어 쓴다면 일반 서비스의 `MONITOR_URL`을 5200으로 바꾸고,
두 서비스의 `PORT`도 위 값으로 맞춥니다.

### 3. DB와 테이블 준비

`psql`을 찾지 못하면 PostgreSQL 설치 폴더의 `bin`을 PATH에 추가합니다.
설치 버전이 다르면 경로의 `16`을 설치된 버전으로 바꿉니다.

```cmd
set "PATH=C:\Program Files\PostgreSQL\16\bin;%PATH%"
```

**DB가 없는 새 환경에서만** 아래 두 명령을 실행합니다. `-W`는 비밀번호를 직접 입력합니다.

```cmd
psql -h 127.0.0.1 -U postgres -W -d postgres -f general\sql\create_database.sql
psql -h 127.0.0.1 -U postgres -W -d postgres -f monitor\backend\sql\create_database.sql
```

DB가 이미 있으면 위 DB 생성은 생략하고 아래를 실행합니다.

```cmd
psql -h 127.0.0.1 -U postgres -W -d codemit_general_db -f general\sql\setup.sql
.venv\Scripts\python.exe monitor\backend\setup_db.py
```

`general/sql/setup.sql`은 게시글/회원 계정 테이블과 자동 번호를 준비하고 기존 회원의 display_name을 보완합니다.
`setup_db.py`는 `monitor/backend/sql/dashboard.sql`을 실행해 요청 기록/운영자 계정/메모
테이블을 준비합니다. 모두 기존 자료를 보존합니다. 원래 수업의 `posts.sql`, `users.sql`,
`http_events.sql`은 참고 자료이며, 위 설치 순서에서는 실행하지 않습니다.
새 DB에는 게시글이 없으므로 게시판에서 직접 새 글을 작성하면 됩니다.

기존 과제를 업데이트할 때도 `monitor/backend/setup_db.py`를 다시 실행합니다.
기존 메모의 제목·내용·시각을 유지하면서 처리 상태 열과 제약조건을 추가합니다.

### 4. 대시보드 실습 계정 생성

```cmd
.venv\Scripts\python.exe monitor\backend\setup_db.py --username operator --name "실습 운영자"
```

비밀번호와 확인 값을 직접 입력합니다(8자 이상). 입력은 화면에 표시되지 않으며,
DB에는 Werkzeug의 scrypt 해시만 저장합니다. 이미 같은 아이디가 있으면 기존 계정과
비밀번호를 유지합니다. 대시보드 로그인에는 **위 명령에서 만든 아이디와 비밀번호**를 사용합니다.
일반 회원과 운영자는 별도 DB에 저장됩니다. 계정의 저장소로 목적지를 판단하므로
서로 다른 아이디를 사용합니다. 기존 양쪽 DB에 같은 아이디가 있으면 일반 회원 계정을 우선합니다.
웹 회원가입에서는 두 DB를 확인해 운영자 아이디와 중복되는 회원 생성을 막습니다.

### 5. 세 개의 CMD 창에서 실행

각 창에서 프로젝트 폴더로 이동한 뒤 실행합니다. 감시 API를 먼저 시작합니다.

감시 Flask:

```cmd
.venv\Scripts\python.exe monitor\backend\app.py
```

일반 Flask:

```cmd
.venv\Scripts\python.exe general\app.py
```

React/Vite:

```cmd
cd monitor\frontend
npm run dev
```

http://127.0.0.1:5100/ 에 접속합니다. 처음에는 로그인 화면이 열립니다.
회원가입으로 만든 계정은 게시판, 위 명령으로 만든 운영자 계정은 감시 대시보드로 이동합니다.
각 CMD 창에서 `Ctrl+C`로 서비스를 종료합니다.

#### 이 PC에서 psycopg DLL 불러오기가 실패할 때

보안 정책 때문에 `psycopg-binary` DLL을 불러오지 못하면, 이미 설치된 PostgreSQL의
libpq를 이용하는 Python 구현으로 실행할 수 있습니다. **Python을 실행하는 각 CMD 창에서**
다음 두 줄을 먼저 실행합니다. 시스템 보안 설정을 바꾸지 않습니다.

```cmd
set "PATH=C:\Program Files\PostgreSQL\16\bin;%PATH%"
set "PSYCOPG_IMPL=python"
```

## 기능과 API

| 요청 | 동작 | 결과 |
|---|---|---|
| POST /api/auth/login | username/password, DB 계정·해시 확인 | 성공200 / 빈 값400 / 불일치401 |
| GET /api/events | 실제 요청 기록 최신50건 | events 배열 |
| POST /api/events | 일반 서비스가 요청 기록 전송 | 저장201 / 잘못된 입력400 |
| GET /api/notes | 메모 번호·제목 목록 | notes 배열 |
| GET /api/notes/번호 | 제목·내용·시각 상세 | note / 없는 번호404 |
| POST /api/notes | title/body/status 작성 | 저장201 / 입력 오류400 |
| PUT /api/notes/번호 | title/body/status 수정 | 저장200 / 입력 오류400 / 없는 번호404 |
| DELETE /api/notes/번호 | 삭제 확정 시 호출 | 삭제200 / 없는 번호404 |

- 로그인 화면에서 목적지를 선택하지 않습니다. 서버에서 계정을 검증하고 역할에 따라 이동합니다.
- 공통 로그인 화면은 React `LoginForm`이 아이디/비밀번호를 state로 관리하고
  일반 Flask의 `POST /api/auth/login`에 JSON으로 전송합니다. 로그인 결과를 state에 저장한 뒤
  서버가 판정한 목적지로 이동합니다. 운영자 판정은 일반 Flask가 감시 Flask의 동일 경로 API에 전달합니다.
- 서명된 HttpOnly 세션 쿠키를 두 서비스가 공유합니다. 새로고침해도 로그인 상태를 유지하고,
  어느 화면에서 로그아웃하든 세션을 지운 뒤 공통 로그인 화면으로 돌아갑니다.
- 게시판은 로그인 후 접근할 수 있고, 감시 기록 조회와 메모 CRUD는 운영자만 사용할 수 있습니다.
  폼 변경 요청과 API 변경 요청은 CSRF 토큰도 확인합니다. 요청 기록 수집 POST는 별도 수집 경로입니다.
- 메모를 선택하면 상세 API를 호출합니다. 수정은 기존 값으로 시작하고 취소하면 DB를 변경하지 않습니다.
- 삭제 버튼은 확인 대화상자만 엽니다. 취소/Esc는 유지, 삭제 확정만 DELETE를 호출합니다.
- 제목/내용은 앞뒤 공백 제거 후 검사합니다. 공백뿐인 작성/수정은400이며 기존 자료를 변경하지 않습니다.
  제목은200자, 내용은10,000자까지 입력합니다. 없는 번호는 조회/수정/삭제 모두404입니다.
- 성공한 변경 이후 목록을 다시 조회합니다. 저장 실패는 오류로 표시하고 입력한 내용을 유지합니다.
- 메모 처리 상태는 `pending`(확인 전), `in_progress`(확인 중), `completed`(완료)입니다.
  작성·수정 폼에서 선택하고 저장하면 목록·상세의 상태 표시에 반영됩니다.
  새 메모의 기본값과 기존 메모의 초기값은 확인 전입니다. 수정 요청에 status가 없으면 기존 상태를 보존합니다.
  잘못된 상태는 서버에서400으로 거절하며 DB도 CHECK 제약으로 검사합니다.
  수정 취소는 상태를 바꾸지 않고, 새로고침·재실행 후에도 DB에 저장한 상태를 유지합니다.
- 빈 목록, 검색 결과 없음, API/DB 실패, 로딩을 구분해서 안내합니다. 기록 조회 실패 시 이전 결과가 있으면
  이전 결과라는 안내를 함께 표시합니다.
- 모든 SQL 입력은 `%s` 매개변수로 전달합니다. DB는 연결 컨텍스트에서 커밋하고 장애 시 롤백합니다.

### 선택 기능의 집계 기준

경로 검색과 상태 코드 필터는 **최신50건의 조회 결과 안에서** 적용됩니다.
조건 해제로 전체 조회 결과를 복원합니다. “조회한 요청”은 현재 필터 목록 길이,
“오류 응답”은 같은 목록에서 상태 코드가400 이상인 건수입니다.
전체 DB 누적 통계는 아닙니다.

선택 기능 네 가지를 모두 구현했습니다. 세션 유지와 로그인 접근 제한은 통합 로그인에 맞춰 구현했습니다.

## 파일 역할

| 파일/폴더 | 역할 |
|---|---|
| general/app.py | 일반 서비스 라우터/요청 후크 등록과5100 실행 |
| general/routes/posts.py, repositories/posts.py | 기존 게시판 HTTP/SQL |
| general/request_logging.py | 실제 응답의 method/path/status_code를 감시 서버에 전송 |
| monitor/backend/app.py | 앱 생성, Blueprint·DB 오류 응답 등록과5200 실행 |
| monitor/backend/routes/auth.py, events.py, notes.py | 로그인·기록·메모 HTTP 요청/응답 |
| monitor/backend/repositories/ | 사용자 조회, 기록 저장/조회, 메모 CRUD SQL |
| monitor/backend/db.py, rules.py | .env/psycopg 연결, 입력 검사 |
| monitor/backend/setup_db.py, sql/dashboard.sql | 비파괴 테이블 준비와 해시 계정 생성 |
| general/routes/auth.py, auth_helpers.py | 회원가입, 계정에 따른 자동 이동, 공통 세션/CSRF |
| init_env.py | 환경 파일 준비와 공통 세션 키 생성 |
| monitor/frontend/src/App.jsx | 세션 복원, 감시 화면, 공통 로그인으로 이동 |
| components/LoginForm.jsx, Dashboard.jsx | 로그인 입력, 사용자 이름/로그아웃, 화면 연결 |
| src/login-main.jsx, api/portal.js | 일반 Flask에 배치되는 React 로그인 진입점과 JSON 로그인 요청 |
| scripts/sync-login.mjs | 빌드한 React 로그인 파일을 일반 서비스 정적 폴더에 준비 |
| components/EventsPanel.jsx | 조회·검색·필터·건수와 응답 표 |
| components/NotesPanel.jsx | 목록/선택/폼/변경 요청 상태 관리 |
| components/NoteList.jsx, NoteDetail.jsx | props로 받은 목록/선택 메모와 동작 표시 |
| components/NoteForm.jsx, DeleteConfirm.jsx | 수정/작성 입력, 삭제 확인/취소 |
| monitor/frontend/src/api/ | 공통 fetch 오류 처리와 로그인/기록/메모 요청 |
| monitor/frontend/vite.config.js | React 개발 서버5173와 /api→5200 프록시 |
| verify_dashboard.py | 실제 PostgreSQL 기반 자동 통합 검증 |
| verify_portal.py | 실행 중인 서버에서 통합 로그인/회원가입/권한/로그아웃 검증 |

부모가 자료와 이벤트 함수를 props로 전달합니다. 목록 `map()`의 key는 메모/기록의 DB 번호입니다.
화면 파일은 직접 fetch하지 않으며 API 함수를 가져와 사용합니다.

## 검증

[필수 20개 제출 전 검토 결과](docs/checklist-review.md)와 검증 자료를 함께 제공합니다.

자동 검증(테이블과 `.env` 준비 후):

```cmd
.venv\Scripts\python.exe verify_dashboard.py
.venv\Scripts\python.exe verify_portal.py
.venv\Scripts\python.exe verify_board.py
cd monitor\frontend
npm run build
```

verify_portal.py는 두 Flask 서버를 실행한 상태에서 사용합니다.
검증 프로그램은 실제 DB에서 임시 계정과 임시 메모를 만들어 로그인/CRUD/400/404/503/
새 Python 프로세스에서의 지속성을 확인합니다. 본인이 만든 검증 자료만 정리하며 기존 메모는 보존합니다.

2026-10-07 확인 결과:

- 대시보드 자동 통합 검증10개 그룹 PASS.
- 통합 로그인 검증 PASS: 회원가입/아이디 중복/계정별 자동 이동/권한 제한/중복 메뉴 제거/로그아웃.
- 게시판 CRUD 검증 PASS: 작성·조회·수정·삭제/공백400/없는 글404/기존 자료 보존.
- React/Vite 프로덕션 빌드 성공.
- 일반 게시글 상세200, 없는 게시글404를 요청하고 감시 화면에서 경로/메서드/코드 일치 확인.
- 틀린 비밀번호 오류, 정상 로그인과 사용자 이름, 로그아웃 후 로그인 폼 확인.
- 메모 작성→목록/상세, 기존 값 수정→정상 저장, 수정 취소→원본 유지.
- 공백 수정→오류와 원본 보존, 테스트 메모의 삭제 취소→보존/확정→제거.
- 새로고침 후 로그인과 메모 유지, 로그아웃 후 접근 제한 확인.
- 처리 상태 기본값·지정 작성·확인 중→완료·상태 생략 시 보존·잘못된 상태 거절·재실행 후 상태 유지 확인.
- 경로/상태 코드 필터와 현재 목록 건수 일치, 조건 해제, PC 화면 확인.
- 제출 ZIP을 새 폴더에 풀고 새 임시 DB에서 테이블 준비·계정 생성·로그인·게시글 작성·
  메모 통합 검증·npm ci·빌드 성공. 검증용 임시 DB는 정리했습니다.

수동 확인은 위 순서대로 진행하면 됩니다. 현재 확인한 화면은 `docs/`에 저장했습니다.

## 제출물

제출 ZIP은 `package_submission.py`로 만듭니다.

```cmd
.venv\Scripts\python.exe package_submission.py
```

`mini-watch-day04.zip`에 두 서비스의 소스, SQL, `.env.example`, Python requirements,
프론트 package.json/package-lock.json, README와 검증 자료를 담습니다.
실제 `.env`, 비밀번호/토큰 파일, 가상환경, node_modules, 빌드/캐시는 제외합니다.
압축을 풀고 이 README의 설치·DB·계정·실행 순서로 새 환경을 준비할 수 있습니다.

## 수업 자료와 과제 분리 (현재 로컬 실행)

수업 원본: `C:\work\mini-watch-day03-start`, 포트 5100.
과제 로그인: http://127.0.0.1:5000/login , 회원가입: http://127.0.0.1:5000/signup .
과제 게시판: http://127.0.0.1:5000/board . 별도 signup-project의 3000번 서비스와는 독립적입니다.
위의 5100번 실행 예시는 수업 서버와 충돌하므로 과제 게시판은 PORT=5000으로 실행합니다.
복사됐던 수업 화면과 이미지는 작업 PC의 별도 수업 자료 폴더에 보관했으며 이번 제출에는 포함하지 않습니다.
과제에서는 `/index.html`, `/step-1.html` 등 수업 화면을 제공하지 않습니다.
