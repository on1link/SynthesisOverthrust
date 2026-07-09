// ============================================================
// SynthesisOverthrust — src/components/LearningLoop.tsx
// B4–B6 surfaces: PracticeCard + ResourcesCard (Skills detail)
// and FocusCard (Grind view).
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import type { LearningResource, PracticeProblem, Subtopic } from "../api";
import { api } from "../api";
import { C, F, btn, col_, mono, row, card } from "../tokens";

const RES_ICON: Record<string, string> = {
  book: "📖", course: "🎓", paper: "📄", video: "🎬", blog: "✍️", tool: "🛠",
};

// ── B4: Practice drill ────────────────────────────────────────────────────────

export function PracticeCard({ nodeId, pathId, col, subtopics, onMasteryChange }: {
  nodeId: string;
  pathId: string;
  col: string;
  subtopics: Subtopic[];
  onMasteryChange: () => void;
}) {
  const [subId, setSubId] = useState<string>("");
  const [difficulty, setDifficulty] = useState("medium");
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [idx, setIdx] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!subId) return;
    setLoading(true);
    setFeedback(null);
    try {
      const probs = await api.listPracticeProblems(subId, pathId, difficulty, 10);
      setProblems(probs);
      setIdx(0);
      setHintShown(false);
      setAnswerShown(false);
      setStartedAt(Date.now());
    } catch (e) {
      setFeedback(String(e));
    } finally {
      setLoading(false);
    }
  }, [subId, pathId, difficulty]);

  const grade = useCallback(async (correct: boolean) => {
    const p = problems[idx];
    if (!p) return;
    try {
      const res = await api.submitPracticeAttempt({
        problem_id: p.id, subtopic_id: subId, path_id: pathId,
        correct, time_taken_s: Math.round((Date.now() - startedAt) / 1000),
        hint_used: hintShown,
      });
      setFeedback(`${correct ? "✓" : "✗"} mastery ${res.mastery_delta >= 0 ? "+" : ""}${res.mastery_delta} → ${res.new_mastery} · +${res.xp_result?.xp_gained ?? 0} XP`);
      onMasteryChange();
    } catch (e) {
      setFeedback(String(e));
    }
    if (idx + 1 < problems.length) {
      setIdx(idx + 1); setHintShown(false); setAnswerShown(false); setStartedAt(Date.now());
    } else {
      setProblems([]);
    }
  }, [problems, idx, subId, pathId, hintShown, startedAt, onMasteryChange]);

  const prob = problems[idx];
  const hints: string[] = prob ? (() => { try { return JSON.parse(prob.hints ?? "[]"); } catch { return []; } })() : [];

  return (
    <div style={{ ...(card(col) as object), padding: "16px 20px" }}>
      <div style={{ fontFamily: F.display, fontSize: 10, letterSpacing: 3, color: C.muted, paddingBottom: 8, marginBottom: 12, borderBottom: `1px solid ${C.border}`, textTransform: "uppercase" }}>
        PRACTICE — graded attempts move mastery
      </div>

      {/* Picker row */}
      <div style={{ ...row(8), flexWrap: "wrap", marginBottom: 12 }}>
        <select value={subId} onChange={e => setSubId(e.target.value)}
          style={{ background: "#00000040", border: `1px solid ${col}55`, borderRadius: 6, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "6px 10px", maxWidth: 320 }}>
          <option value="">— pick a subtopic —</option>
          {subtopics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {["easy", "medium", "hard"].map(d => (
          <button key={d} onClick={() => setDifficulty(d)}
            style={{ ...btn(difficulty === d ? col : C.muted, true), fontSize: 11, padding: "6px 12px", opacity: difficulty === d ? 1 : 0.6 }}>
            {d}
          </button>
        ))}
        <button onClick={load} disabled={!subId || loading} style={{ ...btn(col), fontSize: 12, padding: "6px 16px" }}>
          {loading ? "…" : "▶ Drill"}
        </button>
      </div>

      {feedback && <div style={{ ...mono(11, C.gold), marginBottom: 10 }}>{feedback}</div>}

      {prob ? (
        <div style={col_(10)}>
          <div style={{ ...mono(10, C.muted) }}>problem {idx + 1}/{problems.length} · {prob.difficulty}</div>
          <div style={{ fontFamily: F.body, fontSize: 14, lineHeight: 1.7, color: C.text }}>{prob.problem_text}</div>
          <div style={{ ...row(8), flexWrap: "wrap" }}>
            {hints.length > 0 && !hintShown && (
              <button onClick={() => setHintShown(true)} style={{ ...btn(C.gold, true), fontSize: 11 }}>💡 Hint (−XP)</button>
            )}
            {!answerShown && (
              <button onClick={() => setAnswerShown(true)} style={{ ...btn(C.accent, true), fontSize: 11 }}>Show explanation</button>
            )}
          </div>
          {hintShown && hints.map((h, i) => (
            <div key={i} style={{ ...mono(11, C.gold) }}>💡 {h}</div>
          ))}
          {answerShown && prob.explanation && (
            <div style={{ fontFamily: F.body, fontSize: 12, color: C.text2, lineHeight: 1.7, borderLeft: `2px solid ${col}55`, paddingLeft: 10 }}>
              {prob.explanation}
            </div>
          )}
          {answerShown && (
            <div style={{ ...row(8) }}>
              <button onClick={() => grade(true)} style={{ ...btn(C.green), fontSize: 12, padding: "8px 18px" }}>✓ Got it</button>
              <button onClick={() => grade(false)} style={{ ...btn(C.red), fontSize: 12, padding: "8px 18px" }}>✗ Missed it</button>
            </div>
          )}
        </div>
      ) : (
        !loading && <div style={{ ...mono(11, C.muted) }}>
          {subId ? "No problems loaded — hit ▶ Drill (seed data covers Calculus › Limits for now)." : "Pick a subtopic to start a drill."}
        </div>
      )}
    </div>
  );
}

// ── B5: Resources ─────────────────────────────────────────────────────────────

export function ResourcesCard({ nodeId, pathId, col }: {
  nodeId: string;
  pathId: string;
  col: string;
}) {
  const [resources, setResources] = useState<LearningResource[]>([]);

  const load = useCallback(() => {
    api.listResources(nodeId, pathId).then(setResources).catch(() => setResources([]));
  }, [nodeId, pathId]);

  useEffect(() => { load(); }, [load]);

  const bump = async (r: LearningResource, pct: number) => {
    await api.updateResourceProgress(r.id, pct).catch(() => {});
    load();
  };

  if (resources.length === 0) return null;

  return (
    <div style={{ ...(card(col) as object), padding: "16px 20px" }}>
      <div style={{ fontFamily: F.display, fontSize: 10, letterSpacing: 3, color: C.muted, paddingBottom: 8, marginBottom: 12, borderBottom: `1px solid ${C.border}`, textTransform: "uppercase" }}>
        RESOURCES
      </div>
      <div style={col_(8)}>
        {resources.map(r => (
          <div key={r.id} style={{ ...row(10), flexWrap: "wrap", padding: "6px 0", borderBottom: `1px solid ${C.border}22` }}>
            <span>{RES_ICON[r.type] ?? "📁"}</span>
            {r.url
              ? <a href={r.url} target="_blank" rel="noreferrer" style={{ fontFamily: F.body, fontSize: 13, color: C.text, textDecoration: "none", flex: 1, minWidth: 180 }}>{r.title} ↗</a>
              : <span style={{ fontFamily: F.body, fontSize: 13, color: C.text, flex: 1, minWidth: 180 }}>{r.title}</span>}
            {r.author && <span style={{ ...mono(10, C.muted) }}>{r.author}</span>}
            {r.est_hours > 0 && <span style={{ ...mono(10, C.muted) }}>{r.est_hours}h</span>}
            <span style={{ ...mono(10, r.finished ? C.green : C.muted) }}>{r.finished ? "✓ done" : `${r.pct_complete}%`}</span>
            {!r.finished && (
              <>
                <button onClick={() => bump(r, Math.min(100, r.pct_complete + 25))} style={{ ...btn(col, true), fontSize: 10, padding: "3px 8px" }}>+25%</button>
                <button onClick={() => bump(r, 100)} style={{ ...btn(C.green, true), fontSize: 10, padding: "3px 8px" }}>done</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── B6: Focus session logger ──────────────────────────────────────────────────

const FOCUS_TYPES = [
  { id: "pomodoro", label: "🍅 Pomodoro", mins: 25 },
  { id: "deep", label: "🧘 Deep work", mins: 90 },
  { id: "review", label: "🔁 Review", mins: 30 },
  { id: "assessment", label: "📝 Assessment", mins: 45 },
] as const;

export function FocusCard() {
  const [type, setType] = useState<typeof FOCUS_TYPES[number]>(FOCUS_TYPES[0]);
  const [mins, setMins] = useState(25);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const log = async () => {
    setBusy(true);
    try {
      const r = await api.logFocusSession({
        duration_mins: mins, session_type: type.id, notes: notes || undefined,
      });
      setResult(`logged · +${r.xp_result?.xp_gained ?? 0} XP`);
      setNotes("");
    } catch (e) {
      setResult(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ ...(card(C.teal) as object), padding: "14px 18px" }}>
      <div style={{ fontFamily: F.display, fontSize: 10, letterSpacing: 3, color: C.muted, marginBottom: 10, textTransform: "uppercase" }}>
        FOCUS SESSION
      </div>
      <div style={{ ...row(8), flexWrap: "wrap" }}>
        {FOCUS_TYPES.map(t => (
          <button key={t.id} onClick={() => { setType(t); setMins(t.mins); }}
            style={{ ...btn(type.id === t.id ? C.teal : C.muted, true), fontSize: 11, padding: "6px 12px", opacity: type.id === t.id ? 1 : 0.6 }}>
            {t.label}
          </button>
        ))}
        <input type="number" min={5} max={480} value={mins}
          onChange={e => setMins(Math.max(5, Math.min(480, Number(e.target.value) || 5)))}
          style={{ width: 70, background: "#00000040", border: `1px solid ${C.teal}55`, borderRadius: 6, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "6px 8px" }} />
        <span style={{ ...mono(10, C.muted) }}>min</span>
        <input value={notes} placeholder="notes (optional)" onChange={e => setNotes(e.target.value)}
          style={{ flex: 1, minWidth: 140, background: "#00000040", border: `1px solid ${C.teal}55`, borderRadius: 6, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "6px 10px" }} />
        <button onClick={log} disabled={busy} style={{ ...btn(C.teal), fontSize: 12, padding: "8px 18px" }}>
          {busy ? "…" : "Log"}
        </button>
      </div>
      {result && <div style={{ ...mono(11, C.gold), marginTop: 8 }}>{result}</div>}
    </div>
  );
}
