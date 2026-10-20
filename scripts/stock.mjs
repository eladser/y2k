// One-off stills for the older eras, generated with kie.ai and kept raw in d:/tmp/y2k-raw.
//   node scripts/stock.mjs 1999-banner
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const STOCK = {
  '1999-banner': {
    aspect: '16:9',
    prompt: 'A 1999 corporate stock photo from a CD-ROM clip-art collection: a Boeing 747 climbing away from the camera into a saturated orange and purple sunset, a big lens flare, slightly oversharpened, the over-processed look of late-1990s stock photography. No text, no logos.',
  },
  '2007-hero': {
    aspect: '16:9',
    prompt: 'A 2007 airline advertising photo: a smiling young woman in a white shirt sitting by an airplane window with a laptop, bright overexposed daylight, glossy and clean, shallow depth of field, the optimistic stock-photo look of the mid-2000s. No text, no logos.',
  },
};

const name = process.argv[2];
const job = STOCK[name];
if (!job) throw new Error(`usage: node scripts/stock.mjs <${Object.keys(STOCK).join('|')}>`);

const key = process.env.KIE_API_KEY ?? readFileSync(join(homedir(), '.secrets', 'kie.env'), 'utf8').match(/KIE_API_KEY=(\S+)/)?.[1];
const H = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const call = async (path, body) => {
  const r = await fetch(`https://api.kie.ai/api/v1${path}`, body ? { method: 'POST', headers: H, body: JSON.stringify(body) } : { headers: H });
  const j = await r.json();
  if (j.code !== 200) throw new Error(`${path}: ${j.code} ${j.msg}`);
  return j.data;
};

const { taskId } = await call('/jobs/createTask', { model: 'gpt-image-2-text-to-image', input: { prompt: job.prompt, aspect_ratio: job.aspect, resolution: '2K' } });
for (;;) {
  await new Promise(r => setTimeout(r, 8000));
  const d = await call(`/jobs/recordInfo?taskId=${taskId}`);
  if (d.state === 'fail') throw new Error(d.failMsg ?? 'failed');
  if (d.state !== 'success') continue;
  mkdirSync('d:/tmp/y2k-raw', { recursive: true });
  const img = await fetch(JSON.parse(d.resultJson).resultUrls[0]);
  writeFileSync(`d:/tmp/y2k-raw/${name}.png`, Buffer.from(await img.arrayBuffer()));
  console.log(`d:/tmp/y2k-raw/${name}.png`);
  break;
}
