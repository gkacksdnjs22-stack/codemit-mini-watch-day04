"""과제 게시판 CRUD, 공백 오류, 없는 글, 감시 장애 시 응답과 기존 글 보존을 확인합니다."""
import sys
import uuid
from pathlib import Path
from unittest.mock import patch

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent / "general"))
from app import app
from repositories.posts import list_posts, find_post, delete_post


def main():
    client = app.test_client()
    original = list_posts()
    post_id = None
    # 인증 흐름은 verify_portal.py에서 확인하며 여기서는 로그인된 게시판의 동작을 확인합니다.
    with client.session_transaction() as state:
        state.update(role="operator", user_id=1, name="검증 사용자", csrf_token="board-qa-token")
    def post(path, **data):
        return client.post(path, data={**data, "csrf_token": "board-qa-token"})
    try:
        assert client.get("/board").status_code == 200
        assert post("/board/new", title=" ", body="본문").status_code == 400
        assert list_posts() == original
        marker = uuid.uuid4().hex
        response = post("/board/new", title=marker + " <script>qa</script>", body="첫째 줄\n둘째 줄")
        assert response.status_code == 303
        path = response.headers["Location"]
        post_id = int(path.rsplit("/", 1)[1])
        detail = client.get(path).get_data(as_text=True)
        assert "&lt;script&gt;" in detail and "<script>qa</script>" not in detail
        saved = find_post(post_id)
        assert client.get(path + "/edit").status_code == 200 and find_post(post_id) == saved
        assert post(path + "/edit", title="수정", body=" ").status_code == 400 and find_post(post_id) == saved
        assert post(path + "/edit", title="수정 " + marker, body="수정 내용").status_code == 303
        assert find_post(post_id)["body"] == "수정 내용"
        assert client.get(path + "/delete").status_code == 200 and find_post(post_id) is not None
        assert post(path + "/delete").headers["Location"] == "/board"
        assert find_post(post_id) is None
        for suffix in ("", "/edit", "/delete"):
            assert client.get(path + suffix).status_code == 404
        with patch("request_logging.requests.post", side_effect=requests.ConnectionError):
            assert client.get("/board").status_code == 200
        assert list_posts() == original
        print("PASS: 게시판 CRUD / 공백400 / 없는 글404 / HTML 이스케이프 / 감시 장애 시 게시판 유지 / 기존 글 보존")
    finally:
        if post_id and find_post(post_id):
            delete_post(post_id)
        assert list_posts() == original


if __name__ == "__main__":
    main()
