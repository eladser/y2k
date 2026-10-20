// Generates the 2026 page's film and photos with kie.ai, then encodes them for the web.
//   node scripts/generate.mjs            everything
//   node scripts/generate.mjs photos     only the stills
// Key: KIE_API_KEY in the environment or in ~/.secrets/kie.env. Raw downloads go to d:/tmp/y2k-raw.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { FILM, PHOTOS, WINDOW } from '../site/eras/2026/prompts.js';

const API = 'https://api.kie.ai/api/v1';
const OUT = new URL('../site/eras/2026/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const RAW = 'd:/tmp/y2k-raw';
const only = process.argv[2];

const key = process.env.KIE_API_KEY ?? readFileSync(join(homedir(), '.secrets', 'kie.env'), 'utf8').match(/KIE_API_KEY=(\S+)/)?.[1];
if (!key) throw new Error('no KIE_API_KEY in env or ~/.secrets/kie.env');
const H = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function call(path, body) {
  const r = await fetch(API + path, body ? { method: 'POST', headers: H, body: JSON.stringify(body) } : { headers: H });
  const j = await r.json();
  if (j.code !== 200) throw new Error(`${path}: ${j.code} ${j.msg}`);
  return j.data;
}

async function video(job) {
  const { taskId } = await call('/veo/generate', { prompt: job.prompt, model: 'veo3', aspect_ratio: '16:9', resolution: '1080p', generationType: 'TEXT_2_VIDEO', enableTranslation: false });
  console.log('film queued', taskId);
  for (;;) {
    await sleep(15000);
    const d = await call(`/veo/record-info?taskId=${taskId}`);
    if (d.successFlag === 1) return d.response.resultUrls[0];
    if (d.successFlag > 1) throw new Error(`film failed: ${JSON.stringify(d).slice(0, 300)}`);
  }
}

async function image(job, aspect) {
  const { taskId } = await call('/jobs/createTask', { model: 'gpt-image-2-text-to-image', input: { prompt: job.prompt, aspect_ratio: aspect, resolution: '2K' } });
  console.log(`${job.city ?? 'window'} queued`, taskId);
  for (;;) {
    await sleep(8000);
    const d = await call(`/jobs/recordInfo?taskId=${taskId}`);
    if (d.state === 'success') return JSON.parse(d.resultJson).resultUrls[0];
    if (d.state === 'fail') throw new Error(`${job.city} failed: ${d.failMsg ?? ''}`);
  }
}

async function save(url, name) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${name}: ${r.status}`);
  const p = `${RAW}/${name}`;
  writeFileSync(p, Buffer.from(await r.arrayBuffer()));
  return p;
}

const ff = args => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

mkdirSync(RAW, { recursive: true });
mkdirSync(join(OUT, 'media'), { recursive: true });
console.log('credits', await call('/chat/credit'));

const jobs = [];
if (only !== 'photos') {
  jobs.push(video(FILM).then(u => save(u, 'film.mp4')).then(raw => {
    // no audio track, web-sized, moov atom up front so it starts playing while it downloads
    ff(['-i', raw, '-an', '-vf', 'scale=1600:-2', '-c:v', 'libx264', '-crf', '25', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(OUT, FILM.file)]);
    ff(['-i', raw, '-ss', '0', '-frames:v', '1', '-vf', 'scale=1600:-2', '-q:v', '4', join(OUT, 'media/film.jpg')]);
    console.log('film done');
  }));
}
// Reykjavik sits in a tall tile, so it gets a portrait frame
for (const p of PHOTOS) jobs.push(image(p, p.city === 'Reykjavik' ? '3:4' : '16:9').then(u => save(u, `${p.city}.png`)).then(raw => avif(raw, p.file)));
jobs.push(image(WINDOW, '16:9').then(u => save(u, 'window.png')).then(raw => avif(raw, WINDOW.file)));

function avif(raw, file) {
  ff(['-i', raw, '-vf', 'scale=1800:-2', '-c:v', 'libaom-av1', '-crf', '30', '-still-picture', '1', '-frames:v', '1', join(OUT, file)]);
  console.log(file, 'done');
}

const results = await Promise.allSettled(jobs);
const failed = results.filter(r => r.status === 'rejected');
failed.forEach(f => console.error(f.reason.message));
console.log(`${results.length - failed.length}/${results.length} assets written to ${OUT}media`);
if (failed.length) process.exitCode = 1;
