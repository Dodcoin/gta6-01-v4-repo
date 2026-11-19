// police.js - police cars that spawn at edges, chase, ram and block the player.
import * as THREE from 'three';
import { createCarMesh, Car } from './vehicles.js';
export class Police {
  constructor(scene) { this.scene = scene; this.units = []; this.flash = 0; }
  ensureCount(n, playerPos) {
    while (this.units.length < n) {
      const mesh = createCarMesh(0x1b2a4a, 'police'); this.scene.add(mesh);
      const a = this.units.length * 2.1 + 0.6; const x = playerPos.x + Math.sin(a) * 55, z = playerPos.z + Math.cos(a) * 55;
      const car = new Car(mesh, Math.max(-205, Math.min(205, x)), Math.max(-205, Math.min(205, z)), 0); car.kind = 'police'; car.cruise = 24;
      this.units.push(car);
    }
    while (this.units.length > n) { const u = this.units.pop(); this.scene.remove(u.mesh); }
  }
  update(dt, targetPos, targetSpeed) {
    this.flash += dt;
    let anySee = false;
    for (const u of this.units) {
      const dx = targetPos.x - u.pos.x, dz = targetPos.z - u.pos.z; const dist = Math.hypot(dx, dz);
      if (dist < 70) anySee = true;
      const want = Math.atan2(dx, dz); let diff = want - u.angle; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
      const steer = Math.max(-0.6, Math.min(0.6, diff * 1.4));
      const throttle = dist > 4 ? 1 : 0.2;
      u.drive(dt, throttle, steer / 0.55, false, false);
      if (u.speed < 6 && dist > 10) u.speed += 10 * dt; // keep pursuit lively
      const bar = u.mesh.getObjectByName('lightbar'); if (bar) bar.material.color.setHex(Math.floor(this.flash * 4) % 2 ? 0x2244ff : 0xff2244);
    }
    return anySee;
  }
  nearestDist(pos) { let d = 1e9; for (const u of this.units) d = Math.min(d, Math.hypot(u.pos.x - pos.x, u.pos.z - pos.z)); return d; }
}
