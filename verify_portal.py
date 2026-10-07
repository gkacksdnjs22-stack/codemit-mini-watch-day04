"""실행 중인 과제 서버에서 회원가입, 자동 이동, 접근 제한, 로그아웃을 확인합니다."""
import re
import uuid
from pathlib import Path

import psycopg
import requests
from dotenv import dotenv_values
from werkzeug.security import generate_password_hash

ROOT = Path(__file__).resolve().parent
general = dotenv_values(ROOT / "general/.env")
monitor = dotenv_values(ROOT / "monitor/backend/.env")
BASE = "http://127.0.0.1:" + general.get("PORT", "5100")
API = general.get("MONITOR_API_URL", "http://127.0.0.1:5200")


def connect(config):
    return psycopg.connect(host=config["DB_HOST"], port=config.get("DB_PORT", "5432"),
                          dbname=config["DB_NAME"], user=config["DB_USER"], password=config["DB_PASSWORD"])


def token(client, path):
    response = client.get(BASE + path, timeout=10)
    response.raise_for_status()
    return re.search(r'name="csrf_token" value="([^"]+)"', response.text)[1]


def main():
    suffix = uuid.uuid4().hex[:16]
    member, operator, password = "qa_member_" + suffix, "qa_operator_" + suffix, uuid.uuid4().hex
    client = requests.Session()
    with connect(monitor) as conn:
        conn.execute("INSERT INTO users (username, display_name, password_hash) VALUES (%s, %s, %s)",
                     (operator, "검증 운영자", generate_password_hash(password)))
    try:
        assert client.get(BASE + "/board", allow_redirects=False, timeout=10).headers["Location"] == "/login"
        assert client.get(BASE + "/posts/1", timeout=10).status_code == 401
        assert client.post(BASE + "/login", data={"username": member, "password": password}, timeout=10).status_code == 403
        csrf = token(client, "/signup")
        signup = {"username": operator, "name": "검증 회원", "password": password,
                  "confirmation": password, "csrf_token": csrf}
        assert client.post(BASE + "/signup", data=signup, timeout=10).status_code == 409
        signup["username"] = member
        assert client.post(BASE + "/signup", data=signup, allow_redirects=False, timeout=10).status_code == 303
        csrf = token(client, "/login")
        headers = {"X-CSRF-Token": csrf}
        assert client.post(BASE + "/api/auth/login", json={"username": " ", "password": password}, headers=headers, timeout=10).status_code == 400
        assert client.post(BASE + "/api/auth/login", json={"username": 12, "password": password}, headers=headers, timeout=10).status_code == 400
        wrong = client.post(BASE + "/api/auth/login", json={"username": member, "password": "incorrect"}, headers=headers, timeout=10)
        assert wrong.status_code == 401
        logged = client.post(BASE + "/api/auth/login", json={"username": member, "password": password,
                                                             "role": "operator"}, headers=headers, timeout=10)
        assert logged.status_code == 200 and logged.json()["destination"] == "/board" and logged.json()["user"]["role"] == "member"
        board = client.get(BASE + "/board", timeout=10)
        assert "검증 회원님" in board.text and ">게시판</a>" not in board.text and "로그아웃" in board.text
        assert client.get(API + "/api/notes", timeout=10).status_code == 401
        assert client.get(BASE + "/board/2147483647", timeout=10).status_code == 404
        assert client.post(BASE + "/logout", data={"csrf_token": token(client, "/board")}, allow_redirects=False, timeout=10).headers["Location"] == "/login"
        assert client.get(BASE + "/board", allow_redirects=False, timeout=10).status_code == 303
        logged = client.post(BASE + "/api/auth/login", json={"username": operator, "password": password},
                             headers={"X-CSRF-Token": token(client, "/login")}, timeout=10)
        assert logged.status_code == 200 and logged.json()["destination"] == general["DASHBOARD_URL"]
        state = client.get(API + "/api/auth/me", timeout=10).json()
        assert state["user"]["username"] == operator
        assert client.get(API + "/api/notes", timeout=10).status_code == 200
        events = client.get(API + "/api/events", timeout=10).json()["events"]
        assert any(event["method"] == "GET" and event["path"] == "/board/2147483647" and event["status_code"] == 404 for event in events)
        assert client.get(API + "/api/auth/me", timeout=10).json()["user"]["username"] == operator
        assert client.post(API + "/api/auth/logout", headers={"X-CSRF-Token": state["csrf_token"]}, timeout=10).status_code == 200
        assert client.get(API + "/api/events", timeout=10).status_code == 401
        assert client.get(BASE + "/board", allow_redirects=False, timeout=10).headers["Location"] == "/login"
        print("PASS: 회원가입 / 아이디 중복 / 로그인 자동 이동 / 역할 조작 차단 / 중복 메뉴 제거 / 세션 유지 / 공동 로그아웃")
    finally:
        client.close()
        for config, username in ((general, member), (monitor, operator)):
            with connect(config) as conn:
                conn.execute("DELETE FROM users WHERE username = %s", (username,))


if __name__ == "__main__":
    main()
