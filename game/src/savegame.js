// savegame.js - localStorage persistence for money, mission progress and position.
const KEY = 'costa-serena-save-v1';
export function loadSave() { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && typeof s.money === 'number' ? s : null; } catch { return null; } }
export function storeSave(data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} }
export function clearSave() { try { localStorage.removeItem(KEY); } catch {} }
