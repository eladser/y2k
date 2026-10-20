// Cuts an art board into era bitmaps: screenshots every [data-out] element with
// agent-browser, then converts it with ffmpeg the way a designer of that year would have.
//   node scripts/cut.mjs 1999      (art board served from scripts/art on :8200)
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const era = process.argv[2];
const OUT = `d:/Projects/y2k/site/eras/${era}/img`;
const TMP = `D:/tmp/art-${era}`;
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

// npm's shim can't be spawned directly on Windows, so call the native binary
const BIN = process.platform === 'win32' ? `${process.env.APPDATA}/npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe` : 'agent-browser';
// the first call starts a daemon that inherits stdout, so only read output when it's needed
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
    // 1999 GIFs: a small adaptive palette with ordered dithering, exactly what made them look like that
    ff(['-i', png, '-vf', 'split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', `${OUT}/${out}`]);
  } else ff(['-i', png, `${OUT}/${out}`]);
  console.log(out);
}

// a blinking NEW! is two frames and a loop
if (era === '1999') {
  ff(['-framerate', '2', '-i', `${TMP}/new%d.png`, '-vf', 'split[a][b];[a]palettegen=max_colors=16[p];[b][p]paletteuse', '-loop', '0', `${OUT}/new.gif`]);
  // the 1x1 transparent spacer.gif that held every 1999 layout together
  writeFileSync(`${OUT}/spacer.gif`, Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  console.log('new.gif, spacer.gif');
}
ab('close');
