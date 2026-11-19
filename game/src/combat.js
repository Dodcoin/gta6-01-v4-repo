// combat.js - hitscan pistol with tracer, muzzle flash and damage reactions.
import * as THREE from 'three';
export class Combat {
  constructor(scene, camera, audio) { this.scene = scene; this.camera = camera; this.audio = audio; this.cooldown = 0; this.tracers = []; this.ammo = Infinity; this.weapon = 'Pistol'; }
  update(dt) { this.cooldown -= dt; for (let i = this.tracers.length - 1; i >= 0; i--) { const t = this.tracers[i]; t.life -= dt; t.line.material.opacity = Math.max(0, t.life * 3); if (t.life <= 0) { this.scene.remove(t.line); this.tracers.splice(i, 1); } } }
  shoot(origin, dir, targets, onHit) {
    if (this.cooldown > 0) return false; this.cooldown = 0.22; this.audio.ensure(); this.audio.shot();
    const end = origin.clone().add(dir.clone().multiplyScalar(90));
    let best = null, bestD = 90;
    for (const t of targets) { const to = t.pos.clone().sub(origin); const along = to.dot(dir); if (along < 0 || along > bestD) continue; const perp = to.clone().sub(dir.clone().multiplyScalar(along)).length(); const r = t.radius || 1.2; if (perp < r) { best = t; bestD = along; } }
    const hitPoint = best ? origin.clone().add(dir.clone().multiplyScalar(bestD)) : end;
    const geo = new THREE.BufferGeometry().setFromPoints([origin.clone().add(new THREE.Vector3(0, -0.1, 0)), hitPoint]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffe066, transparent: true, opacity: 1 })); this.scene.add(line); this.tracers.push({ line, life: 0.25 });
    if (best && onHit) onHit(best);
    return true;
  }
}
