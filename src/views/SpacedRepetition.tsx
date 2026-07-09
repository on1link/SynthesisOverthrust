// ============================================================
// SynthesisOverthrust — src/components/SpacedRepetition.tsx
// Flashcard review UI — FSRS rating buttons, streak counter,
// session progress bar, retention stats.
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import type { SrCard } from "../api";
import { api } from "../api";
import { C, F, bar, btn, col_, fill, glassCard, grid, h1, row } from "../tokens";

// ── FSRS rating labels (1=Again 2=Hard 3=Good 4=Easy) ─────────────────────────
const RATINGS = [
  { r: 1, label: "Again", sub: "Forgot — relearn", col: "#ff2050", key: "1" },
  { r: 2, label: "Hard", sub: "Recalled with effort", col: C.gold, key: "2" },
  { r: 3, label: "Good", sub: "Recalled correctly", col: C.accent, key: "3" },
  { r: 4, label: "Easy", sub: "Instant recall", col: C.green, key: "4" },
];

interface SessionStats {
  reviewed: number;
  correct: number;
  again: number;
  avgRating: number;
  ratings: number[];
}

export default function SpacedRepetition() {
  const [cards, setCards] = useState<SrCard[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState<SessionStats>({
    reviewed: 0, correct: 0, again: 0, avgRating: 0, ratings: [],
  });
  const [srMeta, setSrMeta] = useState<any>(null);
  const [flashCol, setFlashCol] = useState<string | null>(null);

  // ── Load due cards ──────────────────────────────────────────────────────────
  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const [dueCards, meta] = await Promise.all([
        api.srGetDue(30),
        api.srGetStats(),
      ]);
      setCards(dueCards);
      setSrMeta(meta);
      setCardIdx(0);
      setRevealed(false);
      setDone(false);
    } catch (e) {
      // Dev mode — use mock cards
      setCards(MOCK_CARDS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  // Create cards for every practiced item that has none yet, then reload.
  const handleBackfill = useCallback(async () => {
    setLoading(true);
    try {
      await api.srBackfill();
      await loadCards();
    } catch (e) {
      console.error("Backfill failed:", e);
      setLoading(false);
    }
  }, [loadCards]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        if (!revealed) { setRevealed(true); return; }
      }
      if (revealed && !submitting) {
        const rt = RATINGS.find(x => x.key === e.key);
        if (rt) handleRating(rt.r);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [revealed, submitting, cards, cardIdx]);

  const currentCard = cards[cardIdx] ?? null;

  const handleRating = useCallback(async (rating: number) => {
    if (!currentCard || submitting) return;
    setSubmitting(true);

    const col = RATINGS.find(rt => rt.r === rating)?.col ?? C.gold;
    setFlashCol(col);
    setTimeout(() => setFlashCol(null), 300);

    try {
      const result = await api.srSubmitReview(currentCard.id, rating);

      setStats(prev => {
        const rs = [...prev.ratings, rating];
        return {
          reviewed: prev.reviewed + 1,
          correct: prev.correct + (rating >= 2 ? 1 : 0),
          again: prev.again + (result.again ? 1 : 0),
          avgRating: rs.reduce((a, b) => a + b, 0) / rs.length,
          ratings: rs,
        };
      });

      if (result.again) {
        // Re-insert at end of queue
        setCards(prev => [...prev, { ...currentCard }]);
      }

      const next = cardIdx + 1;
      if (next >= cards.length && !result.again) {
        setDone(true);
      } else {
        setCardIdx(next);
        setRevealed(false);
      }
    } catch (e) {
      console.error("Review submit failed:", e);
    } finally {
      setSubmitting(false);
    }
  }, [currentCard, submitting, cardIdx, cards]);

  const pct = cards.length > 0 ? (cardIdx / cards.length) * 100 : 0;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <div style={{ fontFamily: F.mono, color: C.muted, letterSpacing: 3 }}>LOADING CARDS…</div>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!loading && cards.length === 0) {
    return (
      <div className="nf-view" style={col_(18)}>
        <div>
          <div style={{ fontFamily: F.mono, color: C.purple, fontSize: 10, letterSpacing: 4, marginBottom: 4 }}>
            // SPACED REPETITION
          </div>
          <h1 style={h1}>Review</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 20 }}>
          <div style={{ fontSize: 64 }}>🎉</div>
          <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.green, letterSpacing: 2 }}>
            ALL CAUGHT UP
          </div>
          <div style={{ fontFamily: F.body, fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 1.8 }}>
            No cards due today. Level up skills to create new cards,<br />
            or come back tomorrow for your scheduled reviews.
          </div>
          <button onClick={handleBackfill} style={{ ...btn(C.purple), fontSize: 13, padding: "10px 22px" }}>
            ⚡ Generate cards from practiced items
          </button>
          {srMeta && (
            <div style={{ ...row(20), flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
              {[
                { v: srMeta.total_cards, l: "Total Cards", col: C.accent },
                { v: srMeta.total_reviews, l: "All-time Reviews", col: C.purple },
                { v: srMeta.retention, l: "Retention", col: C.green },
                { v: `${srMeta.avg_stability?.toFixed(1) ?? "0.0"}d`, l: "Avg Stability", col: C.gold },
              ].map(({ v, l, col }) => (
                <div key={l} style={{ ...glassCard(col), textAlign: "center", padding: "14px 20px", minWidth: 110 }}>
                  <div style={{ fontFamily: F.mono, fontSize: 22, color: col, fontWeight: 700 }}>{v}</div>
                  <div style={{ fontFamily: F.display, fontSize: 9, color: C.muted, letterSpacing: 2, marginTop: 3, textTransform: "uppercase" }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Session complete ─────────────────────────────────────────────────────────
  if (done) {
    const retention = stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0;
    return (
      <div className="nf-view" style={col_(18)}>
        <div>
          <div style={{ fontFamily: F.mono, color: C.purple, fontSize: 10, letterSpacing: 4, marginBottom: 4 }}>
            // SPACED REPETITION
          </div>
          <h1 style={h1}>Session Complete</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "40px 0" }}>
          <div style={{ fontSize: 60, animation: "nf-bounce 1s ease infinite" }}>
            {retention >= 90 ? "🏆" : retention >= 70 ? "⭐" : "💪"}
          </div>
          <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, letterSpacing: 3, color: retention >= 90 ? C.green : retention >= 70 ? C.gold : C.accent }}>
            {retention >= 90 ? "EXCELLENT RECALL" : retention >= 70 ? "GOOD SESSION" : "KEEP PRACTISING"}
          </div>
          <div style={{ ...grid(4, 14), width: "100%", maxWidth: 600 }}>
            {[
              { v: stats.reviewed, l: "Reviewed", col: C.accent },
              { v: stats.correct, l: "Correct", col: C.green },
              { v: `${retention}%`, l: "Retention", col: retention >= 80 ? C.green : C.gold },
              { v: stats.again, l: "Review Again", col: C.red },
            ].map(({ v, l, col }) => (
              <div key={l} style={{ ...glassCard(col), textAlign: "center", padding: "16px 10px" }}>
                <div style={{ fontFamily: F.mono, fontSize: 26, color: col, fontWeight: 700, lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: F.display, fontSize: 9, color: C.muted, letterSpacing: 2, marginTop: 4, textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Rating distribution bar */}
          <div style={{ width: "100%", maxWidth: 500 }}>
            <div style={{ fontFamily: F.display, fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 10, textAlign: "center" }}>
              RATING DISTRIBUTION
            </div>
            <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden", gap: 2 }}>
              {RATINGS.map(q => {
                const count = stats.ratings.filter(x => x === q.r).length;
                const pct = stats.reviewed > 0 ? (count / stats.reviewed) * 100 : 0;
                return pct > 0 ? (
                  <div key={q.r} title={`${q.label}: ${count}`} style={{
                    width: `${pct}%`,
                    background: q.col,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: F.mono,
                    fontSize: 10,
                    color: "#000",
                    fontWeight: 700,
                    borderRadius: 4,
                    opacity: 0.9,
                  }}>
                    {count > 0 && count}
                  </div>
                ) : null;
              })}
            </div>
            <div style={{ ...row(), justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontFamily: F.display, fontSize: 9, color: C.red }}>Again</span>
              <span style={{ fontFamily: F.display, fontSize: 9, color: C.green }}>Easy</span>
            </div>
          </div>
          <button
            onClick={() => { setDone(false); setCardIdx(0); setRevealed(false); setStats({ reviewed: 0, correct: 0, again: 0, avgRating: 0, ratings: [] }); }}
            style={{ ...btn(C.accent), fontSize: 14, padding: "12px 28px" }}>
            ↩ Review Again
          </button>
        </div>
      </div>
    );
  }

  // ── Active review ────────────────────────────────────────────────────────────
  const card_ = currentCard!;
  const pathCol = C.purple;

  return (
    <div className="nf-view" style={col_(18)}>

      {/* Header */}
      <div style={{ ...row(), justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: F.mono, color: C.purple, fontSize: 10, letterSpacing: 4, marginBottom: 4 }}>
            // SPACED REPETITION
          </div>
          <h1 style={h1}>Review</h1>
        </div>
        <div style={{ ...row(12), flexWrap: "wrap" }}>
          <span style={tag_(C.purple)}>📅 {cards.length} due today</span>
          <span style={tag_(C.gold)}>⭐ {stats.reviewed} done</span>
          {srMeta && <span style={tag_(C.green)}>🧠 {srMeta.retention} retention</span>}
        </div>
      </div>

      {/* Session progress */}
      <div style={{ ...bar, height: 8 }}>
        <div style={fill(pct, C.purple, 8)} />
        <div style={{ position: "absolute", right: 0, top: -18, fontFamily: F.mono, fontSize: 9, color: C.muted }}>
          {cardIdx}/{cards.length}
        </div>
      </div>

      {/* ── FLASHCARD ──────────────────────────────────────────────────────── */}
      <div style={{
        ...glassCard(pathCol),
        position: "relative",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 40px",
        textAlign: "center",
        overflow: "hidden",
        transition: "background 0.2s ease",
        background: flashCol ? `${flashCol}18` : undefined,
        cursor: revealed ? "default" : "pointer",
      }}
        onClick={() => !revealed && setRevealed(true)}
      >
        {/* Background grid decoration */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: `repeating-linear-gradient(0deg,${pathCol} 0,${pathCol} 1px,transparent 1px,transparent 30px),repeating-linear-gradient(90deg,${pathCol} 0,${pathCol} 1px,transparent 1px,transparent 30px)`,
          pointerEvents: "none"
        }} />

        {/* Card meta */}
        <div style={{ ...row(8), marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {card_.skill_name && <span style={tag_(pathCol, true)}>⬡ {card_.skill_name}</span>}
          {card_.topic_name && <span style={tag_(pathCol, true)}>{card_.topic_name}</span>}
          <span style={tag_(C.muted, true)}>S {card_.stability != null ? `${card_.stability.toFixed(1)}d` : "new"}</span>
          <span style={tag_(C.muted, true)}>D {card_.difficulty != null ? card_.difficulty.toFixed(1) : "—"}</span>
          <span style={tag_(C.muted, true)}>reps {card_.repetitions}</span>
        </div>

        {/* Question */}
        <div style={{ fontFamily: F.display, fontSize: 11, color: C.muted, letterSpacing: 3, marginBottom: 16 }}>
          QUESTION
        </div>
        <div style={{ fontFamily: F.body, fontSize: 18, lineHeight: 1.8, color: C.text, maxWidth: 640, marginBottom: 24 }}>
          {card_.front}
        </div>

        {/* Answer reveal */}
        {!revealed ? (
          <div style={{ fontFamily: F.display, fontSize: 12, color: C.muted, letterSpacing: 2, animation: "nf-pulse 2s ease-in-out infinite" }}>
            SPACE / CLICK TO REVEAL
          </div>
        ) : (
          <>
            <div style={{ width: "100%", maxWidth: 640, height: 1, background: `${pathCol}33`, margin: "0 auto 24px" }} />
            <div style={{ fontFamily: F.display, fontSize: 11, color: pathCol, letterSpacing: 3, marginBottom: 14 }}>
              ANSWER
            </div>
            <div style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.9, color: C.text2, maxWidth: 640 }}>
              {card_.back}
            </div>
          </>
        )}
      </div>

      {/* ── Rating buttons ─────────────────────────────────────────────────── */}
      {revealed && (
        <div style={{ animation: "nf-fadein 0.2s ease" }}>
          <div style={{ fontFamily: F.display, fontSize: 10, color: C.muted, letterSpacing: 2, textAlign: "center", marginBottom: 12 }}>
            HOW WELL DID YOU RECALL?  <span style={{ color: C.dim }}>(keys 1–4)</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {RATINGS.map(q => (
              <button key={q.r}
                onClick={() => handleRating(q.r)}
                disabled={submitting}
                style={{
                  padding: "14px 18px",
                  minWidth: 100,
                  borderRadius: 10,
                  border: `2px solid ${q.col}55`,
                  background: `${q.col}18`,
                  color: q.col,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: F.display,
                  fontWeight: 700,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s ease",
                  boxShadow: "none",
                  opacity: submitting ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLElement).style.background = `${q.col}35`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${q.col}18`; }}
              >
                <span style={{ fontSize: 18 }}>{RATING_ICONS[q.r]}</span>
                <span style={{ fontSize: 12, letterSpacing: 1 }}>{q.label}</span>
                <span style={{ fontSize: 9, color: `${q.col}99`, letterSpacing: 0.5 }}>{q.sub}</span>
                <span style={{ fontSize: 9, color: C.muted, fontFamily: F.mono }}>key {q.key}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div style={{ fontFamily: F.body, fontSize: 11, color: C.muted, textAlign: "center", lineHeight: 1.8 }}>
        Be honest — FSRS schedules best with accurate ratings.{" "}
        <span style={{ color: C.purple }}>Hard, Good and Easy</span> advance the card;{" "}
        <span style={{ color: C.red }}>Again</span> sends it back to relearning.
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
// Index 1-4 (FSRS ratings); index 0 unused.
const RATING_ICONS = ["", "💀", "😅", "✓", "⚡"];

// Mock cards for dev mode (sidecar down)
const MOCK_CARDS: SrCard[] = [
  { id: "c1", user_id: "default", item_id: 1, front: "Recall: Tensors, autograd and the computation graph", back: "PyTorch Fundamentals — PyTorch", skill_id: "pytorch", skill_name: "PyTorch", topic_name: "Fundamentals", stability: 2.5, difficulty: 4.2, fsrs_state: 2, repetitions: 1, lapses: 0, interval_days: 1, due_date: "today", due_at: "today" },
  { id: "c2", user_id: "default", item_id: 2, front: "Recall: Self-attention and the QKV projection", back: "Attention — Transformers", skill_id: "transformers", skill_name: "Transformers", topic_name: "Attention", stability: 8.1, difficulty: 6.0, fsrs_state: 2, repetitions: 3, lapses: 1, interval_days: 7, due_date: "today", due_at: "today" },
  { id: "c3", user_id: "default", item_id: 3, front: "Recall: Central Limit Theorem and its role in ML", back: "Inference — Statistics", skill_id: "stats", skill_name: "Statistics", topic_name: "Inference", fsrs_state: 1, repetitions: 0, lapses: 0, interval_days: 0, due_date: "today", due_at: "today" },
];

// Re-export token helpers needed
function tag_(col: string, sm?: boolean): React.CSSProperties {
  return {
    padding: sm ? "1px 6px" : "2px 9px", borderRadius: 4, background: `${col}1e`, color: col,
    fontSize: sm ? 10 : 11, fontWeight: 700, letterSpacing: 0.8, fontFamily: F.display,
    whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3
  };
}


