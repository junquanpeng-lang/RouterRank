from __future__ import annotations
from pydantic import BaseModel


class ModelSpec(BaseModel):
    model_id:     str
    model_family: str   # "GPT" | "Claude" | "Gemini"
    display:      str = ""

    @property
    def display_name(self) -> str:
        return self.display or self.model_id


class ProviderSpec(BaseModel):
    name:        str        # "B.ai"  — matches DB provider column
    slug:        str        # "bai"   — matches frontend slug
    is_official: bool = False
    models:      list[ModelSpec]


_PROVIDERS: list[ProviderSpec] = [
    ProviderSpec(
        name="OpenAI", slug="openai", is_official=True,
        models=[
            ModelSpec(model_id="gpt-5.4-mini", model_family="GPT", display="GPT-5.4 mini"),
        ],
    ),
    ProviderSpec(
        name="Anthropic", slug="anthropic", is_official=True,
        models=[
            ModelSpec(model_id="claude-haiku-4-5", model_family="Claude", display="Claude Haiku 4.5"),
        ],
    ),
    ProviderSpec(
        name="Google", slug="google", is_official=True,
        models=[
            ModelSpec(model_id="gemini-3.1-flash-lite", model_family="Gemini", display="Gemini 3.1 Flash-Lite"),
        ],
    ),
    ProviderSpec(
        name="OpenRouter", slug="openrouter",
        models=[
            ModelSpec(model_id="gpt-5.4-mini",         model_family="GPT",    display="GPT-5.4 mini"),
            ModelSpec(model_id="claude-haiku-4-5",      model_family="Claude", display="Claude Haiku 4.5"),
            ModelSpec(model_id="gemini-3.1-flash-lite", model_family="Gemini", display="Gemini 3.1 Flash-Lite"),
        ],
    ),
    ProviderSpec(
        name="EasyRouter", slug="easyrouter",
        models=[
            ModelSpec(model_id="gpt-5.4-mini",         model_family="GPT",    display="GPT-5.4 mini"),
            ModelSpec(model_id="claude-haiku-4-5",      model_family="Claude", display="Claude Haiku 4.5"),
            ModelSpec(model_id="gemini-3.1-flash-lite", model_family="Gemini", display="Gemini 3.1 Flash-Lite"),
        ],
    ),
    ProviderSpec(
        name="B.ai", slug="bai",
        models=[
            ModelSpec(model_id="gpt-5.4-mini",    model_family="GPT",    display="GPT-5.4 mini"),
            ModelSpec(model_id="claude-haiku-4-5", model_family="Claude", display="Claude Haiku 4.5"),
        ],
    ),
    ProviderSpec(
        name="EdenAI", slug="edenai",
        models=[
            ModelSpec(model_id="gpt-5.4-mini",         model_family="GPT",    display="GPT-5.4 mini"),
            ModelSpec(model_id="claude-haiku-4-5",      model_family="Claude", display="Claude Haiku 4.5"),
            ModelSpec(model_id="gemini-3.1-flash-lite", model_family="Gemini", display="Gemini 3.1 Flash-Lite"),
        ],
    ),
]

PROVIDER_REGISTRY: dict[str, ProviderSpec] = {p.name: p for p in _PROVIDERS}
_ALL_PROVIDERS:    list[str]               = [p.name for p in _PROVIDERS]

# Unique models across all providers, keyed by model_id
MODEL_REGISTRY: dict[str, ModelSpec] = {
    m.model_id: m
    for p in _PROVIDERS
    for m in p.models
}
_DEFAULT_SLUGS: list[str] = list(MODEL_REGISTRY)
