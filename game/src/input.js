// input.js - keyboard and mouse state for Costa Serena.
export class Input {
  constructor(canvas) {
    this.keys = new Set(); this.mouseX = 0; this.mouseY = 0; this.mouseDown = false;
    this.yaw = 0; this.pitch = 0.32; this.clicked = false;
    addEventListener('keydown', e => { this.keys.add(e.code); if (e.code === 'Space') e.preventDefault(); });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('mousemove', e => {
      this.mouseX = e.clientX; this.mouseY = e.clientY;
      if (document.pointerLockElement === canvas) { this.yaw -= e.movementX * 0.0032; this.pitch = Math.max(0.05, Math.min(1.1, this.pitch + e.movementY * 0.002)); }
    });
    addEventListener('mousedown', e => { if (e.button === 0) { this.mouseDown = true; this.clicked = true; } });
    addEventListener('mouseup', e => { if (e.button === 0) this.mouseDown = false; });
    canvas.addEventListener('click', () => { if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.(); });
  }
  down(c) { return this.keys.has(c); }
  consumeClick() { const c = this.clicked; this.clicked = false; return c; }
}
