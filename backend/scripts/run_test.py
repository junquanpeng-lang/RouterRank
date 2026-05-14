#!/usr/bin/env python3
"""
Run a test dataset against the /test-run endpoint.
Usage:
  python scripts/run_test.py
  python scripts/run_test.py --file scripts/test_prompts.jsonl --server prod --region Singapore
"""
import argparse
import json
import sys
import urllib.request

DEFAULT_JSONL   = "scripts/test_prompts.jsonl"
DEFAULT_SERVER  = "local-dev"
DEFAULT_REGION  = "Singapore"
DEFAULT_MODELS  = ["gpt-5.4-mini", "claude-haiku-4-5", "gemini-3.1-flash-lite"]
DEFAULT_PROVIDERS = ["OpenAI", "Anthropic", "Google", "OpenRouter", "EasyRouter", "B.ai"]
API_URL         = "http://localhost:8000/test-run"


def load_prompts(path: str) -> list[str]:
    prompts = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            prompts.append(json.loads(line)["prompt"])
    return prompts


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file",        default=DEFAULT_JSONL)
    parser.add_argument("--server",      default=DEFAULT_SERVER)
    parser.add_argument("--region",      default=DEFAULT_REGION)
    parser.add_argument("--temperature", type=float, default=0.0)
    parser.add_argument("--models",      nargs="+", default=DEFAULT_MODELS)
    parser.add_argument("--providers",   nargs="+", default=DEFAULT_PROVIDERS)
    parser.add_argument("--url",         default=API_URL)
    args = parser.parse_args()

    prompts = load_prompts(args.file)
    print(f"==> {len(prompts)} prompt(s) from {args.file}")
    print(f"==> server={args.server}  region={args.region}  temperature={args.temperature}")
    print(f"==> models={args.models}")
    print(f"==> providers={args.providers}")
    print()

    body = json.dumps({
        "prompts":     prompts,
        "server":      args.server,
        "region":      args.region,
        "temperature": args.temperature,
        "models":      args.models,
        "providers":   args.providers,
    }).encode()

    req = urllib.request.Request(
        args.url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req) as resp:
        for raw in resp:
            line = raw.decode("utf-8").rstrip("\n")
            if not line.startswith("data: "):
                continue
            data = json.loads(line[6:])
            print(json.dumps(data, ensure_ascii=False, indent=2))
            sys.stdout.flush()


if __name__ == "__main__":
    main()
