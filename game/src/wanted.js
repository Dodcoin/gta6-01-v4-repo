// wanted.js - wanted star rules, decay and bust logic.
export class Wanted {
  constructor() { this.level = 0; this.heat = 0; this.hiddenTime = 0; this.bustTime = 0; }
  commit(amount) { this.heat += amount; while (this.heat >= 1 && this.level < 5) { this.heat -= 1; this.level++; } if (this.level > 0 && this.heat < 0.2) this.heat = 0.2; }
  setLevel(n) { this.level = Math.max(0, Math.min(5, n)); this.heat = 0; }
  update(dt, seenByPolice) {
    if (this.level === 0) return;
    if (seenByPolice) this.hiddenTime = 0; else { this.hiddenTime += dt; if (this.hiddenTime > 7) { this.level--; this.hiddenTime = 2; if (this.level === 0) this.heat = 0; } }
  }
  stars() { return '★'.repeat(this.level) + '☆'.repeat(5 - this.level); }
}
