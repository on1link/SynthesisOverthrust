// ============================================================
// SynthesisOverthrust — src/views/Scout.tsx
// Skill Scout — discovery proposals with the correction loop:
// approve / edit / reject; approved corrections write back to
// LanceDB + SQLite and accumulate as few-shot examples.
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import type { ScoutProposal } from "../api";
import { api } from "../api";
import { C, F, btn, col_, glassCard, h1, row } from "../tokens";

const SOURCE_META: Record<string, { icon: string; col: string }> = {
  arxiv: { icon: "📄", col: "#b31b1b" },
  huggingface: { icon: "🤗", col: C.gold },
};

interface EditState {
  skill: string;
  topic: string;
  tier: string;
  roles: string;
}

export default function Scout() {
  const [proposals, setProposals] = useState<ScoutProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, EditState>>({});
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProposals(await api.scoutProposals("pending"));
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const r = await api.scoutRun(undefined, 15);
      setLastRun(`${r.candidates} candidates → ${r.proposed} new proposals ` +
        `(${r.skipped_covered} covered · ${r.skipped_foreign} off-catalog · ${r.duplicates} seen before)`);
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  }, [load]);

  const decide = useCallback(async (
    p: ScoutProposal,
    action: "approve" | "edit" | "reject",
  ) => {
    setBusyId(p.id);
    try {
      const ed = editing[p.id];
      await api.scoutDecide(p.id, action, action === "edit" && ed ? {
        skill: ed.skill.trim() || undefined,
        topic: ed.topic.trim() || undefined,
        tier: ed.tier.trim() || undefined,
        roles: ed.roles.trim() ? ed.roles.split(",").map(r => r.trim().toUpperCase()).filter(Boolean) : undefined,
      } : undefined);
      setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n; });
      setProposals(prev => prev.filter(x => x.id !== p.id));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusyId(null);
    }
  }, [editing]);

  const startEdit = (p: ScoutProposal) => setEditing(prev => ({
    ...prev,
    [p.id]: {
      skill: p.proposed.skill ?? "",
      topic: p.proposed.topic ?? "",
      tier: p.proposed.tier ?? "",
      roles: (p.proposed.roles ?? []).join(","),
    },
  }));

  return (
    <div className="nf-view" style={col_(18)}>
      {/* Header */}
      <div style={{ ...row(), justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: F.mono, color: C.teal, fontSize: 10, letterSpacing: 4, marginBottom: 4 }}>
            {"// SKILL SCOUT"}
          </div>
          <h1 style={h1}>Discovery</h1>
        </div>
        <button onClick={handleRun} disabled={running}
          style={{ ...btn(C.teal), fontSize: 13, padding: "10px 22px", opacity: running ? 0.6 : 1 }}>
          {running ? "⟳ Scouting…" : "🔭 Run Scout"}
        </button>
      </div>

      {lastRun && (
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.muted }}>{lastRun}</div>
      )}
      {error && (
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.red }}>⚠ {error}</div>
      )}

      {/* Body */}
      {loading ? (
        <div style={{ fontFamily: F.mono, color: C.muted, letterSpacing: 3, padding: 60, textAlign: "center" }}>
          LOADING PROPOSALS…
        </div>
      ) : proposals.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 60, gap: 14 }}>
          <div style={{ fontSize: 48 }}>🔭</div>
          <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.text2, letterSpacing: 2 }}>
            NO PENDING PROPOSALS
          </div>
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>
            Run the Scout to discover new techniques from arXiv and HuggingFace.
          </div>
        </div>
      ) : (
        proposals.map(p => {
          const meta = SOURCE_META[p.source] ?? { icon: "🌐", col: C.accent };
          const ed = editing[p.id];
          const busy = busyId === p.id;
          return (
            <div key={p.id} style={{ ...glassCard(meta.col), padding: 18 }}>
              {/* Title row */}
              <div style={{ ...row(10), justifyContent: "space-between", flexWrap: "wrap" }}>
                <a href={p.url} target="_blank" rel="noreferrer"
                  style={{ fontFamily: F.body, fontSize: 15, fontWeight: 700, color: C.text, textDecoration: "none", maxWidth: 640 }}>
                  {meta.icon} {p.title} ↗
                </a>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>
                  sim {p.similarity?.toFixed(2)}
                </span>
              </div>
              {p.summary && (
                <div style={{ fontFamily: F.body, fontSize: 12, color: C.text2, lineHeight: 1.7, margin: "8px 0" }}>
                  {p.summary.slice(0, 280)}{p.summary.length > 280 ? "…" : ""}
                </div>
              )}

              {/* Proposed placement / edit form */}
              {!ed ? (
                <div style={{ ...row(8), flexWrap: "wrap", margin: "10px 0" }}>
                  <span style={pill(C.teal)}>⬡ {p.proposed.skill || "—"}</span>
                  <span style={pill(C.accent)}>{p.proposed.topic || "—"}</span>
                  <span style={pill(C.gold)}>Tier {p.proposed.tier || "?"}</span>
                  <span style={pill(C.muted)}>{(p.proposed.roles ?? []).join(", ") || "—"}</span>
                </div>
              ) : (
                <div style={{ ...row(8), flexWrap: "wrap", margin: "10px 0" }}>
                  {(["skill", "topic", "tier", "roles"] as const).map(f => (
                    <input key={f} value={ed[f]}
                      placeholder={f}
                      onChange={e => setEditing(prev => ({ ...prev, [p.id]: { ...prev[p.id], [f]: e.target.value } }))}
                      style={{
                        background: "#00000040", border: `1px solid ${C.teal}55`, borderRadius: 6,
                        color: C.text, fontFamily: F.mono, fontSize: 12, padding: "6px 10px",
                        width: f === "tier" ? 70 : f === "roles" ? 130 : 180,
                      }} />
                  ))}
                </div>
              )}

              {/* Neighbors */}
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, lineHeight: 1.9 }}>
                {p.neighbors.slice(0, 3).map((n, i) => (
                  <div key={i}>≈ {n.score.toFixed(2)} · {n.skill} › {n.topic} › {n.subtopic.slice(0, 70)}</div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ ...row(8), marginTop: 12 }}>
                {!ed ? (
                  <>
                    <button disabled={busy} onClick={() => decide(p, "approve")}
                      style={{ ...btn(C.green), fontSize: 12, padding: "8px 18px" }}>✓ Approve</button>
                    <button disabled={busy} onClick={() => startEdit(p)}
                      style={{ ...btn(C.gold), fontSize: 12, padding: "8px 18px" }}>✎ Edit</button>
                    <button disabled={busy} onClick={() => decide(p, "reject")}
                      style={{ ...btn(C.red), fontSize: 12, padding: "8px 18px" }}>✗ Reject</button>
                  </>
                ) : (
                  <>
                    <button disabled={busy} onClick={() => decide(p, "edit")}
                      style={{ ...btn(C.green), fontSize: 12, padding: "8px 18px" }}>✓ Save & Approve</button>
                    <button disabled={busy}
                      onClick={() => setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n; })}
                      style={{ ...btn(C.muted), fontSize: 12, padding: "8px 18px" }}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function pill(col: string): React.CSSProperties {
  return {
    padding: "2px 9px", borderRadius: 4, background: `${col}1e`, color: col,
    fontSize: 11, fontWeight: 700, letterSpacing: 0.8, fontFamily: F.display,
    whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3,
  };
}
