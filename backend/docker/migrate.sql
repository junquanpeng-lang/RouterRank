-- ============================================================
-- Incremental migration: run against a live container to bring
-- schema up to date without destroying data.
-- Usage:
--   docker exec -i routerrank-db psql -U postgres -d routerrank_test < docker/migrate.sql
-- ============================================================

-- Add success column to test_result (idempotent)
ALTER TABLE test_result
    ADD COLUMN IF NOT EXISTS success BOOLEAN NOT NULL DEFAULT TRUE;

-- Create model_evaluation table (idempotent)
CREATE TABLE IF NOT EXISTS model_evaluation (
    id                           BIGSERIAL PRIMARY KEY,
    provider                     TEXT        NOT NULL,
    model_id                     TEXT        NOT NULL,
    model                        TEXT        NOT NULL,
    evaluated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sample_count                 INTEGER,

    success_rate                 NUMERIC(8,  4),
    ttft_p50                     NUMERIC(12, 3),
    ttft_p95                     NUMERIC(12, 3),
    tpot_p50                     NUMERIC(12, 3),
    tpot_p95                     NUMERIC(12, 3),
    e2e_p50                      NUMERIC(12, 3),
    e2e_p95                      NUMERIC(12, 3),
    prompt_token_deviation       NUMERIC(10, 6),
    output_token_deviation       NUMERIC(10, 6),
    input_price_deviation        NUMERIC(10, 6),
    output_price_deviation       NUMERIC(10, 6),
    cached_input_price_deviation NUMERIC(10, 6),

    trustworthiness_score        NUMERIC(6, 2),
    economics_score              NUMERIC(6, 2),
    performance_score            NUMERIC(6, 2),

    total_score                  NUMERIC(6, 2),
    rating                       TEXT,

    CONSTRAINT uq_eval_provider_model UNIQUE (provider, model_id)
);

CREATE INDEX IF NOT EXISTS idx_me_provider    ON model_evaluation (provider);
CREATE INDEX IF NOT EXISTS idx_me_model_id    ON model_evaluation (model_id);
CREATE INDEX IF NOT EXISTS idx_me_total_score ON model_evaluation (total_score DESC);
