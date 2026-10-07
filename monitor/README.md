# 감시 서비스

- `backend`: Flask API, PostgreSQL 계정/요청 기록/관찰 메모 저장, 5200 포트.
- `frontend`: React + Vite 로그인과 감시 대시보드, 5173 포트.
- 일반 서비스5100의 기록을 `POST /api/events`로 수집합니다.

설치부터 실행까지는 [프로젝트 README](../README.md)를 따릅니다.
기존 수업 원본과 DB의 요청 기록은 보존하며 새 테이블은 `backend/sql/dashboard.sql`로 추가합니다.

이 PC에서는 과제 전용 codemit_monitor_db와 로컬 포트5210/5174를 사용합니다.
수업 실습용 monitor_db 및 포트5200/5173과 분리했습니다.
공통 로그인 http://127.0.0.1:5000/login 에서 운영자 계정으로 로그인하면 대시보드로 자동 이동합니다.
