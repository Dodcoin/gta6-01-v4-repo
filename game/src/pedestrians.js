// pedestrians.js - sidewalk walkers who flee from danger.
import * as THREE from 'three';
import { roadLines } from './city.js';
const COLORS = [0xff8fab, 0x80ed99, 0xffd60a, 0x90e0ef, 0xf4a261, 0xc77dff, 0xffffff, 0x06d6a0];
export class Pedestrians {
  constructor(scene, rand, count = 26) {
    this.list = [];
    for (let i = 0; i < count; i++) {
      const g = new THREE.Group(); const c = COLORS[i % COLORS.length];
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.3), new THREE.MeshLambertMaterial({ color: c })); body.position.y = 1.0; g.add(body);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), new THREE.MeshLambertMaterial({ color: 0xeec39a })); head.position.y = 1.62; g.add(head);
      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.26), new THREE.MeshLambertMaterial({ color: 0x333355 })); legs.position.y = 0.3; g.add(legs);
      const horiz = rand() > 0.5; const line = roadLines[1 + Math.floor(rand() * (roadLines.length - 2))];
      const along = -190 + rand() * 380; const off = (rand() > 0.5 ? 8.2 : -8.2);
      g.position.set(horiz ? along : line + off, 0, horiz ? line + off : along);
      scene.add(g);
      this.list.push({ g, horiz, dir: rand() > 0.5 ? 1 : -1, speed: 1.4 + rand() * 1.2, flee: 0, phase: rand() * 6 });
    }
  }
  panicNear(x, z, r = 16) { for (const p of this.list) if (p.g.position.distanceTo(new THREE.Vector3(x, 0, z)) < r) p.flee = 3; }
  update(dt, threats) {
    for (const p of this.list) {
      let fleeing = p.flee > 0; if (p.flee > 0) p.flee -= dt;
      for (const t of threats) { const d = Math.hypot(p.g.position.x - t.x, p.g.position.z - t.z); if (d < 9) fleeing = true; }
      const sp = fleeing ? 6.5 : p.speed;
      if (fleeing) { let best = null, bd = 1e9; for (const t of threats) { const d = Math.hypot(p.g.position.x - t.x, p.g.position.z - t.z); if (d < bd) { bd = d; best = t; } } if (best) { const dx = p.g.position.x - best.x, dz = p.g.position.z - best.z, l = Math.hypot(dx, dz) || 1; p.g.position.x += dx / l * sp * dt; p.g.position.z += dz / l * sp * dt; p.g.rotation.y = Math.atan2(dx, dz); } }
      else { if (p.horiz) p.g.position.x += p.dir * sp * dt; else p.g.position.z += p.dir * sp * dt; if (p.g.position.x > 205 || p.g.position.x < -205 || p.g.position.z > 205 || p.g.position.z < -205) p.dir *= -1; p.g.rotation.y = p.horiz ? (p.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (p.dir > 0 ? 0 : Math.PI); }
      p.phase += dt * sp * 3; p.g.position.y = Math.abs(Math.sin(p.phase)) * 0.06;
      p.g.position.x = Math.max(-212, Math.min(238, p.g.position.x)); p.g.position.z = Math.max(-212, Math.min(212, p.g.position.z));
    }
  }
}
