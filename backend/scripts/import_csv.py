#!/usr/bin/env python3
"""
Upload / update model pricing from a CSV/TSV file into Supabase.

Usage (run from backend/ directory):
    python scripts/import_csv.py pricing.tsv
    python scripts/import_csv.py pricing.tsv --dry-run
    python scripts/import_csv.py pricing.tsv --clear-first
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

# 把 backend/ 加入搜索路径，使 `app` 包可以被找到
sys.path.insert(0, str(Path(__file__).parent.parent))

import os
import pandas as pd
from dotenv import load_dotenv

# 支持 ENV_FILE 环境变量指定配置文件，默认 .env
_backend_dir = Path(__file__).parent.parent
_env_file = _backend_dir / os.getenv("ENV_FILE", ".env")
load_dotenv(_env_file)

from app.database import get_client  # noqa: E402

COLUMN_MAP: dict[str, str] = {
    "provider_type":             "provider_type",
    "provider_name":             "provider_name",
    "model_family":              "model_family",
    "model_name":                "model_name",
    "pricing_type":              "pricing_type",
    "input_price_per_1m":        "input_price_per_1m",
    "output_price_per_1m":       "output_price_per_1m",
    "cached_input_price_per_1m": "cached_input_price_per_1m",
    "cache_write_price_per_1m":  "cache_write_price_per_1m",
    "context_window":            "context_window",
    "max_output_tokens":         "max_output_tokens",
    "currency":                  "currency",
    "pricing_unit":              "pricing_unit",
    "current_discount":          "current_discount",
    "last_updated":              "last_updated",
    "source_url":                "source_url",
    "notes":                     "notes",
}

REQUIRED   = {"provider_type", "provider_name", "model_family", "model_name"}
NUMERICS   = {"input_price_per_1m", "output_price_per_1m",
              "cached_input_price_per_1m", "cache_write_price_per_1m",
              "current_discount"}
INTEGERS   = {"context_window", "max_output_tokens"}
DEFAULTS   = {"pricing_type": "text", "currency": "USD", "pricing_unit": "per_1m_tokens"}


def load_csv(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path, sep="\t", dtype=str)
    if len(df.columns) == 1:          # fallback to comma-separated
        df = pd.read_csv(path, sep=",", dtype=str)
    df.columns = [c.strip() for c in df.columns]
    return df


def clean_row(row: dict) -> dict | None:
    out: dict = {}
    for csv_col, db_col in COLUMN_MAP.items():
        if csv_col not in row:
            continue
        val = row[csv_col]
        out[db_col] = None if (pd.isna(val) or str(val).strip() == "") else str(val).strip()

    for col, default in DEFAULTS.items():
        if not out.get(col):
            out[col] = default

    for col in NUMERICS:
        if out.get(col):
            try:
                out[col] = float(out[col])
            except (ValueError, TypeError):
                print(f"  [WARN] Non-numeric '{out[col]}' in '{col}' — set NULL")
                out[col] = None

    for col in INTEGERS:
        if out.get(col):
            try:
                out[col] = int(float(out[col]))
            except (ValueError, TypeError):
                print(f"  [WARN] Non-integer '{out[col]}' in '{col}' — set NULL")
                out[col] = None

    for req in REQUIRED:
        if not out.get(req):
            print(f"  [SKIP] missing '{req}': {row}")
            return None
    return out


def upsert_batch(records: list[dict], dry_run: bool) -> tuple[int, list[str]]:
    if dry_run:
        for r in records:
            print(f"  [DRY-RUN] {r['provider_name']} / {r['model_name']}")
        return len(records), []

    errors: list[str] = []
    try:
        get_client().table("model_pricing").upsert(
            records, on_conflict="provider_name,model_name,pricing_type"
        ).execute()
        return len(records), []
    except Exception:
        success = 0
        for rec in records:
            try:
                get_client().table("model_pricing").upsert(
                    rec, on_conflict="provider_name,model_name,pricing_type"
                ).execute()
                success += 1
            except Exception as exc:
                msg = f"{rec.get('provider_name')}/{rec.get('model_name')}: {exc}"
                errors.append(msg)
                print(f"  [ERROR] {msg}")
        return success, errors


def main() -> None:
    ap = argparse.ArgumentParser(description="Import pricing CSV into Supabase")
    ap.add_argument("csv_file",     type=Path)
    ap.add_argument("--dry-run",    action="store_true")
    ap.add_argument("--clear-first",action="store_true")
    ap.add_argument("--batch-size", type=int, default=50)
    args = ap.parse_args()

    if not args.csv_file.exists():
        sys.exit(f"[ERROR] File not found: {args.csv_file}")

    print(f"Loading {args.csv_file} …")
    df = load_csv(args.csv_file)
    missing = REQUIRED - set(df.columns)
    if missing:
        sys.exit(f"[ERROR] Missing required columns: {missing}")
    print(f"  {len(df)} rows, {len(df.columns)} columns")

    if args.clear_first and not args.dry_run:
        print("Clearing existing rows …")
        get_client().table("model_pricing").delete().neq("id", 0).execute()

    records, skipped = [], 0
    for _, row in df.iterrows():
        cleaned = clean_row(row.to_dict())
        if cleaned is None:
            skipped += 1
        else:
            records.append(cleaned)

    print(f"  {len(records)} valid, {skipped} skipped")

    total, all_errors = 0, []
    for i in range(0, len(records), args.batch_size):
        n, errs = upsert_batch(records[i : i + args.batch_size], args.dry_run)
        total += n
        all_errors.extend(errs)

    action = "Would upsert" if args.dry_run else "Upserted"
    print(f"\n{action} {total} rows.")
    if all_errors:
        print(f"{len(all_errors)} error(s):")
        for e in all_errors:
            print(f"  • {e}")
    else:
        print("No errors.")


if __name__ == "__main__":
    main()
