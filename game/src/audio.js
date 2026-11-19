// audio.js - all sound is procedural WebAudio: engine, siren, shots, music, UI.
export class GameAudio {
  constructor() { this.ctx = null; this.muted = false; this.master = null; this.musicTimer = 0; this.note = 0; }
  ensure() { if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; } const C = window.AudioContext || window.webkitAudioContext; if (!C) return; this.ctx = new C(); this.master = this.ctx.createGain(); this.master.gain.value = 0.35; this.master.connect(this.ctx.destination); }
  tone(freq, dur, type = 'sine', vol = 0.2, slide = 0) { if (!this.ctx || this.muted) return; const t = this.ctx.currentTime; const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur); }
  noise(dur, vol = 0.3) { if (!this.ctx || this.muted) return; const n = Math.floor(this.ctx.sampleRate * dur); const b = this.ctx.createBuffer(1, n, this.ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = this.ctx.createBufferSource(); s.buffer = b; const g = this.ctx.createGain(); g.gain.value = vol; s.connect(g); g.connect(this.master); s.start(); }
  shot() { this.noise(0.12, 0.5); this.tone(140, 0.1, 'square', 0.2, -80); }
  crash() { this.noise(0.25, 0.4); this.tone(70, 0.25, 'triangle', 0.3, -30); }
  pickup() { this.tone(660, 0.12, 'sine', 0.25); setTimeout(() => this.tone(990, 0.18, 'sine', 0.25), 90); }
  click() { this.tone(880, 0.05, 'sine', 0.15); }
  engine(speed) { /* continuous hum handled by tone pulses in update */ if (Math.random() < 0.3) this.tone(50 + Math.abs(speed) * 3, 0.08, 'sawtooth', 0.04); }
  sirenTick(t) { this.tone(t % 1 < 0.5 ? 720 : 540, 0.12, 'triangle', 0.05); }
  update(dt, state) { if (!this.ctx || this.muted) return; this.musicTimer -= dt; if (this.musicTimer <= 0) { this.musicTimer = 0.42; const scale = [262, 294, 330, 392, 440, 392, 330, 294]; this.tone(scale[this.note % scale.length], 0.38, 'triangle', state.inCar ? 0.035 : 0.07); this.note++; } if (state.wanted > 0 && Math.random() < dt * 2) this.sirenTick(performance.now() / 500); if (state.inCar) this.engine(state.speed); }
}
