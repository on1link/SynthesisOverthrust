# ============================================================
# SynthesisOverthrust — analytics/router.py
# Learning analytics: XP trends, skill velocity, SR health,
# sleep-performance correlations, weekly snapshots.
# ============================================================

from __future__ import annotations
from datetime import date, timedelta
from collections import defaultdict
from typing import List, Optional

import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel

from db import get_db

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────
class WeeklySnapshot(BaseModel):
    week_start:      str
    xp_gained:       int
    tasks_done:      int
    sessions:        int
    skills_leveled:  int
    sleep_avg:       float
    top_skill:       str


class SkillVelocity(BaseModel):
    node_id:      str
    name:         str
    level:        int
    avg_mastery:  int
    xp_from_skill: int
    sr_reviews:   int
    avg_rating:   float   # FSRS rating 1-4


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/overview")
async def analytics_overview(user_id: str = "default"):
    """Full analytics overview for the Analytics dashboard."""
    db    = await get_db()
    week_ago   = (date.today() - timedelta(days=7)).isoformat()
    month_ago  = (date.today() - timedelta(days=30)).isoformat()

    # ── XP summary ────────────────────────────────────────────────────────
    async with db.execute(
        "SELECT xp, level, sp, streak FROM users WHERE id=?", (user_id,)
    ) as cur:
        user_row = await cur.fetchone()

    # ── XP gained this week (from activity_log) ───────────────────────────
    async with db.execute(
        "SELECT SUM(xp) as total FROM activity_log WHERE user_id=? AND created_at>=?",
        (user_id, week_ago)
    ) as cur:
        xp_week = (await cur.fetchone())["total"] or 0

    # ── Tasks completion rate ──────────────────────────────────────────────
    async with db.execute(
        "SELECT COUNT(*) as n FROM tasks WHERE user_id=? AND created_at>=?",
        (user_id, week_ago)
    ) as cur:
        tasks_created = (await cur.fetchone())["n"]
    async with db.execute(
        "SELECT COUNT(*) as n FROM tasks WHERE user_id=? AND done=1 AND done_at>=?",
        (user_id, week_ago)
    ) as cur:
        tasks_done = (await cur.fetchone())["n"]

    # ── Grind sessions ─────────────────────────────────────────────────────
    async with db.execute(
        "SELECT COUNT(*) as n, SUM(xp_reward) as xp FROM grind_sessions WHERE user_id=? AND created_at>=?",
        (user_id, week_ago)
    ) as cur:
        grind_row = await cur.fetchone()

    # ── SR stats (FSRS: due_at queue, rating 1-4, pass = rating >= 2) ─────
    from datetime import datetime, timezone
    now_iso = datetime.now(timezone.utc).isoformat()
    async with db.execute(
        "SELECT COUNT(*) as n FROM sr_cards WHERE user_id=? AND due_at<=?",
        (user_id, now_iso)
    ) as cur:
        sr_due = (await cur.fetchone())["n"]

    async with db.execute(
        """SELECT AVG(quality) as avg_q,
                  AVG(CASE WHEN quality >= 2 THEN 1.0 ELSE 0.0 END) as pass_rate
           FROM sr_reviews WHERE user_id=? AND reviewed_at>=?""",
        (user_id, week_ago)
    ) as cur:
        sr_row = await cur.fetchone()
    avg_q = sr_row["avg_q"] or 0
    pass_rate = sr_row["pass_rate"]

    # ── Sleep stats ────────────────────────────────────────────────────────
    async with db.execute(
        "SELECT AVG(hours) as avg_h, AVG(energy) as avg_e FROM sleep_logs WHERE user_id=? AND log_date>=?",
        (user_id, week_ago)
    ) as cur:
        sleep_row = await cur.fetchone()

    # ── XP trend (last 30 days, grouped by day) ───────────────────────────
    async with db.execute(
        """SELECT date(created_at) as day, SUM(xp) as xp
           FROM activity_log WHERE user_id=? AND created_at>=?
           GROUP BY day ORDER BY day ASC""",
        (user_id, month_ago)
    ) as cur:
        xp_trend = [{"day": r["day"], "xp": r["xp"]} for r in await cur.fetchall()]

    # ── Top skills by computed level (v_node_mastery drives levels) ───────
    async with db.execute(
        """SELECT v.node_id, s.name, v.computed_level as level, v.avg_mastery
           FROM v_node_mastery v
           JOIN skills s ON s.id = v.node_id
           WHERE v.user_id=? AND v.avg_mastery>0
           ORDER BY v.avg_mastery DESC LIMIT 8""",
        (user_id,)
    ) as cur:
        top_skills = [dict(r) for r in await cur.fetchall()]

    # ── Platform breakdown ─────────────────────────────────────────────────
    async with db.execute(
        """SELECT platform, COUNT(*) as sessions, SUM(xp_reward) as xp
           FROM grind_sessions WHERE user_id=? AND created_at>=?
           GROUP BY platform ORDER BY sessions DESC""",
        (user_id, month_ago)
    ) as cur:
        platform_stats = [dict(r) for r in await cur.fetchall()]

    return {
        "user": dict(user_row) if user_row else {},
        "week": {
            "xp_gained":     int(xp_week),
            "tasks_done":    tasks_done,
            "tasks_created": tasks_created,
            "completion_rate": round(tasks_done / tasks_created * 100, 1) if tasks_created else 0,
            "grind_sessions": grind_row["n"] or 0,
            "grind_xp":       int(grind_row["xp"] or 0),
        },
        "sr": {
            "due_today":  sr_due,
            "avg_rating": round(float(avg_q), 2),
            "retention":  f"{round(pass_rate * 100)}%" if pass_rate is not None else "—",
        },
        "sleep": {
            "avg_hours":  round(float(sleep_row["avg_h"] or 0), 1),
            "avg_energy": round(float(sleep_row["avg_e"] or 0), 1),
        },
        "xp_trend":       xp_trend,
        "top_skills":     top_skills,
        "platform_stats": platform_stats,
    }


@router.get("/skill-velocity", response_model=List[SkillVelocity])
async def skill_velocity(user_id: str = "default"):
    """Analyse which skills are progressing fastest and SR health per skill."""
    db     = await get_db()
    month_ago = (date.today() - timedelta(days=30)).isoformat()

    async with db.execute(
        """SELECT v.node_id, s.name, v.computed_level as level, v.avg_mastery
           FROM v_node_mastery v
           JOIN skills s ON s.id = v.node_id
           WHERE v.user_id=? AND v.avg_mastery>0
           ORDER BY v.avg_mastery DESC""",
        (user_id,)
    ) as cur:
        skills = await cur.fetchall()

    result = []
    for sk in skills:
        # XP attributed to this skill (activity_log carries node_id)
        async with db.execute(
            """SELECT SUM(xp) as total FROM activity_log
               WHERE user_id=? AND node_id=? AND created_at>=?""",
            (user_id, sk["node_id"], month_ago)
        ) as cur:
            skill_xp = (await cur.fetchone())["total"] or 0

        # SR review stats for this skill (card → item → topic → skill)
        async with db.execute(
            """SELECT COUNT(*) as n, AVG(r.quality) as avg_q
               FROM sr_reviews r
               JOIN sr_cards c ON c.id = r.card_id
               JOIN topic_items ti ON ti.id = c.item_id
               JOIN topics t ON t.id = ti.topic_id
               WHERE c.user_id=? AND t.skill_id=? AND r.reviewed_at>=?""",
            (user_id, sk["node_id"], month_ago)
        ) as cur:
            sr_row = await cur.fetchone()

        result.append(SkillVelocity(
            node_id      = sk["node_id"],
            name         = sk["name"],
            level        = sk["level"],
            avg_mastery  = sk["avg_mastery"],
            xp_from_skill = int(skill_xp),
            sr_reviews   = sr_row["n"] or 0,
            avg_rating   = round(float(sr_row["avg_q"] or 0), 2),
        ))

    return sorted(result, key=lambda x: x.xp_from_skill, reverse=True)


@router.get("/sleep-correlation")
async def sleep_correlation(user_id: str = "default", days: int = 30):
    """
    Correlate sleep quality/hours with XP gained the following day.
    Returns correlation coefficient and scatter data.
    """
    db       = await get_db()
    cutoff   = (date.today() - timedelta(days=days)).isoformat()

    async with db.execute(
        "SELECT log_date, hours, quality, energy FROM sleep_logs WHERE user_id=? AND log_date>=? ORDER BY log_date",
        (user_id, cutoff)
    ) as cur:
        sleep_rows = await cur.fetchall()

    async with db.execute(
        """SELECT date(created_at) as day, SUM(xp) as xp
           FROM activity_log WHERE user_id=? AND created_at>=?
           GROUP BY day""",
        (user_id, cutoff)
    ) as cur:
        xp_by_day = {r["day"]: r["xp"] for r in await cur.fetchall()}

    points = []
    for s in sleep_rows:
        # XP gained the day AFTER the sleep log
        next_day_str = str(date.fromisoformat(s["log_date"]) + timedelta(days=1))
        xp_next = xp_by_day.get(next_day_str, 0)
        points.append({
            "date":    s["log_date"],
            "hours":   s["hours"],
            "quality": s["quality"],
            "energy":  s["energy"],
            "next_day_xp": xp_next or 0,
        })

    # Compute Pearson correlation hours → next day XP
    if len(points) >= 3:
        df = pd.DataFrame(points)
        corr_hours  = df["hours"].corr(df["next_day_xp"])
        corr_quality = df["quality"].corr(df["next_day_xp"])
    else:
        corr_hours = corr_quality = 0.0

    return {
        "points":          points,
        "corr_hours_xp":   round(float(corr_hours or 0), 3),
        "corr_quality_xp": round(float(corr_quality or 0), 3),
        "insight": _sleep_insight(corr_hours or 0, corr_quality or 0),
    }


@router.post("/snapshot/weekly")
async def create_weekly_snapshot(user_id: str = "default"):
    """Compute and store weekly analytics snapshot."""
    db         = await get_db()
    week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()
    week_end   = (date.today() + timedelta(days=1)).isoformat()

    async with db.execute(
        "SELECT SUM(xp) as xp FROM activity_log WHERE user_id=? AND created_at>=? AND created_at<?",
        (user_id, week_start, week_end)
    ) as cur:
        xp_gained = int((await cur.fetchone())["xp"] or 0)

    async with db.execute(
        "SELECT COUNT(*) as n FROM tasks WHERE user_id=? AND done=1 AND done_at>=?",
        (user_id, week_start)
    ) as cur:
        tasks_done = (await cur.fetchone())["n"]

    async with db.execute(
        "SELECT COUNT(*) as n FROM grind_sessions WHERE user_id=? AND created_at>=?",
        (user_id, week_start)
    ) as cur:
        sessions = (await cur.fetchone())["n"]

    async with db.execute(
        "SELECT COUNT(*) as n FROM sr_reviews WHERE user_id=? AND reviewed_at>=?",
        (user_id, week_start)
    ) as cur:
        skills_leveled = (await cur.fetchone())["n"]

    async with db.execute(
        "SELECT AVG(hours) as avg FROM sleep_logs WHERE user_id=? AND log_date>=?",
        (user_id, week_start)
    ) as cur:
        sleep_avg = float((await cur.fetchone())["avg"] or 0)

    await db.execute(
        """INSERT OR REPLACE INTO analytics_snapshots
           (id,user_id,week_start,xp_gained,tasks_done,sessions,skills_leveled,sleep_avg,top_skill)
           VALUES (lower(hex(randomblob(16))),?,?,?,?,?,?,?,?)""",
        (user_id, week_start, xp_gained, tasks_done, sessions, skills_leveled, sleep_avg, "")
    )
    await db.commit()
    return {"week_start": week_start, "xp_gained": xp_gained, "snapshot": "saved"}


def _sleep_insight(corr_hours: float, corr_quality: float) -> str:
    if corr_hours > 0.5:
        return "Strong positive correlation: more sleep → significantly higher next-day XP."
    elif corr_hours > 0.2:
        return "Moderate correlation: sleep hours show a positive trend with next-day performance."
    elif corr_hours < -0.2:
        return "Inverse pattern detected — review your sleep schedule."
    else:
        return "Not enough data yet for a reliable correlation. Keep logging!"
