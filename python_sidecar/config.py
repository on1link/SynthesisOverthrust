# ============================================================
# SynthesisOverthrust — python_sidecar/config.py
# Single settings object — reads from env vars with sane defaults.
# ============================================================

from __future__ import annotations
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="NF_", case_sensitive=False)

    IDENTIFIER: str = "com.synthesisoverthrust.app"

    # ── Server ────────────────────────────────────────────────────────────────
    PORT:       int  = 7731
    HOST:       str  = "127.0.0.1"
    DEBUG:      bool = False

    # ── Data paths ────────────────────────────────────────────────────────────
    DATA_DIR:   str  = str(Path.home() / f".local/share/{IDENTIFIER}")
    DB_PATH:    str  = str(Path.home() / f".local/share/{IDENTIFIER}/synthesis_overthrust.db")
    VAULT_PATH: str  = ""          # set in app Settings UI
    PLUGIN_DIR: str  = str(Path.home() / f".local/share/{IDENTIFIER}/plugins")
    BACKUP_DIR: str  = str(Path.home() / f".local/share/{IDENTIFIER}")
    # ── AI / Ollama ───────────────────────────────────────────────────────────
    OLLAMA_URL:   str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    EMBED_MODEL:  str = "all-MiniLM-L6-v2"
    MASTERY_SR_CAP:    int = 80   # SR/practice ceiling; >80 needs assessment (D21)
    ASSESS_PASS_SCORE: int = 70   # pass threshold (D25)
    ASSESS_QUESTIONS:  int = 4    # questions per assessment
    ASSESS_MODEL:      str = ""   # assessment model; empty → OLLAMA_MODEL (SO-D5:
                                  # prefer a ≥7B model here, 3B graders are erratic)

    # ── FAISS ─────────────────────────────────────────────────────────────────
    FAISS_INDEX: str  = str(Path.home() / f".local/share/{IDENTIFIER}/faiss.index")
    FAISS_PATH: str  = str(Path.home() / f".local/share/{IDENTIFIER}/faiss.index")
    CHUNK_SIZE:  int  = 400     # tokens per chunk
    CHUNK_OVERLAP: int = 80

    # ── Catalog / LanceDB ─────────────────────────────────────────────────────
    LANCE_DIR:    str = str(Path.home() / f".local/share/{IDENTIFIER}/lancedb")
    CATALOG_PATH: str = str(Path(__file__).resolve().parents[1] / "Synthesis Overthrust Catalog.md")

    # ── Syncthing (optional) ──────────────────────────────────────────────────
    SYNCTHING_URL:     str = "http://localhost:8384"
    SYNCTHING_API_KEY: str = ""

    @property
    def db_url(self) -> str:
        return f"sqlite+aiosqlite:///{self.DB_PATH}"

    @property
    def data_path(self) -> Path:
        p = Path(self.DATA_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def plugin_path(self) -> Path:
        p = Path(self.PLUGIN_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()

# Ensure data directory exists
Path(settings.DATA_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.PLUGIN_DIR).mkdir(parents=True, exist_ok=True)
