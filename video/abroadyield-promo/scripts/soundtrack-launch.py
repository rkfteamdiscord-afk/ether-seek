"""Soundtrack for the AbroadYield launch film: the same track as the 45-second promo.

Same synthesis as scripts/soundtrack45.py (140 BPM, A minor, the same kick, hats, claps, plucks,
pads, impacts, whooshes and bells, the same chord loop and master), re-cut to the launch edit:
it reads public/launch/timeline.json (bun scripts/timeline-launch.ts) for the shots and cues.
Tension intro, first drop on the logo, busier beat from the report, breakdown over the drone
montage, final drop on the end logo.
Run: python3 scripts/soundtrack-launch.py  ->  public/launch/soundtrack-launch.wav
"""
import json
import wave
import numpy as np

SR = 44100
FPS = 30
TL = json.load(open("public/launch/timeline.json"))
TOTAL = TL["totalFrames"] / FPS + 0.4
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

f = lambda frames: frames / FPS
M = TL["music"]
shots = TL["shots"]
first_drop = f(M["firstDrop"])
busy_from = f(M["busyFrom"])
breakdown = (f(M["breakdownFrom"]), f(M["finalDrop"]))
drop = f(M["finalDrop"])

BEAT = 60 / 140
ROOTS = [55.0, 43.65, 65.41, 49.0]
CHORDS = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 261.63, 329.63], [196.0, 246.94, 293.66]]

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

# Intro (problem): pads on the chord loop, a pulse on every beat and a long riser into the logo.
t = 0.0
bar = 0
while t < first_drop - 0.05:
    length = min(BEAT * 4, first_drop - t)
    add(pad(CHORDS[bar % 4], length, attack=0.2), t, gain=1.1)
    add(pluck(ROOTS[bar % 4], BEAT * 0.9), t, gain=0.5)
    t += BEAT * 4
    bar += 1
add(riser(first_drop - 0.4), 0.4, gain=0.8)
# Logo: first drop, then the beat; busier from the report; breakdown over the drone shots.
add(impact(1.4), first_drop, gain=1.0)
add(bell(880.0, 2.0), first_drop + 0.05, gain=0.5)
beat_section(first_drop, busy_from, busy=False)
beat_section(busy_from, breakdown[0], busy=True)
add(pad([110.0, 220.0, 261.63, 329.63], breakdown[1] - breakdown[0], attack=0.3), breakdown[0], gain=1.4)
add(riser(breakdown[1] - breakdown[0]), breakdown[0], gain=1.0)

for h in TL["hits"]:
    at = f(h["f"])
    if h["kind"] == "impact":
        add(impact(h["gain"]), at, gain=0.85)
    elif h["kind"] == "tick":
        add(tick(), at, pan=0.35 if int(h["f"]) % 2 else -0.35, gain=h["gain"])
    else:
        add(bell(880.0, 2.0), at, gain=h["gain"])
        add(bell(1318.5, 2.0), at + 0.13, pan=0.3, gain=h["gain"] * 0.6)

# A whoosh on every cut.
for s in shots[1:]:
    add(whoosh(0.4), f(s["from"]) - 0.22, gain=1.1)

# End logo: final drop, the full chord, then the closing beat under the call to action.
add(impact(1.5), drop, gain=1.0)
add(pad([110.0, 220.0, 261.63, 329.63, 493.88], TOTAL - drop, attack=0.05), drop, gain=1.6)
beat_section(drop + BEAT * 2, TOTAL - 1.2, busy=False)

# Master: gentle saturation, fade out, normalize to -1 dBFS.
mix = np.stack([L, R], axis=1)
mix = np.tanh(mix * 1.15)
fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
pcm = (mix * 32767).astype(np.int16)
with wave.open("public/launch/soundtrack-launch.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{TOTAL:.2f}s, first drop={first_drop:.2f}s, breakdown={breakdown[0]:.2f}-{breakdown[1]:.2f}s")
