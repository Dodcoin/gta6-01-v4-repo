// minimap.js - 2D canvas minimap: roads, beach, player, traffic, police, mission.
import { roadLines } from './city.js';
export function drawMinimap(ctx, state) {
  const S = 150, c = S / 2, scale = S / 460; ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = '#79b657'; ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = '#f2d492'; ctx.fillRect(c + 198 * scale, 0, 30, S); ctx.fillStyle = '#1e9bb5'; ctx.fillRect(c + 228 * scale, 0, 40, S);
  ctx.strokeStyle = '#3a3f46'; ctx.lineWidth = 4;
  for (const l of roadLines) { ctx.beginPath(); ctx.moveTo(c + l * scale, 0); ctx.lineTo(c + l * scale, S); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, c + l * scale); ctx.lineTo(S, c + l * scale); ctx.stroke(); }
  const dot = (x, z, col, r = 3) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(c + x * scale, c + z * scale, r, 0, 7); ctx.fill(); };
  for (const t of state.traffic) dot(t.pos.x, t.pos.z, '#dddddd', 2);
  for (const p of state.police) dot(p.pos.x, p.pos.z, Math.floor(performance.now() / 300) % 2 ? '#ff3344' : '#3366ff', 3.5);
  if (state.target) { dot(state.target[0], state.target[1], '#ffe135', 5); ctx.strokeStyle = '#ffe135'; ctx.beginPath(); ctx.arc(c + state.target[0] * scale, c + state.target[1] * scale, 8, 0, 7); ctx.stroke(); }
  // player arrow
  ctx.save(); ctx.translate(c + state.player.x * scale, c + state.player.z * scale); ctx.rotate(Math.atan2(Math.sin(state.angle), Math.cos(state.angle)) * 0 + state.angle); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c, c, c - 1, 0, 7); ctx.stroke();
}
