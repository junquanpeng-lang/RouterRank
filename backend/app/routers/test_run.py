from __future__ import annotations
import json
import uuid
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.test_result import TestRunRequest
from app.services import test_result as svc
from app.services.llm_caller import (
    call_openai_gpt,
    call_anthropic_claude,
    call_google_gemini,
    call_openrouter_gpt,
    call_openrouter_claude,
    call_openrouter_gemini,
    call_easyrouter_gpt,
    call_easyrouter_claude,
    call_easyrouter_gemini,
    call_bai_gpt,
    call_bai_claude,
)

router = APIRouter(prefix="/test-run", tags=["test-run"])

_FUNCS = {
    ("OpenAI",     "GPT"):    call_openai_gpt,
    ("Anthropic",  "Claude"): call_anthropic_claude,
    ("Google",     "Gemini"): call_google_gemini,
    ("OpenRouter", "GPT"):    call_openrouter_gpt,
    ("OpenRouter", "Claude"): call_openrouter_claude,
    ("OpenRouter", "Gemini"): call_openrouter_gemini,
    ("EasyRouter", "GPT"):    call_easyrouter_gpt,
    ("EasyRouter", "Claude"): call_easyrouter_claude,
    ("EasyRouter", "Gemini"): call_easyrouter_gemini,
    ("B.ai",       "GPT"):    call_bai_gpt,
    ("B.ai",       "Claude"): call_bai_claude,
}


@router.post("")
async def create_test_run(req: TestRunRequest):
    """
    对每条 prompt × 每个 (model × provider) 发起调用，结果实时写入 test_result 表，
    同时通过 SSE 流式返回进度。test_run_at 为接口被调用时的北京时间，所有行共享同一值。
    """
    run_id = str(uuid.uuid4())
    test_run_at = svc.beijing_now()
    models = req.resolved_models()
    total = len(req.prompts) * sum(
        1 for m in models for p in req.providers if _FUNCS.get((p, m.model_family))
    )

    async def generate():
        yield f"data: {json.dumps({'__run_start__': True, 'run_id': run_id, 'test_run_at': test_run_at.isoformat(), 'total': total})}\n\n"

        done = errors = 0
        for prompt in req.prompts:
            for model in models:
                for provider in req.providers:
                    func = _FUNCS.get((provider, model.model_family))
                    if func is None:
                        continue

                    yield f"data: {json.dumps({'__start__': True, 'prompt': prompt[:80], 'provider': provider, 'model': model.display_name, 'model_id': model.model_id})}\n\n"

                    try:
                        result = await func(model.model_id, prompt, req.temperature)
                        svc.insert_row(
                            run_id=run_id,
                            test_run_at=test_run_at,
                            server=req.server,
                            region=req.region,
                            temperature=req.temperature,
                            result=result,
                            provider=provider,
                            model=model.display_name,
                            model_id=model.model_id,
                        )
                        payload = result.model_dump()
                        payload.update({"provider": provider, "model": model.display_name, "model_id": model.model_id, "saved": True})
                        done += 1
                        yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

                    except Exception as exc:
                        err_msg = str(exc)
                        svc.insert_error_row(
                            run_id=run_id,
                            test_run_at=test_run_at,
                            server=req.server,
                            region=req.region,
                            temperature=req.temperature,
                            prompt=prompt,
                            provider=provider,
                            model=model.display_name,
                            model_id=model.model_id,
                            error=err_msg,
                        )
                        errors += 1
                        yield f"data: {json.dumps({'__error__': True, 'provider': provider, 'model': model.display_name, 'model_id': model.model_id, 'prompt': prompt[:80], 'error': err_msg, 'saved': True})}\n\n"

        yield f"data: {json.dumps({'__done__': True, 'run_id': run_id, 'total': done + errors, 'success': done, 'errors': errors})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
