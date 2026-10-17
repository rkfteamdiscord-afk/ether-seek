/**
 * Generates the 45-second promo's narration with ElevenLabs, one MP3 per line, then switches the
 * composition to use it (src/v45/voiceover.generated.ts).
 *
 *   ELEVENLABS_API_KEY=... node --experimental-strip-types scripts/voiceover45.ts
 *   optional: ELEVENLABS_VOICE_ID (default "Adam", a deep male narrator from the premade voices)
 *
 * The key is read from the environment only; never commit it.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { VOICE_LINES } from "../src/v45/timeline.ts";

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("Set ELEVENLABS_API_KEY first.");
  process.exit(1);
}
const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB";
mkdirSync("public/voiceover45", { recursive: true });

for (const line of VOICE_LINES) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: line.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true },
    }),
  });
  if (!response.ok) {
    console.error(`${line.id}: ${response.status} ${await response.text()}`);
    process.exit(1);
  }
  writeFileSync(`public/voiceover45/${line.id}.mp3`, Buffer.from(await response.arrayBuffer()));
  console.log(`✓ ${line.id}  "${line.text}"`);
}

writeFileSync(
  "src/v45/voiceover.generated.ts",
  `// Written by scripts/voiceover45.ts after it generates public/voiceover45/*.mp3 with ElevenLabs.\n// While false, the promo renders with music only.\nexport const VOICEOVER_READY = true;\n`,
);
console.log("Voice-over ready: render AbroadYieldPromo45 again.");
