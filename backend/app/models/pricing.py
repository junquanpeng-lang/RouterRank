from __future__ import annotations
from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, Field

ProviderType = Literal["official", "aggregator"]
PricingType  = Literal["text", "image", "audio", "embedding"]


class PricingRow(BaseModel):
    id:                         Optional[int]   = None
    provider_type:              ProviderType
    provider_name:              str
    model_family:               str
    model_name:                 str
    pricing_type:               PricingType     = "text"
    input_price_per_1m:         Optional[float] = None
    output_price_per_1m:        Optional[float] = None
    cached_input_price_per_1m:  Optional[float] = None
    cache_write_price_per_1m:   Optional[float] = None
    context_window:             Optional[int]   = None
    max_output_tokens:          Optional[int]   = None
    currency:                   str             = "USD"
    pricing_unit:               str             = "per_1m_tokens"
    current_discount:           float           = 0
    last_updated:               Optional[date]  = None
    source_url:                 Optional[str]   = None
    notes:                      Optional[str]   = None


class PricingComparison(BaseModel):
    """Official price vs aggregator prices for one model."""
    model_name:   str
    model_family: str
    official:     Optional[PricingRow]
    aggregators:  list[PricingRow]


class UpsertResult(BaseModel):
    upserted: int
    skipped:  int
    errors:   list[str] = Field(default_factory=list)
