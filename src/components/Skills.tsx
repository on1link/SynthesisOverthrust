// ============================================================
// SynthesisOverthrust — src/components/Skills.tsx
// Vertical-scroll skill tree inspired by NewSkills design:
//   - Left role sidebar
//   - Horizontal tier tabs with scroll-spy
//   - Vertically stacked tiers with squircle skill nodes
//   - SVG dependency lines overlay
//   - Full-page detail view with subtopic checklists
//   - Backend-integrated mastery, unlocks, and progression
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  Difficulty,
  NodeLevel,
  Role,
  SkillData,
  SkillNode,
  Subtopic,
  User,
} from "../api";
import { api } from "../api";
import { PracticeCard, ResourcesCard } from "./LearningLoop";
import { C, F, BR, SHADOW, card, btn, tag, bar, fill, row, col_, h1, mono } from "../tokens";

// ── Constants ─────────────────────────────────────────────────────────────────
const NODE_SIZE = 96;

// ── Tier theme colours (inline, no Tailwind) ─────────────────────────────────
const TIER_THEMES: Record<string, { accent: string; bg: string; border: string }> = {
  tier_f:  { accent: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" },
  tier_1t: { accent: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)" },
  tier_2t: { accent: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)" },
};
const defaultTierTheme = { accent: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" };
const tierTheme = (id: string) => TIER_THEMES[id] || defaultTierTheme;

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseJsonArray = (raw: string | string[] | undefined): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

const levelKey = (nodeId: string, pathId: string) => `${nodeId}::${pathId}`;

const getNodeLevel = (levels: SkillData["levels"] = {}, nodeId: string, pathId: string): NodeLevel =>
  levels[levelKey(nodeId, pathId)] ?? { level: 0, avg_mastery: 0, mastered_subtopics: 0, xp_invested: 0, unlocked: false };

const titleForMastery = (pct: number): string =>
  pct === 0 ? "Locked" : pct < 20 ? "Novice" : pct < 40 ? "Apprentice" : pct < 60 ? "Adept" : pct < 80 ? "Expert" : "Master";

// ── Props ─────────────────────────────────────────────────────────────────────
interface SkillsProps {
  user: User | null;
  skillData: SkillData | null;
  refreshSkills: () => Promise<void>;
  levelUpSkill: (nodeId: string, pathId: string) => Promise<void>;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Skills({ skillData, refreshSkills, levelUpSkill }: SkillsProps) {
  const [activeRole, setActiveRole] = useState<string>("");
  const [freeMode, setFreeMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const syncTree = useCallback(async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const r = await api.catalogSyncTree();
      setSyncMsg(`+${r.roles_created} roles · +${r.links_created} links · ${r.tiers_set} tiers set · ${r.matched} skills matched${r.unmatched.length ? ` · unmatched: ${r.unmatched.join(", ")}` : ""}`);
      await refreshSkills();
    } catch (e) {
      setSyncMsg(`⚠ ${String(e)}`);
    } finally {
      setSyncing(false);
    }
  }, [refreshSkills]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [activeTierId, setActiveTierId] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const tierRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<{ path: string; met: boolean }[]>([]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const roles: Role[] = useMemo(() => skillData?.roles ?? [], [skillData]);
  const diffs: Difficulty[] = useMemo(() => skillData?.difficulties ?? [], [skillData]);
  const allNodes: SkillNode[] = useMemo(() => {
    const n = skillData?.nodes;
    return Array.isArray(n) ? n : Object.values(n || {});
  }, [skillData]);
  const levels = skillData?.levels ?? {};
  const nodeMap = useMemo(() => Object.fromEntries(allNodes.map(n => [n.id, n])), [allNodes]);

  // Init defaults
  useEffect(() => {
    if (!activeRole && roles.length) setActiveRole(roles[0].id);
  }, [roles, activeRole]);
  useEffect(() => {
    if (!activeTierId && diffs.length) setActiveTierId(diffs[0].id);
  }, [diffs, activeTierId]);

  // Role colour
  const roleCol = useCallback((roleId?: string) => {
    const r = roles.find(r => r.id === (roleId ?? activeRole));
    return r?.color || C.accent;
  }, [roles, activeRole]);
  const col = roleCol();

  // Nodes for current role, grouped by tier
  const roleNodes = useMemo(
    () => allNodes.filter(n => n.path_id === activeRole),
    [allNodes, activeRole],
  );

  // ── Unlock logic ──────────────────────────────────────────────────────────
  const isUnlocked = useCallback((sk: SkillNode): boolean => {
    if (freeMode) return true;
    const nl = getNodeLevel(levels, sk.id, activeRole);
    if (nl.unlocked) return true;
    const prereqs = parseJsonArray(sk.prereqs);
    if (!prereqs.length) return true;
    return prereqs.every(pid => getNodeLevel(levels, pid, activeRole).level > 0);
  }, [levels, activeRole, freeMode]);

  // Path progress
  const pathProgress = useMemo(() => {
    if (!roleNodes.length) return 0;
    const total = roleNodes.reduce((s, n) => s + (n.item_count || 0), 0);
    const done = roleNodes.reduce((s, n) => s + getNodeLevel(levels, n.id, activeRole).mastered_subtopics, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [roleNodes, levels, activeRole]);

  // Total SP spent (sum of all invested xp across role)
  const totalSpent = useMemo(
    () => roleNodes.reduce((s, n) => s + getNodeLevel(levels, n.id, activeRole).mastered_subtopics, 0),
    [roleNodes, levels, activeRole],
  );

  // ── Dependency lines ──────────────────────────────────────────────────────
  const updateLines = useCallback(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const sr = sc.getBoundingClientRect();
    const newLines: { path: string; met: boolean }[] = [];

    roleNodes.forEach(child => {
      const pids = parseJsonArray(child.prereqs);
      if (!pids.length) return;
      const childEl = nodeRefs.current[child.id];
      if (!childEl) return;
      const cr = childEl.getBoundingClientRect();
      const cx = cr.left - sr.left + cr.width / 2;
      const cy = cr.top - sr.top + sc.scrollTop;

      pids.forEach(pid => {
        const parentEl = nodeRefs.current[pid];
        const parent = nodeMap[pid];
        if (!parentEl || !parent) return;
        const pr = parentEl.getBoundingClientRect();
        const px = pr.left - sr.left + pr.width / 2;
        const py = pr.bottom - sr.top + sc.scrollTop;
        const met = getNodeLevel(levels, pid, activeRole).level > 0 || freeMode;
        const midY = py + (cy - py) / 2;
        const path = Math.abs(px - cx) < 3
          ? `M${px},${py} L${cx},${cy}`
          : `M${px},${py} L${px},${midY} L${cx},${midY} L${cx},${cy}`;
        newLines.push({ path, met });
      });
    });
    setLines(newLines);
  }, [roleNodes, nodeMap, levels, activeRole, freeMode]);

  useEffect(() => {
    const t = setTimeout(updateLines, 120);
    window.addEventListener("resize", updateLines);
    return () => { clearTimeout(t); window.removeEventListener("resize", updateLines); };
  }, [updateLines]);

  // ── Scroll-spy for tier tabs ──────────────────────────────────────────────
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveTierId(e.target.id); }),
      { root: sc, rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    diffs.forEach(d => { const el = tierRefs.current[d.id]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [diffs, activeRole]);

  const scrollToTier = (id: string) => {
    tierRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Subtopic fetching ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!detailId) { setSubtopics([]); return; }
    let active = true;
    api.getSubtopics(detailId, activeRole)
      .then(subs => { if (active) setSubtopics(subs); })
      .catch(err => console.error("get_subtopics failed:", err));
    return () => { active = false; };
  }, [detailId, activeRole]);

  // ── Mastery actions ───────────────────────────────────────────────────────
  const checkDependentUnlocks = useCallback(async (changedNodeId: string) => {
    const dependents = allNodes.filter(
      n => n.path_id === activeRole && parseJsonArray(n.prereqs).includes(changedNodeId),
    );
    await Promise.all(dependents.map(d => api.checkNodeUnlock(d.id, activeRole).catch(() => {})));
  }, [allNodes, activeRole]);

  const toggleSubtopic = useCallback(async (sub: Subtopic) => {
    const delta = sub.mastery >= 80 ? -sub.mastery : (100 - sub.mastery);
    try {
      await api.updateSubtopicMastery(sub.id, activeRole, delta);
      const [subs] = await Promise.all([
        api.getSubtopics(sub.node_id, activeRole),
        checkDependentUnlocks(sub.node_id),
      ]);
      setSubtopics(subs);
      await refreshSkills();
    } catch { }
  }, [activeRole, refreshSkills, checkDependentUnlocks]);

  const completeAll = useCallback(async (nodeId: string) => {
    const subs = await api.getSubtopics(nodeId, activeRole).catch(() => []);
    for (const sub of subs) {
      if (sub.mastery < 80) await api.updateSubtopicMastery(sub.id, activeRole, 100 - sub.mastery).catch(() => {});
    }
    const updated = await api.getSubtopics(nodeId, activeRole).catch(() => []);
    setSubtopics(updated);
    await checkDependentUnlocks(nodeId);
    await refreshSkills();
  }, [activeRole, refreshSkills, checkDependentUnlocks]);

  const resetAll = useCallback(async (nodeId: string) => {
    const subs = await api.getSubtopics(nodeId, activeRole).catch(() => []);
    for (const sub of subs) {
      if (sub.mastery > 0) await api.updateSubtopicMastery(sub.id, activeRole, -sub.mastery).catch(() => {});
    }
    const updated = await api.getSubtopics(nodeId, activeRole).catch(() => []);
    setSubtopics(updated);
    await checkDependentUnlocks(nodeId);
    await refreshSkills();
  }, [activeRole, refreshSkills, checkDependentUnlocks]);

  // ══════════════════════════════════════════════════════════════════════════
  // DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (detailId) {
    const sk = nodeMap[detailId];
    if (!sk) { setDetailId(null); return null; }
    const nl = getNodeLevel(levels, sk.id, activeRole);
    const lv = nl.level;
    const topicMax = sk.topic_count || 1;
    const totalItems = sk.item_count || subtopics.length || 1;
    const doneItems = subtopics.filter(s => s.mastery >= 80).length;
    const pct = Math.round((doneItems / totalItems) * 100);
    const shared = parseJsonArray(sk.shared);
    const prereqs = parseJsonArray(sk.prereqs).map(pid => nodeMap[pid]).filter(Boolean);
    const unlocks = allNodes.filter(n => n.path_id === activeRole && parseJsonArray(n.prereqs).includes(sk.id));

    return (
      <div className="nf-view" style={{ ...col_(16), minHeight: "100%", color: C.text, padding: 24, overflowY: "auto" }}>
        {/* Back */}
        <button onClick={() => setDetailId(null)} style={{ ...btn(C.muted, true), alignSelf: "flex-start", marginBottom: 8 }}>
          ← BACK
        </button>

        {/* Header */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: 20, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <div style={{ fontSize: "2.8rem", minWidth: 52 }}>{sk.icon}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
              {shared.map(rid => {
                const r = roles.find(r => r.id === rid);
                return <div key={rid} style={{ ...(tag(r?.color || C.accent, true) as object), fontSize: 9 }}>{rid.toUpperCase()}</div>;
              })}
            </div>
            <h1 style={{ ...h1, fontSize: 22, color: col, marginBottom: 4 }}>{sk.name}</h1>
            <div style={{ ...mono(11, C.muted), marginBottom: 10 }}>
              {titleForMastery(pct)} · {topicMax} {topicMax === 1 ? "topic" : "topics"} · {doneItems}/{totalItems} subtopics
            </div>
            {/* Level dots */}
            <div style={{ ...row(3), marginBottom: 8, flexWrap: "wrap" }}>
              {Array.from({ length: topicMax }).map((_, i) => (
                <div key={i} style={{ width: 20, height: 9, borderRadius: BR.xs, border: `2px solid ${col}`, background: i < lv ? col : "transparent", opacity: i < lv ? 1 : 0.2 }} />
              ))}
              <span style={{ ...mono(10, C.muted), marginLeft: 6 }}>LV {lv}/{topicMax}</span>
            </div>
            <p style={{ fontFamily: F.body, fontSize: 13, lineHeight: 1.7, color: C.text2, maxWidth: 560 }}>{sk.description}</p>
            {/* Progress bar */}
            <div style={{ ...bar, marginTop: 8, maxWidth: 340 }}>
              <div style={fill(pct, col) as object} className="nf-bar-fill" />
            </div>
          </div>
        </div>

        {/* Level badge */}
        <div style={{ ...(card(col) as object), padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 700, color: col }}>LV {lv}</span>
          <span style={{ ...mono(11, C.muted) }}>{titleForMastery(pct)}</span>
          <span style={{ marginLeft: "auto", ...mono(11, C.muted) }}>{doneItems}/{totalItems} ({pct}%)</span>
        </div>

        {/* Subtopics checklist */}
        <div style={{ ...(card(col) as object), padding: "16px 20px" }}>
          <div style={{ fontFamily: F.display, fontSize: 10, letterSpacing: 3, color: C.muted, paddingBottom: 8, marginBottom: 12, borderBottom: `1px solid ${C.border}`, textTransform: "uppercase" }}>
            SUBTOPICS — check items to level up
          </div>
          {subtopics.length > 0 ? (() => {
            const grouped: { header: string; items: Subtopic[] }[] = [];
            for (const sub of subtopics) {
              const header = sub.description || "General";
              const last = grouped[grouped.length - 1];
              if (last && last.header === header) last.items.push(sub);
              else grouped.push({ header, items: [sub] });
            }
            return (
              <div style={col_(20)}>
                {grouped.map((group, gi) => {
                  const gDone = group.items.filter(s => s.mastery >= 80).length;
                  const gPct = Math.round((gDone / group.items.length) * 100);
                  return (
                    <div key={gi}>
                      <div style={{ ...row(8), justifyContent: "space-between", marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${col}22` }}>
                        <span style={{ fontFamily: F.display, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: col, textTransform: "uppercase" }}>{group.header}</span>
                        <span style={{ ...mono(10, C.muted) }}>{gDone}/{group.items.length} ({gPct}%)</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 4 }}>
                        {group.items.map(sub => {
                          const checked = sub.mastery >= 80;
                          return (
                            <div key={sub.id} onClick={() => toggleSubtopic(sub)}
                              style={{ ...row(7), padding: "6px 4px", cursor: "pointer", borderRadius: BR.xs, minHeight: 44, transition: "background 0.15s" }}
                              onMouseEnter={e => (e.currentTarget.style.background = C.surface2)}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              <div style={{ width: 20, height: 20, borderRadius: BR.xs, flexShrink: 0, border: `2px solid ${col}`, background: checked ? col : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: checked ? C.bg : col, transition: "all 0.15s" }}>
                                {checked ? "✓" : ""}
                              </div>
                              <span style={{ fontFamily: F.body, fontSize: 12, lineHeight: 1.45, flex: 1, color: checked ? C.muted : C.text, textDecoration: checked ? "line-through" : "none" }}>{sub.name}</span>
                              {sub.practice_count > 0 && <span style={{ ...mono(9, C.muted) }}>{sub.accuracy}%</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div style={{ fontFamily: F.body, fontSize: 12, color: C.muted, textAlign: "center", padding: "20px 0" }}>No subtopics loaded</div>
          )}
        </div>

        {/* Practice drill (B4) */}
        <PracticeCard
          nodeId={sk.id}
          pathId={activeRole}
          col={col}
          subtopics={subtopics}
          onMasteryChange={() => {
            api.getSubtopics(sk.id, activeRole).then(setSubtopics).catch(() => {});
            refreshSkills();
          }}
        />

        {/* Learning resources (B5) */}
        <ResourcesCard nodeId={sk.id} pathId={activeRole} col={col} />

        {/* Prerequisites & Unlocks */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {[
            { label: "PREREQUISITES", list: prereqs, empty: "Foundation — no prereqs" },
            { label: "UNLOCKS", list: unlocks, empty: "Mastery — top of tree" },
          ].map((sec, si) => (
            <div key={si} style={{ ...(card() as object), padding: "14px 16px" }}>
              <div style={{ fontFamily: F.display, fontSize: 10, letterSpacing: 3, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>{sec.label}</div>
              {sec.list.length ? sec.list.map((p: SkillNode) => {
                const pNl = getNodeLevel(levels, p.id, activeRole);
                return (
                  <div key={p.id} onClick={() => setDetailId(p.id)}
                    style={{ ...row(8), padding: "6px 8px", borderRadius: BR.xs, cursor: "pointer", minHeight: 44, fontSize: 12, fontFamily: F.body, color: C.text, border: `1px solid ${C.border}`, marginBottom: 3, transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.surface2)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                    <span style={{ ...(tag(col, true) as object), fontSize: 9, marginLeft: "auto" }}>LV {pNl.level}/{p.topic_count || 1}</span>
                  </div>
                );
              }) : <div style={{ fontSize: 12, color: C.muted }}>{sec.empty}</div>}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ ...row(8) }}>
          <button onClick={() => completeAll(sk.id)} style={btn(C.green, true)}>✓ COMPLETE ALL</button>
          <button onClick={() => resetAll(sk.id)} style={btn(C.red, true)}>↺ RESET</button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN TREE VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="nf-view" style={{ display: "flex", height: "100%", color: C.text, overflow: "hidden" }}>

      {/* ── COL 1: Role Sidebar ──────────────────────────────────────── */}
      <div style={{
        width: 80, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 28, gap: 20, overflowY: "auto",
      }}>
        {roles.map(r => {
          const active = activeRole === r.id;
          const rCol = r.color || C.accent;
          return (
            <button key={r.id} onClick={() => { setActiveRole(r.id); setDetailId(null); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: "none", border: "none", cursor: "pointer", color: active ? rCol : C.muted,
                transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? rCol : C.surface2, color: active ? "#fff" : C.muted,
                boxShadow: active ? `0 4px 16px ${rCol}44` : "none",
                fontSize: 20, fontWeight: 700, transition: "all 0.25s",
                transform: active ? "scale(1.1)" : "scale(1)",
              }}>
                {r.name.charAt(0)}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: F.mono }}>{r.id}</span>
            </button>
          );
        })}
      </div>

      {/* ── COL 2: Skill Canvas (centre) ─────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ flexShrink: 0, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontFamily: F.mono, color: col, fontSize: 9, letterSpacing: 4, marginBottom: 2 }}>// NEURALFORGE</div>
              <h2 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: C.text, margin: 0, letterSpacing: 1 }}>Path Progression</h2>
            </div>
            <div style={row(8)}>
              {/* Catalog → tree sync (roles, skill links, tiers) */}
              <button onClick={syncTree} disabled={syncing}
                title="Mirror catalog roles, skill links and tiers into the tree"
                style={{
                  ...row(6), padding: "5px 14px", borderRadius: BR.pill, cursor: "pointer",
                  background: `${C.teal}15`, border: `1px solid ${C.teal}44`,
                  color: C.teal, fontFamily: F.mono, fontSize: 10, fontWeight: 700,
                  letterSpacing: 1, opacity: syncing ? 0.5 : 1, transition: "all 0.2s",
                }}
              >
                {syncing ? "⟳ SYNCING…" : "⇄ SYNC CATALOG"}
              </button>
              {/* Mode toggle */}
              <button onClick={() => setFreeMode(v => !v)}
                style={{
                  ...row(6), padding: "5px 14px", borderRadius: BR.pill, cursor: "pointer",
                  background: freeMode ? `${C.gold}22` : `${C.muted}15`,
                  border: `1px solid ${freeMode ? C.gold + "55" : C.border}`,
                  color: freeMode ? C.gold : C.muted, fontFamily: F.mono, fontSize: 10, fontWeight: 700,
                  letterSpacing: 1, transition: "all 0.2s",
                }}
              >
                {freeMode ? "🔓" : "🔒"} {freeMode ? "FREE SANDBOX" : "STRICT PATH"}
              </button>
            </div>
          </div>
          {syncMsg && (
            <div style={{ padding: "4px 24px", fontFamily: F.mono, fontSize: 10, color: C.teal }}>{syncMsg}</div>
          )}

          {/* Tier tabs */}
          <div style={{ display: "flex", gap: 8, padding: "10px 24px", overflowX: "auto" }}>
            {diffs.map(d => {
              const tt = tierTheme(d.id);
              const isActive = activeTierId === d.id;
              const hasSkills = roleNodes.some(n => n.difficulty_id === d.id);
              return (
                <button key={d.id} onClick={() => hasSkills && scrollToTier(d.id)}
                  style={{
                    padding: "6px 18px", borderRadius: BR.pill, fontFamily: F.display, fontSize: 11,
                    fontWeight: 700, letterSpacing: 1, cursor: hasSkills ? "pointer" : "not-allowed",
                    background: isActive ? tt.accent : "transparent",
                    color: isActive ? "#fff" : hasSkills ? C.text2 : C.muted,
                    border: `1px solid ${isActive ? tt.accent : C.border}`,
                    opacity: hasSkills ? 1 : 0.4, transition: "all 0.2s", whiteSpace: "nowrap",
                    boxShadow: isActive ? `0 2px 12px ${tt.accent}44` : "none",
                  }}
                >
                  {!hasSkills && "🔒 "}{d.short_label} — {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable tier canvas */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", position: "relative", background: C.bg, scrollBehavior: "smooth" }}>

          {/* SVG lines layer */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
            {lines.map((l, i) => (
              <path key={i} d={l.path} stroke={l.met ? C.muted : `${C.muted}44`} strokeWidth={2.5}
                fill="none" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={l.met ? "none" : "6 6"} opacity={0.7} />
            ))}
          </svg>

          {/* Tier sections */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: 900, margin: "0 auto", padding: "0 24px 160px" }}>
            {diffs.map(d => {
              const tierSkills = roleNodes.filter(n => n.difficulty_id === d.id);
              const tt = tierTheme(d.id);
              const tierLocked = !tierSkills.some(sk => isUnlocked(sk)) && !freeMode;

              return (
                <div key={d.id} id={d.id} ref={el => { tierRefs.current[d.id] = el; }}
                  style={{
                    padding: "48px 0", margin: "16px 0", position: "relative",
                    opacity: tierLocked ? 0.35 : 1, filter: tierLocked ? "grayscale(0.5)" : "none",
                    transition: "all 0.4s",
                  }}
                >
                  {/* Tier background */}
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 32,
                    background: tt.bg, border: `1px solid ${tt.border}`,
                    pointerEvents: "none",
                  }} />

                  {/* Tier label */}
                  <div style={{ position: "relative", textAlign: "center", marginBottom: 32 }}>
                    <span style={{
                      fontFamily: F.display, fontSize: 11, fontWeight: 700, letterSpacing: 3,
                      textTransform: "uppercase", color: tt.accent,
                      background: C.bg, padding: "4px 16px", borderRadius: BR.pill,
                      border: `1px solid ${tt.border}`,
                    }}>
                      {d.short_label} — {d.label}
                    </span>
                  </div>

                  {/* Skill nodes */}
                  <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "48px 56px" }}>
                    {tierSkills.length === 0 && (
                      <div style={{ padding: "32px 24px", border: `2px dashed ${C.border}`, borderRadius: 24, color: C.muted, fontFamily: F.body, fontSize: 13 }}>
                        Empty tier region
                      </div>
                    )}
                    {tierSkills.map(sk => {
                      const nl = getNodeLevel(levels, sk.id, activeRole);
                      const done = nl.mastered_subtopics;
                      const total = sk.item_count || 1;
                      const pct = Math.round((done / total) * 100);
                      const un = isUnlocked(sk);
                      const locked = !un && nl.level === 0;
                      const maxed = pct >= 100;

                      // Squircle colours
                      const outerBg = maxed
                        ? `linear-gradient(135deg, ${C.gold}88, ${C.gold})`
                        : nl.level > 0
                          ? `linear-gradient(135deg, ${col}66, ${col})`
                          : C.surface;
                      const innerBg = nl.level > 0
                        ? `linear-gradient(135deg, ${col}, ${C.accentEnd})`
                        : C.surface2;

                      return (
                        <div key={sk.id} ref={el => { nodeRefs.current[sk.id] = el; }}
                          className={`skill-node${locked ? " locked" : ""}`}
                          onClick={() => !locked && setDetailId(sk.id)}
                          style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            cursor: locked ? "not-allowed" : "pointer",
                            opacity: locked ? 0.45 : 1, transition: "all 0.25s",
                            filter: locked ? "grayscale(0.5)" : "none",
                          }}
                        >
                          {/* Squircle node */}
                          <div style={{
                            position: "relative", width: NODE_SIZE, height: NODE_SIZE, borderRadius: 32,
                            display: "flex", alignItems: "center", justifyContent: "center", padding: 5,
                            background: outerBg, boxShadow: maxed ? `0 8px 24px ${C.gold}44` : nl.level > 0 ? `0 6px 20px ${col}33` : SHADOW.card,
                            transition: "all 0.3s",
                          }}>
                            {/* Inner circle */}
                            <div style={{
                              width: "100%", height: "100%", borderRadius: 28,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: innerBg, position: "relative", overflow: "hidden",
                            }}>
                              <span style={{ fontSize: 36, filter: nl.level > 0 ? "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" : "none", opacity: locked ? 0.4 : 1 }}>
                                {sk.icon || "•"}
                              </span>
                              {nl.level > 0 && (
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 100%)", pointerEvents: "none" }} />
                              )}
                            </div>

                            {/* Progress badge */}
                            <div style={{
                              position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                              padding: "2px 10px", borderRadius: BR.pill, fontSize: 10, fontWeight: 800,
                              fontFamily: F.mono, letterSpacing: 0.5, zIndex: 5,
                              background: maxed ? C.gold : nl.level > 0 ? col : C.surface2,
                              color: maxed || nl.level > 0 ? "#fff" : C.muted,
                              border: `2px solid ${C.bg}`,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}>
                              {done}/{total}
                            </div>

                            {/* Level up button (spend SP) */}
                            {!locked && !maxed && (
                              <button
                                onClick={e => { e.stopPropagation(); levelUpSkill(sk.id, activeRole); }}
                                style={{
                                  position: "absolute", top: "50%", right: -12, transform: "translateY(-50%)",
                                  width: 26, height: 26, borderRadius: 10, border: `2px solid ${C.bg}`,
                                  background: freeMode ? C.gold : col, color: "#fff",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  cursor: "pointer", fontSize: 14, fontWeight: 700, lineHeight: 1,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)", transition: "all 0.15s", zIndex: 10,
                                }}
                                title="Spend 1 SP to boost mastery"
                              >+</button>
                            )}
                          </div>

                          {/* Label */}
                          <div style={{
                            marginTop: 12, padding: "6px 14px", borderRadius: 12,
                            background: C.bgAcrylic, backdropFilter: "blur(8px)",
                            border: `1px solid ${C.border}`,
                            maxWidth: 160, minWidth: 100, textAlign: "center",
                            boxShadow: SHADOW.card,
                          }}>
                            <div style={{ fontFamily: F.display, fontSize: 11, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 3 }}>
                              {sk.name}
                            </div>
                            <div style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, fontWeight: 700 }}>
                              Lv {nl.level}/{sk.topic_count || 1}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── COL 3: Summary Panel (right) ─────────────────────────────── */}
      <div style={{
        width: 220, flexShrink: 0, borderLeft: `1px solid ${C.border}`,
        background: C.surface, display: "flex", flexDirection: "column", alignItems: "center",
        padding: "24px 16px", gap: 20, overflowY: "auto",
      }}>
        {/* Role badge card */}
        <div style={{
          width: "100%", background: C.surface3, borderRadius: 24, padding: "28px 16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          border: `1px solid ${C.border}`, boxShadow: SHADOW.card,
        }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>
            {roles.find(r => r.id === activeRole)?.name || "—"}
          </span>

          {/* Circular icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${col}, ${C.accentEnd})`,
            border: `3px solid ${C.text}`, boxShadow: `0 8px 24px ${col}44`,
            fontSize: 32, color: "#fff", fontWeight: 700,
          }}>
            {roles.find(r => r.id === activeRole)?.name?.charAt(0) || "?"}
          </div>

          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>
            Skill Progression
          </span>

          {/* Progress ring */}
          <div style={{ position: "relative", width: 120, height: 120 }}>
            <svg width={120} height={120} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={60} cy={60} r={50} fill="none" stroke={`${C.border}44`} strokeWidth={10} />
              <circle cx={60} cy={60} r={50} fill="none"
                stroke={col} strokeWidth={10} strokeLinecap="round"
                strokeDasharray={314} strokeDashoffset={314 - 314 * (pathProgress / 100)}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 800, color: C.text }}>{pathProgress}</span>
              <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted }}>/ 100%</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ width: "100%", ...col_(8) }}>
          {[
            { label: "Subtopics Done", value: totalSpent },
            { label: "Skills", value: roleNodes.length },
            { label: "Tiers", value: diffs.length },
          ].map(s => (
            <div key={s.label} style={{ ...row(8), justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ ...mono(10, C.muted) }}>{s.label}</span>
              <span style={{ ...mono(12, C.text), fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
