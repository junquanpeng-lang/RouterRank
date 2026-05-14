#!/usr/bin/env python3
"""Export test_result table to a JSONL backup file."""
import json
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env.test"))

from app.database import get_client

def main():
    rows = get_client().table("test_result").select("*").order("id").execute().data
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.join(os.path.dirname(__file__), f"test_results_backup_{ts}.jsonl")
    with open(path, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, default=str) + "\n")
    print(f"Exported {len(rows)} rows → {path}")

if __name__ == "__main__":
    main()
