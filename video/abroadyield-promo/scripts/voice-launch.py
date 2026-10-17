"""English narration for the launch film with Kokoro (open-weights TTS, runs offline on the CPU).

Stand-in until the ElevenLabs take: each line is synthesized sentence by sentence, joined with
short pauses, then trimmed. Sentence boundaries are therefore exact; inside a sentence, word
starts are spread by syllable count. Writes public/launch/voice/<id>.mp3 and the measured timings
to src/launch/vo-timings.generated.ts (VOICE_READY = true).

Needs: pip install kokoro-onnx soundfile; the model files kokoro-v1.0.onnx and voices-v1.0.bin
(github.com/thewh1teagle/kokoro-onnx/releases, model-files-v1.0) in KOKORO_DIR.
Run: KOKORO_DIR=/path python3 scripts/voice-launch.py   (after bun scripts/timeline-launch.ts)
"""
import json
import os
import re
import subprocess
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

VOICE = os.environ.get("KOKORO_VOICE", "af_heart")
SPEED = float(os.environ.get("KOKORO_SPEED", "1.0"))
SENTENCE_GAP = 0.26
SR = 24000

model_dir = os.environ["KOKORO_DIR"]
kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
shots = json.load(open("public/launch/timeline.json"))["shots"]
os.makedirs("public/launch/voice", exist_ok=True)

# How the narrator should say words that are spelled differently on screen.
SAY = {"AbroadYield.": "Abroad Yield.", "AbroadYield": "Abroad Yield"}


def trim(x, thr=0.012):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    return x[max(0, idx[0] - int(0.02 * SR)) : idx[-1] + int(0.06 * SR)]


def syllables(word):
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 1
    if w.isdigit():
        return 2
    groups = re.findall(r"[aeiouy]+", w)
    n = len(groups) - (1 if w.endswith("e") and len(groups) > 1 else 0)
    return max(1, n)


timings = {}
for shot in shots:
    words = shot["text"].split()
    # Sentences end on . ? ! or : (commas stay inside, for a natural read).
    sentences, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        if re.search(r"[.?!:]$", w):
            sentences.append(cur)
            cur = []
    if cur:
        sentences.append(cur)
    audio, starts, t = [], [0.0] * len(words), 0.0
    for k, idxs in enumerate(sentences):
        text = " ".join(SAY.get(words[i], words[i]) for i in idxs)
        samples, sr = kokoro.create(text, voice=VOICE, speed=SPEED, lang="en-us")
        assert sr == SR
        clip = trim(samples)
        dur = len(clip) / SR
        weights = [syllables(words[i]) + 0.6 for i in idxs]
        total = sum(weights)
        acc = 0.0
        for i, wgt in zip(idxs, weights):
            starts[i] = round(t + dur * 0.92 * acc / total, 3)
            acc += wgt
        audio.append(clip)
        t += dur
        if k < len(sentences) - 1:
            audio.append(np.zeros(int(SENTENCE_GAP * SR), dtype=clip.dtype))
            t += SENTENCE_GAP
    line = np.concatenate(audio)
    wav = f"public/launch/voice/{shot['id']}.wav"
    sf.write(wav, line, SR)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5",
         "-ar", "44100", "-b:a", "192k", wav[:-4] + ".mp3"],
        check=True,
    )
    os.remove(wav)
    timings[shot["id"]] = {"starts": starts, "end": round(t, 3)}
    print(f"{shot['id']}: {t:.2f}s")

with open("src/launch/vo-timings.generated.ts", "w") as f:
    f.write(
        "// Measured narration timings, keyed by line id: word start times and line end, in seconds\n"
        f"// from the start of each voice clip. Written by scripts/voice-launch.py (Kokoro, voice {VOICE}).\n"
        "export const MEASURED: Record<string, { starts: number[]; end: number }> = "
        + json.dumps(timings, indent=2)
        + ";\n\n// True once public/launch/voice/<id>.mp3 files exist for every line.\nexport const VOICE_READY = true;\n"
    )
