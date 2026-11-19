// shots.js - deterministic screenshot scene setup from ?shot=&seed= parameters.
export function parseShot() {
  const q = new URLSearchParams(location.search); const name = q.get('shot');
  if (!name) return null; const seed = Number(q.get('seed') || 7) || 7;
  return { name, seed };
}
export function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
