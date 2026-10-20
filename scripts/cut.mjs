// Screenshots every [data-out] element on an art board and converts it with ffmpeg into era bitmaps.
//   node scripts/cut.mjs 1999      (art board served from scripts/art on :8200)
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const era = process.argv[2];
// forward slashes, because these paths go straight into agent-browser and ffmpeg arguments
const OUT = fileURLToPath(new URL(`../site/eras/${era}/img`, import.meta.url)).replace(/\\/g, '/');
const TMP = join(tmpdir(), `art-${era}`).replace(/\\/g, '/');
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

// npm's shim can't be spawned directly on Windows, so call the native binary
const BIN = process.platform === 'win32' ? `${process.env.APPDATA}/npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe` : 'agent-browser';
// the first call spawns a daemon that inherits stdout, so ignore stdio unless reading
const opts = { encoding: 'utf8', timeout: 60000, env: { ...process.env, AGENT_BROWSER_SESSION: 'art' } };
const ab = (...args) => execFileSync(BIN, args, { ...opts, stdio: 'ignore' });
const read = (...args) => execFileSync(BIN, args, opts);
const ff = args => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);

ab('set', 'viewport', '1600', '1200');
ab('open', `http://localhost:8200/${era}.html`);
ab('wait', '1500');
const list = JSON.parse(JSON.parse(read('eval', 'JSON.stringify([...document.querySelectorAll("[data-out]")].map((e, i) => (e.id ||= "a" + i, [e.id, e.dataset.out, e.dataset.q || ""])))').trim()));

for (const [id, out, q] of list) {
  const png = `${TMP}/${out.replace(/\.\w+$/, '')}.png`;
  ab('screenshot', `#${id}`, png);
  if (out.endsWith('.jpg')) ff(['-i', png, '-q:v', q || '6', `${OUT}/${out}`]);
  else if (out.endsWith('.gif')) {
    // small adaptive palette with Bayer dithering, the 1999 GIF look
    ff(['-i', png, '-vf', 'split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', `${OUT}/${out}`]);
  } else ff(['-i', png, `${OUT}/${out}`]);
  console.log(out);
}

if (era === '1999') {
  ff(['-framerate', '2', '-i', `${TMP}/new%d.png`, '-vf', 'split[a][b];[a]palettegen=max_colors=16[p];[b][p]paletteuse', '-loop', '0', `${OUT}/new.gif`]);
  // the 1x1 transparent spacer.gif that held every 1999 layout together
  writeFileSync(`${OUT}/spacer.gif`, Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  console.log('new.gif, spacer.gif');
}
// the ajaxload.info spinner every 2007 site used
if (era === '2007') {
  ff(['-framerate', '10', '-i', `${TMP}/spin%d.png`, '-vf', 'split[a][b];[a]palettegen=max_colors=16[p];[b][p]paletteuse', '-loop', '0', `${OUT}/spinner.gif`]);
  console.log('spinner.gif');
}
if (era === '1996') {
  const anim = (frames, fps, out) => ff(['-framerate', fps, '-i', `${TMP}/${frames}%d.png`, '-vf', 'split[a][b];[a]palettegen=max_colors=32[p];[b][p]paletteuse', '-loop', '0', `${OUT}/${out}`]);
  anim('plane', '5', 'plane.gif');
  anim('cons', '2', 'construction.gif');
  console.log('plane.gif, construction.gif');
}
for (const f of readdirSync(OUT)) if (/^(new\d|spin\d|plane\d|cons\d)\.png$/.test(f)) rmSync(`${OUT}/${f}`);
ab('close');
