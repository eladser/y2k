import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, fft, spectrogram, LENGTH } from '../site/modem.js';

const sr = 8000;
const buf = build(sr);

// energy of one frequency over a window, Goertzel style
function power(t0, t1, f) {
  const c = 2 * Math.cos((2 * Math.PI * f) / sr);
  let s1 = 0, s2 = 0;
  for (let i = Math.floor(t0 * sr); i < t1 * sr; i++) [s1, s2] = [buf[i] + c * s1 - s2, s1];
  return (s1 * s1 + s2 * s2 - c * s1 * s2) / ((t1 - t0) * sr);
}

test('length matches the timeline', () => {
  assert.equal(buf.length, Math.ceil(sr * LENGTH));
});

test('dial tone is 350 + 440 Hz', () => {
  assert.ok(power(0.2, 0.9, 350) > 50 * power(0.2, 0.9, 2100));
  assert.ok(power(0.2, 0.9, 440) > 50 * power(0.2, 0.9, 2100));
});

test('first digit is a 5', () => {
  assert.ok(power(1.06, 1.13, 770) > 20 * power(1.06, 1.13, 697));
  assert.ok(power(1.06, 1.13, 1336) > 20 * power(1.06, 1.13, 1209));
});

test('answer tone sits at 2100 Hz', () => {
  // inside one 450 ms half so the phase flip doesn't smear it
  assert.ok(power(3.5, 3.8, 2100) > 50 * power(3.5, 3.8, 1650));
});

test('V.21 uses both channels at once', () => {
  for (const f of [980, 1180, 1650, 1850]) assert.ok(power(5.3, 6.2, f) > 10 * power(5.3, 6.2, 3000), f);
});

test('fft puts a pure tone in the right bin', () => {
  const n = 256, re = new Float32Array(n), im = new Float32Array(n);
  for (let i = 0; i < n; i++) re[i] = Math.sin((2 * Math.PI * 32 * i) / n);
  fft(re, im);
  const mag = Array.from(re.slice(0, n / 2), (r, k) => Math.hypot(r, im[k]));
  assert.equal(mag.indexOf(Math.max(...mag)), 32);
});

test('spectrogram has one column per hop', () => {
  const s = spectrogram(buf, sr, 256, 96);
  assert.equal(s.cols.length, Math.floor((buf.length - 256) / 96) + 1);
  assert.equal(s.cols[0].length, 128);
});
