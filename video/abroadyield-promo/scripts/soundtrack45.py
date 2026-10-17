"""Original soundtrack for the 45-second AbroadYield promo, synthesized from scratch.

140 BPM in A minor, synced to src/v45/timeline.ts at 30 fps: impacts on the hook, a click on each
of the 17 storm photos, a crash on the shattered 7%, whooshes on every transition, a breakdown
before the drone montage and a drop on the logo.
Run: python3 scripts/soundtrack45.py  ->  public/audio/soundtrack45.wav
"""
import wave
import numpy as np

SR = 44100
FPS = 30
TOTAL = 1350 / FPS + 0.4
N = int(TOTAL * SR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)

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

# Keep in sync with src/v45/timeline.ts.
SCENES = [("hook", 60), ("drone-gaztelugatxe", 70), ("storm", 160), ("drone-navagio", 70),
          ("shatter", 100), ("tornado", 110), ("drone-krka", 70), ("speedrun", 100),
          ("shuffle", 100), ("drone-lagos", 70), ("states", 90), ("drone-santorini", 70),
          ("report", 99), ("drone-calanques", 65), ("drone-dubai", 60), ("drone-tokyo", 70),
          ("finale", 182)]
TRANS = [12] * 14 + [14, 14]
start = {}
at = 0
for (sid, d), t in zip(SCENES, TRANS + [0]):
    start[sid] = at
    at += d - t
cuts = [start[SCENES[i + 1][0]] / FPS + TRANS[i] / FPS / 2 for i in range(len(TRANS))]
f = lambda frames: frames / FPS

# Hook: slams and a riser into the first drone shot.
for fr in (0, 16, 34):
    add(impact(1.0 if fr else 1.3), f(fr), gain=0.85)
add(riser(f(start["drone-gaztelugatxe"]) - 0.6), 0.6, gain=0.7)

BEAT = 60 / 140
ROOTS = [55.0, 43.65, 65.41, 49.0]
CHORDS = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 261.63, 329.63], [196.0, 246.94, 293.66]]
breakdown = (f(start["drone-calanques"]) - 0.2, f(start["finale"]) + f(34))
drop = f(start["finale"] + 34)

def beat_section(t0, t1, busy):
    beat = 0
    while t0 + beat * BEAT < t1 - 0.05:
        bt = t0 + beat * BEAT
        bar = (beat // 4) % 4
        add(kick(), bt, gain=1.0)
        add(hat(), bt + BEAT / 2, pan=0.3)
        if busy:
            add(hat(), bt + BEAT * 0.25, pan=-0.35, gain=0.5)
            add(hat(), bt + BEAT * 0.75, pan=-0.3, gain=0.7)
        if beat % 4 in (1, 3):
            add(clap(), bt, gain=0.8)
        for half in (0, 0.5):
            root = ROOTS[bar] * (2 if half and beat % 2 else 1)
            add(pluck(root, BEAT * 0.48), bt + half * BEAT, gain=0.6)
        if beat % 4 == 0:
            add(pad(CHORDS[bar], BEAT * 4), bt, gain=1.0)
        beat += 1

beat_section(f(start["drone-gaztelugatxe"]), f(start["speedrun"]), busy=False)
beat_section(f(start["speedrun"]), breakdown[0], busy=True)
# Breakdown over the drone montage: pad and a long riser, no drums.
add(pad([110.0, 220.0, 261.63, 329.63], breakdown[1] - breakdown[0], attack=0.3), breakdown[0], gain=1.4)
add(riser(breakdown[1] - breakdown[0]), breakdown[0], gain=1.0)

# Storm photo clicks, the shatter crash, cost-card hits, the tornado collapse.
for i in range(17):
    add(tick(), f(start["storm"] + i * 8), pan=(-0.45 if i % 2 else 0.45), gain=1.1)
add(impact(1.2), f(start["shatter"] + 42), gain=0.9)
add(impact(0.6), f(start["shatter"] + 52), gain=0.6)
add(impact(1.1), f(start["tornado"] + 88), gain=0.9)
add(impact(0.5), f(start["shuffle"] + 60), gain=0.6)
for i in range(12):
    add(tick(), f(start["speedrun"] + i * 6), gain=0.7)

for c in cuts:
    add(whoosh(0.4), c - 0.22, gain=1.1)

# Logo drop, final chord, bells on the call to action, then a closing beat under the CTA.
add(impact(1.5), drop, gain=1.0)
add(pad([110.0, 220.0, 261.63, 329.63, 493.88], TOTAL - drop, attack=0.05), drop, gain=1.6)
beat_section(drop + BEAT * 2, TOTAL - 0.8, busy=False)
add(bell(880.0, 2.0), f(start["finale"] + 70), gain=0.8)
add(bell(1318.5, 2.0), f(start["finale"] + 74), pan=0.3, gain=0.5)

# Master: gentle saturation, fade out, normalize to -1 dBFS.
mix = np.stack([L, R], axis=1)
mix = np.tanh(mix * 1.15)
fade = int(0.6 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
pcm = (mix * 32767).astype(np.int16)
with wave.open("public/audio/soundtrack45.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{TOTAL:.2f}s, drop={drop:.2f}s, breakdown={breakdown[0]:.2f}-{breakdown[1]:.2f}s")
