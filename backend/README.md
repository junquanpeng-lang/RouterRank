# RouterRank Backend

FastAPI + Supabase backend，提供两项核心服务：
1. **定价数据 API** — 官方 & 聚合商 token 价格查询
2. **Token 计费偏差审计** — 同 prompt 对比官方 API vs 三方 API 的 token 用量差异

## 项目结构

```
backend/
├── app/
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 全局配置（pydantic-settings + .env）
│   ├── database.py          # Supabase client 单例
│   ├── models/
│   │   ├── pricing.py       # 定价相关 Pydantic 模型
│   │   └── token_audit.py   # 审计相关 Pydantic 模型
│   ├── routers/
│   │   ├── pricing.py       # GET /pricing/*
│   │   └── token_audit.py   # POST /token-audit/run  GET /token-audit/*
│   └── services/
│       ├── llm_caller.py    # 封装所有 LLM API 调用（官方 & 三方）
│       └── token_audit.py   # 审计编排：并发调用 → 偏差计算 → 存库
├── scripts/
│   └── import_csv.py        # CSV 批量导入定价数据
├── schema.sql               # Supabase 建表 SQL
├── requirements.txt
└── .env.example
```

## 快速上手

### 1. 建表（一次性）

登录 Supabase Dashboard → SQL Editor，粘贴并执行 `schema.sql`。

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填入 Supabase 和各 LLM 服务商的 API key
```

### 3. 安装依赖 & 启动

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Swagger 文档：`http://localhost:8000/docs`

### 4. 导入定价数据

```bash
# 预览（不写入）
python scripts/import_csv.py pricing.tsv --dry-run

# 正式导入（按 provider_name + model_name + pricing_type upsert）
python scripts/import_csv.py pricing.tsv

# 先清空再全量导入
python scripts/import_csv.py pricing.tsv --clear-first
```

---

## API 说明

### 定价接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/pricing/` | 查询全部定价，支持 `provider_type / provider_name / model_family / model_name` 过滤 |
| GET | `/pricing/comparison` | 官方价 vs 聚合商价，按模型分组（前端排行榜用） |
| GET | `/pricing/providers` | 服务商名称列表 |
| GET | `/pricing/models` | 模型名称列表 |
| GET | `/pricing/{id}` | 单条记录 |

### Token 审计接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/token-audit/run` | 发起一次审计（见下方请求体） |
| GET | `/token-audit/results` | 查询历史明细，支持 `model_family / provider_name / run_id / limit` 过滤 |
| GET | `/token-audit/summary` | 按模型×服务商聚合的偏差统计（均值、最大值） |

#### POST /token-audit/run 请求体

```json
{
  "prompt": "Explain transformer architecture in 3 sentences.",
  "temperature": 0,
  "model_families": ["GPT", "Claude", "Gemini"],
  "providers": ["OpenRouter", "EasyRouter", "B.ai"]
}
```

#### 偏差率计算

```
prompt_token_deviation     = (provider_prompt_tokens - official_prompt_tokens)     / official_prompt_tokens
completion_token_deviation = (provider_completion_tokens - official_completion_tokens) / official_completion_tokens
```

正值表示三方计费 token 数多于官方（超收），负值表示少于官方。

---

## 支持的模型组合

| 模型系列 | 官方对照组 | OpenRouter | EasyRouter | B.ai |
|--------|-----------|-----------|-----------|------|
| GPT    | OpenAI    | ✅ | ✅ | ✅ |
| Claude | Anthropic | ✅ | ✅ | ✅ |
| Gemini | Google    | ✅ | ✅ | ❌（不支持）|
