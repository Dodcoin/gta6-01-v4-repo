// city.js - procedural tropical city: road grid, buildings, palms, beach and sea.
import * as THREE from 'three';
export const ROAD_SPACING = 44, ROAD_W = 12, CITY_EXT = 198;
export const roadLines = [];
for (let c = -CITY_EXT; c <= CITY_EXT; c += ROAD_SPACING) roadLines.push(c);
export function isOnRoad(x, z) { return roadLines.some(c => Math.abs(x - c) < ROAD_W / 2) || roadLines.some(c => Math.abs(z - c) < ROAD_W / 2); }
function windowTexture(rand, base) {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; const g = cv.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 64, 128);
  for (let y = 6; y < 120; y += 12) for (let x = 6; x < 56; x += 12) { g.fillStyle = rand() > 0.35 ? '#ffe9a8' : '#2b4a5e'; g.fillRect(x, y, 7, 8); }
  const t = new THREE.CanvasTexture(cv); return t;
}
export function buildCity(scene, rand) {
  const colliders = [];
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x8fbf6a });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(560, 560), groundMat); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; scene.add(ground);
  // sand beach + sea on the east edge
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(70, 560), new THREE.MeshLambertMaterial({ color: 0xf2d492 })); sand.rotation.x = -Math.PI / 2; sand.position.set(232, 0.01, 0); scene.add(sand);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(180, 560), new THREE.MeshLambertMaterial({ color: 0x1e9bb5 })); sea.rotation.x = -Math.PI / 2; sea.position.set(340, 0.02, 0); scene.add(sea);
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x3a3f46 }); const sideMat = new THREE.MeshLambertMaterial({ color: 0xc9c2b4 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const c of roadLines) {
    for (const horiz of [false, true]) {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(horiz ? 440 : ROAD_W, horiz ? ROAD_W : 440), roadMat); road.rotation.x = -Math.PI / 2; road.position.set(horiz ? 0 : c, 0.02, horiz ? c : 0); scene.add(road);
      const side1 = new THREE.Mesh(new THREE.PlaneGeometry(horiz ? 440 : 2.4, horiz ? 2.4 : 440), sideMat); side1.rotation.x = -Math.PI / 2; side1.position.set(horiz ? 0 : c - ROAD_W / 2 - 1.2, 0.03, horiz ? c - ROAD_W / 2 - 1.2 : 0); scene.add(side1);
      const side2 = side1.clone(); if (horiz) side2.position.z = c + ROAD_W / 2 + 1.2; else side2.position.x = c + ROAD_W / 2 + 1.2; scene.add(side2);
      for (let d = -210; d < 215; d += 14) { const dash = new THREE.Mesh(new THREE.PlaneGeometry(horiz ? 5 : 0.35, horiz ? 0.35 : 5), lineMat); dash.rotation.x = -Math.PI / 2; dash.position.set(horiz ? d : c, 0.04, horiz ? c : d); scene.add(dash); }
    }
  }
  const palette = ['#f7e8c9', '#f4b8a0', '#a8d8ea', '#ffd166', '#f1fa8c', '#c3f0ca', '#ffc6ff', '#ffffff'];
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8a5a33 }); const leafMat = new THREE.MeshLambertMaterial({ color: 0x2eaa4f });
  for (let bx = 0; bx < roadLines.length - 1; bx++) for (let bz = 0; bz < roadLines.length - 1; bz++) {
    const cx = (roadLines[bx] + roadLines[bx + 1]) / 2, cz = (roadLines[bz] + roadLines[bz + 1]) / 2;
    if (cx > 175) continue;
    const lots = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < lots; i++) {
      const w = 12 + rand() * 10, d = 12 + rand() * 10, h = 10 + rand() * 38;
      const x = cx + (rand() - 0.5) * 10, z = cz + (rand() - 0.5) * 10;
      const tex = windowTexture(rand, palette[Math.floor(rand() * palette.length)]);
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ map: tex }));
      b.position.set(x, h / 2, z); scene.add(b);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 1, d + 1), new THREE.MeshLambertMaterial({ color: 0xe76f51 })); roof.position.set(x, h + 0.5, z); scene.add(roof);
      colliders.push({ x, z, hw: w / 2 + 0.6, hd: d / 2 + 0.6 });
    }
    for (let p = 0; p < 3; p++) {
      const px = cx + (rand() - 0.5) * 26, pz = cz + (rand() - 0.5) * 26; if (isOnRoad(px, pz)) continue;
      const palm = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 5.5, 6), trunkMat); trunk.position.y = 2.75; palm.add(trunk);
      for (let l = 0; l < 5; l++) { const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.6, 4), leafMat); leaf.position.y = 5.8; leaf.rotation.z = 1.15; leaf.rotation.y = l / 5 * Math.PI * 2; leaf.translateY(1.2); palm.add(leaf); }
      palm.position.set(px, 0, pz); scene.add(palm);
    }
  }
  // beach palms
  for (let z = -200; z < 210; z += 22) { const palm = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 6, 6), trunkMat); trunk.position.y = 3; palm.add(trunk); const crown = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.6, 6), leafMat); crown.position.y = 6.4; palm.add(crown); palm.position.set(214 + (rand() - 0.5) * 8, 0, z); scene.add(palm); }
  // street lamps
  const lampMat = new THREE.MeshLambertMaterial({ color: 0x445566 }); const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff2b0 });
  for (const c of roadLines) for (let d = -198; d < 200; d += 44) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5, 5), lampMat); pole.position.set(c + 7, 2.5, d); scene.add(pole); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), bulbMat); bulb.position.set(c + 7, 5.1, d); scene.add(bulb); }
  // glowing mission marker helper geometry is in missions; plaza fountain at centre
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.4, 20), new THREE.MeshLambertMaterial({ color: 0xffe8b0 })); plaza.position.set(22, 0.2, 22); scene.add(plaza);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.6, 16), new THREE.MeshLambertMaterial({ color: 0x33bbdd })); water.position.set(22, 0.5, 22); scene.add(water);
  return { colliders };
}
export function collide(pos, radius, colliders) {
  for (const c of colliders) { const dx = pos.x - c.x, dz = pos.z - c.z; if (Math.abs(dx) < c.hw + radius && Math.abs(dz) < c.hd + radius) { if (c.hw - Math.abs(dx) < c.hd - Math.abs(dz)) pos.x = c.x + Math.sign(dx || 1) * (c.hw + radius); else pos.z = c.z + Math.sign(dz || 1) * (c.hd + radius); } }
  pos.x = Math.max(-215, Math.min(245, pos.x)); pos.z = Math.max(-215, Math.min(215, pos.z));
}
