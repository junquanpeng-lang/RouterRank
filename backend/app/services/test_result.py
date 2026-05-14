from __future__ import annotations
from datetime import datetime, timezone, timedelta
from typing import Optional

from app.database import get_client
from app.services.llm_caller import LLMResult

TABLE = "test_result"
_BEIJING = timezone(timedelta(hours=8))


def beijing_now() -> datetime:
    return datetime.now(_BEIJING)


def insert_row(
    *,
    run_id: str,
    test_run_at: datetime,
    server: str,
    region: str,
    temperature: float,
    result: LLMResult,
    provider: str,
    model: str,
    model_id: str,
    error: Optional[str] = None,
) -> None:
    row = {
        "run_id":             run_id,
        "test_run_at":       test_run_at.isoformat(),
        "server":             server,
        "region":             region,
        "temperature":        temperature,
        "prompt":             result.prompt,
        "output":             result.output,
        "prompt_tokens":      result.prompt_tokens,
        "output_tokens":      result.output_tokens,
        "ttft_ms":            result.ttft_ms,
        "tpot_ms":            result.tpot_ms,
        "e2e_ms":             result.e2e_ms,
        "first_token":        result.first_token,
        "first_token_logprob": result.first_token_logprob,
        "stop_reason":        result.stop_reason,
        "provider":           provider,
        "model":              model,
        "model_id":           model_id,
        "success":            True,
        "error":              error,
    }
    get_client().table(TABLE).insert(row).execute()


def insert_error_row(
    *,
    run_id: str,
    test_run_at: datetime,
    server: str,
    region: str,
    temperature: float,
    prompt: str,
    provider: str,
    model: str,
    model_id: str,
    error: str,
) -> None:
    row = {
        "run_id":       run_id,
        "test_run_at": test_run_at.isoformat(),
        "server":       server,
        "region":       region,
        "temperature":  temperature,
        "prompt":       prompt,
        "provider":     provider,
        "model":        model,
        "model_id":     model_id,
        "success":      False,
        "error":        error,
    }
    get_client().table(TABLE).insert(row).execute()
