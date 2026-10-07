"""예시 환경 파일을 준비하고 두 서비스의 세션 키를 맞춥니다. 기존 설정은 보존합니다."""
import re
import secrets
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PATHS = (ROOT / "general/.env", ROOT / "monitor/backend/.env")


def main():
    texts = [path.read_text(encoding="utf-8") if path.exists()
             else path.with_name(".env.example").read_text(encoding="utf-8") for path in PATHS]
    keys = []
    for content in texts:
        match = re.search(r"^SECRET_KEY=(.*)$", content, re.MULTILINE)
        value = match[1].strip() if match else ""
        if len(value) >= 32 and not value.startswith("GENERATE_"):
            keys.append(value)
    if len(set(keys)) > 1:
        raise SystemExit("두 .env의 SECRET_KEY가 다릅니다. 같은 키로 맞춘 후 실행해 주세요.")
    key = keys[0] if keys else secrets.token_hex(32)
    for path, content in zip(PATHS, texts):
        if re.search(r"^SECRET_KEY=.*$", content, re.MULTILINE):
            content = re.sub(r"^SECRET_KEY=.*$", "SECRET_KEY=" + key, content, flags=re.MULTILINE)
        else:
            content = content.rstrip() + "\nSECRET_KEY=" + key + "\n"
        path.write_text(content, encoding="utf-8")
    print("환경 파일과 공통 세션 키 준비 완료. DB_PASSWORD를 설정해 주세요.")


if __name__ == "__main__":
    main()
