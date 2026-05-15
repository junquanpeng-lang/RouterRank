from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class ModelSpec(BaseModel):
    model_id:     str
    model_family: str   # "GPT" | "Claude" | "Gemini"
    display:      str = ""

    @property
    def display_name(self) -> str:
        return self.display or self.model_id


class ProviderSpec(BaseModel):
    name:           str         # "B.ai"  — matches DB provider column
    slug:           str         # "bai"   — matches frontend slug
    is_official:    bool = False
    type:           str = "router"       # router | gateway | inference | self_host
    domain:         Optional[str] = None # for logo.clearbit.com lookup
    website:        Optional[str] = None
    region:         str = "Global"
    description_en: str = ""
    description_zh: str = ""
    models:         list[ModelSpec]


_PROVIDERS: list[ProviderSpec] = [
    ProviderSpec(
        name="OpenAI", slug="openai", is_official=True,
        type="inference",
        domain="openai.com",
        website="https://openai.com",
        region="US",
        description_en="Official OpenAI inference endpoint. Serves as the pricing and output reference baseline for GPT-family models.",
        description_zh="OpenAI 官方推理端点，作为 GPT 系列模型的标准定价与输出基准参考。",
        models=[
            ModelSpec(model_id="gpt-5.4-mini", model_family="GPT", display="GPT-5.4 mini"),
        ],
    ),
    ProviderSpec(
        name="Anthropic", slug="anthropic", is_official=True,
        type="inference",
        domain="anthropic.com",
        website="https://anthropic.com",
        region="US",
        description_en="Official Anthropic inference endpoint. Serves as the pricing and output reference baseline for Claude-family models.",
        description_zh="Anthropic 官方推理端点，作为 Claude 系列模型的标准定价与输出基准参考。",
        models=[
            ModelSpec(model_id="claude-haiku-4-5", model_family="Claude", display="Claude Haiku 4.5"),
        ],
    ),
    ProviderSpec(
        name="Google", slug="google", is_official=True,
        type="inference",
        domain="google.com",
        website="https://ai.google.dev",
        region="US",
        description_en="Official Google inference endpoint. Serves as the pricing and output reference baseline for Gemini-family models.",
        description_zh="Google 官方推理端点，作为 Gemini 系列模型的标准定价与输出基准参考。",
        models=[
            ModelSpec(model_id="gemini-3.1-flash-lite", model_family="Gemini", display="Gemini 3.1 Flash-Lite"),
        ],
    ),
    ProviderSpec(
        name="OpenRouter", slug="openrouter",
        type="router",
        domain="openrouter.ai",
        website="https://openrouter.ai",
        region="US/EU",
        description_en="Aggregator router covering 100+ models across the major upstream providers. Convenient single-API access trades off a gateway fee on top of official pricing.",
        description_zh="覆盖 100+ 模型的聚合型路由中转，串联主流上游厂商。便捷的单 API 接入背后是官方价之上的中转溢价。",
        models=[
            ModelSpec(model_id="gpt-5.4-mini",         model_family="GPT",    display="GPT-5.4 mini"),
            ModelSpec(model_id="claude-haiku-4-5",      model_family="Claude", display="Claude Haiku 4.5"),
            ModelSpec(model_id="gemini-3.1-flash-lite", model_family="Gemini", display="Gemini 3.1 Flash-Lite"),
        ],
    ),
    ProviderSpec(
        name="EasyRouter", slug="easyrouter",
        type="router",
        domain="easyrouter.io",
        website="https://easyrouter.io",
        region="Global",
        description_en="Lightweight multi-model router with a flat 15% discount on official list prices across GPT, Claude, and Gemini families. Straightforward pricing with no hidden fees.",
        description_zh="轻量级多模型路由，在 GPT、Claude、Gemini 三条产品线上统一提供 85 折优惠。定价透明，无隐藏费用。",
        models=[
            ModelSpec(model_id="gpt-5.4-mini",         model_family="GPT",    display="GPT-5.4 mini"),
            ModelSpec(model_id="claude-haiku-4-5",      model_family="Claude", display="Claude Haiku 4.5"),
            ModelSpec(model_id="gemini-3.1-flash-lite", model_family="Gemini", display="Gemini 3.1 Flash-Lite"),
        ],
    ),
    ProviderSpec(
        name="B.ai", slug="bai",
        type="router",
        domain="b.ai",
        website="https://b.ai",
        region="Global",
        description_en="Cost-optimized AI router with Asia-Pacific focus. Listed prices match official rates for GPT and Claude families, with measured billing accuracy tracked across all supported models.",
        description_zh="面向亚太市场的低价 AI 路由中转。GPT 和 Claude 系列标价与官方一致，对所有支持模型持续监测计费准确性。",
        models=[
            ModelSpec(model_id="gpt-5.4-mini",    model_family="GPT",    display="GPT-5.4 mini"),
            ModelSpec(model_id="claude-haiku-4-5", model_family="Claude", display="Claude Haiku 4.5"),
        ],
    ),
    ProviderSpec(
        name="EdenAI", slug="edenai",
        type="router",
        domain="edenai.run",
        website="https://edenai.run",
        region="Global",
        description_en="Multi-modal AI aggregator with a unified API spanning text, image, speech and more. Provides standardized provider comparison and fallback routing across major model families.",
        description_zh="多模态 AI 聚合平台，通过统一 API 覆盖文本、图像、语音等多种模态，并提供标准化的厂商对比与故障转移路由。",
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
