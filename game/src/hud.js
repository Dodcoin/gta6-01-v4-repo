// hud.js - DOM HUD, menus, phone popup, banners and prompts.
export class Hud {
  constructor() {
    this.el = id => document.getElementById(id);
    this.money = this.el('money'); this.stars = this.el('stars'); this.healthFill = this.el('healthfill');
    this.objective = this.el('objective'); this.speed = this.el('speed'); this.phone = this.el('phone'); this.phoneText = this.el('phonetext');
    this.banner = this.el('banner'); this.prompt = this.el('prompt'); this.weapon = this.el('weapon'); this.title = this.el('title-screen');
    this.pause = this.el('pause-screen'); this.minimap = this.el('minimap'); this.phoneUntil = 0; this.bannerUntil = 0;
  }
  showPhone(text, secs = 6) { this.phoneText.textContent = text; this.phone.style.display = 'block'; this.phoneUntil = performance.now() + secs * 1000; }
  showBanner(text, secs = 3.5) { this.banner.textContent = text; this.banner.style.display = 'block'; this.bannerUntil = performance.now() + secs * 1000; }
  update(state) {
    this.money.textContent = '$' + Math.floor(state.money).toLocaleString('en-US');
    this.stars.textContent = state.stars; this.stars.style.opacity = state.wanted > 0 ? '1' : '0.35';
    this.healthFill.style.width = Math.max(0, state.health) + '%'; this.healthFill.style.background = state.health > 35 ? '#3ddc84' : '#ff4455';
    this.objective.textContent = state.objective; this.speed.textContent = state.inCar ? Math.round(Math.abs(state.speed) * 3.6) + ' km/h' : '';
    this.weapon.textContent = state.inCar ? '' : '🔫 Pistol — click to shoot';
    const now = performance.now(); if (now > this.phoneUntil) this.phone.style.display = 'none'; if (now > this.bannerUntil) this.banner.style.display = 'none';
  }
  setPrompt(t) { this.prompt.textContent = t || ''; this.prompt.style.display = t ? 'block' : 'none'; }
}
