-- ============================================================
-- Local Docker init: Supabase-compatible roles + full schema
-- Runs automatically on first container startup
-- ============================================================

-- ── PostgREST roles (mirrors Supabase cloud) ─────────────────
CREATE ROLE anon        NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

-- Let the postgres superuser act as these roles
GRANT anon         TO postgres;
GRANT service_role TO postgres;

-- Grant access to public schema
GRANT USAGE  ON SCHEMA public TO anon, service_role;
GRANT ALL    ON ALL TABLES    IN SCHEMA public TO anon, service_role;
GRANT ALL    ON ALL SEQUENCES IN SCHEMA public TO anon, service_role;

-- New tables created later also get these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES    TO anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO anon, service_role;


-- ── 1. Pricing table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS model_pricing (
    id                          BIGSERIAL PRIMARY KEY,
    provider_type               TEXT NOT NULL,
    provider_name               TEXT NOT NULL,
    model_family                TEXT NOT NULL,
    model_name                  TEXT NOT NULL,
    pricing_type                TEXT NOT NULL DEFAULT 'text',
    input_price_per_1m          NUMERIC(18, 6),
    output_price_per_1m         NUMERIC(18, 6),
    cached_input_price_per_1m   NUMERIC(18, 6),
    cache_write_price_per_1m    NUMERIC(18, 6),
    context_window              INTEGER,
    max_output_tokens           INTEGER,
    currency                    TEXT NOT NULL DEFAULT 'USD',
    pricing_unit                TEXT NOT NULL DEFAULT 'per_1m_tokens',
    current_discount            NUMERIC(6, 4) NOT NULL DEFAULT 0,
    last_updated                DATE,
    source_url                  TEXT,
    notes                       TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_provider_model UNIQUE (provider_name, model_name, pricing_type)
);

CREATE INDEX IF NOT EXISTS idx_mp_provider_type ON model_pricing (provider_type);
CREATE INDEX IF NOT EXISTS idx_mp_provider_name  ON model_pricing (provider_name);
CREATE INDEX IF NOT EXISTS idx_mp_model_name     ON model_pricing (model_name);
CREATE INDEX IF NOT EXISTS idx_mp_model_family   ON model_pricing (model_family);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_model_pricing_updated_at ON model_pricing;
CREATE TRIGGER trg_model_pricing_updated_at
    BEFORE UPDATE ON model_pricing
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 2. Test result table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS test_result (
    id                  BIGSERIAL PRIMARY KEY,
    run_id              UUID        NOT NULL,
    test_run_at         TIMESTAMPTZ NOT NULL,
    server              TEXT,
    region              TEXT,
    temperature         NUMERIC(4, 2) NOT NULL DEFAULT 0,

    prompt              TEXT        NOT NULL,
    output              TEXT,

    prompt_tokens       INTEGER,
    output_tokens       INTEGER,

    ttft_ms             NUMERIC(12, 3),
    tpot_ms             NUMERIC(12, 3),
    e2e_ms              NUMERIC(12, 3),

    first_token         TEXT,
    first_token_logprob NUMERIC(12, 6),
    stop_reason         TEXT,

    provider            TEXT        NOT NULL,
    model               TEXT        NOT NULL,
    model_id            TEXT        NOT NULL,

    success             BOOLEAN     NOT NULL DEFAULT TRUE,
    error               TEXT,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tr_run_id      ON test_result (run_id);
CREATE INDEX IF NOT EXISTS idx_tr_provider    ON test_result (provider);
CREATE INDEX IF NOT EXISTS idx_tr_model_id    ON test_result (model_id);
CREATE INDEX IF NOT EXISTS idx_tr_test_run_at ON test_result (test_run_at DESC);


-- ── 4. Model evaluation table ─────────────────────────────────

CREATE TABLE IF NOT EXISTS model_evaluation (
    id                           BIGSERIAL PRIMARY KEY,
    provider                     TEXT        NOT NULL,
    model_id                     TEXT        NOT NULL,
    model                        TEXT        NOT NULL,
    evaluated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sample_count                 INTEGER,

    -- Phase 1: basic metrics
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

    -- Phase 2: dimension scores (0-100)
    trustworthiness_score        NUMERIC(6, 2),
    economics_score              NUMERIC(6, 2),
    performance_score            NUMERIC(6, 2),

    -- Phase 3: total score and rating
    total_score                  NUMERIC(6, 2),
    rating                       TEXT,

    CONSTRAINT uq_eval_provider_model UNIQUE (provider, model_id)
);

CREATE INDEX IF NOT EXISTS idx_me_provider    ON model_evaluation (provider);
CREATE INDEX IF NOT EXISTS idx_me_model_id    ON model_evaluation (model_id);
CREATE INDEX IF NOT EXISTS idx_me_total_score ON model_evaluation (total_score DESC);
