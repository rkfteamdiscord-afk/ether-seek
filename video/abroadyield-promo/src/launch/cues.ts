/**
 * Sound-design cues for the launch film, in absolute frames. scripts/timeline-launch.ts writes them
 * (with the shot list) to public/launch/timeline.json for scripts/soundtrack-launch.py.
 */
import { SHOTS, TOTAL_FRAMES, shot, wordAt, type ShotId } from "./vo";

type Hit = { f: number; kind: "impact" | "tick" | "bell"; gain: number };

const abs = (id: ShotId, f: number) => shot(id).from + f;
const w = (id: ShotId, i: number) => abs(id, wordAt(id, i));

export const buildCues = () => {
  const hits: Hit[] = [];
  const impact = (f: number, gain = 1) =>
    hits.push({ f, kind: "impact", gain });
  const tick = (f: number, gain = 0.8) => hits.push({ f, kind: "tick", gain });

  // Cold open: one slam per destination flash.
  for (let i = 0; i < 4; i++) impact(i * 6, i ? 0.55 : 1.2);
  impact(w("listing", 3), 1.1);
  for (let i = 0; i < 9; i++) tick(abs("reality", 3 + i * 4), 0.7);
  impact(w("reality", 7), 1);
  impact(w("nobody", 5), 1.2);
  // Questionnaire taps, ranking rows, numbers beats, report items.
  const q = shot("questions");
  const per = Math.max(3, Math.floor((q.voiceEnd - 12) / 12));
  for (let i = 0; i < 12; i++) tick(q.from + 8 + i * per + per - 3, 0.75);
  impact(q.from + 8 + per * 12, 0.6);
  for (let i = 0; i < 7; i++) tick(abs("ranking", 6 + i * 3), 0.6);
  impact(w("ranking", 5), 0.5);
  for (const i of [0, 2, 6]) impact(w("numbers", i) - 4, 0.8);
  impact(w("unlock", 1), 0.9);
  for (const i of [0, 2, 4, 5, 7, 10]) impact(w("sections", i) - 3, 0.45);
  for (const i of [3, 4, 5, 6]) tick(w("simulator", i) - 2, 0.9);
  tick(abs("assistant", 35), 0.9);
  impact(w("deliver", 3) - 4, 0.5);
  impact(w("pricing", 7), 0.9);
  impact(w("pricing", 9), 0.7);
  hits.push({ f: w("finale", 6) + 10, kind: "bell", gain: 0.8 });

  const logo = shot("logo");
  const next = shot("next");
  const finale = shot("finale");
  return {
    fps: 30,
    totalFrames: TOTAL_FRAMES,
    shots: SHOTS.map((s) => ({
      id: s.id,
      text: s.text,
      from: s.from,
      frames: s.frames,
      voiceAt: s.from + s.voiceAt,
      voiceEnd: s.from + s.voiceEnd,
    })),
    hits,
    // Music sections (frames): tension intro, first drop on the logo, busier beat from the
    // report onwards, a breakdown over the drone montage, the final drop on the end logo.
    music: {
      firstDrop: logo.from + 20,
      busyFrom: shot("unlock").from,
      breakdownFrom: next.from - 4,
      finalDrop: finale.from + finale.voiceAt - 2,
    },
  };
};
