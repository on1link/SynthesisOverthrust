// ============================================================
// SynthesisOverthrust — src-tauri/src/commands.rs
// All #[tauri::command] handlers.
// Updated for 002_skill_cycle.sql:
//   - activity_log uses 'action'/'details' (001 schema columns)
//   - skill levels 0–5, mastery-driven via v_node_mastery
//   - tasks uses node_id/subtopic_id (no 'skill_node_id')
//   - goals uses 'target' column (not 'total')
//   - new: subtopics, mastery, practice, resources,
//          focus sessions, notifications, milestones, unlocks
// ============================================================

use chrono::Utc;
use serde_json::{Value, json};
use sqlx::SqlitePool;
use tauri::State;
use uuid::Uuid;

use crate::db::DbPool;
use crate::error::{NfError, Result};

const XP_PER_LEVEL: i64 = 1000;
const MAX_NODE_LEVEL: i64 = 5;

// ── XP helper ─────────────────────────────────────────────────────────────────
// activity_log (001): action TEXT, details TEXT
// activity_log (002 additions): xp INTEGER, node_id TEXT, path_id TEXT
async fn award_xp(
    pool: &SqlitePool,
    user_id: &str,
    amount: i64,
    action: &str,  // activity_log.action
    details: &str, // activity_log.details
    sp_bonus: i64,
    node_id: Option<&str>,
    path_id: Option<&str>,
) -> Result<Value> {
    let (xp, level, sp): (i64, i64, i64) =
        sqlx::query_as("SELECT xp, level, sp FROM users WHERE id = ?")
            .bind(user_id)
            .fetch_one(pool)
            .await?;

    let new_xp = xp + amount;
    let new_level = new_xp / XP_PER_LEVEL + 1;
    let leveled = new_level > level;
    let sp_gain = sp_bonus + if leveled { 3 } else { 0 };
    let new_sp = sp + sp_gain;

    sqlx::query("UPDATE users SET xp=?,level=?,sp=? WHERE id=?")
        .bind(new_xp)
        .bind(new_level)
        .bind(new_sp)
        .bind(user_id)
        .execute(pool)
        .await?;

    sqlx::query(
        "INSERT INTO activity_log (id,user_id,action,details,xp,node_id,path_id)
         VALUES (?,?,?,?,?,?,?)",
    )
    .bind(Uuid::new_v4().to_string())
    .bind(user_id)
    .bind(action)
    .bind(details)
    .bind(amount)
    .bind(node_id)
    .bind(path_id)
    .execute(pool)
    .await?;

    if leveled {
        let _ = sqlx::query(
            "INSERT INTO notifications (user_id,type,title,body) VALUES ('default','level_up',?,?)",
        )
        .bind(format!("Level {} reached! 🎉", new_level))
        .bind(format!("{} XP gained · {} SP awarded.", amount, sp_gain))
        .execute(pool)
        .await;
    }

    Ok(json!({
        "xp_gained":  amount,   "total_xp":   new_xp,
        "new_level":  new_level,"leveled_up": leveled,
        "sp_gained":  sp_gain,  "total_sp":   new_sp,
    }))
}

// ════════════════════════════════════════════════════════════════════════════
// USER
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_user(db: State<'_, DbPool>) -> Result<Value> {
    let row = sqlx::query_as::<_, (String, String, i64, i64, i64, i64, i64, String, i64)>(
        "SELECT id, name, xp, level, sp, streak,
                COALESCE(daily_xp_goal, 200),
                COALESCE(timezone, 'UTC'),
                COALESCE(onboarding_done, 0)
         FROM users WHERE id='default'",
    )
    .fetch_one(&db.0)
    .await?;
    Ok(json!({
        "id": row.0, "name": row.1, "xp": row.2, "level": row.3,
        "sp": row.4, "streak": row.5,
        "daily_xp_goal": row.6, "timezone": row.7, "onboarding_done": row.8 != 0,
    }))
}

#[tauri::command]
pub async fn update_streak(db: State<'_, DbPool>) -> Result<i64> {
    let today = Utc::now().format("%Y-%m-%d").to_string();
    let yesterday = (Utc::now() - chrono::Duration::days(1))
        .format("%Y-%m-%d")
        .to_string();
    let last: Option<String> =
        sqlx::query_scalar("SELECT last_active FROM users WHERE id='default'")
            .fetch_one(&db.0)
            .await?;
    let new_streak: i64 = match last.as_deref() {
        Some(d) if d == today => {
            return Ok(
                sqlx::query_scalar("SELECT streak FROM users WHERE id='default'")
                    .fetch_one(&db.0)
                    .await?,
            );
        }
        Some(d) if d == yesterday => {
            sqlx::query_scalar("SELECT streak+1 FROM users WHERE id='default'")
                .fetch_one(&db.0)
                .await?
        }
        _ => 1,
    };
    sqlx::query("UPDATE users SET streak=?,last_active=? WHERE id='default'")
        .bind(new_streak)
        .bind(&today)
        .execute(&db.0)
        .await?;
    Ok(new_streak)
}

// ════════════════════════════════════════════════════════════════════════════
// SKILLS — MASTERY-DRIVEN LEVELS (0–5 via v_node_mastery)
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_skill_levels(db: State<'_, DbPool>) -> Result<Value> {
    // One row per (skill, role): skill_id, role_id, skill name, icon, description, difficulty_id
    let skill_role_rows = sqlx::query_as::<_, (String, String, String, String, Option<String>, Option<String>)>(
        "SELECT s.id, r.id, s.name, s.icon, s.description, s.difficulty_id
         FROM skills s
         JOIN skill_roles sr ON sr.skill_id = s.id
         JOIN roles r ON r.id = sr.role_id
         ORDER BY s.id, r.sort_order",
    )
    .fetch_all(&db.0)
    .await?;

    // prereqs: skill_id → prerequisite skill id
    let prereq_rows = sqlx::query_as::<_, (String, String)>(
        "SELECT skill_id, prerequisite_id FROM skill_prerequisites",
    )
    .fetch_all(&db.0)
    .await?;

    // all roles a skill belongs to (for the "shared" field)
    let all_roles_rows = sqlx::query_as::<_, (String, String)>(
        "SELECT skill_id, role_id FROM skill_roles",
    )
    .fetch_all(&db.0)
    .await?;

    // topic count per skill (for level dot display)
    let topic_counts = sqlx::query_as::<_, (String, i64)>(
        "SELECT skill_id, COUNT(*) FROM topics GROUP BY skill_id",
    )
    .fetch_all(&db.0)
    .await?;

    // total item count per skill (for progress denominator)
    let item_counts = sqlx::query_as::<_, (String, i64)>(
        "SELECT t.skill_id, COUNT(ti.id)
         FROM topics t JOIN topic_items ti ON ti.topic_id = t.id
         GROUP BY t.skill_id",
    )
    .fetch_all(&db.0)
    .await?;

    // mastery-driven levels from the view (gracefully empty if view missing)
    let mastery_rows = sqlx::query_as::<_, (String, f64, i64, i64, i64)>(
        "SELECT node_id, COALESCE(avg_mastery,0.0), computed_level,
                COALESCE(mastered_count,0), COALESCE(xp_invested,0)
         FROM v_node_mastery WHERE user_id='default'",
    )
    .fetch_all(&db.0)
    .await
    .unwrap_or_default();

    // unlocked skills
    let unlocked: Vec<String> =
        sqlx::query_scalar(
            "SELECT skill_id FROM user_skill_unlocks WHERE user_id='default' AND is_unlocked=1",
        )
        .fetch_all(&db.0)
        .await
        .unwrap_or_default();

    // Build levels map keyed "skill_id::role_id"
    let mut levels = serde_json::Map::new();
    for (skill_id, avg_mastery, computed_level, mastered_count, xp_inv) in &mastery_rows {
        let is_unlocked = unlocked.contains(skill_id);
        for (sid, role_id) in &all_roles_rows {
            if sid != skill_id {
                continue;
            }
            levels.insert(
                format!("{}::{}", skill_id, role_id),
                json!({
                    "level":              computed_level,
                    "avg_mastery":        avg_mastery,
                    "mastered_subtopics": mastered_count,
                    "xp_invested":        xp_inv,
                    "unlocked":           is_unlocked,
                }),
            );
        }
    }

    // Build nodes — one per (skill, role)
    let nodes: Vec<Value> = skill_role_rows
        .iter()
        .map(|(skill_id, role_id, name, icon, desc, diff_id)| {
            let prereqs: Vec<&str> = prereq_rows
                .iter()
                .filter(|(sid, _)| sid == skill_id)
                .map(|(_, pid)| pid.as_str())
                .collect();
            let shared: Vec<&str> = all_roles_rows
                .iter()
                .filter(|(sid, _)| sid == skill_id)
                .map(|(_, rid)| rid.as_str())
                .collect();
            let n_topics = topic_counts.iter().find(|(s, _)| s == skill_id).map(|(_, c)| *c).unwrap_or(0);
            let n_items = item_counts.iter().find(|(s, _)| s == skill_id).map(|(_, c)| *c).unwrap_or(0);
            json!({
                "id":            skill_id,
                "path_id":       role_id,
                "name":          name,
                "icon":          icon,
                "description":   desc,
                "difficulty_id": diff_id,
                "prereqs":       serde_json::to_string(&prereqs).unwrap_or_else(|_| "[]".into()),
                "shared":        serde_json::to_string(&shared).unwrap_or_else(|_| "[]".into()),
                "topic_count":   n_topics,
                "item_count":    n_items,
            })
        })
        .collect();

    // Also return roles and difficulties for UI tabs
    let roles = sqlx::query_as::<_, (String, String, String, String, String, i64)>(
        "SELECT id, name, color, bg_color, bg_alpha, COALESCE(sort_order,0) FROM roles ORDER BY sort_order",
    )
    .fetch_all(&db.0)
    .await?;

    let difficulties = sqlx::query_as::<_, (String, String, String, i64)>(
        "SELECT id, label, short_label, COALESCE(sort_order,0) FROM difficulties ORDER BY sort_order",
    )
    .fetch_all(&db.0)
    .await?;

    let roles_json: Vec<Value> = roles.iter().map(|(id, name, color, bg, bg_a, sort)| {
        json!({ "id": id, "name": name, "color": color, "bg_color": bg, "bg_alpha": bg_a, "sort_order": sort })
    }).collect();

    let diff_json: Vec<Value> = difficulties.iter().map(|(id, label, short, sort)| {
        json!({ "id": id, "label": label, "short_label": short, "sort_order": sort })
    }).collect();

    Ok(json!({ "levels": levels, "nodes": nodes, "roles": roles_json, "difficulties": diff_json }))
}

/// Spend 1 SP → boost all topic_items of a skill by +15 mastery (capped 100).
#[tauri::command]
pub async fn level_up_skill(
    node_id: String,
    path_id: String,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let sp: i64 = sqlx::query_scalar("SELECT sp FROM users WHERE id='default'")
        .fetch_one(&db.0)
        .await?;
    if sp < 1 {
        return Err(NfError::Validation("Not enough SP (need 1)".into()));
    }

    let cur_level: i64 = sqlx::query_scalar(
        "SELECT COALESCE(computed_level,0) FROM v_node_mastery WHERE user_id='default' AND node_id=?",
    )
    .bind(&node_id)
    .fetch_one(&db.0)
    .await
    .unwrap_or(0);

    if cur_level >= MAX_NODE_LEVEL {
        return Err(NfError::Validation(format!(
            "Node already at max level ({MAX_NODE_LEVEL})"
        )));
    }

    sqlx::query("UPDATE users SET sp=sp-1 WHERE id='default'")
        .execute(&db.0)
        .await?;

    // Boost all topic_items belonging to this skill
    sqlx::query(
        "INSERT INTO user_item_mastery (user_id, item_id, mastery, last_practiced)
         SELECT 'default', ti.id,
                MIN(100, COALESCE(
                    (SELECT mastery FROM user_item_mastery uim2
                     WHERE uim2.user_id='default' AND uim2.item_id=ti.id), 0) + 15),
                datetime('now')
         FROM topic_items ti
         JOIN topics t ON t.id = ti.topic_id
         WHERE t.skill_id = ?
         ON CONFLICT(user_id, item_id) DO UPDATE
            SET mastery = MIN(100, mastery + 15), last_practiced = datetime('now')",
    )
    .bind(&node_id)
    .execute(&db.0)
    .await?;

    let name: String =
        sqlx::query_scalar("SELECT name FROM skills WHERE id=?")
            .bind(&node_id)
            .fetch_one(&db.0)
            .await
            .unwrap_or_else(|_| node_id.clone());

    let new_level: i64 = sqlx::query_scalar(
        "SELECT COALESCE(computed_level,0) FROM v_node_mastery WHERE user_id='default' AND node_id=?",
    )
    .bind(&node_id)
    .fetch_one(&db.0)
    .await
    .unwrap_or(0);

    let xp_result = award_xp(
        &db.0,
        "default",
        100,
        "skill_boost",
        &format!("SP boost: {name}"),
        0,
        Some(&node_id),
        Some(&path_id),
    )
    .await?;

    let _ = crate::sidecar::post(
        "/plugins/fire",
        json!({
            "hook":"on_skill_levelup",
            "payload":{"node_id":node_id,"path_id":path_id,"skill_name":name,"level":new_level}
        }),
    )
    .await;

    Ok(json!({ "node_id":node_id,"path_id":path_id,"new_level":new_level,"xp_result":xp_result }))
}

// ════════════════════════════════════════════════════════════════════════════
// SUBTOPICS
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_subtopics(
    node_id: String,
    path_id: String,
    db: State<'_, DbPool>,
) -> Result<Value> {
    // topic_items joined with their parent topic for the group header context
    // "name" = item content, "description" = parent topic header
    let rows = sqlx::query_as::<_, (i64, String, String, i64, i64)>(
        "SELECT ti.id, ti.content, t.header, ti.sort_order, ti.xp_value
         FROM topic_items ti
         JOIN topics t ON t.id = ti.topic_id
         WHERE t.skill_id = ?
         ORDER BY t.sort_order, ti.sort_order",
    )
    .bind(&node_id)
    .fetch_all(&db.0)
    .await?;

    let prog = sqlx::query_as::<_, (i64, i64, i64, i64, Option<String>)>(
        "SELECT item_id, mastery, practice_count, correct_count, last_practiced
         FROM user_item_mastery WHERE user_id='default'",
    )
    .fetch_all(&db.0)
    .await?;

    Ok(json!(
        rows.iter()
            .map(|(id, content, topic_header, order, xp_val)| {
                let p = prog.iter().find(|(iid, ..)| iid == id);
                let mastery = p.map(|x| x.1).unwrap_or(0);
                let pc = p.map(|x| x.2).unwrap_or(0);
                let cc = p.map(|x| x.3).unwrap_or(0);
                json!({
                    "id":           id.to_string(),
                    "node_id":      node_id,
                    "path_id":      path_id,
                    "name":         content,
                    "description":  topic_header,
                    "order_idx":    order,
                    "xp_value":     xp_val,
                    "mastery":      mastery,
                    "practice_count": pc,
                    "correct_count":  cc,
                    "accuracy":     if pc > 0 { cc * 100 / pc } else { 0 },
                    "last_practiced": p.and_then(|x| x.4.clone()),
                })
            })
            .collect::<Vec<_>>()
    ))
}

#[tauri::command]
pub async fn update_subtopic_mastery(
    subtopic_id: String,
    path_id: String,
    delta: i64,
    db: State<'_, DbPool>,
) -> Result<Value> {
    // subtopic_id is a topic_item id (integer stored as text from frontend)
    let item_id: i64 = subtopic_id.parse().map_err(|_| NfError::Validation("invalid item id".into()))?;

    sqlx::query(
        "INSERT INTO user_item_mastery (user_id, item_id, mastery, last_practiced)
         VALUES ('default', ?, MAX(0, MIN(100, ?)), datetime('now'))
         ON CONFLICT(user_id, item_id) DO UPDATE
            SET mastery = MAX(0, MIN(100, mastery + ?)),
                last_practiced = datetime('now')",
    )
    .bind(item_id)
    .bind(delta)
    .bind(delta)
    .execute(&db.0)
    .await?;

    // Resolve the parent skill id for the response
    let node_id: Option<String> =
        sqlx::query_scalar(
            "SELECT t.skill_id FROM topic_items ti JOIN topics t ON t.id = ti.topic_id WHERE ti.id = ?",
        )
        .bind(item_id)
        .fetch_optional(&db.0)
        .await?;

    let new_mastery: i64 = sqlx::query_scalar(
        "SELECT COALESCE(mastery, 0) FROM user_item_mastery WHERE user_id='default' AND item_id=?",
    )
    .bind(item_id)
    .fetch_one(&db.0)
    .await
    .unwrap_or(0);

    Ok(json!({ "subtopic_id": subtopic_id, "new_mastery": new_mastery, "node_id": node_id }))
}

// ════════════════════════════════════════════════════════════════════════════
// PRACTICE PROBLEMS + ATTEMPTS
// ════════════════════════════════════════════════════════════════════════════

// Mirrors python_sidecar settings.MASTERY_SR_CAP (D21) — change both together.
const MASTERY_SR_CAP: i64 = 80;

#[tauri::command]
pub async fn list_practice_problems(
    subtopic_id: String,
    path_id: String,
    difficulty: Option<String>,
    limit: Option<i64>,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let lim = limit.unwrap_or(10);
    let diff = difficulty.unwrap_or_else(|| "medium".into());
    let rows = sqlx::query_as::<_, (String, String, String, String, Option<String>)>(
        "SELECT id,difficulty,problem_text,hints,explanation FROM practice_problems
         WHERE subtopic_id=? AND path_id=? AND difficulty=? ORDER BY RANDOM() LIMIT ?",
    )
    .bind(&subtopic_id)
    .bind(&path_id)
    .bind(&diff)
    .bind(lim)
    .fetch_all(&db.0)
    .await?;
    Ok(json!(rows.iter().map(|(id,dif,prob,hints,expl)|
        json!({"id":id,"difficulty":dif,"problem_text":prob,"hints":hints,"explanation":expl})
    ).collect::<Vec<_>>()))
}

#[tauri::command]
pub async fn submit_practice_attempt(
    problem_id: String,
    subtopic_id: String,
    path_id: String,
    correct: bool,
    time_taken_s: i64,
    hint_used: bool,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let delta: i64 = if correct {
        8 - if hint_used { 2 } else { 0 }
    } else {
        -3
    };
    let xp_awarded: i64 = if correct {
        if hint_used { 30 } else { 50 }
    } else {
        10
    };

    let attempt_id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO practice_attempts
         (id,user_id,problem_id,subtopic_id,path_id,correct,time_taken_s,hint_used,xp_awarded,mastery_delta)
         VALUES (?,?,?,?,?,?,?,?,?,?)"
    )
    .bind(&attempt_id).bind("default").bind(&problem_id)
    .bind(&subtopic_id).bind(&path_id)
    .bind(correct as i64).bind(time_taken_s).bind(hint_used as i64)
    .bind(xp_awarded).bind(delta).execute(&db.0).await?;

    let item_id: i64 = subtopic_id.parse().map_err(|_| NfError::Validation("invalid item id".into()))?;

    // Update topic_item mastery + counters in user_item_mastery
    sqlx::query(
        "INSERT INTO user_item_mastery
         (user_id, item_id, mastery, practice_count, correct_count, last_practiced)
         VALUES ('default', ?, MAX(0, MIN(?, ?)), 1, ?, datetime('now'))
         ON CONFLICT(user_id, item_id) DO UPDATE
            SET mastery        = CASE
                  WHEN mastery > ? THEN MAX(0, mastery + MIN(0, ?))      -- above cap: deltas can only lower toward it, floor 0
                  ELSE MAX(0, MIN(?, mastery + ?))
                END,
                practice_count = practice_count + 1,
                correct_count  = correct_count + ?,
                last_practiced = datetime('now')",
    )
    .bind(item_id)
    .bind(MASTERY_SR_CAP)
    .bind(delta)
    .bind(if correct { 1i64 } else { 0 })
    .bind(MASTERY_SR_CAP)
    .bind(delta)
    .bind(MASTERY_SR_CAP)
    .bind(delta)
    .bind(if correct { 1i64 } else { 0 })
    .execute(&db.0)
    .await?;

    let new_mastery: i64 = sqlx::query_scalar(
        "SELECT COALESCE(mastery, 0) FROM user_item_mastery WHERE user_id='default' AND item_id=?",
    )
    .bind(item_id)
    .fetch_one(&db.0)
    .await
    .unwrap_or(0);

    let node_id: Option<String> =
        sqlx::query_scalar(
            "SELECT t.skill_id FROM topic_items ti JOIN topics t ON t.id = ti.topic_id WHERE ti.id = ?",
        )
        .bind(item_id)
        .fetch_optional(&db.0)
        .await?;

    let xp_result = award_xp(
        &db.0,
        "default",
        xp_awarded,
        "practice",
        &format!("Practice: {subtopic_id}"),
        0,
        node_id.as_deref(),
        Some(&path_id),
    )
    .await?;

    Ok(json!({
        "attempt_id":attempt_id,"correct":correct,
        "mastery_delta":delta,"new_mastery":new_mastery,
        "xp_result":xp_result,
    }))
}

// ════════════════════════════════════════════════════════════════════════════
// LEARNING RESOURCES
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn list_resources(
    node_id: String,
    path_id: String,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let rows = sqlx::query_as::<
        _,
        (
            String,
            String,
            String,
            Option<String>,
            Option<String>,
            f64,
            i64,
        ),
    >(
        "SELECT r.id,r.type,r.title,r.url,r.author,r.est_hours,r.is_free
         FROM learning_resources r
         WHERE (r.node_id=? OR r.node_id IS NULL) AND r.path_id=?
         ORDER BY r.type,r.title",
    )
    .bind(&node_id)
    .bind(&path_id)
    .fetch_all(&db.0)
    .await?;

    let prog = sqlx::query_as::<_, (String, i64, Option<String>)>(
        "SELECT resource_id,pct_complete,finished_at FROM resource_progress WHERE user_id='default'"
    ).fetch_all(&db.0).await?;

    Ok(json!(
        rows.iter()
            .map(|(id, rtype, title, url, author, est_h, is_free)| {
                let p = prog.iter().find(|(rid, ..)| rid == id);
                json!({
                    "id":id,"type":rtype,"title":title,"url":url,"author":author,
                    "est_hours":est_h,"is_free":is_free==&1i64,
                    "pct_complete": p.map(|x| x.1).unwrap_or(0),
                    "finished":     p.and_then(|x| x.2.clone()).is_some(),
                })
            })
            .collect::<Vec<_>>()
    ))
}

#[tauri::command]
pub async fn update_resource_progress(
    resource_id: String,
    pct_complete: i64,
    db: State<'_, DbPool>,
) -> Result<()> {
    let pct = pct_complete.clamp(0, 100);
    sqlx::query(
        "INSERT INTO resource_progress (user_id,resource_id,pct_complete,started_at,finished_at)
         VALUES ('default',?,?,
             COALESCE((SELECT started_at FROM resource_progress WHERE user_id='default' AND resource_id=?),datetime('now')),
             CASE WHEN ?>=100 THEN datetime('now') ELSE NULL END)
         ON CONFLICT(user_id,resource_id) DO UPDATE
            SET pct_complete=excluded.pct_complete, finished_at=excluded.finished_at, updated_at=datetime('now')"
    ).bind(&resource_id).bind(pct).bind(&resource_id).bind(pct).execute(&db.0).await?;
    Ok(())
}

// ════════════════════════════════════════════════════════════════════════════
// FOCUS SESSIONS
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn log_focus_session(
    duration_mins: i64,
    session_type: String,
    node_id: Option<String>,
    subtopic_id: Option<String>,
    path_id: Option<String>,
    notes: Option<String>,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let valid = ["pomodoro", "deep", "review", "assessment"];
    if !valid.contains(&session_type.as_str()) {
        return Err(NfError::Validation(format!(
            "Invalid session_type: {session_type}"
        )));
    }
    let xp: i64 = match (session_type.as_str(), duration_mins) {
        ("deep", d) if d >= 90 => 80,
        ("deep", d) if d >= 45 => 50,
        ("pomodoro", _) => 20,
        ("review", _) => 30,
        ("assessment", _) => 40,
        _ => 15,
    };
    let id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO focus_sessions (id,user_id,node_id,subtopic_id,path_id,duration_mins,session_type,notes,xp_reward,started_at,ended_at)
         VALUES (?,?,?,?,?,?,?,?,?,datetime('now',?),datetime('now'))"
    )
    .bind(&id).bind("default").bind(&node_id).bind(&subtopic_id).bind(&path_id)
    .bind(duration_mins).bind(&session_type).bind(&notes).bind(xp)
    .bind(format!("-{duration_mins} minutes"))
    .execute(&db.0).await?;

    let xp_result = award_xp(
        &db.0,
        "default",
        xp,
        "focus",
        &format!("{session_type} ({duration_mins}min)"),
        0,
        node_id.as_deref(),
        path_id.as_deref(),
    )
    .await?;

    Ok(json!({ "session_id":id,"xp_result":xp_result }))
}

// ════════════════════════════════════════════════════════════════════════════
// NODE UNLOCKS
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn check_node_unlock(
    node_id: String,
    path_id: String,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let already: bool = sqlx::query_scalar(
        "SELECT COUNT(*) > 0 FROM user_skill_unlocks
         WHERE user_id='default' AND skill_id=? AND is_unlocked=1",
    )
    .bind(&node_id)
    .fetch_one(&db.0)
    .await?;
    if already {
        return Ok(json!({"unlocked":true,"already_was":true}));
    }

    // prereqs come from skill_prerequisites table
    let prereqs: Vec<String> =
        sqlx::query_scalar("SELECT prerequisite_id FROM skill_prerequisites WHERE skill_id=?")
            .bind(&node_id)
            .fetch_all(&db.0)
            .await?;

    if prereqs.is_empty() {
        sqlx::query(
            "INSERT INTO user_skill_unlocks (user_id, skill_id, is_unlocked)
             VALUES ('default', ?, 1)
             ON CONFLICT(user_id, skill_id) DO UPDATE SET is_unlocked=1",
        )
        .bind(&node_id)
        .execute(&db.0)
        .await?;
        return Ok(json!({"unlocked":true,"already_was":false}));
    }

    let mut all_met = true;
    for pid in &prereqs {
        let lvl: i64 = sqlx::query_scalar(
            "SELECT COALESCE(computed_level, 0) FROM v_node_mastery
             WHERE user_id='default' AND node_id=?",
        )
        .bind(pid)
        .fetch_one(&db.0)
        .await
        .unwrap_or(0);
        if lvl < 1 {
            all_met = false;
            break;
        }
    }
    if all_met {
        sqlx::query(
            "INSERT INTO user_skill_unlocks (user_id, skill_id, is_unlocked)
             VALUES ('default', ?, 1)
             ON CONFLICT(user_id, skill_id) DO UPDATE SET is_unlocked=1",
        )
        .bind(&node_id)
        .execute(&db.0)
        .await?;
    }
    Ok(json!({"unlocked":all_met,"already_was":false,"prereqs_needed":prereqs}))
}

#[tauri::command]
pub async fn get_unlocked_nodes(path_id: Option<String>, db: State<'_, DbPool>) -> Result<Value> {
    // path_id filter: join through skill_roles to find skills in that role
    let rows: Vec<(String,)> = if let Some(ref pid) = path_id {
        sqlx::query_as(
            "SELECT usu.skill_id FROM user_skill_unlocks usu
             JOIN skill_roles sr ON sr.skill_id = usu.skill_id AND sr.role_id = ?
             WHERE usu.user_id='default' AND usu.is_unlocked=1",
        )
        .bind(pid)
        .fetch_all(&db.0)
        .await?
    } else {
        sqlx::query_as(
            "SELECT skill_id FROM user_skill_unlocks WHERE user_id='default' AND is_unlocked=1",
        )
        .fetch_all(&db.0)
        .await?
    };
    Ok(json!(
        rows.iter()
            .map(|(n,)| json!({"node_id": n, "path_id": path_id}))
            .collect::<Vec<_>>()
    ))
}

// ════════════════════════════════════════════════════════════════════════════
// MILESTONES + NOTIFICATIONS
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_milestones(path_id: Option<String>, db: State<'_, DbPool>) -> Result<Value> {
    let rows: Vec<(String, String, i64, String, String)> = if let Some(ref pid) = path_id {
        sqlx::query_as(
            "SELECT node_id,path_id,level,badge,earned_at FROM skill_milestones WHERE user_id='default' AND path_id=? ORDER BY earned_at DESC"
        ).bind(pid).fetch_all(&db.0).await?
    } else {
        sqlx::query_as(
            "SELECT node_id,path_id,level,badge,earned_at FROM skill_milestones WHERE user_id='default' ORDER BY earned_at DESC"
        ).fetch_all(&db.0).await?
    };
    Ok(json!(
        rows.iter()
            .map(
                |(n, p, l, b, e)| json!({"node_id":n,"path_id":p,"level":l,"badge":b,"earned_at":e})
            )
            .collect::<Vec<_>>()
    ))
}

#[tauri::command]
pub async fn list_notifications(unread_only: Option<bool>, db: State<'_, DbPool>) -> Result<Value> {
    let sql = if unread_only.unwrap_or(true) {
        "SELECT id,type,title,body,read,created_at FROM notifications WHERE user_id='default' AND read=0 ORDER BY created_at DESC LIMIT 50"
    } else {
        "SELECT id,type,title,body,read,created_at FROM notifications WHERE user_id='default' ORDER BY created_at DESC LIMIT 50"
    };
    let rows = sqlx::query_as::<_, (String, String, String, Option<String>, i64, String)>(sql)
        .fetch_all(&db.0)
        .await?;
    Ok(json!(rows.iter().map(|(id,t,title,body,r,ca)|
        json!({"id":id,"type":t,"title":title,"body":body,"read":r==&1i64,"created_at":ca})
    ).collect::<Vec<_>>()))
}

#[tauri::command]
pub async fn mark_notification_read(id: String, db: State<'_, DbPool>) -> Result<()> {
    sqlx::query("UPDATE notifications SET read=1 WHERE id=? AND user_id='default'")
        .bind(&id)
        .execute(&db.0)
        .await?;
    Ok(())
}

#[tauri::command]
pub async fn mark_all_notifications_read(db: State<'_, DbPool>) -> Result<i64> {
    let r = sqlx::query("UPDATE notifications SET read=1 WHERE user_id='default' AND read=0")
        .execute(&db.0)
        .await?;
    Ok(r.rows_affected() as i64)
}

// ════════════════════════════════════════════════════════════════════════════
// TASKS  (002 schema: node_id/subtopic_id, no 'skill_node_id')
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn list_tasks(db: State<'_, DbPool>) -> Result<Value> {
    let rows = sqlx::query_as::<
        _,
        (
            String,
            String,
            Option<String>,
            i64,
            i64,
            Option<String>,
            Option<String>,
            Option<String>,
        ),
    >(
        "SELECT id,title,description,done,xp_reward,due_date,node_id,subtopic_id
         FROM tasks WHERE user_id='default' ORDER BY done ASC,created_at DESC LIMIT 100",
    )
    .fetch_all(&db.0)
    .await?;
    Ok(json!(rows.iter().map(|(id,t,d,dn,xp,due,nid,sid)|
        json!({"id":id,"title":t,"description":d,"done":dn==&1i64,"xp_reward":xp,"due_date":due,"node_id":nid,"subtopic_id":sid})
    ).collect::<Vec<_>>()))
}

#[tauri::command]
pub async fn create_task(
    title: String,
    description: Option<String>,
    xp_reward: Option<i64>,
    due_date: Option<String>,
    node_id: Option<String>,
    subtopic_id: Option<String>,
    path_id: Option<String>,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let id = Uuid::new_v4().to_string();
    let xp = xp_reward.unwrap_or(50);
    sqlx::query(
        "INSERT INTO tasks (id,user_id,title,description,xp_reward,due_date,node_id,subtopic_id,path_id)
         VALUES (?,?,?,?,?,?,?,?,?)"
    ).bind(&id).bind("default").bind(&title).bind(&description)
     .bind(xp).bind(&due_date).bind(&node_id).bind(&subtopic_id).bind(&path_id)
     .execute(&db.0).await?;
    Ok(json!({"id":id,"title":title,"xp_reward":xp}))
}

#[tauri::command]
pub async fn complete_task(task_id: String, db: State<'_, DbPool>) -> Result<Value> {
    let (title, xp, node_id, path_id): (String, i64, Option<String>, Option<String>) =
        sqlx::query_as(
            "SELECT title,xp_reward,node_id,path_id FROM tasks WHERE id=? AND user_id='default'",
        )
        .bind(&task_id)
        .fetch_one(&db.0)
        .await
        .map_err(|_| NfError::NotFound(task_id.clone()))?;
    sqlx::query("UPDATE tasks SET done=1,done_at=datetime('now') WHERE id=?")
        .bind(&task_id)
        .execute(&db.0)
        .await?;
    let xp_result = award_xp(
        &db.0,
        "default",
        xp,
        "task_complete",
        &format!("Task: {title}"),
        1,
        node_id.as_deref(),
        path_id.as_deref(),
    )
    .await?;
    let _ = crate::sidecar::post(
        "/plugins/fire",
        json!({
            "hook":"on_task_complete","payload":{"task_id":task_id,"task_name":title,"xp":xp}
        }),
    )
    .await;
    Ok(xp_result)
}

#[tauri::command]
pub async fn delete_task(task_id: String, db: State<'_, DbPool>) -> Result<()> {
    sqlx::query("DELETE FROM tasks WHERE id=? AND user_id='default'")
        .bind(&task_id)
        .execute(&db.0)
        .await?;
    Ok(())
}

// ════════════════════════════════════════════════════════════════════════════
// GOALS  (002 schema: 'target' not 'total')
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn list_goals(db: State<'_, DbPool>) -> Result<Value> {
    let rows = sqlx::query_as::<
        _,
        (
            String,
            String,
            Option<String>,
            i64,
            i64,
            Option<String>,
            i64,
        ),
    >(
        "SELECT id,title,description,progress,target,target_date,done
         FROM goals WHERE user_id='default' ORDER BY created_at DESC LIMIT 20",
    )
    .fetch_all(&db.0)
    .await?;
    Ok(json!(rows.iter().map(|(id,t,d,p,tot,dt,done)|
        json!({"id":id,"title":t,"description":d,"progress":p,"total":tot,"target_date":dt,
               "done":done==&1i64,"pct":(*p as f64/(*tot).max(1) as f64*100.0)})
    ).collect::<Vec<_>>()))
}

#[tauri::command]
pub async fn create_goal(
    title: String,
    description: Option<String>,
    goal_type: Option<String>,
    target: i64,
    target_date: Option<String>,
    node_id: Option<String>,
    path_id: Option<String>,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let id = Uuid::new_v4().to_string();
    let gt = goal_type.unwrap_or_else(|| "xp".into());
    sqlx::query(
        "INSERT INTO goals (id,user_id,title,description,goal_type,target,target_date,node_id,path_id)
         VALUES (?,?,?,?,?,?,?,?,?)"
    ).bind(&id).bind("default").bind(&title).bind(&description)
     .bind(&gt).bind(target).bind(&target_date).bind(&node_id).bind(&path_id)
     .execute(&db.0).await?;
    Ok(json!({"id":id,"title":title,"target":target}))
}

#[tauri::command]
pub async fn update_goal_progress(
    goal_id: String,
    progress: i64,
    db: State<'_, DbPool>,
) -> Result<Value> {
    sqlx::query(
        "UPDATE goals SET progress=MIN(target,?), done=CASE WHEN MIN(target,?)>=target THEN 1 ELSE 0 END
         WHERE id=? AND user_id='default'"
    ).bind(progress).bind(progress).bind(&goal_id).execute(&db.0).await?;
    let (p, t, done): (i64, i64, i64) =
        sqlx::query_as("SELECT progress,target,done FROM goals WHERE id=?")
            .bind(&goal_id)
            .fetch_one(&db.0)
            .await?;
    Ok(json!({"progress":p,"total":t,"pct":p as f64/t.max(1) as f64*100.0,"done":done==1}))
}

// ════════════════════════════════════════════════════════════════════════════
// GRIND SESSIONS (002: path_id, subtopic_id, difficulty)
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn log_grind_session(
    platform: String,
    problems_solved: i64,
    duration_mins: i64,
    difficulty: Option<String>,
    node_id: Option<String>,
    path_id: Option<String>,
    subtopic_id: Option<String>,
    notes: Option<String>,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let id = Uuid::new_v4().to_string();
    let diff = difficulty.unwrap_or_else(|| "medium".into());
    let mult: i64 = match diff.as_str() {
        "hard" => 75,
        "medium" => 50,
        _ => 30,
    };
    let xp = (problems_solved * mult).min(500) + if duration_mins >= 60 { 100 } else { 0 };

    sqlx::query(
        "INSERT INTO grind_sessions (id,user_id,platform,node_id,path_id,subtopic_id,problems_solved,duration_mins,difficulty,notes,xp_reward)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(&id).bind("default").bind(&platform)
     .bind(&node_id).bind(&path_id).bind(&subtopic_id)
     .bind(problems_solved).bind(duration_mins).bind(&diff).bind(&notes).bind(xp)
     .execute(&db.0).await?;

    if let Some(sid) = &subtopic_id {
        if let Ok(item_id) = sid.parse::<i64>() {
            let delta: i64 = (problems_solved * 3).min(20);
            sqlx::query(
                "INSERT INTO user_item_mastery (user_id, item_id, mastery, practice_count, last_practiced)
                 VALUES ('default', ?, MIN(100, ?), 1, datetime('now'))
                 ON CONFLICT(user_id, item_id) DO UPDATE
                    SET mastery = MIN(100, mastery + ?),
                        practice_count = practice_count + 1,
                        last_practiced = datetime('now')"
            ).bind(item_id).bind(delta).bind(delta).execute(&db.0).await?;
        }
    }

    let xp_result = award_xp(
        &db.0,
        "default",
        xp,
        "grind",
        &format!("{platform}: {problems_solved} problems ({diff})"),
        1,
        node_id.as_deref(),
        path_id.as_deref(),
    )
    .await?;

    let _ = crate::sidecar::post("/plugins/fire", json!({
        "hook":"on_grind_session_end",
        "payload":{"platform":platform,"problems_solved":problems_solved,"duration_mins":duration_mins,"xp":xp}
    })).await;

    Ok(json!({"session_id":id,"xp_result":xp_result}))
}

#[tauri::command]
pub async fn list_grind_sessions(db: State<'_, DbPool>) -> Result<Value> {
    let rows = sqlx::query_as::<_, (String, String, i64, i64, i64, String, Option<String>)>(
        "SELECT id,platform,problems_solved,duration_mins,xp_reward,created_at,difficulty
         FROM grind_sessions WHERE user_id='default' ORDER BY created_at DESC LIMIT 50",
    )
    .fetch_all(&db.0)
    .await?;
    Ok(json!(rows.iter().map(|(id,p,ps,dm,xp,ca,diff)|
        json!({"id":id,"platform":p,"problems_solved":ps,"duration_mins":dm,"xp_reward":xp,"created_at":ca,"difficulty":diff})
    ).collect::<Vec<_>>()))
}

// ════════════════════════════════════════════════════════════════════════════
// PROJECTS / VITALS / ACTIVITY / VAULT / CONFIG
// ════════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn list_projects(db: State<'_, DbPool>) -> Result<Value> {
    let rows = sqlx::query_as::<_, (String,String,Option<String>,String,i64,Option<String>)>(
        "SELECT id,title,description,status,xp_reward,repo_url FROM projects WHERE user_id='default' ORDER BY status,created_at DESC"
    ).fetch_all(&db.0).await?;
    Ok(json!(rows.iter().map(|(id,t,d,s,xp,r)|
        json!({"id":id,"title":t,"description":d,"status":s,"xp_reward":xp,"repo_url":r})
    ).collect::<Vec<_>>()))
}

#[tauri::command]
pub async fn create_project(
    title: String,
    description: Option<String>,
    repo_url: Option<String>,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let id = Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO projects (id,user_id,title,description,repo_url,status,xp_reward) VALUES (?,?,?,?,?,'backlog',400)")
        .bind(&id).bind("default").bind(&title).bind(&description).bind(&repo_url).execute(&db.0).await?;
    Ok(json!({"id":id,"title":title}))
}

#[tauri::command]
pub async fn move_project(
    project_id: String,
    status: String,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let valid = ["backlog", "active", "review", "done"];
    if !valid.contains(&status.as_str()) {
        return Err(NfError::Validation(format!("Invalid status: {status}")));
    }
    sqlx::query("UPDATE projects SET status=? WHERE id=? AND user_id='default'")
        .bind(&status)
        .bind(&project_id)
        .execute(&db.0)
        .await?;
    if status == "done" {
        let (title, xp): (String, i64) =
            sqlx::query_as("SELECT title,xp_reward FROM projects WHERE id=?")
                .bind(&project_id)
                .fetch_one(&db.0)
                .await?;
        let xp_result = award_xp(
            &db.0,
            "default",
            xp,
            "project_done",
            &format!("Project: {title}"),
            2,
            None,
            None,
        )
        .await?;
        return Ok(json!({"status":"done","xp_result":xp_result}));
    }
    Ok(json!({"status":status}))
}

#[tauri::command]
pub async fn delete_project(project_id: String, db: State<'_, DbPool>) -> Result<()> {
    sqlx::query("DELETE FROM projects WHERE id=? AND user_id='default'")
        .bind(&project_id)
        .execute(&db.0)
        .await?;
    Ok(())
}

#[tauri::command]
pub async fn log_sleep(
    hours: f64,
    quality: i64,
    energy: i64,
    notes: Option<String>,
    db: State<'_, DbPool>,
) -> Result<Value> {
    let today = Utc::now().format("%Y-%m-%d").to_string();
    sqlx::query(
        "INSERT INTO sleep_logs (user_id,log_date,hours,quality,energy,notes) VALUES (?,?,?,?,?,?)
         ON CONFLICT(user_id,log_date) DO UPDATE SET hours=excluded.hours,quality=excluded.quality,energy=excluded.energy,notes=excluded.notes"
    ).bind("default").bind(&today).bind(hours).bind(quality).bind(energy).bind(&notes).execute(&db.0).await?;
    let xp_result = award_xp(
        &db.0,
        "default",
        30,
        "sleep_log",
        "Sleep logged",
        0,
        None,
        None,
    )
    .await?;
    Ok(json!({"logged":true,"date":today,"xp_result":xp_result}))
}

#[tauri::command]
pub async fn list_sleep_logs(db: State<'_, DbPool>) -> Result<Value> {
    let rows = sqlx::query_as::<_, (String,f64,i64,i64,Option<String>)>(
        "SELECT log_date,hours,quality,energy,notes FROM sleep_logs WHERE user_id='default' ORDER BY log_date DESC LIMIT 30"
    ).fetch_all(&db.0).await?;
    Ok(json!(
        rows.iter()
            .map(|(d, h, q, e, n)| json!({"date":d,"hours":h,"quality":q,"energy":e,"notes":n}))
            .collect::<Vec<_>>()
    ))
}

#[tauri::command]
pub async fn list_activity(limit: Option<i64>, db: State<'_, DbPool>) -> Result<Value> {
    let lim = limit.unwrap_or(50);
    let rows = sqlx::query_as::<_, (String, Option<String>, i64, String)>(
        "SELECT action, details, COALESCE(xp,0), created_at
         FROM activity_log WHERE user_id='default' ORDER BY created_at DESC LIMIT ?",
    )
    .bind(lim)
    .fetch_all(&db.0)
    .await?;
    Ok(json!(
        rows.iter()
            .map(|(t, d, xp, ca)| json!({"type":t,"description":d,"xp":xp,"created_at":ca}))
            .collect::<Vec<_>>()
    ))
}

#[tauri::command]
pub async fn set_vault_path(path: String, db: State<'_, DbPool>) -> Result<()> {
    sqlx::query("INSERT INTO config (key,value) VALUES ('vault_path',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=datetime('now')")
        .bind(&path).execute(&db.0).await?;
    Ok(())
}

#[tauri::command]
pub async fn list_vault_notes(db: State<'_, DbPool>) -> Result<Value> {
    let rows = sqlx::query_as::<_, (String,String,i64,String)>(
        "SELECT path,title,word_count,modified_at FROM vault_index ORDER BY modified_at DESC LIMIT 200"
    ).fetch_all(&db.0).await?;
    Ok(json!(
        rows.iter()
            .map(|(p, t, w, m)| json!({"path":p,"title":t,"word_count":w,"modified_at":m}))
            .collect::<Vec<_>>()
    ))
}

#[tauri::command]
pub async fn read_vault_note(path: String) -> Result<String> {
    std::fs::read_to_string(&path).map_err(|e| NfError::Io(e.to_string()))
}

#[tauri::command]
pub async fn write_vault_note(path: String, content: String) -> Result<()> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&path, &content)?;
    Ok(())
}

#[tauri::command]
pub async fn get_config(key: String, db: State<'_, DbPool>) -> Result<Option<String>> {
    Ok(sqlx::query_scalar("SELECT value FROM config WHERE key=?")
        .bind(&key)
        .fetch_optional(&db.0)
        .await?)
}

#[tauri::command]
pub async fn set_config(key: String, value: String, db: State<'_, DbPool>) -> Result<()> {
    sqlx::query("INSERT INTO config (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=datetime('now')")
        .bind(&key).bind(&value).execute(&db.0).await?;
    Ok(())
}
