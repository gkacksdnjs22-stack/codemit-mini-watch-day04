"""패키지를 새 폴더에 풀고 임시 DB/서버에서 설치·빌드·계정·통합 검증을 확인합니다."""
import argparse
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import uuid
from contextlib import nullcontext
from pathlib import Path
from zipfile import ZipFile

import psycopg
import requests
from dotenv import dotenv_values
from psycopg import sql

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, default=ROOT / "mini-watch-day04.zip")
    args = parser.parse_args()
    config = dotenv_values(ROOT / "monitor/backend/.env")
    connection = dict(host=config["DB_HOST"], port=config["DB_PORT"], user=config["DB_USER"], password=config["DB_PASSWORD"])
    suffix = uuid.uuid4().hex[:10]
    databases, servers = [], []
    report = {}
    env = {key: value for key, value in os.environ.items() if not key.startswith("DB_") and key not in {"SECRET_KEY", "PORT", "MONITOR_URL", "MONITOR_API_URL", "DASHBOARD_URL"}}
    env["PYTHONUTF8"] = "1"
    def run(command, cwd, data=None):
        result = subprocess.run(command, cwd=cwd, env=env, input=data, capture_output=True, text=True, encoding="utf-8", timeout=180)
        if result.returncode:
            raise AssertionError(result.stdout[-1800:] + result.stderr[-1800:])
        return result
    def free_port():
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            return listener.getsockname()[1]
    tempdir = tempfile.TemporaryDirectory(prefix="codemit-day04-repro-")
    try:
        with nullcontext(tempdir.name) as temp:
            target = Path(temp).resolve()
            with ZipFile(args.archive) as archive:
                names = archive.namelist()
                assert not any(Path(name).name == ".env" or (Path(name).name.startswith(".env.") and Path(name).name != ".env.example") for name in names)
                assert all((target / name).resolve().is_relative_to(target) for name in names)
                archive.extractall(target)
            project = target / "mini-watch-day04"
            with psycopg.connect(**connection, dbname="postgres", autocommit=True) as admin:
                for kind in ("general", "monitor"):
                    name = "qa_day04_" + kind + "_" + suffix
                    admin.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(name)))
                    databases.append(name)
            general_port, api_port = free_port(), free_port()
            key = uuid.uuid4().hex + uuid.uuid4().hex
            for folder, database, port in zip(("general", "monitor/backend"), databases, (general_port, api_port)):
                values = {"DB_HOST": connection["host"], "DB_PORT": connection["port"], "DB_USER": connection["user"],
                          "DB_PASSWORD": connection["password"], "DB_NAME": database, "PORT": port, "SECRET_KEY": key}
                if folder == "general":
                    values.update(MONITOR_URL=f"http://127.0.0.1:{api_port}/api/events", MONITOR_API_URL=f"http://127.0.0.1:{api_port}", DASHBOARD_URL="http://127.0.0.1:5173/")
                (project / folder / ".env").write_text("\n".join(f"{name}={value}" for name, value in values.items()) + "\n", encoding="utf-8")
            run([sys.executable, "init_env.py"], project)
            with psycopg.connect(**connection, dbname=databases[0]) as conn:
                conn.execute((project / "general/sql/setup.sql").read_text(encoding="utf-8"))
            password = uuid.uuid4().hex
            run([sys.executable, "monitor/backend/setup_db.py", "--username", "qa_operator", "--name", "검증 운영자", "--password-stdin"], project, password + "\n" + password + "\n")
            run([sys.executable, "monitor/backend/setup_db.py"], project)
            report["repeat_schema_setup"] = "PASS"
            frontend = project / "monitor/frontend"
            run(["npm.cmd", "ci"], frontend)
            run(["npm.cmd", "run", "build"], frontend)
            assert (project / "general/static/portal/manifest.json").exists()
            report["fresh_npm_install_and_react_build"] = "PASS"
            for folder, port in (("monitor/backend", api_port), ("general", general_port)):
                process = subprocess.Popen([sys.executable, "app.py"], cwd=project / folder, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                servers.append(process)
                for attempt in range(100):
                    if process.poll() is not None:
                        raise AssertionError("검증용 서버 실행 실패")
                    try:
                        requests.get(f"http://127.0.0.1:{port}/", timeout=1)
                        break
                    except requests.ConnectionError:
                        time.sleep(0.1)
                else:
                    raise AssertionError("검증용 서버 응답 시간 초과")
            run([sys.executable, "verify_submission.py"], project)
            report["fresh_databases_and_integration"] = "PASS"
            client = requests.Session()
            import re
            page = client.get(f"http://127.0.0.1:{general_port}/login", timeout=10)
            csrf = re.search(r'data-csrf="([^"]+)"', page.text)[1]
            assert "portal/assets/login-" in page.text
            logged = client.post(f"http://127.0.0.1:{general_port}/api/auth/login", json={"username": "qa_operator", "password": password}, headers={"X-CSRF-Token": csrf}, timeout=10)
            assert logged.status_code == 200 and logged.json()["user"]["name"] == "검증 운영자"
            report["cli_account_and_react_login_assets"] = "PASS"
            client.close()
    finally:
        for process in servers:
            process.terminate()
            process.wait(timeout=10)
        if databases:
            with psycopg.connect(**connection, dbname="postgres", autocommit=True) as admin:
                for database in databases:
                    admin.execute(sql.SQL("DROP DATABASE {} WITH (FORCE)").format(sql.Identifier(database)))
        tempdir.cleanup()
    report["temporary_databases_removed"] = True
    (ROOT / "docs/package-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
