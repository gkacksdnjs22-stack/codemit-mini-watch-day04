"""과제 회원 계정을 생성합니다. 비밀번호는 직접 입력하고 기존 계정은 보존합니다."""
import argparse
from getpass import getpass
from werkzeug.security import generate_password_hash
from db import connect_db


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--username", default="student")
    parser.add_argument("--name", default="실습 회원")
    args = parser.parse_args()
    password = getpass("회원 비밀번호 (10자 이상): ")
    confirmation = getpass("비밀번호 확인: ")
    if len(password) < 10 or not password.strip() or password != confirmation:
        parser.error("비밀번호는 10자 이상이며 확인 값과 같아야 합니다.")
    with connect_db() as conn:
        result = conn.execute(
            "INSERT INTO users (username, display_name, password_hash) VALUES (%s, %s, %s) ON CONFLICT (username) DO NOTHING",
            (args.username, args.name, generate_password_hash(password)),
        )
    print("회원 계정을 만들었습니다." if result.rowcount else "이미 있는 계정입니다. 기존 계정을 유지합니다.")


if __name__ == "__main__":
    main()
