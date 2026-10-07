"""실제 PostgreSQL로 로그인, 메모 CRUD, 실패 시 보존, 재실행 후 유지 검증.

새로 만든 검증 계정과 메모만 마지막에 정리합니다. 기존 자료는 그대로 둡니다.
"""
import json
import subprocess
import sys
import uuid
from pathlib import Path
from unittest.mock import patch

import psycopg
from werkzeug.security import generate_password_hash

BACKEND = Path(__file__).resolve().parent / "monitor" / "backend"
sys.path.insert(0, str(BACKEND))
from app import create_app
from db import connect_db


def main():
    client = create_app().test_client()
    token = uuid.uuid4().hex
    username, password = "qa_" + token, uuid.uuid4().hex
    checks, ids = [], []

    def record(label):
        checks.append(label)

    with connect_db() as conn:
        before = conn.execute("SELECT * FROM notes ORDER BY id").fetchall()
        user_id = conn.execute(
            "INSERT INTO users (username, display_name, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (username, "검증 운영자", generate_password_hash(password)),
        ).fetchone()["id"]
    try:
        assert client.get("/api/notes").status_code == 401
        assert client.get("/api/events").status_code == 401
        assert client.post("/api/auth/login", json={"username": username, "password": password}).status_code == 403
        client.environ_base["HTTP_X_CSRF_TOKEN"] = client.get("/api/auth/me").json["csrf_token"]
        for bad in ({}, {"username": " ", "password": password}, {"username": username, "password": "\t"}, {"username": 42, "password": password}):
            assert client.post("/api/auth/login", json=bad).status_code == 400
        assert client.post("/api/auth/login", json={"username": username, "password": "incorrect"}).status_code == 401
        assert client.post("/api/auth/login", json={"username": "missing_" + token, "password": password}).status_code == 401
        good = client.post("/api/auth/login", json={"username": "  " + username + "  ", "password": password})
        assert good.status_code == 200 and good.json["user"]["name"] == "검증 운영자"
        assert "password_hash" not in good.json["user"]
        client.environ_base["HTTP_X_CSRF_TOKEN"] = good.json["csrf_token"]
        record("DB 계정과 해시 판정: 정상200 / 빈 값400 / 틀린 계정401")

        for bad in ({}, [], {"title": "  ", "body": "본문"}, {"title": "제목", "body": "\n\t"}, {"title": 1, "body": "본문"},
                    *({"title": "제목", "body": "본문", "status": status} for status in ("unknown", "", None, 1, ["pending"]))):
            assert client.post("/api/notes", json=bad).status_code == 400
        with connect_db() as conn:
            assert conn.execute("SELECT * FROM notes ORDER BY id").fetchall() == before
        record("잘못된 작성 요청400 / 기존 DB 자료 보존")

        title, body = "SQL ' ; -- " + token, "첫 줄\n둘째 줄 <script>alert(1)</script>"
        created = client.post("/api/notes", json={"title": "  " + title + "  ", "body": " " + body + " "})
        assert created.status_code == 201
        note = created.json["note"]
        ids.append(note["id"])
        url = "/api/notes/" + str(note["id"])
        assert note["title"] == title and note["body"] == body
        assert note["status"] == "pending"
        assert any(n["id"] == note["id"] for n in client.get("/api/notes").json["notes"])
        assert client.get(url).json["note"] == note
        record("작성201 / 공백 제거 / SQL 특수문자 보존 / 목록·상세 조회")

        for bad in ({"title": " ", "body": "본문"}, {"title": "제목", "body": "\t\n"}, {}):
            assert client.put(url, json=bad).status_code == 400
            assert client.get(url).json["note"] == note
        record("공백 수정400 / 원래 제목·내용·수정시각 보존")
        processing = client.put(url, json={"title": title, "body": body, "status": "in_progress"})
        assert processing.status_code == 200 and processing.json["note"]["status"] == "in_progress"
        for invalid in ("unknown", None, 1, ["completed"]):
            assert client.put(url, json={"title": title, "body": body, "status": invalid}).status_code == 400
            assert client.get(url).json["note"] == processing.json["note"]
        try:
            with connect_db() as conn:
                conn.execute("UPDATE notes SET status=%s WHERE id=%s", ("unknown", note["id"]))
        except psycopg.errors.CheckViolation:
            pass
        else:
            raise AssertionError("DB에서 잘못된 처리 상태를 허용했습니다.")
        updated = client.put(url, json={"title": "수정 " + token, "body": " 수정 내용 ", "status": "completed"})
        assert updated.status_code == 200 and updated.json["note"]["body"] == "수정 내용"
        assert updated.json["note"]["status"] == "completed"
        assert next(n for n in client.get("/api/notes").json["notes"] if n["id"] == note["id"])["status"] == "completed"
        assert client.put(url, json={"title": "수정 " + token, "body": "수정 내용"}).json["note"]["status"] == "completed"
        explicit = client.post("/api/notes", json={"title": "상태 지정 " + token, "body": body, "status": "in_progress"})
        assert explicit.status_code == 201 and explicit.json["note"]["status"] == "in_progress"
        ids.append(explicit.json["note"]["id"])
        assert client.delete("/api/notes/" + str(ids[-1])).status_code == 200
        record("처리 상태 기본값·지정 작성·확인 중→완료 / 목록·상세 일치 / 잘못된 상태400와 DB 제약 / 상태 생략 시 보존")
        child = subprocess.run(
            [sys.executable, "-c", "from app import create_app; import sys; c=create_app().test_client(); s=c.session_transaction(); session=s.__enter__(); session.update(user_id=int(sys.argv[2]),role='operator'); s.__exit__(None,None,None); r=c.get('/api/notes/'+sys.argv[1]); assert r.status_code==200 and r.json['note']['body']=='수정 내용' and r.json['note']['status']=='completed'; print('PERSISTED')", str(note["id"]), str(user_id)],
            cwd=BACKEND, capture_output=True, text=True,
        )
        assert child.returncode == 0 and "PERSISTED" in child.stdout, child.stderr
        record("수정200 / 새 Python 프로세스에서 저장된 DB 자료 재조회")
        assert client.delete(url).status_code == 200
        for method in (client.get, client.put, client.delete):
            assert method(url).status_code == 404
            assert method("/api/notes/2147483647").status_code == 404
        assert all(n["id"] != note["id"] for n in client.get("/api/notes").json["notes"])
        record("삭제200 / 삭제된 번호·없는 번호 GET·PUT·DELETE404")

        events = client.get("/api/events")
        assert events.status_code == 200
        assert all({"method", "path", "status_code", "occurred_at"} <= row.keys() for row in events.json["events"])
        assert client.get("/api/events?event_type=invalid").status_code == 400
        assert client.post("/api/events", json={"method": "GET", "path": "/", "status_code": True}).status_code == 400
        record("실제 요청 기록 조회 / 이벤트 입력과 필터 검증")
        with patch("repositories.notes.connect_db", side_effect=psycopg.OperationalError("QA")):
            failure = client.get("/api/notes")
            assert failure.status_code == 503 and "error" in failure.json
        record("DB 장애503 / JSON 오류 안내")
        assert client.post("/api/auth/logout").status_code == 200
        assert client.get("/api/notes").status_code == 401
        record("세션·CSRF / 로그아웃 후 메모와 기록 API 접근 차단")
    finally:
        with connect_db() as conn:
            for note_id in ids:
                conn.execute("DELETE FROM notes WHERE id=%s", (note_id,))
            conn.execute("DELETE FROM users WHERE username=%s", (username,))
            assert conn.execute("SELECT * FROM notes ORDER BY id").fetchall() == before
    report = {"result": "PASS", "checks": checks, "existing_notes_preserved": True, "test_data_cleaned": True}
    if len(sys.argv) > 1:
        Path(sys.argv[1]).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(checks)}/{len(checks)} integration groups PASS; existing notes preserved; QA data cleaned.")


if __name__ == "__main__":
    main()
