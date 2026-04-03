// ============================================================
// SynthesisOverthrust — src/tokens.ts
// Central design system — all CSS values, style factories,
// and shared animation keyframes.
// ============================================================

// ── Colour palette ────────────────────────────────────────────────────────────
// RPG Merged Architecture — Acrylic Blur + Slate tones
export const C = {
  bg: "#1A202C",                           // BG_RECESSED (slots/skill trees)
  bgAcrylic: "rgba(45, 55, 72, 0.85)",    // BG_PRIMARY (acrylic blur panels)
  surface: "#2D3748",
  surface2: "#1A202C",
  surface3: "#171923",
  border: "rgba(255,255,255,0.1)",         // GEOMETRY border spec
  border2: "rgba(255,255,255,0.15)",

  accent: "#3B82F6",   // blue  — primary CTA (gradient start)
  accentEnd: "#8B5CF6", // purple — gradient end
  gold: "#ffc107",     // gold  — XP, rewards
  green: "#22C55E",    // green — HP, success (STATUS spec)
  red: "#ff4060",      // red   — danger, blocked
  purple: "#8B5CF6",   // purple — SP
  orange: "#ff6b35",   // orange — level-up
  pink: "#ff6bde",     // pink  — special
  teal: "#22D3EE",     // cyan  — high-contrast stats

  mle: "#3B82F6",
  de: "#8B5CF6",
  ds: "#ffc107",
  aie: "#66FF99",

  text: "#FFFFFF",      // TEXT primary
  text2: "#94A3B8",     // TEXT muted
  muted: "#94A3B8",     // TEXT muted (alias)
  dim: "#1a1a3c",
} as const;

// ── Fonts ─────────────────────────────────────────────────────────────────────
// TYPOGRAPHY: Inter/Nunito. Numerics: Tabular Lining/Monospace
export const F = {
  display: "'Inter', 'Nunito', sans-serif",
  mono: "'Share Tech Mono', monospace",
  body: "'Inter', 'Nunito', sans-serif",
} as const;

// ── Geometry ──────────────────────────────────────────────────────────────────
// GEOMETRY: Window Radius 16px. Element Radius 8-12px. Border: 1px rgba(255,255,255,0.1)
export const BR = {
  xs: 4,     // inline code, small tags
  sm: 8,     // buttons, inputs, small cards
  md: 12,    // medium containers, cards
  lg: 16,    // windows, large panels
  pill: 999, // pill-shaped action bar slots
  circle: "50%" as const,
} as const;

// ELEVATION: Box-shadow spec
export const SHADOW = {
  card: "0 4px 16px rgba(0,0,0,0.3)",
  elevated: "0 20px 40px rgba(0,0,0,0.4)",
  glow: (col: string) => `0 0 20px ${col}33`,
} as const;

// ACTION BAR: 48x48px slots, minimum hit target 44x44px
export const HIT_TARGET = 44;
export const ACTION_SLOT = 48;

// ── Global CSS injected once into <head> ──────────────────────────────────────
export const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    width: 100%; height: 100%;
    background: ${C.bg};
    color: ${C.text};
    font-family: ${F.body};
    font-size: 12px;
    line-height: 1.5;
    overflow: hidden;
  }

  ::-webkit-scrollbar       { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${C.surface}; }
  ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: ${BR.xs}px; }
  ::-webkit-scrollbar-thumb:hover { background: ${C.muted}; }

  ::selection { background: ${C.accent}44; color: ${C.accent}; }

  /* ── Animations ─────────────────────────────────────────────── */
  @keyframes nf-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes nf-glow {
    0%, 100% { box-shadow: 0 0 8px var(--glow-col, ${C.accent})44; }
    50%       { box-shadow: 0 0 22px var(--glow-col, ${C.accent})88, 0 0 40px var(--glow-col, ${C.accent})33; }
  }
  @keyframes nf-scan {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes nf-xp-fill {
    from { width: 0%; }
    to   { width: var(--target-width, 0%); }
  }
  @keyframes nf-fadein {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nf-slideright {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes nf-toast-in {
    from { opacity: 0; transform: translateX(60px) scale(0.9); }
    to   { opacity: 1; transform: translateX(0)   scale(1); }
  }
  @keyframes nf-toast-out {
    from { opacity: 1; transform: translateX(0)   scale(1); }
    to   { opacity: 0; transform: translateX(60px) scale(0.9); }
  }
  @keyframes nf-levelup {
    0%   { opacity: 0; transform: scale(0.5); }
    40%  { opacity: 1; transform: scale(1.12); }
    70%  { transform: scale(0.97); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes nf-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes nf-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes nf-bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-4px); }
  }

  /* Scanline overlay */
  .nf-scanline::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none; z-index: 10;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.04) 2px,
      rgba(0,0,0,0.04) 4px
    );
  }

  /* Node hover */
  .skill-node { transition: filter 0.15s ease, transform 0.15s ease; }
  .skill-node:hover { filter: brightness(1.3); transform: scale(1.05); }
  .skill-node.locked { cursor: not-allowed !important; }
  .skill-node.locked:hover { filter: none; transform: none; }

  /* Button hover */
  .nf-btn { transition: all 0.18s ease; }
  .nf-btn:hover { filter: brightness(1.2); transform: translateY(-1px); box-shadow: ${SHADOW.elevated}; }
  .nf-btn:active { transform: translateY(0); filter: brightness(0.95); }

  /* Card hover */
  .nf-card-hover { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .nf-card-hover:hover { border-color: var(--hover-col, ${C.border2}) !important; box-shadow: 0 0 20px var(--hover-col, ${C.border2})22; }

  /* Fade in on mount */
  .nf-view { animation: nf-fadein 0.22s ease forwards; }

  /* Progress bar shimmer */
  .nf-bar-fill {
    background-size: 200% auto;
    animation: nf-shimmer 2.5s linear infinite;
  }
`;

// ── Style factories ────────────────────────────────────────────────────────────
export const card = (accentCol?: string, extra?: React.CSSProperties): React.CSSProperties => ({
  background: C.bgAcrylic,
  border: `1px solid ${accentCol ? accentCol + "33" : C.border}`,
  borderRadius: BR.md,
  padding: 20,
  boxShadow: accentCol ? SHADOW.glow(accentCol) : SHADOW.card,
  backdropFilter: "blur(12px)",
  ...extra,
});

export const glassCard = (col: string): React.CSSProperties => ({
  background: `linear-gradient(135deg, ${C.bgAcrylic} 0%, ${col}0a 100%)`,
  border: `1px solid ${col}33`,
  borderRadius: BR.md,
  padding: 20,
  boxShadow: `${SHADOW.elevated}, ${SHADOW.glow(col)}`,
  backdropFilter: "blur(12px)",
});

export const btn = (col: string, sm?: boolean): React.CSSProperties => ({
  background: `${col}1a`,
  border: `1px solid ${col}55`,
  color: col,
  padding: sm ? "5px 11px" : "8px 18px",
  minHeight: sm ? 32 : HIT_TARGET,
  minWidth: sm ? 32 : HIT_TARGET,
  borderRadius: BR.sm,
  cursor: "pointer",
  fontFamily: F.display,
  fontSize: sm ? 11 : 13,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase" as const,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  whiteSpace: "nowrap" as const,
  transition: "all 0.18s ease",
  userSelect: "none" as const,
});

export const dangerBtn = (sm?: boolean): React.CSSProperties => btn(C.red, sm);
export const primaryBtn = (sm?: boolean): React.CSSProperties => btn(C.accent, sm);

export const inp: React.CSSProperties = {
  background: C.surface2,
  border: `1px solid ${C.border}`,
  borderRadius: BR.sm,
  padding: "9px 13px",
  color: C.text,
  fontFamily: F.body,
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

export const sel: React.CSSProperties = { ...inp, cursor: "pointer" };

export const tag = (col: string, sm?: boolean): React.CSSProperties => ({
  padding: sm ? "1px 6px" : "2px 9px",
  borderRadius: BR.xs,
  background: `${col}1e`,
  color: col,
  fontSize: sm ? 10 : 11,
  fontWeight: 700,
  letterSpacing: 0.8,
  fontFamily: F.display,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
});

// RESOURCE CENTER: Thick horizontal bars, animated fill, bold centered numerics
export const bar: React.CSSProperties = {
  height: 8,
  borderRadius: BR.xs,
  background: C.border,
  overflow: "hidden",
  position: "relative",
};

export const fill = (pct: number, col: string, h = 8): React.CSSProperties => ({
  width: `${Math.min(100, Math.max(0, pct))}%`,
  height: h,
  borderRadius: BR.xs,
  background: `linear-gradient(90deg, ${col}bb, ${col})`,
  boxShadow: `0 0 8px ${col}88`,
  transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
});

export const label: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: C.muted,
  fontFamily: F.display,
  marginBottom: 5,
};

// TYPOGRAPHY: H1 18px Bold per spec
export const h1: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: 2,
  textTransform: "uppercase",
  fontFamily: F.display,
  margin: 0,
  lineHeight: 1.1,
};

export const h2: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: 2,
  textTransform: "uppercase",
  fontFamily: F.display,
  margin: "0 0 16px",
};

export const h3: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 2.5,
  textTransform: "uppercase",
  color: C.muted,
  fontFamily: F.display,
  margin: "0 0 6px",
};

// NUMERICS: Tabular Lining/Monospace (font-variant-numeric: tabular-nums)
export const mono = (size = 12, col: string = C.text): React.CSSProperties => ({
  fontFamily: F.mono,
  fontSize: size,
  color: col,
  fontVariantNumeric: "tabular-nums",
});

export const row = (gap = 8): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap,
});

export const col_ = (gap = 8): React.CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap,
});

export const grid = (n: number, gap = 14): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(${n}, 1fr)`,
  gap,
});

// ── Bezier path for SVG skill tree connections ────────────────────────────────
export const bezier = (x1: number, y1: number, x2: number, y2: number, r = 28) => {
  const my = (y1 + y2) / 2;
  return `M${x1} ${y1 + r} C${x1} ${my},${x2} ${my},${x2} ${y2 - r}`;
};

// ── SVG level arc for skill nodes ─────────────────────────────────────────────
export const levelArc = (cx: number, cy: number, r: number, frac: number) => {
  if (frac <= 0) return "";
  if (frac >= 1) return `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r}Z`;
  const a = frac * 2 * Math.PI - Math.PI / 2;
  const x2 = cx + r * Math.cos(a);
  const y2 = cy + r * Math.sin(a);
  return `M${cx} ${cy - r} A${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x2} ${y2}`;
};

// Import guard for React.CSSProperties without importing React everywhere
import type React from "react";
