// V.90 handshake from the ITU spec frequencies (V.8, V.21, V.34), squeezed from ~20 s to ~10

const TAU = Math.PI * 2;
export const LENGTH = 10.1;

export const PHASES = [
  { t: 0.05, label: 'dial tone', note: '350 + 440 Hz' },
  { t: 1.05, label: 'dialing', note: 'DTMF 5 5 5 1 9 9 9' },
  { t: 2.3, label: 'ringing', note: '440 + 480 Hz' },
  { t: 3.4, label: 'answer tone', note: '2100 Hz, phase flips every 450 ms to switch off echo cancellers' },
  { t: 5.25, label: 'V.8 call menu', note: 'V.21 FSK at 300 bit/s, both modems at once' },
  { t: 6.3, label: 'probing', note: 'V.34 INFO0 then line probing, 150 to 3750 Hz' },
  { t: 7.35, label: 'training', note: 'equalizer training, scrambled data' },
];

const DTMF = { 1: [697, 1209], 5: [770, 1336], 9: [852, 1477] };

export function build(sr) {
  const buf = new Float32Array(Math.ceil(sr * LENGTH));
  const at = s => Math.floor(s * sr);
  let seed = 1999;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // 5 ms fades so tones don't click
  const env = (i, n) => Math.min(1, i / (sr * 0.005), (n - i) / (sr * 0.005));

  const fill = (t0, dur, amp, fn) => {
    const s = at(t0), n = at(dur);
    for (let i = 0; i < n && s + i < buf.length; i++) buf[s + i] += fn(i / sr, i) * amp * env(i, n);
  };
  const tones = (t0, dur, freqs, amp) =>
    fill(t0, dur, amp, x => freqs.reduce((v, f) => v + Math.sin(TAU * f * x), 0));
  const noise = (t0, dur, amp) => fill(t0, dur, amp, () => rnd() * 2 - 1);

  const fsk = (t0, dur, mark, space, baud, amp) => {
    let ph = 0, bit = 1;
    const per = Math.round(sr / baud);
    fill(t0, dur, amp, (x, i) => {
      if (i % per === 0) bit = rnd() > 0.5;
      ph += TAU * (bit ? mark : space) / sr;
      return Math.sin(ph);
    });
  };
  const dpsk = (t0, dur, f, bps, amp) => {
    let flip = 0;
    const per = Math.round(sr / bps);
    fill(t0, dur, amp, (x, i) => {
      if (i % per === 0 && rnd() > 0.5) flip += Math.PI;
      return Math.sin(TAU * f * x + flip);
    });
  };
  // L1/L2: 150 Hz comb minus the four the spec skips, Schroeder phases so they don't peak together
  const probe = (t0, dur, amp) => {
    const fs = [];
    for (let k = 1; k <= 25; k++) if (![6, 8, 12, 16].includes(k)) fs.push(k * 150);
    fill(t0, dur, amp / Math.sqrt(fs.length), x =>
      fs.reduce((v, f, k) => v + Math.cos(TAU * f * x + (Math.PI * k * k) / fs.length), 0));
  };

  noise(0, 0.012, 0.4);
  tones(0.05, 0.95, [350, 440], 0.18);
  [...'5551999'].forEach((d, i) => tones(1.05 + i * 0.17, 0.09, DTMF[d], 0.22));
  tones(2.3, 0.9, [440, 480], 0.14);
  noise(3.3, 0.01, 0.3);

  // ANSam: 2100 Hz with 15 Hz AM, phase reversed every 450 ms
  fill(3.4, 1.8, 0.28, x => (1 + 0.2 * Math.sin(TAU * 15 * x)) / 1.2 * Math.sin(TAU * 2100 * x + (Math.floor(x / 0.45) % 2) * Math.PI));

  fsk(5.25, 1.0, 980, 1180, 300, 0.13);
  fsk(5.25, 1.0, 1650, 1850, 300, 0.13);

  dpsk(6.3, 0.2, 1200, 600, 0.12);
  dpsk(6.3, 0.2, 2400, 600, 0.12);
  probe(6.52, 0.16, 0.55);
  probe(6.7, 0.6, 0.3);

  noise(7.35, 0.85, 0.13);
  fill(8.2, LENGTH - 8.2, 0.2, x => (rnd() * 2 - 1) * (0.85 + 0.15 * Math.sin(TAU * 4 * x)));
  return buf;
}

export function play(ctx, data, muted) {
  const b = ctx.createBuffer(1, data.length, ctx.sampleRate);
  b.copyToChannel(data, 0);
  const src = new AudioBufferSourceNode(ctx, { buffer: b });
  // the phone line only ever carried 300-3400 Hz
  const hp = new BiquadFilterNode(ctx, { type: 'highpass', frequency: 300 });
  const lp = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 3400 });
  const g = new GainNode(ctx, { gain: muted ? 0 : 0.5 });
  src.connect(hp).connect(lp).connect(g).connect(ctx.destination);
  src.start();
  return { src, gain: g.gain };
}

// magnitudes in dB, one column per hop, bins up to sr/2
export function spectrogram(data, sr, n = 256, hop = 96) {
  const cols = [];
  const win = Float32Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((TAU * i) / (n - 1)));
  const re = new Float32Array(n), im = new Float32Array(n);
  for (let s = 0; s + n <= data.length; s += hop) {
    for (let i = 0; i < n; i++) { re[i] = data[s + i] * win[i]; im[i] = 0; }
    fft(re, im);
    const col = new Float32Array(n / 2);
    for (let k = 0; k < n / 2; k++) col[k] = 10 * Math.log10(re[k] * re[k] + im[k] * im[k] + 1e-12);
    cols.push(col);
  }
  return { cols, hz: sr / n, sec: hop / sr };
}

// in-place radix-2, n must be a power of two
export function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -TAU / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const p = i + k, q = p + len / 2;
        const tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr;
        re[q] = re[p] - tr; im[q] = im[p] - ti;
        re[p] += tr; im[p] += ti;
        [cr, ci] = [cr * wr - ci * wi, cr * wi + ci * wr];
      }
    }
  }
}
