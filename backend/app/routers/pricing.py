from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.database import get_client
from app.models.pricing import PricingComparison, PricingRow

router = APIRouter(prefix="/pricing", tags=["pricing"])

TABLE = "model_pricing"


@router.get("/", response_model=list[PricingRow])
def list_pricing(
    provider_type:  Optional[str] = Query(None, description="official | aggregator"),
    provider_name:  Optional[str] = Query(None),
    model_family:   Optional[str] = Query(None),
    model_name:     Optional[str] = Query(None),
):
    q = get_client().table(TABLE).select("*")
    if provider_type:
        q = q.eq("provider_type", provider_type)
    if provider_name:
        q = q.eq("provider_name", provider_name)
    if model_family:
        q = q.eq("model_family", model_family)
    if model_name:
        q = q.eq("model_name", model_name)
    return q.order("provider_type").order("provider_name").order("model_name").execute().data


@router.get("/providers", response_model=list[str])
def list_providers(provider_type: Optional[str] = Query(None)):
    q = get_client().table(TABLE).select("provider_name")
    if provider_type:
        q = q.eq("provider_type", provider_type)
    return sorted({r["provider_name"] for r in q.execute().data})


@router.get("/models", response_model=list[str])
def list_models(model_family: Optional[str] = Query(None)):
    q = get_client().table(TABLE).select("model_name")
    if model_family:
        q = q.eq("model_family", model_family)
    return sorted({r["model_name"] for r in q.execute().data})


@router.get("/comparison", response_model=list[PricingComparison])
def price_comparison(
    model_family: Optional[str] = Query(None),
    model_name:   Optional[str] = Query(None),
):
    """Official price vs aggregator prices grouped by model (for the ranking table)."""
    q = get_client().table(TABLE).select("*")
    if model_family:
        q = q.eq("model_family", model_family)
    if model_name:
        q = q.eq("model_name", model_name)

    groups: dict[str, dict] = {}
    for row in q.execute().data:
        key = row["model_name"]
        groups.setdefault(key, {
            "model_name":   row["model_name"],
            "model_family": row["model_family"],
            "official":     None,
            "aggregators":  [],
        })
        if row["provider_type"] == "official":
            groups[key]["official"] = row
        else:
            groups[key]["aggregators"].append(row)

    return list(groups.values())


@router.get("/{pricing_id}", response_model=PricingRow)
def get_pricing(pricing_id: int):
    res = get_client().table(TABLE).select("*").eq("id", pricing_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Not found")
    return res.data
