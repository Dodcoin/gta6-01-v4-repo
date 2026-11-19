// vehicles.js - low-poly car models and arcade driving physics.
import * as THREE from 'three';
export function createCarMesh(color, kind = 'sedan') {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const glassMat = new THREE.MeshLambertMaterial({ color: 0x223344 });
  const len = kind === 'sport' ? 4.6 : kind === 'van' ? 5.2 : 4.2, h = kind === 'van' ? 1.5 : 0.85;
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, h, len), bodyMat); body.position.y = 0.65; g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, len * 0.45), kind === 'police' ? new THREE.MeshLambertMaterial({ color: 0xffffff }) : glassMat); cabin.position.set(0, 0.65 + h / 2 + 0.25, -0.2); g.add(cabin);
  if (kind === 'sport') { const wing = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.5), bodyMat); wing.position.set(0, 1.35, -len / 2 + 0.3); g.add(wing); }
  if (kind === 'police') { const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.5), new THREE.MeshBasicMaterial({ color: 0xff2244 })); bar.name = 'lightbar'; bar.position.set(0, 1.85, -0.2); g.add(bar); }
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 10); const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  g.userData.wheels = [];
  for (const [wx, wz] of [[-0.95, len / 2 - 0.7], [0.95, len / 2 - 0.7], [-0.95, -len / 2 + 0.7], [0.95, -len / 2 + 0.7]]) { const w = new THREE.Mesh(wheelGeo, wheelMat); w.rotation.z = Math.PI / 2; w.position.set(wx, 0.38, wz); g.add(w); g.userData.wheels.push(w); }
  const hl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffcc })); hl.position.set(0, 0.7, len / 2 + 0.03); g.add(hl);
  return g;
}
export class Car {
  constructor(mesh, x, z, angle) { this.mesh = mesh; this.pos = mesh.position; this.pos.set(x, 0, z); this.angle = angle; this.speed = 0; this.steer = 0; this.kind = 'sedan'; this.health = 100; }
  drive(dt, throttle, steerInput, brake, handbrake) {
    const maxF = 26, maxR = -9;
    if (throttle > 0) this.speed += 14 * dt * throttle; else if (throttle < 0) this.speed += (this.speed > 0.5 ? -22 * dt : 9 * dt * throttle);
    if (brake) this.speed -= Math.sign(this.speed) * 26 * dt;
    if (!throttle && !brake) this.speed -= this.speed * 0.55 * dt;
    if (handbrake) this.speed -= this.speed * 2.2 * dt;
    this.speed = Math.max(maxR, Math.min(maxF, this.speed));
    if (Math.abs(this.speed) < 0.02 && !throttle) this.speed = 0;
    const grip = 1 / (1 + Math.abs(this.speed) * 0.045);
    this.steer += ((steerInput * 0.55 * grip) - this.steer) * Math.min(1, dt * 8);
    if (Math.abs(this.speed) > 0.1) this.angle += this.steer * this.speed * dt * 0.42 * (handbrake ? 1.7 : 1);
    this.pos.x += Math.sin(this.angle) * this.speed * dt; this.pos.z += Math.cos(this.angle) * this.speed * dt;
    this.mesh.rotation.y = this.angle;
    for (const w of this.mesh.userData.wheels) w.rotation.x += this.speed * dt * 2.4;
  }
  place(x, z, angle, speed = 0) { this.pos.set(x, 0, z); this.angle = angle; this.speed = speed; this.mesh.rotation.y = angle; }
}
