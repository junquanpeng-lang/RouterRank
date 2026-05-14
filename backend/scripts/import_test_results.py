#!/usr/bin/env python3
"""
Import a JSONL backup back into test_result.
Usage: python scripts/import_test_results.py scripts/test_results_backup_<ts>.jsonl
"""
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env.test"))

from app.database import get_client

BATCH = 100  # rows per insert

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_test_results.py <backup.jsonl>")
        sys.exit(1)

    path = sys.argv[1]
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                row = json.loads(line)
                row.pop("id", None)   # let the DB assign a new id
                rows.append(row)

    client = get_client()
    total = 0
    for i in range(0, len(rows), BATCH):
        batch = rows[i : i + BATCH]
        client.table("test_result").insert(batch).execute()
        total += len(batch)
        print(f"  inserted {total}/{len(rows)}")

    print(f"Done. {total} rows imported.")

if __name__ == "__main__":
    main()
