// shoot.mjs - capture the four Costa Serena screenshots with headless Chromium + ffmpeg.
// Starts serve.ts as a child, shoots each ?shot= scene at seed 7, converts PNG to JPEG.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const chrome = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell';
const scenes = [
  ['cover', '1-cover.jpg'], ['chase', '2-chase.jpg'], ['foot', '3-foot.jpg'], ['mission', '4-mission.jpg'],
];
mkdirSync(join(root, 'screenshots'), { recursive: true });
const server = spawn('node', ['serve.ts'], { cwd: root, stdio: 'pipe' });
let ready = false;
server.stdout.on('data', d => { if (String(d).includes('8080')) ready = true; });
for (let i = 0; i < 50 && !ready; i++) await new Promise(r => setTimeout(r, 200));
if (!ready) { console.error('server did not start'); server.kill(); process.exit(1); }
try {
  for (const [scene, out] of scenes) {
    const png = `/tmp/shot-${scene}.png`;
    const args = ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader', '--window-size=1280,720', '--hide-scrollbars', '--virtual-time-budget=30000', `--screenshot=${png}`, `http://localhost:8080/?shot=${scene}&seed=7`];
    const r = spawnSync(chrome, args, { timeout: 120000, encoding: 'utf8' });
    if (!existsSync(png)) { console.error('no png for', scene, r.stderr?.slice(-500)); process.exitCode = 1; continue; }
    const dest = join(root, 'screenshots', out);
    // qscale 5 usually lands well under 250 KiB for these flat-shaded scenes; retry coarser if needed.
    for (const q of [5, 8, 11, 14]) {
      spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', png, '-qscale:v', String(q), dest], { encoding: 'utf8' });
      if (existsSync(dest) && statSync(dest).size <= 250 * 1024) break;
    }
    console.log(scene, '->', out, existsSync(dest) ? statSync(dest).size + ' bytes' : 'MISSING');
  }
} finally { server.kill(); }
