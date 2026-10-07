"""실제 환경설정/의존성/캐시를 제외하고 과제 ZIP을 만듭니다."""
import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parent
EXCLUDED_DIRS = {".venv", "venv", "node_modules", "__pycache__", ".git", "dist", ".pytest_cache"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "mini-watch-day04.zip")
    args = parser.parse_args()
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        for path in sorted(ROOT.rglob("*")):
            relative = path.relative_to(ROOT)
            if not path.is_file() or path.resolve() == output:
                continue
            if any(part in EXCLUDED_DIRS for part in relative.parts):
                continue
            if relative.parts[:3] == ("general", "static", "portal"):
                continue
            if path.name == ".env" or (path.name.startswith(".env.") and path.name != ".env.example"):
                continue
            if path.suffix in {".pyc", ".zip", ".log"}:
                continue
            if path.name.startswith("try_"):
                continue
            archive.write(path, "mini-watch-day04/" + relative.as_posix())
        names = archive.namelist()
        assert any(name.endswith("package-lock.json") for name in names)
        assert any(name.endswith("sql/dashboard.sql") for name in names)
        assert not any(any(part in EXCLUDED_DIRS or part == ".env" for part in Path(name).parts) for name in names)
    print(f"ZIP prepared: {output.name} ({len(names)} files, {output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
