// missions.js - story chain from fixer Marina Sol, plus repeatable side jobs.
import * as THREE from 'three';
export const FIXER = 'Marina Sol';
export const MISSIONS = [
  { id: 'm1', title: 'First Drop', brief: 'Marina: Pick up the package by the east pier and bring it to the plaza fountain. Quick and clean.', pickup: [176, 44], drop: [22, 22], reward: 450, timer: 150, phone: 'Marina: I owe people money, you drive. Package first — questions later.' },
  { id: 'm2', title: 'Hot Wheels', brief: 'Marina: Steal the marked coral sports car and deliver it to the garage on the west side.', stealKind: 'sport', drop: [-176, -44], reward: 800, timer: 170, phone: 'Marina: That coral coupe? Its alarm is loud. So drive louder.' },
  { id: 'm3', title: 'Heat Escape', brief: 'Marina: The pickup went wrong. Lose the police, then reach the safehouse by the beach.', pickup: [-88, 132], drop: [198, -88], reward: 1000, timer: 200, wantedOnPickup: 3, phone: 'Marina: It was a setup! Shake them off and get to the safehouse!' },
  { id: 'm4', title: 'Last Run', brief: 'Marina: One final run across the whole city. Three stars, one timer, freedom at the end.', pickup: [-176, 176], drop: [198, 176], reward: 2000, timer: 190, wantedStart: 3, phone: 'Marina: Last job, Rafi. Cross Serena and we are both free.' },
];
export class MissionSystem {
  constructor(scene) {
    this.index = 0; this.stage = 'pickup'; this.active = false; this.timeLeft = 0; this.done = false; this.sideJob = null;
    this.marker = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 14, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe135, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
    this.marker.position.y = 7; scene.add(this.marker);
    this.ring = new THREE.Mesh(new THREE.RingGeometry(2.4, 3.2, 24), new THREE.MeshBasicMaterial({ color: 0xffe135, side: THREE.DoubleSide })); this.ring.rotation.x = -Math.PI / 2; this.ring.position.y = 0.15; scene.add(this.ring);
  }
  current() { return this.done ? this.sideJob : MISSIONS[this.index]; }
  start(index, onPhone) { this.index = index; const m = MISSIONS[index]; if (!m) { this.done = true; this.startSide(onPhone); return; } this.active = true; this.stage = m.stealKind ? 'steal' : 'pickup'; this.timeLeft = m.timer; if (onPhone) onPhone(m.phone); if (m.wantedStart) this.forceWanted = m.wantedStart; }
  startSide(onPhone) { const drops = [[176, 44], [-132, -132], [88, -176], [198, 88]]; const d = drops[Math.floor(Math.random() * drops.length)]; this.sideJob = { id: 'side', title: 'Side Gig: Quick Delivery', brief: 'Marina: Another fare, another envelope. Deliver it for cash.', pickup: null, drop: d, reward: 250, timer: 120 }; this.active = true; this.stage = 'drop'; if (onPhone) onPhone('Marina: Free roam, kid. Side gigs pay the rent.'); }
  target() { const m = this.current(); if (!m) return null; if (this.stage === 'pickup') return m.pickup; if (this.stage === 'steal') return m.stealPos || null; return m.drop; }
  objectiveText() { const m = this.current(); if (!m) return 'Free roam — enjoy Costa Serena.'; if (!this.active) return m.brief; const t = Math.max(0, Math.ceil(this.timeLeft)); if (this.stage === 'pickup') return `${m.title}: Pick up the package  (${t}s)`; if (this.stage === 'steal') return `${m.title}: Steal the marked coral sports car  (${t}s)`; return `${m.title}: Reach the glowing drop-off  (${t}s)`; }
  update(dt, playerPos, events) {
    const m = this.current(); if (!this.active || !m) { this.marker.visible = false; this.ring.visible = false; return; }
    if (this.stage !== 'steal' || m.stealPos) { const t = this.target(); if (t) { this.marker.visible = true; this.ring.visible = true; this.marker.position.x = t[0]; this.marker.position.z = t[1]; this.ring.position.x = t[0]; this.ring.position.z = t[1]; this.marker.material.color.setHex(this.stage === 'drop' ? 0x33ff88 : 0xffe135); } }
    else { this.marker.visible = false; this.ring.visible = false; }
    this.timeLeft -= dt; if (this.timeLeft <= 0) { events.fail(m); this.active = false; return; }
    const t = this.target(); if (t && Math.hypot(playerPos.x - t[0], playerPos.z - t[1]) < 5) {
      if (this.stage === 'pickup') { this.stage = 'drop'; events.pickup(m); if (m.wantedOnPickup) events.setWanted(m.wantedOnPickup); }
      else if (this.stage === 'drop') { events.complete(m); this.active = false; if (this.done) this.startSide(events.phone); else if (this.index + 1 < MISSIONS.length) this.start(this.index + 1, events.phone); else { this.done = true; this.startSide(events.phone); } }
    }
  }
}
