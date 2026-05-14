from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter

from app.database import get_client
from app.services.metrics import compute_all

router = APIRouter(prefix="/model-evaluation", tags=["model-evaluation"])

TABLE = "model_evaluation"


@router.post("/update")
async def update_model_evaluation():
    """
    Recompute all metrics for every (provider, model_id) in test_result
    and upsert results into model_evaluation.
    """
    evaluations = compute_all()
    now = datetime.now(timezone.utc).isoformat()
    client = get_client()

    for ev in evaluations:
        ev["evaluated_at"] = now
        # delete existing row then insert fresh (avoids PostgREST upsert quirks)
        client.table(TABLE).delete().eq("provider", ev["provider"]).eq("model_id", ev["model_id"]).execute()
        client.table(TABLE).insert(ev).execute()

    return {"updated": len(evaluations), "evaluations": evaluations}


@router.get("")
def list_model_evaluations():
    """Return all rows from model_evaluation ordered by total_score desc."""
    return (
        get_client()
        .table(TABLE)
        .select("*")
        .order("total_score", desc=True)
        .execute()
        .data
    )
