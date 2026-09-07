// WCAG contrast ratio math, pure and DOM-free, so the browser tool and
// `node --test` run the identical implementation. No dependency on any
// other file here — this could be lifted out whole.
//
// Phase 14 (roadmap §4.14). Advisory only: nothing in this repository wires
// this into a gate. It backs a live warning in theme-creator.html that a
// person can see and still choose to ignore.

// Accepts "#abc", "abc", "#aabbcc", "aabbcc", any case. Returns null for
// anything else rather than throwing — a person mid-keystroke in a hex
// field passes through invalid strings on every character before landing
// on a valid one, and the caller decides what an unparsable value means
// for its readout (typically: no verdict yet, not a warning).
export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// WCAG's own piecewise sRGB-to-linear step, applied per channel.
function linearChannel(c8) {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

// Relative luminance, 0 (black) to 1 (white). Accepts either a hex string
// or an already-parsed {r,g,b}, since the caller sometimes has one and
// sometimes the other.
export function relativeLuminance(color) {
  const rgb = typeof color === 'string' ? hexToRgb(color) : color;
  if (!rgb) return null;
  const r = linearChannel(rgb.r), g = linearChannel(rgb.g), b = linearChannel(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// (lighter + 0.05) / (darker + 0.05) — symmetric by construction, since the
// caller never has to know which side is lighter.
export function contrastRatio(colorA, colorB) {
  const la = relativeLuminance(colorA);
  const lb = relativeLuminance(colorB);
  if (la === null || lb === null) return null;
  const lighter = Math.max(la, lb), darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// >= threshold passes, matching WCAG's own boundary (a ratio of exactly
// 3.0 against a 3.0 threshold is a pass, not a near-miss).
export function meetsThreshold(ratio, threshold) {
  if (ratio === null) return null;
  return ratio >= threshold;
}
