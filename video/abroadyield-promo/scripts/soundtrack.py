"""Original soundtrack for the AbroadYield promo, synthesized from scratch (no samples, no licence).

128 BPM beat in A minor (Am-F-C-G), synced to the edit at 30 fps: impacts on the hook slams,
a click on every photo cut, whooshes on scene transitions, a drop on the logo and a final chord.
Run: python3 scripts/soundtrack.py  ->  public/audio/soundtrack.wav
"""
import wave
import numpy as np

SR = 44100
FPS = 30
TOTAL = 724 / FPS + 0.4
N = int(TOTAL * SR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)

# Scene starts (frames) and transition centres, from Promo.tsx.
DUR = [66, 124, 96, 75, 96, 84, 70, 70, 135]
TRANS = [10, 12, 10, 14, 12, 12, 12, 10]
starts = [0]
for d, t in zip(DUR[:-1], TRANS):
    starts.append(starts[-1] + d - t)
cuts = [(starts[i + 1] + TRANS[i] / 2) / FPS for i in range(len(TRANS))]

def t_axis(sec):
    return np.arange(int(sec * SR)) / SR

def add(sig, at, pan=0.0, gain=1.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * (1 - max(pan, 0))
    R[i : i + len(sig)] += sig * (1 + min(pan, 0))

def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y

def kick():
    t = t_axis(0.35)
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def hat():
    t = t_axis(0.05)
    n = rng.standard_normal(len(t))
    return np.diff(n, prepend=0) * np.exp(-t * 90) * 0.18

def clap():
    t = t_axis(0.22)
    n = lowpass(rng.standard_normal(len(t)), 3500)
    return (n * 0.9 + np.sin(2 * np.pi * 190 * t) * 0.4) * np.exp(-t * 18) * 0.5

def impact(size=1.0):
    t = t_axis(1.2)
    f = 30 + 90 * np.exp(-t * 6)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    burst = lowpass(rng.standard_normal(len(t)), 1800) * np.exp(-t * 7) * 1.4
    return (sub + burst) * size

def whoosh(length=0.45):
    t = t_axis(length)
    env = np.sin(np.pi * t / length) ** 2
    n = rng.standard_normal(len(t))
    bright = np.diff(n, prepend=0)
    mix = bright * np.linspace(0.2, 1.0, len(t)) + n * 0.25
    return mix * env * 0.22

def tick():
    t = t_axis(0.06)
    return (np.sin(2 * np.pi * 2400 * t) * 0.5 + np.diff(rng.standard_normal(len(t)), prepend=0) * 0.4) * np.exp(-t * 70) * 0.35

def riser(length):
    t = t_axis(length)
    f = 200 + 1800 * (t / length) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15
    n = np.diff(rng.standard_normal(len(t)), prepend=0) * 0.12
    return (tone + n) * (t / length) ** 1.5

def saw(freq, sec, harmonics=12):
    t = t_axis(sec)
    s = np.zeros(len(t))
    for k in range(1, harmonics + 1):
        s += np.sin(2 * np.pi * freq * k * t) / k
    return s * 0.5

def pluck(freq, sec):
    t = t_axis(sec)
    return lowpass(saw(freq, sec, 8), 900) * np.exp(-t * 9)

def pad(freqs, sec, attack=0.4):
    t = t_axis(sec)
    s = sum(saw(f, sec, 6) + saw(f * 1.006, sec, 6) for f in freqs)
    env = np.minimum(t / attack, 1) * np.minimum((sec - t) / 0.6, 1)
    return lowpass(s, 1400) * env * 0.05

def bell(freq, sec):
    t = t_axis(sec)
    return (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t)) * np.exp(-t * 3) * 0.25

# Hook: three slams and a riser into the destinations.
for f in (0, 10, 20):
    add(impact(0.9 if f < 20 else 1.2), f / FPS, gain=0.8)
add(riser(starts[1] / FPS - 0.9), 0.9, gain=0.9)

# Beat: from the destinations until the logo drop.
BEAT = 60 / 128
t0 = starts[1] / FPS
drop = (starts[8] + 26) / FPS
ROOTS = [55.0, 43.65, 65.41, 49.0]  # A, F, C, G
CHORDS = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 261.63, 329.63], [196.0, 246.94, 293.66]]
beat = 0
while t0 + beat * BEAT < drop - 0.05:
    at = t0 + beat * BEAT
    bar = (beat // 4) % 4
    add(kick(), at, gain=0.95)
    add(hat(), at + BEAT / 2, pan=0.3)
    add(hat(), at + BEAT * 0.75, pan=-0.3, gain=0.6)
    if beat % 4 in (1, 3):
        add(clap(), at, gain=0.7)
    for half in (0, 0.5):
        root = ROOTS[bar] * (2 if half and beat % 2 else 1)
        add(pluck(root, BEAT * 0.48), at + half * BEAT, gain=0.55)
    if beat % 4 == 0:
        add(pad(CHORDS[bar], BEAT * 4), at, gain=1.0)
    beat += 1

# Photo cuts, the "real number" landing and the cost cards.
for i in range(7):
    add(tick(), (starts[1] + i * 17) / FPS, pan=(-0.4 if i % 2 else 0.4))
add(impact(0.8), (starts[2] + 62) / FPS, gain=0.7)
for i in range(4):
    add(impact(0.45), (starts[3] + 6 + i * 9) / FPS, pan=(-0.3 if i % 2 else 0.3), gain=0.6)

# Whooshes on every transition (except the last, which gets the drop).
for c in cuts[:-1]:
    add(whoosh(), c - 0.25, gain=1.0)
add(riser(1.6), drop - 1.6, gain=1.0)

# Logo drop, final chord and a bell on the call to action.
add(impact(1.4), drop, gain=0.9)
add(pad([110.0, 220.0, 261.63, 329.63, 493.88], TOTAL - drop, attack=0.05), drop, gain=1.6)
add(bell(880.0, 2.0), (starts[8] + 58) / FPS, gain=0.8)
add(bell(1318.5, 2.0), (starts[8] + 62) / FPS, pan=0.3, gain=0.5)

# Master: gentle saturation, fade out, normalize to -1 dBFS.
mix = np.stack([L, R], axis=1)
mix = np.tanh(mix * 1.2)
fade = int(0.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
pcm = (mix * 32767).astype(np.int16)
with wave.open("public/audio/soundtrack.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{TOTAL:.2f}s, starts={starts}, drop={drop:.2f}s")
