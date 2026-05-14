from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field

from app.models.registry import MODEL_REGISTRY, ModelSpec, _DEFAULT_SLUGS, _ALL_PROVIDERS


class TestRunRequest(BaseModel):
    prompts:     list[str] = Field(..., min_length=1, description="Prompts from JSONL, one per line")
    server:      str       = Field(..., description="Server identifier, e.g. 'prod-us-west'")
    region:      str       = Field(..., description="Test region, e.g. 'Shanghai'")
    temperature: float     = Field(default=0.0, ge=0.0, le=2.0)
    models:      list[str] = Field(
        default_factory=lambda: list(_DEFAULT_SLUGS),
        description="Model slugs, e.g. ['gpt-5.4-mini']",
    )
    providers:   list[str] = Field(
        default=_ALL_PROVIDERS,
        description="Providers: OpenAI / Anthropic / Google / OpenRouter / EasyRouter / B.ai",
    )

    def resolved_models(self) -> list[ModelSpec]:
        return [MODEL_REGISTRY[slug] for slug in self.models if slug in MODEL_REGISTRY]
