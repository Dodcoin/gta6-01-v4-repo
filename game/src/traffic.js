// traffic.js - AI cars that follow the road grid, keep lanes and brake for obstacles.
import { createCarMesh, Car } from './vehicles.js';
import { roadLines } from './city.js';
const COLORS = [0xe63946, 0x457b9d, 0x2a9d8f, 0xe9c46a, 0xf4a261, 0x9b5de5, 0x00bbf9, 0xffffff, 0x222222, 0x80ed99];
export class Traffic {
  constructor(scene, rand, count = 15) {
    this.cars = [];
    for (let i = 0; i < count; i++) {
      const kind = i % 5 === 0 ? 'sport' : i % 4 === 0 ? 'van' : 'sedan';
      const mesh = createCarMesh(COLORS[i % COLORS.length], kind); scene.add(mesh);
      const horiz = rand() > 0.5; const line = roadLines[1 + Math.floor(rand() * (roadLines.length - 2))];
      const along = -190 + rand() * 380; const dir = rand() > 0.5 ? 1 : -1; const lane = 2.8 * dir;
      const car = new Car(mesh, horiz ? along : line + lane, horiz ? line + lane : along, horiz ? (dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (dir > 0 ? 0 : Math.PI));
      car.kind = kind; car.cruise = 8 + rand() * 5; car.dir = dir; car.horiz = horiz; car.line = line; car.turnCooldown = 0;
      this.cars.push(car);
    }
  }
  update(dt, playerPos, rand) {
    for (const car of this.cars) {
      let target = car.cruise;
      // brake for player and other cars ahead
      const fx = Math.sin(car.angle), fz = Math.cos(car.angle);
      const relx = playerPos.x - car.pos.x, relz = playerPos.z - car.pos.z; const ahead = relx * fx + relz * fz; const side = Math.abs(relx * fz - relz * fx);
      if (ahead > 0 && ahead < 9 && side < 2.2) target = 0;
      for (const o of this.cars) { if (o === car) continue; const rx = o.pos.x - car.pos.x, rz = o.pos.z - car.pos.z; const a = rx * fx + rz * fz; if (a > 0 && a < 8 && Math.abs(rx * fz - rz * fx) < 2) target = Math.min(target, Math.max(0, o.speed)); }
      car.speed += Math.max(-18 * dt, Math.min(7 * dt, target - car.speed));
      car.pos.x += fx * car.speed * dt; car.pos.z += fz * car.speed * dt;
      car.mesh.rotation.y = car.angle;
      for (const w of car.mesh.userData.wheels) w.rotation.x += car.speed * dt * 2.2;
      car.turnCooldown -= dt;
      // at intersections, sometimes turn
      const nearX = roadLines.some(c => Math.abs(car.pos.x - c) < 2), nearZ = roadLines.some(c => Math.abs(car.pos.z - c) < 2);
      if (nearX && nearZ && car.turnCooldown <= 0 && rand() < 0.35) {
        car.turnCooldown = 4; const turn = rand() > 0.5 ? Math.PI / 2 : -Math.PI / 2; car.angle += turn; car.horiz = !car.horiz;
        // snap to lane centre-ish
        const nx = roadLines.reduce((a, b) => Math.abs(b - car.pos.x) < Math.abs(a - car.pos.x) ? b : a); const nz = roadLines.reduce((a, b) => Math.abs(b - car.pos.z) < Math.abs(a - car.pos.z) ? b : a);
        if (car.horiz) car.pos.z = nz + 2.8 * Math.sign(Math.cos(car.angle) || 1) * (Math.abs(Math.sin(car.angle)) > 0.5 ? 0 : 1); else car.pos.x = nx;
      }
      if (car.pos.x > 215 || car.pos.x < -215 || car.pos.z > 215 || car.pos.z < -215) { car.angle += Math.PI; car.pos.x = Math.max(-210, Math.min(210, car.pos.x)); car.pos.z = Math.max(-210, Math.min(210, car.pos.z)); }
    }
  }
}
