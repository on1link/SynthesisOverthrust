// src-tauri/src/scheduler.rs
// Cron-based background jobs:
//   - Midnight: reset daily tasks, fire on_daily_reset plugin hook
//   - 08:00: SR review reminder notification (if cards due)

use anyhow::Result;
use sqlx::SqlitePool;
use tokio_cron_scheduler::{JobScheduler, Job};
use tracing::info;

pub async fn start_scheduler(pool: SqlitePool) -> Result<()> {
    let sched = JobScheduler::new().await?;

    // ── Midnight: streak check + plugin hook ─────────────────────────────────
    let pool_m = pool.clone();
    sched.add(Job::new_async("0 0 0 * * *", move |_, _| {
        let pool = pool_m.clone();
        Box::pin(async move {
            info!("Midnight reset running…");
            // Reset daily task completion flags
            let _ = sqlx::query("UPDATE users SET last_grind_date=NULL WHERE last_grind_date<date('now')")
                .execute(&pool).await;
            // Fire plugin hook via sidecar (best-effort)
            let _ = crate::sidecar::post("/plugins/fire", serde_json::json!({
                "hook": "on_daily_reset",
                "payload": { "date": chrono::Utc::now().format("%Y-%m-%d").to_string() }
            })).await;
            // Nightly auto-backup (D31) — best-effort, mirrors backup::maybe_auto_commit
            let auto: Option<String> =
                sqlx::query_scalar("SELECT value FROM config WHERE key='auto_git_commit'")
                    .fetch_optional(&pool).await.ok().flatten();
            if auto.as_deref() == Some("true") {
                let _ = crate::sidecar::post("/backup/commit", serde_json::json!({
                    "message": "nightly auto-backup"
                })).await;
                info!("Nightly auto-backup triggered");
            }
        })
    })?).await?;

    // ── 08:00: SR reminder ────────────────────────────────────────────────────
    let pool_sr = pool.clone();
    sched.add(Job::new_async("0 0 8 * * *", move |_, _| {
        let pool = pool_sr.clone();
        Box::pin(async move {
            let due: i64 = sqlx::query_scalar(
                "SELECT COUNT(*) FROM sr_cards WHERE user_id='default' AND due_date<=date('now')"
            ).fetch_one(&pool).await.unwrap_or(0);
            if due > 0 {
                info!("SR reminder: {due} cards due");
                // Tauri 2.0 notification via plugin — emitted as event instead
                // since we don't have the AppHandle here. The frontend polls sidecar_status.
            }
        })
    })?).await?;

    sched.start().await?;
    info!("Scheduler started");

    // Keep alive
    loop { tokio::time::sleep(std::time::Duration::from_secs(3600)).await; }
}
