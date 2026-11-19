// main.js - boot, game loop and wiring for Costa Serena (original tropical crime game).
import * as THREE from 'three';
import { buildCity, collide } from './city.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { createCarMesh, Car } from './vehicles.js';
import { Traffic } from './traffic.js';
import { Pedestrians } from './pedestrians.js';
import { Police } from './police.js';
import { Wanted } from './wanted.js';
import { Combat } from './combat.js';
import { MissionSystem, MISSIONS } from './missions.js';
import { Hud } from './hud.js';
import { drawMinimap } from './minimap.js';
import { GameAudio } from './audio.js';
import { loadSave, storeSave, clearSave } from './savegame.js';
import { parseShot, mulberry } from './shots.js';

const shot = parseShot(); const rand = mulberry(shot ? shot.seed * 1000 + 17 : 42);
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x87ceeb);
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xaee2ff, 90, 340);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 900); camera.position.set(0, 6, 14);
scene.add(new THREE.HemisphereLight(0xcfefff, 0xffe0b0, 1.15));
const sun = new THREE.DirectionalLight(0xffe3a3, 1.6); sun.position.set(80, 120, 40); scene.add(sun);
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(430, 12, 8), new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide })); scene.add(skyDome);

const { colliders } = buildCity(scene, rand);
const input = new Input(canvas); const audio = new GameAudio(); const hud = new Hud();
const player = new Player(scene); const wanted = new Wanted(); const police = new Police(scene);
const traffic = new Traffic(scene, rand, 15); const peds = new Pedestrians(scene, rand, 26);
const combat = new Combat(scene, camera, audio); const missions = new MissionSystem(scene);

// parked stealable cars
const parked = [];
const parkSpots = [[14, -22], [-30, 66], [58, -66], [-74, -22], [100, 110], [-120, 22], [30, 154], [-160, -110]];
parkSpots.forEach(([x, z], i) => { const kind = i === 2 ? 'van' : 'sedan'; const mesh = createCarMesh([0x06d6a0, 0xef476f, 0x118ab2, 0xffd166, 0x8338ec, 0xfb5607, 0xffffff, 0x3a86ff][i], kind); scene.add(mesh); const car = new Car(mesh, x, z, i % 2 ? 0 : Math.PI / 2); car.kind = kind; car.parked = true; parked.push(car); });
// mission 2 target: coral sports car parked visibly
const coralMesh = createCarMesh(0xff6f61, 'sport'); scene.add(coralMesh); const coralCar = new Car(coralMesh, 66, 66, Math.PI / 2); coralCar.kind = 'sport'; coralCar.isTarget = true; parked.push(coralCar);
MISSIONS[1].stealPos = [66, 66];
// The coral target also gets a floating beacon so players can spot it across the plaza.
const beacon = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3, 6), new THREE.MeshBasicMaterial({ color: 0xff6f61 }));
beacon.position.set(66, 5.2, 66); beacon.rotation.x = Math.PI; scene.add(beacon);

let money = 120, paused = false, started = false, bustTimer = 0, shootDmgTimer = 0, saveTimer = 0;
let camYaw = 0.6, camDist = 9, lastCrimeAt = 0;
const save = loadSave();
if (save && !shot) { hud.el('continue-btn').style.display = 'inline-block'; }

function allCars() { return [...parked, ...traffic.cars, ...police.units]; }
function currentPos() { return player.inCar ? player.inCar.pos : player.pos; }
function currentSpeed() { return player.inCar ? player.inCar.speed : 0; }
function phone(t) { hud.showPhone(t); }
function respawn(reason) {
  money = Math.max(0, money - 200); wanted.setLevel(0); police.ensureCount(0, player.pos); player.health = 100;
  if (player.inCar) { player.inCar = null; }
  player.pos.set(-22, 0, -30); player.group.visible = true; hud.showBanner(reason + '  -$200'); audio.crash();
}
function saveNow() { storeSave({ money, missionIndex: missions.index, done: missions.done, x: currentPos().x, z: currentPos().z }); }
function startGame(useSave) {
  audio.ensure(); audio.click(); started = true; hud.title.style.display = 'none';
  if (useSave && save) { money = save.money; missions.index = save.missionIndex || 0; missions.done = !!save.done; if (save.x !== undefined) player.pos.set(save.x, 0, save.z); }
  missions.start(missions.index, phone); if (missions.forceWanted) { wanted.setLevel(missions.forceWanted); missions.forceWanted = null; }
  hud.showBanner('Welcome to Costa Serena');
}
hud.el('start-btn').addEventListener('click', () => { clearSave(); startGame(false); });
hud.el('continue-btn').addEventListener('click', () => startGame(true));
hud.el('resume-btn').addEventListener('click', () => { paused = false; hud.pause.style.display = 'none'; audio.click(); });
hud.el('restart-btn').addEventListener('click', () => { clearSave(); location.reload(); });
addEventListener('keydown', e => {
  if ((e.code === 'Escape' || e.code === 'KeyP') && started) { paused = !paused; hud.pause.style.display = paused ? 'flex' : 'none'; }
  if (e.code === 'KeyM') { audio.muted = !audio.muted; hud.showBanner(audio.muted ? 'Muted' : 'Sound on', 1.2); }
  audio.ensure();
});
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

// ---- screenshot poses (deterministic) ----
if (shot) {
  started = true; hud.title.style.display = 'none'; missions.start(0, phone);
  const sportMesh = createCarMesh(0xffd60a, 'sport'); scene.add(sportMesh); const sport = new Car(sportMesh, -70, 22, Math.PI / 2); sport.kind = 'sport'; parked.push(sport);
  if (shot.name === 'cover') { player.inCar = sport; sport.place(-70, 22, Math.PI / 2, 15); input.yaw = -Math.PI / 2; hud.showPhone('Marina: Package first — questions later. The pier, now!', 9999); traffic.cars[0].place(-38, 18.5, Math.PI / 2, 9); traffic.cars[1].place(-6, 25.5, -Math.PI / 2, 8); traffic.cars[2].place(-100, 25.5, Math.PI / 2, 10); }
  if (shot.name === 'chase') { player.inCar = sport; sport.place(-30, 22, Math.PI / 2, 12); wanted.setLevel(3); police.ensureCount(2, sport.pos); police.units[0].place(-37, 17.8, Math.PI / 2, 11); police.units[1].place(-37.5, 26.4, Math.PI / 2, 11); input.yaw = -Math.PI / 2; hud.showPhone('Marina: Three stars?! Lose them, Rafi — do NOT stop!', 9999); }
  if (shot.name === 'foot') { player.pos.set(14, 0, 14); player.angle = 0.785; input.yaw = -2.36; const spots = [[19, 26], [27, 22], [24, 28], [15, 27], [28, 27], [12, 24]]; spots.forEach(([x, z], i) => { const p = peds.list[i]; p.g.position.set(x, 0, z); p.speed = 0; p.g.rotation.y = -2.2; }); hud.showPhone('Marina: Meet me by the fountain when it is done.', 9999); }
  if (shot.name === 'mission') { missions.stage = 'drop'; player.inCar = sport; sport.place(22, 46, Math.PI, 3); input.yaw = 0; hud.showBanner('Almost there — deliver the package!', 9999); hud.showPhone('Marina: That is the spot. Park in the glow, Rafi.', 9999); }
}

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!started || paused) { renderer.render(scene, camera); return; }
  const pos = currentPos();
  // --- player / driving ---
  if (player.inCar) {
    player.group.visible = false; // driver sits inside the car, not on its roof
    const car = player.inCar; const wasSpeed = Math.abs(car.speed);
    let throttle = 0, steer = 0; if (input.down('KeyW')) throttle = 1; if (input.down('KeyS')) throttle = -1;
    if (input.down('KeyA')) steer = 1; if (input.down('KeyD')) steer = -1;
    car.drive(dt, throttle, steer, false, input.down('Space'));
    collide(car.pos, 1.6, colliders);
    // hit pedestrians / cars = crime + damage
    for (const p of peds.list) { if (Math.abs(car.speed) > 3 && p.g.position.distanceTo(car.pos) < 1.8) { p.flee = 4; if (now - lastCrimeAt > 3000) { wanted.commit(1); lastCrimeAt = now; audio.crash(); hud.showBanner('You hit a pedestrian!'); } } }
    for (const o of allCars()) { if (o !== car && o.pos.distanceTo(car.pos) < 2.6 && Math.abs(car.speed) > 6) { car.speed *= 0.55; if (now - lastCrimeAt > 2500) { wanted.commit(0.6); lastCrimeAt = now; audio.crash(); } } }
    if (input.down('KeyF') && Math.abs(car.speed) < 1.5) { player.inCar = null; player.pos.set(car.pos.x + 2.2, 0, car.pos.z); player.group.visible = true; }
    player.pos.copy(car.pos);
  } else {
    camYaw = input.yaw; player.update(dt, input, camYaw, colliders);
    // car collisions on foot: stay out of cars
    for (const c of allCars()) { const d = player.pos.distanceTo(c.pos); if (d < 2) { const push = 2 - d; player.pos.x += (player.pos.x - c.pos.x) * push * 0.5; player.pos.z += (player.pos.z - c.pos.z) * push * 0.5; } }
    // enter car
    let near = null, nd = 4;
    for (const c of [...parked, ...traffic.cars]) { const d = player.pos.distanceTo(c.pos); if (d < nd) { nd = d; near = c; } }
    hud.setPrompt(near ? 'Press F to ' + (near.parked || traffic.cars.includes(near) ? 'steal / enter car' : 'enter car') : (missions.stage === 'steal' ? 'Find the coral sports car — follow the minimap' : ''));
    if (near && input.down('KeyF')) {
      player.inCar = near; near.speed = 0; audio.click();
      const ti = traffic.cars.indexOf(near); if (ti >= 0) traffic.cars.splice(ti, 1);
      if (near.isTarget && missions.stage === 'steal') { missions.stage = 'drop'; wanted.commit(1); hud.showBanner('Alarm! Get the car to the garage!'); }
      else if (now - lastCrimeAt > 2000) { wanted.commit(0.55); lastCrimeAt = now; }
      hud.setPrompt('');
    }
    // shooting
    if (input.consumeClick()) {
      const dir = new THREE.Vector3(-Math.sin(camYaw) * Math.cos(input.pitch), -Math.sin(input.pitch) * 0.4 + 0.05, -Math.cos(camYaw) * Math.cos(input.pitch)).normalize();
      const origin = player.pos.clone().add(new THREE.Vector3(0, 1.5, 0));
      const targets = [...peds.list.map(p => ({ pos: p.g.position, radius: 1.1, kind: 'ped', ref: p })), ...police.units.map(u => ({ pos: u.pos, radius: 2, kind: 'police', ref: u }))];
      combat.shoot(origin, dir, targets, hit => { wanted.commit(1); peds.panicNear(pos.x, pos.z, 22); if (hit.kind === 'ped') hit.ref.flee = 5; if (hit.kind === 'police') { hit.ref.speed = 0; } });
    } else input.consumeClick();
  }
  // --- world sim ---
  traffic.update(dt, pos, rand); peds.update(dt, [{ x: pos.x, z: pos.z }, ...police.units.map(u => ({ x: u.pos.x, z: u.pos.z }))]);
  const wantCount = wanted.level === 0 ? 0 : wanted.level <= 2 ? wanted.level : wanted.level + 1;
  police.ensureCount(wantCount, pos);
  const seen = police.update(dt, pos, Math.abs(currentSpeed()));
  wanted.update(dt, seen);
  // police shooting back at 3+ stars
  if (wanted.level >= 3 && seen) { shootDmgTimer -= dt; if (shootDmgTimer <= 0 && police.nearestDist(pos) < 26) { shootDmgTimer = 1.1; player.health -= 6; audio.shot(); } }
  // bust check
  const bustRange = player.inCar ? 5 : 3.2;
  const slowEnough = Math.abs(currentSpeed()) < 2;
  if (wanted.level > 0 && police.nearestDist(pos) < bustRange && slowEnough) {
    bustTimer += dt;
    if (bustTimer > 2.5) { bustTimer = 0; respawn('BUSTED! The clinic patched you up.'); }
  } else bustTimer = Math.max(0, bustTimer - dt);
  if (!player.inCar && player.health < 100) player.health = Math.min(100, player.health + dt * 2.5);
  if (player.inCar) player.health = Math.min(100, player.health + dt * 1.2);
  if (player.health <= 0) respawn('WASTED! The clinic patched you up.');
  combat.update(dt);
  // --- missions ---
  missions.update(dt, pos, {
    phone, pickup: m => { audio.pickup(); hud.showBanner('Package picked up!'); },
    fail: m => { hud.showBanner('MISSION FAILED — retrying: ' + m.title); missions.start(missions.index, phone); },
    complete: m => { money += m.reward; audio.pickup(); hud.showBanner('MISSION COMPLETE  +$' + m.reward); saveNow(); },
    setWanted: n => wanted.setLevel(n),
  });
  if (missions.forceWanted) { wanted.setLevel(missions.forceWanted); missions.forceWanted = null; }
  // --- camera ---
  const target = pos.clone().add(new THREE.Vector3(0, 1.6, 0));
  if (player.inCar) {
    const car = player.inCar; const back = new THREE.Vector3(Math.sin(car.angle), 0, Math.cos(car.angle));
    const desired = car.pos.clone().add(back.multiplyScalar(-11.5)).add(new THREE.Vector3(0, 5.4, 0));
    camera.position.lerp(desired, 1 - Math.pow(0.001, dt)); camera.lookAt(target);
    input.yaw = car.angle + Math.PI;
  } else {
    const d = camDist; const cx = target.x + Math.sin(input.yaw) * d * Math.cos(input.pitch), cz = target.z + Math.cos(input.yaw) * d * Math.cos(input.pitch), cy = target.y + Math.sin(input.pitch) * d + 1;
    camera.position.lerp(new THREE.Vector3(cx, Math.max(1.2, cy), cz), 1 - Math.pow(0.0001, dt)); camera.lookAt(target);
  }
  skyDome.position.copy(camera.position);
  // --- HUD / audio / save ---
  hud.update({ money, stars: wanted.stars(), wanted: wanted.level, health: player.health, objective: missions.objectiveText(), inCar: !!player.inCar, speed: currentSpeed() });
  drawMinimap(hud.minimap.getContext('2d'), { player: pos, angle: player.inCar ? player.inCar.angle : player.angle, traffic: traffic.cars, police: police.units, target: missions.target() });
  audio.update(dt, { inCar: !!player.inCar, speed: currentSpeed(), wanted: wanted.level });
  saveTimer -= dt; if (saveTimer <= 0) { saveTimer = 8; if (!shot) saveNow(); }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
