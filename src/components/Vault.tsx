// ============================================================
// SynthesisOverthrust — src/components/Vault.tsx
// Obsidian vault browser — connect, browse, preview, write
// ============================================================

import React, { useEffect, useState } from "react";
import type { GitStatus, SearchResult, SearchStats, SnapshotInfo, VaultNote } from "../api";
import { api } from "../api";
import type { UseGameState } from "../hooks/useGameState";
import {
  C, F,
  btn,
  card,
  col_,
  glassCard,
  h1, h2, h3,
  inp,
  mono,
  row,
  tag
} from "../tokens";

type Props = Pick<UseGameState, "vaultNotes" | "setVaultPath" | "readNote" | "writeNote">;

export default function Vault({ vaultNotes, setVaultPath, readNote, writeNote }: Props) {
  const [vaultInput, setVaultInput] = useState("");
  const [selNote, setSelNote] = useState<VaultNote | null>(null);
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [semantic, setSemantic] = useState(false);
  const [semResults, setSemResults] = useState<SearchResult[] | null>(null);
  const [semBusy, setSemBusy] = useState(false);
  const [semMsg, setSemMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    api.searchStats().then(setStats).catch(() => setStats(null));
  }, []);

  const handleConnect = async () => {
    if (!vaultInput.trim()) return;
    await setVaultPath(vaultInput.trim());
    setVaultInput("");
  };

  const handleReindex = async () => {
    setReindexing(true);
    setSemMsg(null);
    try {
      const s = await api.searchReindex();
      setStats({ ...s, indexed: true });
      setSemMsg(`indexed ${s.indexed_chunks} chunks from ${s.unique_notes} notes`);
    } catch (e) {
      setSemMsg(`⚠ ${String(e)}`);
    } finally {
      setReindexing(false);
    }
  };

  const runSemantic = async () => {
    if (!search.trim()) return;
    setSemBusy(true);
    setSemMsg(null);
    try {
      setSemResults(await api.searchVault(search.trim(), 8));
    } catch (e) {
      setSemResults(null);
      setSemMsg(`⚠ ${String(e)}`);
    } finally {
      setSemBusy(false);
    }
  };

  const openPath = (path: string, title: string) =>
    handleOpenNote(vaultNotes.find(n => n.path === path)
      ?? { path, title, word_count: 0, modified_at: "" });

  const handleOpenNote = async (note: VaultNote) => {
    setSelNote(note);
    setEditing(false);
    setLoading(true);
    try {
      const c = await readNote(note.path);
      setContent(c);
    } catch {
      setContent("Error reading note.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selNote) return;
    setSaving(true);
    try {
      await writeNote(selNote.path, content);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = vaultNotes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.path.toLowerCase().includes(search.toLowerCase())
  );

  const totalWords = vaultNotes.reduce((s, n) => s + n.word_count, 0);

  return (
    <div className="nf-view" style={col_(18)}>

      {/* Header */}
      <div style={{ ...row(), justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: F.mono, color: C.teal, fontSize: 10, letterSpacing: 4, marginBottom: 4 }}>
            // OBSIDIAN VAULT
          </div>
          <h1 style={h1}>Knowledge Vault</h1>
        </div>
        <div style={row(10)}>
          <span style={tag(C.teal)}>{vaultNotes.length} notes</span>
          <span style={tag(C.purple)}>{totalWords.toLocaleString()} words</span>
          <span style={tag(C.gold)}>
            {stats?.indexed ? `${stats.indexed_chunks} chunks indexed` : "not indexed"}
          </span>
          {vaultNotes.length > 0 && (
            <button className="nf-btn" onClick={handleReindex} disabled={reindexing}
              style={{ ...btn(C.gold, true), opacity: reindexing ? 0.5 : 1 }}>
              {reindexing ? "⟳ Indexing…" : "⚡ Reindex"}
            </button>
          )}
        </div>
      </div>

      {semMsg && <div style={{ ...mono(11, C.gold) }}>{semMsg}</div>}

      {/* Connect banner (shown when no notes yet) */}
      {vaultNotes.length === 0 && (
        <div style={{ ...glassCard(C.teal), animation: "nf-fadein 0.2s ease" }}>
          <div style={{ ...row(14), flexWrap: "wrap", gap: 14 }}>
            <span style={{ fontSize: 36 }}>📓</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: C.teal, marginBottom: 6 }}>
                Connect your Obsidian Vault
              </div>
              <div style={{ fontFamily: F.body, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
                SynthesisOverthrust will watch your vault for changes, index all notes, and let you read &amp; write directly from here.
              </div>
            </div>
          </div>
          <div style={{ ...row(10), marginTop: 16, flexWrap: "wrap" }}>
            <input
              style={{ ...inp, flex: 1, minWidth: 260, borderColor: `${C.teal}44` }}
              placeholder="/home/user/ObsidianVault  or  /Users/name/Documents/MyVault"
              value={vaultInput}
              onChange={e => setVaultInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleConnect()}
            />
            <button className="nf-btn"
              onClick={handleConnect}
              style={btn(C.teal)}>
              📓 Connect
            </button>
          </div>
        </div>
      )}

      {/* Main layout: list + preview */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", minHeight: 420 }}>

        {/* ── Note list ─────────────────────────────────────────────── */}
        <div style={{ width: 280, flexShrink: 0, ...col_(10) }}>

          {/* Search: substring filter ⇄ semantic */}
          {vaultNotes.length > 0 && (
            <div style={col_(6)}>
              <div style={row(6)}>
                <input
                  style={{ ...inp, flex: 1, borderColor: semantic ? `${C.purple}55` : `${C.teal}44` }}
                  placeholder={semantic ? "Semantic search… (Enter)" : "Filter notes…"}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => semantic && e.key === "Enter" && runSemantic()}
                />
                <button className="nf-btn"
                  title={semantic ? "Semantic (meaning) search — click for name filter" : "Name filter — click for semantic search"}
                  onClick={() => { setSemantic(v => !v); setSemResults(null); setSemMsg(null); }}
                  style={btn(semantic ? C.purple : C.muted, true)}>
                  {semantic ? "✨" : "🔤"}
                </button>
              </div>
              {semantic && (
                <div style={{ ...mono(9, C.muted) }}>
                  {semBusy ? "searching…" : "meaning-based search over indexed chunks"}
                </div>
              )}
            </div>
          )}

          {/* Semantic results */}
          {semantic && semResults && (
            <div style={{ ...card(C.purple), padding: "8px 6px", maxHeight: 520, overflowY: "auto" }}>
              {semResults.length === 0 ? (
                <div style={{ textAlign: "center", padding: 24, color: C.muted, fontFamily: F.body, fontSize: 12 }}>
                  No semantic matches.
                </div>
              ) : semResults.map(r => (
                <div key={`${r.path}#${r.chunk_index}`}
                  className="nf-card-hover"
                  onClick={() => openPath(r.path, r.title)}
                  style={{
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 3,
                    "--hover-col": C.purple, transition: "all 0.15s ease",
                  } as React.CSSProperties}>
                  <div style={{ ...row(6), justifyContent: "space-between" }}>
                    <span style={{ fontFamily: F.display, fontSize: 12, fontWeight: 600, color: C.purple }}>{r.title}</span>
                    <span style={{ ...mono(9, C.muted) }}>{r.score.toFixed(2)}</span>
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: 11, color: C.text2, lineHeight: 1.6, margin: "4px 0" }}>
                    {r.chunk_text.slice(0, 140)}{r.chunk_text.length > 140 ? "…" : ""}
                  </div>
                  <div style={{ ...row(4), flexWrap: "wrap" }}>
                    {r.tags.slice(0, 3).map(t => <span key={t} style={tag(C.purple, true)}>#{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!(semantic && semResults) && (
          <div style={{
            ...card(),
            padding: "8px 4px",
            maxHeight: 520,
            overflowY: "auto",
          }}>
            {vaultNotes.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: C.muted, fontFamily: F.body, fontSize: 12 }}>
                No vault connected yet.<br />Use the panel above.
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: C.muted, fontFamily: F.body, fontSize: 12 }}>
                No notes match "{search}"
              </div>
            ) : (
              filtered.map(note => {
                const isSel = selNote?.path === note.path;
                // vault_index carries no tags column — nothing to parse
                const tags: string[] = [];
                return (
                  <div key={note.path}
                    className="nf-card-hover"
                    onClick={() => handleOpenNote(note)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: isSel ? `${C.teal}12` : "transparent",
                      border: `1px solid ${isSel ? C.teal + "44" : "transparent"}`,
                      marginBottom: 3,
                      "--hover-col": C.teal,
                      transition: "all 0.15s ease",
                    } as React.CSSProperties}>
                    <div style={{ fontFamily: F.display, fontSize: 13, fontWeight: 600, color: isSel ? C.teal : C.text, marginBottom: 3 }}>
                      {note.title}
                    </div>
                    <div style={{ ...row(4), flexWrap: "wrap", marginBottom: 3 }}>
                      {tags.slice(0, 3).map(t => (
                        <span key={t} style={tag(C.purple, true)}>#{t}</span>
                      ))}
                    </div>
                    <div style={{ ...mono(9, C.muted) }}>
                      {note.word_count} words · {new Date(note.modified_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          )}

          {/* Reconnect option */}
          {vaultNotes.length > 0 && (
            <div style={{ ...row(8), flexWrap: "wrap" }}>
              <input
                style={{ ...inp, flex: 1, fontSize: 11 }}
                placeholder="Change vault path…"
                value={vaultInput}
                onChange={e => setVaultInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleConnect()}
              />
              <button className="nf-btn" onClick={handleConnect} style={btn(C.teal, true)}>↩</button>
            </div>
          )}

          <BackupCard />
        </div>

        {/* ── Note preview / editor ──────────────────────────────────── */}
        <div style={{ flex: 1, ...col_(10), minWidth: 0 }}>
          {selNote ? (
            <>
              {/* Note header */}
              <div style={{
                ...card(C.teal),
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.teal }}>
                    {selNote.title}
                  </div>
                  <div style={{ ...mono(10, C.muted), marginTop: 4 }}>
                    {selNote.path}
                  </div>
                </div>
                <div style={row(8)}>
                  <span style={tag(C.purple)}>{selNote.word_count} words</span>
                  {editing ? (
                    <>
                      <button className="nf-btn" onClick={handleSave} style={btn(C.green, true)}>
                        {saving ? "Saving…" : "✓ Save"}
                      </button>
                      <button className="nf-btn" onClick={() => setEditing(false)} style={btn(C.muted, true)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="nf-btn" onClick={() => setEditing(true)} style={btn(C.teal, true)}>
                      ✏ Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div style={{ textAlign: "center", padding: 48, color: C.muted, fontFamily: F.body, fontSize: 13 }}>
                  Loading…
                </div>
              ) : editing ? (
                <textarea
                  style={{
                    ...inp,
                    minHeight: 420,
                    resize: "vertical",
                    fontFamily: F.mono,
                    fontSize: 13,
                    lineHeight: 1.9,
                    borderColor: `${C.teal}55`,
                  }}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              ) : (
                <div style={{
                  ...card(),
                  maxHeight: 480,
                  overflowY: "auto",
                }}>
                  {content.split("\n").map((line, i) => {
                    if (line.startsWith("# "))
                      return <h1 key={i} style={{ ...h1, fontSize: 20, marginBottom: 10, color: C.teal }}>{line.slice(2)}</h1>;
                    if (line.startsWith("## "))
                      return <h2 key={i} style={{ ...h2, marginBottom: 8, color: C.accent }}>{line.slice(3)}</h2>;
                    if (line.startsWith("### "))
                      return <h3 key={i} style={{ ...h3, color: C.purple, marginBottom: 5 }}>{line.slice(4)}</h3>;
                    if (line.startsWith("- "))
                      return (
                        <div key={i} style={{ fontFamily: F.body, fontSize: 13, lineHeight: 1.8, color: C.text, paddingLeft: 16, borderLeft: `2px solid ${C.border}`, marginBottom: 2 }}>
                          {line.slice(2)}
                        </div>
                      );
                    if (line.trim() === "")
                      return <div key={i} style={{ height: 10 }} />;
                    return (
                      <p key={i} style={{ fontFamily: F.body, fontSize: 13, lineHeight: 1.9, color: C.text2, marginBottom: 4 }}>
                        {line}
                      </p>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div style={{
              ...card(),
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: 60, textAlign: "center",
            }}>
              <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.5 }}>📓</div>
              <div style={{ fontFamily: F.display, fontSize: 16, color: C.muted }}>
                Select a note to preview
              </div>
              <div style={{ fontFamily: F.body, fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.7 }}>
                Hit ⚡ Reindex, then use ✨ semantic search to find notes by meaning —<br />
                or ask the AI Tutor with 📓 Vault context for answers from your own notes.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Backup card (B12) — git commit/push + DB snapshots ─────────────────────────
function BackupCard() {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotInfo[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [backing, setBacking] = useState(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const [remoteUrl, setRemoteUrl] = useState("");
  const [remoteBusy, setRemoteBusy] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [advMsg, setAdvMsg] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [s, snaps] = await Promise.all([api.backupStatus(), api.backupSnapshots()]);
      setStatus(s);
      setSnapshots(snaps);
      setLoadErr(null);
    } catch (e) {
      setLoadErr(String(e));
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleBackup = async () => {
    setBacking(true);
    setBackupMsg(null);
    try {
      const r = await api.backupCommit();
      await refresh();
      setBackupMsg(`${r.files_changed} files · snapshot ${r.snapshot ?? "?"}`);
    } catch (e) {
      setBackupMsg(String(e));
    } finally {
      setBacking(false);
    }
  };

  const handleSetRemote = async () => {
    if (!remoteUrl.trim()) return;
    setRemoteBusy(true);
    setAdvMsg(null);
    try {
      await api.backupSetRemote(remoteUrl.trim());
      await refresh();
      setAdvMsg("remote set");
    } catch (e) {
      setAdvMsg(String(e));
    } finally {
      setRemoteBusy(false);
    }
  };

  const handlePush = async () => {
    setPushBusy(true);
    setAdvMsg(null);
    try {
      const r = await api.backupPush();
      setAdvMsg(r.result);
    } catch (e) {
      setAdvMsg(String(e));
    } finally {
      setPushBusy(false);
    }
  };

  const latestSnapshot = snapshots?.[0];

  return (
    <div style={{ ...card(C.green), padding: 14, marginTop: 4 }}>
      <div style={{ fontFamily: F.display, fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 6 }}>
        💾 Backup
      </div>

      {loadErr ? (
        <div style={{ ...mono(10, C.red) }}>⚠ {loadErr}</div>
      ) : status?.error ? (
        <div style={{ ...mono(10, C.red) }}>⚠ {status.error}</div>
      ) : (
        <>
          <div style={{ ...mono(10, C.muted), marginBottom: 4 }}>
            ⎇ {status?.branch ?? "…"} · {status?.dirty ? "changes pending" : "clean"} · last: {status?.last_commit?.message ?? "never"}
          </div>
          <div style={{ ...mono(10, C.muted), marginBottom: 8 }}>
            {snapshots?.length ?? 0} snapshots{latestSnapshot ? ` · latest ${latestSnapshot.sha256.slice(0, 8)}` : ""}
          </div>
        </>
      )}

      <button className="nf-btn" onClick={handleBackup} disabled={backing}
        style={{ ...btn(C.green, true), opacity: backing ? 0.5 : 1, width: "100%" }}>
        {backing ? "⟳ Backing up…" : "💾 Backup Now"}
      </button>
      {backupMsg && <div style={{ ...mono(10, C.gold), marginTop: 6 }}>{backupMsg}</div>}

      {/* Advanced: remote + push */}
      <div style={{ ...row(6), marginTop: 10, flexWrap: "wrap" }}>
        <input
          style={{ ...inp, flex: 1, minWidth: 120, fontSize: 10, padding: "5px 8px" }}
          placeholder="git remote url…"
          value={remoteUrl}
          onChange={e => setRemoteUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSetRemote()}
        />
        <button className="nf-btn" onClick={handleSetRemote} disabled={remoteBusy}
          style={btn(C.muted, true)}>
          Set remote
        </button>
        <button className="nf-btn" onClick={handlePush} disabled={pushBusy || !status?.has_remote}
          title={status?.has_remote ? "Push to origin" : "Set a remote first"}
          style={{ ...btn(C.teal, true), opacity: (pushBusy || !status?.has_remote) ? 0.5 : 1 }}>
          ⇪ Push
        </button>
      </div>
      {advMsg && <div style={{ ...mono(10, C.gold), marginTop: 6 }}>{advMsg}</div>}
    </div>
  );
}
