# React와 Flask로 감시 대시보드 완성하기

과제: https://classroom.codemit.kr/classes/5/problems/49/submit
확인일: 2026-10-07

기존 일반 게시판과 기록 전송을 유지하고, React + Vite 대시보드와 Flask JSON API를 추가한다.
PostgreSQL에 psycopg로 연결하며 사용자 입력은 `%s` 매개변수로 바인딩한다.

필수 범위:

1. React state로 아이디/비밀번호 입력을 관리하고 `/api/auth/login`으로 전송.
2. DB 계정과 비밀번호 해시 검증, 빈 입력400/틀린 계정401.
3. 성공하면 사용자 이름과 대시보드, 로그아웃하면 로그인 폼.
4. 실제 일반 서비스 요청의 method/path/status_code를 표시.
5. 메모 목록/상세와 제목·내용의 작성/수정/삭제.
6. 수정 취소와 삭제 확인/취소, 성공한 변경만 반영.
7. 기록과 메모의 목록 새로고침, 빈 목록과 오류 안내.
8. 서버에서 작성/수정의 공백 입력400, 기존 자료 보존, 없는 메모 조회/수정/삭제404.
9. DB에 변경이 저장되며 재실행과 새로고침 후에도 유지.
10. React components/api 분리와 props 연결, Flask routes/repositories/db.py 분리.
11. 의존성 파일, SQL, `.env.example`, Windows CMD 설치·DB·계정·실행 README.
12. 실제 비밀번호/.env/가상환경/node_modules/캐시를 제출에서 제외.

포트: 일반 서비스5100, 감시 Flask5200, Vite5173. Vite `/api` 프록시를 사용.
기본 과제는 새로고침하면 로그인 폼으로 돌아간다. 세션 유지와 API 보호는 선택 과제.

선택 기능: 경로/상태 필터, 요청/오류 건수 요약, 메모 상태, 세션/API 보호.
