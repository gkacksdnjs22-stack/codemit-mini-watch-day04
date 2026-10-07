"""실행 중인 과제 서버에서 필수 기능 통합 검증을 실행합니다."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
for script in ("verify_dashboard.py", "verify_portal.py", "verify_board.py"):
    subprocess.run([sys.executable, str(ROOT / script)], cwd=ROOT, check=True)
print("All assignment integration checks PASS. Checklist evidence: docs/checklist-review.md")
