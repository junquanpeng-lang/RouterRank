from fastapi import APIRouter, HTTPException
from app.models.registry import _PROVIDERS, MODEL_REGISTRY, PROVIDER_REGISTRY

router = APIRouter(prefix="/registry", tags=["registry"])


@router.get("/providers")
def list_providers():
    """List all providers with their supported models."""
    return [p.model_dump() for p in _PROVIDERS]


@router.get("/providers/{slug}")
def get_provider(slug: str):
    """Get a single provider by slug."""
    p = next((p for p in _PROVIDERS if p.slug == slug), None)
    if p is None:
        raise HTTPException(status_code=404, detail=f"Provider '{slug}' not found")
    return p.model_dump()


@router.get("/models")
def list_models():
    """List all unique models across all providers."""
    return [m.model_dump() for m in MODEL_REGISTRY.values()]
