// ============================================================
// SynthesisOverthrust — src-tauri/src/db.rs
// SQLite pool init, WAL config, migrations 001–003, skill seed.
// Tauri 2.0 — no tauri::api::path; paths resolved via app.path().
// ============================================================

use anyhow::Result;
use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use tracing::info;

/// Tauri managed state.
pub struct DbPool(pub SqlitePool);

// ── Pool ──────────────────────────────────────────────────────────────────────
pub async fn init_pool(db_url: &str) -> Result<SqlitePool> {
    let pool = SqlitePoolOptions::new()
        .max_connections(16)
        .connect(db_url)
        .await?;

    // WAL mode for concurrent Python sidecar + Rust access
    sqlx::query("PRAGMA journal_mode = WAL;")
        .execute(&pool)
        .await?;
    sqlx::query("PRAGMA foreign_keys = ON;")
        .execute(&pool)
        .await?;
    sqlx::query("PRAGMA synchronous = NORMAL;")
        .execute(&pool)
        .await?;
    sqlx::query("PRAGMA wal_autocheckpoint = 1000;")
        .execute(&pool)
        .await?;
    sqlx::query("PRAGMA cache_size = -32000;")
        .execute(&pool)
        .await?; // 32MB cache
    Ok(pool)
}

// ── Migrations ────────────────────────────────────────────────────────────────
/// Runs embedded SQL migrations.
/// Uses sqlx::migrate! which embeds the files at compile time.
/// If a checksum mismatch is detected (schema file was rewritten),
/// the _sqlx_migrations table is reset so migrations re-run cleanly.
pub async fn run_migrations(pool: &SqlitePool) -> Result<()> {
    info!("Running database migrations…");
    match sqlx::migrate!("../migrations").run(pool).await {
        Ok(()) => {}
        Err(e) => {
            let msg = e.to_string();
            if msg.contains("checksum") || msg.contains("has been modified") {
                tracing::warn!(
                    "Migration checksum mismatch — resetting migration state: {msg}"
                );
                // Drop the migration tracking table so they re-run from scratch.
                // Tables use CREATE IF NOT EXISTS, so existing data is preserved.
                sqlx::query("DROP TABLE IF EXISTS _sqlx_migrations")
                    .execute(pool)
                    .await?;
                sqlx::migrate!("../migrations").run(pool).await?;
            } else {
                return Err(e.into());
            }
        }
    }
    info!("All migrations applied");

    // Seed default user if not exists (migration also does this,
    // but belt-and-suspenders for fresh DBs)
    sqlx::query(
        "INSERT OR IGNORE INTO users (id, name, username)
         VALUES ('default', 'Learner', 'Learner')",
    )
    .execute(pool)
    .await?;

    Ok(())
}

