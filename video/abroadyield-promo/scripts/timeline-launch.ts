// Writes public/launch/timeline.json (shots, sound cues, music sections) for soundtrack-launch.py.
// Run: bun scripts/timeline-launch.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { buildCues } from "../src/launch/cues";

const cues = buildCues();
mkdirSync("public/launch", { recursive: true });
writeFileSync("public/launch/timeline.json", JSON.stringify(cues, null, 2));
console.log(
  `${cues.shots.length} shots, ${(cues.totalFrames / cues.fps).toFixed(1)} s, ${cues.hits.length} cues`,
);
