// ============================================================
// SynthesisOverthrust — src-tauri/src/commands_p2.rs
// Phase 2 IPC commands — all proxy to Python sidecar via HTTP.
// Tauri 2.0: same #[tauri::command] pattern, no API changes.
// ============================================================

use crate::error::{NfError, Result};
use crate::sidecar::{get, is_alive, post};
use serde_json::{Value, json};

// ── Convenience macro ─────────────────────────────────────────────────────────
macro_rules! proxy_get {
    ($name:ident, $path:expr) => {
        #[tauri::command]
        pub async fn $name() -> Result<Value> {
            get($path)
                .await
                .map_err(|e| NfError::Sidecar(e.to_string()))
        }
    };
}

// ════════════════════════════════════════════════════════════════════════════
// SPACED REPETITION (FSRS)
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn sr_get_due(limit: Option<u32>) -> Result<Value> {
    let l = limit.unwrap_or(20);
    get(&format!("/sr/due?limit={l}"))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

proxy_get!(sr_get_all, "/sr/all");
proxy_get!(sr_get_stats, "/sr/stats");

#[tauri::command]
pub async fn sr_create_card(
    item_id: i64,
    front: Option<String>,
    back: Option<String>,
) -> Result<Value> {
    post(
        "/sr/create",
        json!({"item_id":item_id,"front":front,"back":back}),
    )
    .await
    .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn sr_submit_review(card_id: String, rating: u8) -> Result<Value> {
    post("/sr/review", json!({"card_id":card_id,"rating":rating}))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn sr_backfill() -> Result<Value> {
    post("/sr/backfill", json!({}))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

// ════════════════════════════════════════════════════════════════════════════
// SKILLS CATALOG (LanceDB retrieval)
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn catalog_ingest() -> Result<Value> {
    post("/catalog/ingest", json!({}))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn catalog_search(
    query: String,
    k: Option<u32>,
    role: Option<String>,
    tier: Option<String>,
) -> Result<Value> {
    let mut url = format!(
        "/catalog/search?q={}&k={}",
        urlencoding::encode(&query),
        k.unwrap_or(8)
    );
    if let Some(r) = role {
        url.push_str(&format!("&role={}", urlencoding::encode(&r)));
    }
    if let Some(t) = tier {
        url.push_str(&format!("&tier={}", urlencoding::encode(&t)));
    }
    get(&url).await.map_err(|e| NfError::Sidecar(e.to_string()))
}

proxy_get!(catalog_stats, "/catalog/stats");

#[tauri::command]
pub async fn catalog_sync_tree() -> Result<Value> {
    post("/catalog/sync-tree", json!({}))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

// ════════════════════════════════════════════════════════════════════════════
// SKILL SCOUT (discovery agent + correction loop)
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn scout_run(sources: Option<Vec<String>>, limit: Option<u32>) -> Result<Value> {
    post(
        "/scout/run",
        json!({"sources": sources, "limit": limit.unwrap_or(15)}),
    )
    .await
    .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn scout_proposals(status: Option<String>) -> Result<Value> {
    let s = status.unwrap_or_else(|| "pending".into());
    get(&format!("/scout/proposals?status={}", urlencoding::encode(&s)))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn scout_decide(
    proposal_id: String,
    action: String,
    skill: Option<String>,
    topic: Option<String>,
    tier: Option<String>,
    roles: Option<Vec<String>>,
) -> Result<Value> {
    post(
        "/scout/decide",
        json!({
            "proposal_id": proposal_id, "action": action,
            "skill": skill, "topic": topic, "tier": tier, "roles": roles,
        }),
    )
    .await
    .map_err(|e| NfError::Sidecar(e.to_string()))
}

proxy_get!(scout_fewshot, "/scout/fewshot");

// ════════════════════════════════════════════════════════════════════════════
// SEMANTIC SEARCH
// ════════════════════════════════════════════════════════════════════════════

// Wire truth: python_sidecar/search/router.py — /query and /reindex are POST.

#[tauri::command]
pub async fn search_vault(query: String, top_k: Option<u32>) -> Result<Value> {
    post(
        "/search/query",
        json!({"query": query, "top_k": top_k.unwrap_or(6)}),
    )
    .await
    .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn search_related(skill_id: String, top_k: Option<u32>) -> Result<Value> {
    let k = top_k.unwrap_or(5);
    get(&format!("/search/related/{skill_id}?top_k={k}"))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn search_reindex() -> Result<Value> {
    post("/search/reindex", json!({}))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

proxy_get!(search_stats, "/search/stats");

// ════════════════════════════════════════════════════════════════════════════
// LLM / OLLAMA
// ════════════════════════════════════════════════════════════════════════════

// Wire truth: pydantic models in python_sidecar/llm/router.py (ChatIn,
// PracticeIn, ExplainIn). context_type "vault" → 501 until B10 (D11).

#[tauri::command]
pub async fn llm_chat(
    messages: Vec<Value>,
    model: Option<String>,
    context_type: Option<String>,
    skill_id: Option<String>,
    session_id: Option<String>,
) -> Result<Value> {
    post(
        "/llm/chat",
        json!({
            "messages": messages,
            "model": model,
            "context_type": context_type.unwrap_or_else(|| "general".into()),
            "skill_id": skill_id,
            "session_id": session_id,
        }),
    )
    .await
    .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn llm_practice(
    subtopic_id: String,
    path_id: String,
    difficulty: Option<String>,
    count: Option<u32>,
    model: Option<String>,
) -> Result<Value> {
    post(
        "/llm/practice",
        json!({
            "subtopic_id": subtopic_id,
            "path_id": path_id,
            "difficulty": difficulty.unwrap_or_else(|| "medium".into()),
            "count": count.unwrap_or(3),
            "model": model,
        }),
    )
    .await
    .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn llm_explain(
    concept: String,
    target_level: Option<String>,
    analogy_domain: Option<String>,
    model: Option<String>,
) -> Result<Value> {
    post(
        "/llm/explain",
        json!({
            "concept": concept,
            "target_level": target_level.unwrap_or_else(|| "intermediate".into()),
            "analogy_domain": analogy_domain,
            "model": model,
        }),
    )
    .await
    .map_err(|e| NfError::Sidecar(e.to_string()))
}

// llm_ingest_paper deferred with the vault slice (D12) — the old proxy sent
// {file_path} to an endpoint expecting {text}; rebuild alongside B10/B14.

proxy_get!(llm_list_models, "/llm/models");

// ════════════════════════════════════════════════════════════════════════════
// ASSESSMENTS (B7) — wire truth: python_sidecar/assess/router.py
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn assess_start(item_id: i64, model: Option<String>) -> Result<Value> {
    post("/assess/start", json!({"item_id": item_id, "model": model}))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn assess_submit(assessment_id: String, answers: Vec<String>) -> Result<Value> {
    post(
        "/assess/submit",
        json!({"assessment_id": assessment_id, "answers": answers}),
    )
    .await
    .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn assess_active(item_id: Option<i64>) -> Result<Value> {
    match item_id {
        Some(id) => get(&format!("/assess/active?item_id={id}")).await,
        None => get("/assess/active").await,
    }
    .map_err(|e| NfError::Sidecar(e.to_string()))
}

#[tauri::command]
pub async fn assess_history(item_id: i64) -> Result<Value> {
    get(&format!("/assess/history?item_id={item_id}"))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

// ════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════════════════════════════════════

proxy_get!(analytics_overview, "/analytics/overview");
proxy_get!(analytics_skill_velocity, "/analytics/skill-velocity");
proxy_get!(analytics_sleep_correlation, "/analytics/sleep-correlation");

#[tauri::command]
pub async fn analytics_weekly_snapshot() -> Result<Value> {
    post("/analytics/snapshot/weekly", json!({}))
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

// ════════════════════════════════════════════════════════════════════════════
// SIDECAR MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn sidecar_status() -> Result<Value> {
    let alive = is_alive().await;
    Ok(json!({"alive":alive,"port":7731}))
}

#[tauri::command]
pub async fn sidecar_restart(app: tauri::AppHandle) -> Result<()> {
    crate::sidecar::restart(app)
        .await
        .map_err(|e| NfError::Sidecar(e.to_string()))
}

// Helper: URL encode (shared with commands_p3)
pub(crate) mod urlencoding {
    pub fn encode(s: &str) -> String {
        s.chars()
            .map(|c| match c {
                'a'..='z' | 'A'..='Z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
                ' ' => "%20".to_string(),
                c => format!("%{:02X}", c as u32),
            })
            .collect()
    }
}
