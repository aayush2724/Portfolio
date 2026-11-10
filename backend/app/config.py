"""Runtime configuration, read from the environment (and backend/.env locally).

Every variable is documented in the repository's root `.env.example`.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = Field(default="development", description="development | test | staging | production")
    app_version: str = "0.1.0"
    log_level: str = "INFO"

    # Pooled URL for request traffic. On Neon, locks and the LangGraph
    # checkpointer (later milestones) need the direct endpoint instead.
    database_url: str = "postgresql+asyncpg://pia:pia@127.0.0.1:5434/pia_dev"
    database_url_direct: str | None = None

    # Read-only fine-grained token: Contents + Metadata on the monitored repos.
    github_token: str | None = None
    github_api_base: str = "https://api.github.com"
    github_timeout_seconds: float = 20.0
    github_max_file_bytes: int = 40_000
    github_max_total_bytes: int = 400_000

    portfolio_repo: str = "aayush2724/Portfolio"
    portfolio_branch: str = "main"
    portfolio_site_url: str = "https://aayush-2724.vercel.app"
    seed_file: str = "seeds/projects.seed.json"

    cors_allowed_origins: str = "https://aayush-2724.vercel.app,http://localhost:5173,http://localhost:4173"

    # ── LLM (OpenRouter by default; any OpenAI-compatible endpoint works) ──
    llm_provider: str = "openrouter"
    llm_base_url: str = "https://openrouter.ai/api/v1"
    llm_api_key: str | None = None  # unset → the assistant reports itself offline
    # Visitor answers: a free OpenRouter model (owner decision 2026-11-09). Free models are rate-limited
    # per account; when a call is refused the site falls back to the scripted guide.
    llm_chat_model: str = "nvidia/nemotron-3.5-super-vl:free"
    # Any single free model can be throttled upstream at busy times (seen 2026-11-09 with Gemma), so
    # OpenRouter is given an ordered list and moves on when one is busy. Comma-separated.
    llm_fallback_models: str = "recursive/flint-v1.0:free,google/gemma-4-31b-it:free"
    # Repository analysis (M3+): free as well (owner decision 2026-11-09). Every result is reviewed by
    # the owner before anything is published, and invalid model output is rejected by validation.
    llm_analysis_model: str = "nvidia/nemotron-3.5-super-vl:free"
    # Private repositories never go to a free endpoint, whose providers may keep or train
    # on requests. They use this model; empty = private repos are skipped by model analysis (their
    # README ingestion is deterministic and unaffected).
    llm_private_repo_model: str | None = None
    # Owner decision 2026-11-09: public repositories only. Private repos are neither ingested nor analysed.
    include_private_repos: bool = False
    llm_timeout_seconds: float = 25.0
    # Reasoning models (Nemotron) can spend the whole output budget thinking and return no text.
    # Measured 2026-11-09 on the Auralis architecture question: "minimal" gives first text at ~10 s and
    # a complete answer at ~14 s ("low": 18 s / 28 s). Empty string = let the model decide.
    llm_reasoning_effort: str = "minimal"
    llm_daily_budget_usd: float = 2.0
    # Free models cost $0, so the dollar budget cannot protect the account's free quota (about 1,000
    # requests a day on OpenRouter). This caps model requests per UTC day across chat and analysis.
    llm_daily_request_cap: int = 800
    llm_prices_json: str | None = None  # {"model": [usd_per_m_input, usd_per_m_output]} overrides
    llm_app_url: str = "https://aayush-2724.vercel.app"  # OpenRouter attribution headers
    llm_app_name: str = "Portfolio Intelligence Agent"

    # ── Visitor assistant limits ──
    assistant_max_history: int = 12
    # Free reasoning model: about 3/4 of the output is hidden reasoning on large evidence packs
    # (measured 2026-11-09: 3,005 tokens for a 2,300-character architecture answer).
    assistant_max_output_tokens: int = 4000
    assistant_timeout_seconds: float = 45.0  # free model: headroom for busy periods
    assistant_max_tools: int = 3
    assistant_evidence_max_chars: int = 18_000
    rate_limit_per_ip: int = 20
    rate_limit_window_seconds: int = 600
    rate_limit_per_session_daily: int = 40
    # Proxies whose X-Forwarded-For entries we trust, counted from the right. 0 = use the socket peer
    # (local dev). Render appends one entry, so production sets 1.
    trusted_proxy_hops: int = 0
    rate_limit_salt: str = "rotate-me"  # mixed into the daily IP hash; set a random value in production
    store_conversations: bool = False  # metrics only unless the owner opts in (privacy.html must match)
    conversation_retention_days: int = 30

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_allowed_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def migration_database_url(self) -> str:
        return self.database_url_direct or self.database_url

    @property
    def llm_fallbacks(self) -> list[str]:
        return [m.strip() for m in self.llm_fallback_models.split(",") if m.strip()]

    @property
    def llm_configured(self) -> bool:
        return bool(self.llm_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
