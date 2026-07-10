// ============================================================
// SynthesisOverthrust — src/views/AITutor.tsx
// AI Tutor (B8): chat with local Ollama (general/skill context),
// generate practice problems into the shared drill bank (D13),
// explain concepts. Vault RAG + paper ingestion deferred (D11/D12).
// Wire truth: python_sidecar/llm/router.py via src/api.ts.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMsg, PracticeProblem, SkillData, SkillNode, Subtopic } from "../api";
import { api } from "../api";
import { C, F, btn, card, col_, glassCard, h1, h2, mono, row } from "../tokens";

type Tab = "chat" | "practice" | "explain" | "papers";

const TAB_META: { id: Tab; icon: string; label: string; col: string }[] = [
  { id: "chat", icon: "💬", label: "AI Chat", col: C.accent },
  { id: "practice", icon: "⚔", label: "Practice", col: C.gold },
  { id: "explain", icon: "🔬", label: "Explain", col: C.purple },
  { id: "papers", icon: "📄", label: "Papers", col: C.teal },
];

export default function AITutor() {
  const [tab, setTab] = useState<Tab>("chat");
  const [models, setModels] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState("");
  const [sidecarOk, setSidecarOk] = useState<boolean | null>(null);
  const [ollamaHint, setOllamaHint] = useState<string | null>(null);
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [activeRole, setActiveRole] = useState<string>("");

  useEffect(() => {
    api.sidecarStatus().then(s => setSidecarOk(s.alive)).catch(() => setSidecarOk(false));
    api.llmListModels()
      .then(res => {
        setModels(res.models);
        if (res.models.length) setActiveModel(m => m || res.models[0]);
        setOllamaHint(res.models.length ? null : res.hint ?? "No models — run `ollama pull llama3`.");
      })
      .catch(e => setOllamaHint(String(e)));
    api.getSkillLevels()
      .then(sd => {
        setSkillData(sd);
        if (sd.roles.length) setActiveRole(r => r || sd.roles[0].id);
      })
      .catch(() => {});
  }, []);

  const nodes = (skillData?.nodes ?? []).filter(n => n.path_id === activeRole);

  return (
    <div className="nf-view" style={col_(18)}>

      {/* Header */}
      <div style={{ ...row(), justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: F.mono, color: C.accent, fontSize: 10, letterSpacing: 4, marginBottom: 4 }}>
            // AI INTELLIGENCE LAYER
          </div>
          <h1 style={h1}>AI Tutor</h1>
        </div>
        <div style={row(10)}>
          <div style={{
            ...row(8), padding: "8px 14px", borderRadius: 9,
            background: sidecarOk ? `${C.green}18` : `${C.red}18`,
            border: `1px solid ${sidecarOk ? C.green : C.red}44`,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: sidecarOk ? C.green : C.red,
              boxShadow: `0 0 6px ${sidecarOk ? C.green : C.red}`,
              animation: sidecarOk ? "nf-pulse 2s ease-in-out infinite" : "none"
            }} />
            <span style={{ fontFamily: F.mono, fontSize: 10, color: sidecarOk ? C.green : C.red }}>
              {sidecarOk === null ? "checking…" : sidecarOk ? "sidecar online" : "sidecar offline"}
            </span>
          </div>
          {(skillData?.roles.length ?? 0) > 1 && (
            <select style={selStyle} value={activeRole} onChange={e => setActiveRole(e.target.value)}>
              {skillData!.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
          <select style={selStyle} value={activeModel} onChange={e => setActiveModel(e.target.value)}>
            {models.length === 0 && <option value="">no models</option>}
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Sidecar / Ollama warnings */}
      {sidecarOk === false && (
        <div style={{ ...glassCard(C.red), padding: "14px 20px" }}>
          <div style={{ fontFamily: F.display, fontSize: 13, color: C.red, marginBottom: 8, fontWeight: 700 }}>
            ⚠ Python sidecar is not running
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, lineHeight: 2 }}>
            <code style={codeStyle}>./scripts/sidecar.sh start</code>
          </div>
        </div>
      )}
      {sidecarOk && ollamaHint && (
        <div style={{ ...glassCard(C.gold), padding: "14px 20px" }}>
          <div style={{ fontFamily: F.display, fontSize: 13, color: C.gold, marginBottom: 6, fontWeight: 700 }}>
            ⚠ Ollama not reachable
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, lineHeight: 2 }}>
            {ollamaHint} — <code style={codeStyle}>ollama serve</code>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ ...row(6), flexWrap: "wrap" }}>
        {TAB_META.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...btn(t.col), opacity: tab === t.id ? 1 : 0.35, background: tab === t.id ? `${t.col}22` : "transparent" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "chat" && <ChatTab model={activeModel} nodes={nodes} />}
      {tab === "practice" && <PracticeTab model={activeModel} nodes={nodes} role={activeRole} />}
      {tab === "explain" && <ExplainTab model={activeModel} />}
      {tab === "papers" && <PapersTab />}
    </div>
  );
}

const selStyle: React.CSSProperties = {
  background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7,
  padding: "7px 12px", color: C.text, fontFamily: F.mono, fontSize: 12, cursor: "pointer",
};
const codeStyle: React.CSSProperties = {
  background: C.surface, padding: "2px 8px", borderRadius: 4, color: C.gold,
};

// ═════════════════════════════════════════════════════════════════════════════
// CHAT TAB — history is server-side per session_id; send only the new turn
// ═════════════════════════════════════════════════════════════════════════════
function ChatTab({ model, nodes }: { model: string; nodes: SkillNode[] }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [contextType, setContextType] = useState<"general" | "skill">("general");
  const [skillId, setSkillId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMsg = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await api.llmChat([userMsg], {
        model: model || undefined,
        contextType,
        skillId: contextType === "skill" && skillId ? skillId : undefined,
        sessionId,
      });
      setSessionId(resp.session_id);
      setMessages(prev => [...prev, { role: "assistant", content: resp.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠ Error: ${String(e)}. Is Ollama running?` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={col_(14)}>
      {/* Context switcher */}
      <div style={{ ...row(8), flexWrap: "wrap" }}>
        <span style={{ fontFamily: F.display, fontSize: 10, color: C.muted, letterSpacing: 2 }}>CONTEXT:</span>
        {(["general", "skill"] as const).map(ct => (
          <button key={ct} onClick={() => setContextType(ct)}
            style={{ ...btn(contextType === ct ? C.accent : C.muted, true), opacity: contextType === ct ? 1 : 0.4 }}>
            {ct === "general" ? "🧠 General" : "⬡ Skill"}
          </button>
        ))}
        <button disabled title="Vault RAG lands with the vault search slice (B10)"
          style={{ ...btn(C.muted, true), opacity: 0.25, cursor: "not-allowed" }}>
          📓 Vault RAG (soon)
        </button>
        {contextType === "skill" && (
          <select value={skillId} onChange={e => setSkillId(e.target.value)} style={selStyle}>
            <option value="">— pick a skill —</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        )}
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); setSessionId(undefined); }}
            style={{ ...btn(C.muted, true), marginLeft: "auto" }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Message history */}
      <div style={{
        ...card(), padding: 16, minHeight: 360, maxHeight: 480,
        overflowY: "auto", display: "flex", flexDirection: "column", gap: 14,
      }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.5 }}>
            <div style={{ fontSize: 36 }}>🧠</div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 1.8 }}>
              Ask anything about ML engineering.<br />
              Skill context tailors answers to what you're mastering.
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "82%",
            padding: "12px 16px",
            borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
            background: m.role === "user" ? `${C.accent}1e` : C.surface2,
            border: `1px solid ${m.role === "user" ? C.accent + "44" : C.border}`,
            fontFamily: F.body,
            fontSize: 13,
            lineHeight: 1.8,
            color: C.text,
            whiteSpace: "pre-wrap",
            animation: "nf-fadein 0.18s ease",
          }}>
            {m.role === "assistant" && <div style={{ fontFamily: F.mono, fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 7 }}>AI TUTOR</div>}
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: "flex-start", padding: "12px 16px", borderRadius: "12px 12px 12px 4px",
            background: C.surface2, border: `1px solid ${C.border}`, fontFamily: F.mono, fontSize: 12, color: C.muted,
            animation: "nf-pulse 1s ease-in-out infinite"
          }}>
            thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ ...row(10) }}>
        <textarea
          style={{
            flex: 1, background: C.surface2, border: `1px solid ${input ? C.accent + "55" : C.border}`,
            borderRadius: 9, padding: "11px 14px", color: C.text, fontFamily: F.body, fontSize: 14,
            outline: "none", resize: "none", height: 52, lineHeight: 1.6, transition: "border-color 0.2s ease"
          }}
          placeholder="Ask anything… (Shift+Enter for newline, Enter to send)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ ...btn(C.accent), padding: "14px 20px", alignSelf: "stretch", opacity: (!input.trim() || loading) ? 0.4 : 1 }}>
          {loading ? "…" : "⏎ Send"}
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PRACTICE TAB — generates into the shared drill bank (009); graded attempts
// move mastery through the same submit_practice_attempt path as PracticeCard
// ═════════════════════════════════════════════════════════════════════════════
function PracticeTab({ model, nodes, role }: { model: string; nodes: SkillNode[]; role: string }) {
  const [skillId, setSkillId] = useState("");
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [subId, setSubId] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [count, setCount] = useState(3);
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [hintShown, setHintShown] = useState<Record<number, boolean>>({});
  const [scores, setScores] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => {
    setSubtopics([]);
    setSubId("");
    if (!skillId || !role) return;
    api.getSubtopics(skillId, role).then(setSubtopics).catch(() => setSubtopics([]));
  }, [skillId, role]);

  const generate = async () => {
    if (!subId) return;
    setLoading(true);
    setProblems([]);
    setRevealed({});
    setHintShown({});
    setScores({});
    setFeedback(null);
    try {
      const res = await api.llmPractice(subId, role, difficulty, count, model || undefined);
      setProblems(res.problems);
      setStartedAt(Date.now());
    } catch (e) {
      setFeedback(`⚠ ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const grade = useCallback(async (i: number, correct: boolean) => {
    const p = problems[i];
    if (!p || i in scores) return;
    setScores(s => ({ ...s, [i]: correct }));
    try {
      const res = await api.submitPracticeAttempt({
        problem_id: p.id, subtopic_id: subId, path_id: role,
        correct, time_taken_s: Math.round((Date.now() - startedAt) / 1000),
        hint_used: !!hintShown[i],
      });
      setFeedback(`${correct ? "✓" : "✗"} mastery ${res.mastery_delta >= 0 ? "+" : ""}${res.mastery_delta} → ${res.new_mastery} · +${res.xp_result?.xp_gained ?? 0} XP`);
    } catch (e) {
      setFeedback(String(e));
    }
  }, [problems, scores, subId, role, startedAt, hintShown]);

  const dc: Record<string, string> = { easy: C.green, medium: C.gold, hard: C.red };
  const correct = Object.values(scores).filter(Boolean).length;
  const selSkill = nodes.find(n => n.id === skillId);

  return (
    <div style={col_(16)}>
      {/* Config bar */}
      <div style={{ ...glassCard(C.gold), padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={cfgLabel}>SKILL</div>
            <select style={{ ...selStyle, width: "100%", borderColor: `${C.gold}44` }}
              value={skillId} onChange={e => setSkillId(e.target.value)}>
              <option value="">— pick a skill —</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={cfgLabel}>SUBTOPIC</div>
            <select style={{ ...selStyle, width: "100%", borderColor: `${C.gold}44` }}
              value={subId} onChange={e => setSubId(e.target.value)} disabled={!subtopics.length}>
              <option value="">{skillId ? "— pick a subtopic —" : "pick a skill first"}</option>
              {subtopics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <div style={cfgLabel}>DIFFICULTY</div>
            <div style={row(6)}>
              {(["easy", "medium", "hard"] as const).map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  style={{
                    padding: "9px 14px", borderRadius: 7, border: `1.5px solid ${difficulty === d ? dc[d] : C.border}`,
                    background: difficulty === d ? `${dc[d]}22` : "transparent", color: difficulty === d ? dc[d] : C.muted,
                    cursor: "pointer", fontFamily: F.display, fontSize: 12, fontWeight: 700, transition: "all 0.15s"
                  }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={cfgLabel}>COUNT</div>
            <div style={row(6)}>
              {[1, 3, 5].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  style={{
                    padding: "9px 16px", borderRadius: 7, border: `1.5px solid ${count === n ? C.gold : C.border}`,
                    background: count === n ? `${C.gold}22` : "transparent", color: count === n ? C.gold : C.muted,
                    cursor: "pointer", fontFamily: F.mono, fontSize: 13, fontWeight: 700
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button onClick={generate} disabled={!subId || loading}
            style={{ ...btn(C.gold), padding: "12px 22px", opacity: (!subId || loading) ? 0.5 : 1 }}>
            {loading ? "⏳ Generating…" : "⚡ Generate"}
          </button>
        </div>
        <div style={{ fontFamily: F.body, fontSize: 11, color: C.muted, marginTop: 10 }}>
          Generated problems are stored in the drill bank — they also show up under Skills → Practice.
        </div>
      </div>

      {feedback && <div style={{ ...mono(11, C.gold) }}>{feedback}</div>}

      {/* Score bar */}
      {problems.length > 0 && (
        <div style={{
          ...row(), justifyContent: "space-between", padding: "10px 16px", borderRadius: 9,
          background: C.surface2, border: `1px solid ${C.border}`
        }}>
          <span style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>{selSkill?.name ?? ""} — {difficulty}</span>
          <div style={row(8)}>
            <span style={{ fontFamily: F.mono, fontSize: 14, color: C.green, fontWeight: 700 }}>{correct}/{problems.length}</span>
            <span style={{ fontFamily: F.display, fontSize: 10, color: C.muted, letterSpacing: 1 }}>CORRECT</span>
          </div>
        </div>
      )}

      {/* Problems */}
      {loading && (
        <div style={{ textAlign: "center", padding: 48, fontFamily: F.mono, color: C.muted, animation: "nf-pulse 1s ease-in-out infinite" }}>
          Generating problems with {model || "default model"}…
        </div>
      )}
      {!loading && problems.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, fontFamily: F.body, fontSize: 13, color: C.muted }}>
          Pick a skill and subtopic, then hit Generate to create AI-powered practice problems.
        </div>
      )}
      {problems.map((p, i) => {
        const hints: string[] = (() => { try { return JSON.parse(p.hints ?? "[]"); } catch { return []; } })();
        return (
          <div key={p.id} style={{ ...card(dc[p.difficulty]), animation: "nf-fadein 0.2s ease" }}>
            <div style={{ ...row(), justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ ...row(8) }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: C.muted }}>#{i + 1}</span>
                <span style={{ fontFamily: F.display, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: dc[p.difficulty] }}>
                  {p.difficulty}
                </span>
              </div>
              {i in scores && (
                <span style={{ fontFamily: F.display, fontSize: 12, color: scores[i] ? C.green : C.red, fontWeight: 700 }}>
                  {scores[i] ? "✓ Correct" : "✗ Incorrect"}
                </span>
              )}
            </div>

            <div style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.8, color: C.text, marginBottom: 16 }}>
              {p.problem_text}
            </div>

            {hints.length > 0 && !hintShown[i] && !revealed[i] && (
              <button onClick={() => setHintShown(h => ({ ...h, [i]: true }))}
                style={{ ...btn(C.gold, true), marginBottom: 12 }}>
                💡 Hint (counts against XP)
              </button>
            )}
            {hintShown[i] && (
              <div style={{ fontFamily: F.body, fontSize: 12, color: C.muted, marginBottom: 12, fontStyle: "italic" }}>
                {hints.map((h, j) => <div key={j}>💡 {h}</div>)}
              </div>
            )}

            {!revealed[i] ? (
              <button onClick={() => setRevealed(r => ({ ...r, [i]: true }))}
                style={{ ...btn(dc[p.difficulty], true) }}>
                Reveal Answer
              </button>
            ) : (
              <>
                <div style={{
                  padding: "14px 16px", borderRadius: 9, background: `${dc[p.difficulty]}0d`,
                  border: `1px solid ${dc[p.difficulty]}33`, fontFamily: F.body, fontSize: 14,
                  lineHeight: 1.85, color: C.text2, whiteSpace: "pre-wrap", marginBottom: 14
                }}>
                  {p.explanation ?? "(no explanation returned)"}
                </div>
                {!(i in scores) && (
                  <div style={row(8)}>
                    <span style={{ fontFamily: F.display, fontSize: 10, color: C.muted, letterSpacing: 1 }}>HOW DID YOU DO?</span>
                    <button onClick={() => grade(i, true)} style={{ ...btn(C.green, true) }}>✓ Got it</button>
                    <button onClick={() => grade(i, false)} style={{ ...btn(C.red, true) }}>✗ Missed it</button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

const cfgLabel: React.CSSProperties = {
  fontFamily: F.display, fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 6,
};

// ═════════════════════════════════════════════════════════════════════════════
// EXPLAIN TAB
// ═════════════════════════════════════════════════════════════════════════════
function ExplainTab({ model }: { model: string }) {
  const [concept, setConcept] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "expert">("intermediate");
  const [analogy, setAnalogy] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const QUICK = ["Attention mechanism", "Backpropagation", "RLHF", "LoRA", "Transformer architecture", "Gradient descent", "Regularisation", "Batch normalisation"];

  const explain = async (c = concept) => {
    if (!c.trim()) return;
    setConcept(c);
    setLoading(true);
    setExplanation("");
    try {
      const res = await api.llmExplain(c.trim(), level, analogy || undefined, model || undefined);
      setExplanation(res.explanation);
    } catch (e) {
      setExplanation(`⚠ Error: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={col_(16)}>
      <div style={glassCard(C.purple)}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={cfgLabel}>CONCEPT</div>
            <input style={{
              background: C.surface2, border: `1px solid ${concept ? C.purple + "55" : C.border}`,
              borderRadius: 7, padding: "9px 13px", color: C.text, fontFamily: F.body, fontSize: 14,
              outline: "none", width: "100%", boxSizing: "border-box", transition: "all 0.2s"
            }}
              placeholder="e.g. self-attention, vanishing gradients, LoRA…"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              onKeyDown={e => e.key === "Enter" && explain()}
            />
          </div>
          <div>
            <div style={cfgLabel}>DEPTH</div>
            <div style={row(6)}>
              {(["beginner", "intermediate", "expert"] as const).map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  style={{
                    padding: "9px 12px", borderRadius: 7, border: `1.5px solid ${level === l ? C.purple : C.border}`,
                    background: level === l ? `${C.purple}22` : "transparent", color: level === l ? C.purple : C.muted,
                    cursor: "pointer", fontFamily: F.display, fontSize: 11, fontWeight: 700, transition: "all 0.15s",
                    textTransform: "capitalize"
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ minWidth: 130 }}>
            <div style={cfgLabel}>ANALOGY DOMAIN (optional)</div>
            <input style={{
              background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 12px",
              color: C.text, fontFamily: F.body, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box"
            }}
              placeholder="e.g. cooking, music…"
              value={analogy}
              onChange={e => setAnalogy(e.target.value)}
            />
          </div>
          <button onClick={() => explain()} disabled={!concept.trim() || loading}
            style={{ ...btn(C.purple), padding: "12px 20px", opacity: (!concept.trim() || loading) ? 0.4 : 1 }}>
            {loading ? "⏳ Thinking…" : "🔬 Explain"}
          </button>
        </div>

        {/* Quick-fire buttons */}
        <div style={{ ...row(6), flexWrap: "wrap", marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: F.display, fontSize: 9, color: C.muted, letterSpacing: 2 }}>QUICK:</span>
          {QUICK.map(q => (
            <button key={q} onClick={() => explain(q)}
              style={{
                padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.purple}33`,
                background: "transparent", color: C.muted, cursor: "pointer",
                fontFamily: F.body, fontSize: 11, transition: "all 0.15s"
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.purple; (e.currentTarget as HTMLElement).style.borderColor = `${C.purple}66`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.muted; (e.currentTarget as HTMLElement).style.borderColor = `${C.purple}33`; }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 48, fontFamily: F.mono, color: C.muted, animation: "nf-pulse 1s ease-in-out infinite" }}>
          Generating explanation…
        </div>
      )}
      {explanation && (
        <div style={{ ...card(C.purple), animation: "nf-fadein 0.2s ease" }}>
          <div style={{ fontFamily: F.mono, fontSize: 9, color: C.purple, letterSpacing: 3, marginBottom: 14 }}>
            🔬 {concept.toUpperCase()} — {level.toUpperCase()} LEVEL
          </div>
          <div style={{ fontFamily: F.body, fontSize: 14, lineHeight: 1.95, color: C.text, whiteSpace: "pre-wrap" }}>
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAPERS TAB — deferred with the vault slice (D12, B10/B14)
// ═════════════════════════════════════════════════════════════════════════════
function PapersTab() {
  return (
    <div style={{ ...glassCard(C.teal), textAlign: "center", padding: 48 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
      <h2 style={{ ...h2, color: C.teal }}>Research Paper Ingestion</h2>
      <div style={{ fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.9, maxWidth: 480, margin: "0 auto" }}>
        PDF → structured digest → Obsidian note lands together with the vault
        search & sync slice (B10/B14) — digesting a paper without a vault to
        file it into is half a feature.
      </div>
    </div>
  );
}
