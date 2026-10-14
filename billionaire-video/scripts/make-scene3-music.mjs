// Synthesises the instrumental cue for scene 3 (yacht) into public/scene3-music.wav.
// 120 BPM, one beat = 0.5 s = 15 frames at 30 fps. No voices, no samples.
// Sync points (seconds): 1.0 cut to deck, 4.9 phone lands, 5.0 eye roll,
// 5.5 comic drop (descending "wah-wah" brass), 7.0 hard cut.
import { writeFileSync, mkdirSync } from "node:fs";

const SR = 44100;
const DURATION = 7;
const N = SR * DURATION;
const L = new Float32Array(N);
const R = new Float32Array(N);

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (i, v, pan = 0) => {
  if (i < 0 || i >= N) return;
  L[i] += v * (1 - pan) * 0.5 + v * 0.5;
  R[i] += v * (1 + pan) * 0.5 + v * 0.5;
};

// Electric piano (two-operator FM) for elegant lounge chords.
const epiano = (t0, dur, note, vel = 0.12, pan = 0) => {
  const f = midi(note);
  const start = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.6) * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 2.2) * (t > dur ? Math.exp(-(t - dur) * 9) : 1);
    const mod = Math.sin(2 * Math.PI * f * 14 * t) * 0.6 * Math.exp(-t * 8);
    const v = Math.sin(2 * Math.PI * f * t + mod + Math.sin(2 * Math.PI * f * t) * 0.4);
    add(start + i, v * env * vel, pan);
  }
};

// Plucked upright-style bass with a fat sub.
const bass = (t0, dur, note, vel = 0.32) => {
  const f = midi(note);
  const start = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.15) * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, t * 200) * Math.exp(-t * 3.2) * (t > dur ? Math.exp(-(t - dur) * 30) : 1);
    const v = Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 10);
    add(start + i, Math.tanh(v * 1.4) * env * vel);
  }
};

const kick = (t0, vel = 0.7) => {
  const start = Math.floor(t0 * SR);
  let phase = 0;
  for (let i = 0; i < SR * 0.35; i++) {
    const t = i / SR;
    const f = 48 + 110 * Math.exp(-t * 28);
    phase += (2 * Math.PI * f) / SR;
    add(start + i, Math.sin(phase) * Math.exp(-t * 9) * vel);
  }
};

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

const hat = (t0, vel = 0.05, decay = 45, pan = 0.3) => {
  const start = Math.floor(t0 * SR);
  let prev = 0;
  for (let i = 0; i < SR * 0.12; i++) {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    add(start + i, hp * Math.exp((-i / SR) * decay) * vel, pan);
  }
};

const snap = (t0, vel = 0.22) => {
  const start = Math.floor(t0 * SR);
  for (let i = 0; i < SR * 0.18; i++) {
    const t = i / SR;
    const body = Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30);
    add(start + i, (rnd() * 0.8 + body) * Math.exp(-t * 22) * vel, -0.1);
  }
};

// Muted brass "wah": sawtooth through a sweeping one-pole lowpass with vibrato.
const wah = (t0, dur, note, vel = 0.16, bend = 0) => {
  const f0 = midi(note);
  const start = Math.floor(t0 * SR);
  const len = Math.floor((dur + 0.08) * SR);
  let phase = 0;
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const vib = 1 + 0.012 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t * 3);
    const f = f0 * vib * Math.pow(2, (bend * Math.min(1, t / dur)) / 12);
    phase = (phase + f / SR) % 1;
    const saw = phase * 2 - 1;
    const open = Math.sin(Math.PI * Math.min(1, t / dur)) ** 0.6;
    const cutoff = 300 + 2200 * open;
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    lp += a * (saw - lp);
    const env = Math.min(1, t * 40) * (t > dur ? Math.exp(-(t - dur) * 40) : 1);
    add(start + i, lp * env * vel, 0.15);
  }
};

const B = 0.5; // one beat

// Bars 1-2 (0-4 s): Dmaj9 -> Bm9 -> Gmaj7 -> A13 lounge progression.
const chords = [
  [62, 66, 69, 73, 76],
  [59, 62, 66, 69, 73],
  [55, 59, 62, 66, 69],
  [57, 61, 64, 66, 71],
];
const roots = [38, 35, 31, 33];
for (let c = 0; c < 4; c++) {
  const t = c * 2 * B;
  chords[c].forEach((n, k) => epiano(t + k * 0.012, 2 * B - 0.05, n, 0.07, (k - 2) * 0.2));
  bass(t, B * 0.9, roots[c]);
  bass(t + 1.5 * B, B * 0.4, roots[c] + 12, 0.22);
}
// Bar 3 (4-5.5 s): back to D, tension builds, accent when the phone lands (4.9 s).
chords[0].forEach((n, k) => epiano(4 + k * 0.012, B * 1.6, n, 0.07, (k - 2) * 0.2));
bass(4, B * 0.9, 38);
bass(4.75, 0.12, 45, 0.25);
epiano(4.9, 0.25, 81, 0.12, 0.3);
epiano(4.9, 0.25, 74, 0.1, -0.3);

// Drums: kick on 1 and 3, hats on eighths, snap on 2 and 4. Cut to deck accented at 1.0 s.
for (let b = 0; b < 11; b++) {
  const t = b * B;
  if (b % 2 === 0) kick(t, b === 2 ? 0.85 : 0.6);
  else snap(t);
  hat(t + B / 2, 0.045);
  hat(t, 0.025);
}
// Little hiccup fill as the eyes roll (5.0-5.5 s).
hat(5.0, 0.06);
hat(5.125, 0.06);
hat(5.25, 0.07);
hat(5.375, 0.08);

// Comic drop (5.5 s): the beat stops, descending muted brass, then the final sting at 6.75 s.
wah(5.5, 0.28, 67, 0.18);
wah(5.82, 0.28, 66, 0.18);
wah(6.14, 0.55, 65, 0.2, -1.2);
bass(5.5, 0.25, 43, 0.25);
bass(5.82, 0.25, 42, 0.25);
bass(6.14, 0.5, 41, 0.28);
// Final staccato button exactly before the cut.
kick(6.75, 0.8);
bass(6.75, 0.16, 38, 0.38);
[62, 66, 69, 74].forEach((n, k) => epiano(6.75, 0.16, n, 0.09, (k - 1.5) * 0.2));

// Normalise, soft-clip and hard-stop at 7.0 s (sharp cut).
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.9 / peak;
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const tail = i > N - 220 ? (N - i) / 220 : 1;
  pcm.writeInt16LE(Math.round(Math.tanh(L[i] * gain) * tail * 32767), i * 4);
  pcm.writeInt16LE(Math.round(Math.tanh(R[i] * gain) * tail * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);
mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/scene3-music.wav", import.meta.url), Buffer.concat([header, pcm]));
console.log("Wrote public/scene3-music.wav");
