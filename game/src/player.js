// player.js - third-person on-foot character built from boxes, animated limbs.
import * as THREE from 'three';
import { collide } from './city.js';
export class Player {
  constructor(scene) {
    this.group = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: 0xf2b98a }); const shirt = new THREE.MeshLambertMaterial({ color: 0xff6b35 }); const pants = new THREE.MeshLambertMaterial({ color: 0x2255aa });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.75, 0.34), shirt); torso.position.y = 1.05; this.group.add(torso);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), skin); head.position.y = 1.68; this.group.add(head);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.48), new THREE.MeshLambertMaterial({ color: 0xffe135 })); cap.position.y = 1.93; this.group.add(cap);
    this.armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), shirt); this.armL.position.set(-0.42, 1.05, 0); this.group.add(this.armL);
    this.armR = this.armL.clone(); this.armR.position.x = 0.42; this.group.add(this.armR);
    this.legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), pants); this.legL.position.set(-0.16, 0.35, 0); this.group.add(this.legL);
    this.legR = this.legL.clone(); this.legR.position.x = 0.16; this.group.add(this.legR);
    this.group.position.set(6, 0, 10); scene.add(this.group);
    this.pos = this.group.position; this.angle = 0; this.health = 100; this.walkPhase = 0; this.inCar = null; this.dead = false;
  }
  update(dt, input, camYaw, colliders) {
    if (this.inCar) { this.group.visible = false; return; }
    this.group.visible = true;
    let mx = 0, mz = 0;
    if (input.down('KeyW')) mz += 1; if (input.down('KeyS')) mz -= 1; if (input.down('KeyA')) mx -= 1; if (input.down('KeyD')) mx += 1;
    const moving = mx !== 0 || mz !== 0; const run = input.down('ShiftLeft') || input.down('ShiftRight');
    const speed = run ? 10 : 5.2;
    if (moving) {
      const len = Math.hypot(mx, mz); mx /= len; mz /= len;
      const sin = Math.sin(camYaw), cos = Math.cos(camYaw);
      const wx = mx * cos - mz * sin, wz = -mx * sin - mz * cos;
      // camera-relative: forward is -sin/-cos of yaw handled in main via yaw sign; use direct transform
      this.pos.x += wx * speed * dt; this.pos.z += wz * speed * dt;
      this.angle = Math.atan2(wx, wz); this.walkPhase += dt * (run ? 13 : 9);
    } else this.walkPhase *= 0.8;
    const s = Math.sin(this.walkPhase) * 0.55;
    this.legL.rotation.x = s; this.legR.rotation.x = -s; this.armL.rotation.x = -s * 0.8; this.armR.rotation.x = s * 0.8;
    this.group.rotation.y = this.angle;
    collide(this.pos, 0.6, colliders);
  }
}
