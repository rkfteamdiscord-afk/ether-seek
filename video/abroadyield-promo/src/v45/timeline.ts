/**
 * Scene lengths and transition lengths (frames at 30 fps) of the 45-second promo. Shared by the
 * timeline, the voice-over placement and scripts/soundtrack45.py (keep the numbers in sync).
 */
export const SCENES = [
  { id: "hook", frames: 60 },
  { id: "drone-gaztelugatxe", frames: 70 },
  { id: "storm", frames: 160 },
  { id: "drone-navagio", frames: 70 },
  { id: "shatter", frames: 100 },
  { id: "tornado", frames: 110 },
  { id: "drone-krka", frames: 70 },
  { id: "speedrun", frames: 100 },
  { id: "shuffle", frames: 100 },
  { id: "drone-lagos", frames: 70 },
  { id: "states", frames: 90 },
  { id: "drone-santorini", frames: 70 },
  { id: "report", frames: 99 },
  { id: "drone-calanques", frames: 65 },
  { id: "drone-dubai", frames: 60 },
  { id: "drone-tokyo", frames: 70 },
  { id: "finale", frames: 182 },
] as const;

export const TRANSITIONS = [
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 14, 14,
];

export type SceneId = (typeof SCENES)[number]["id"];

/** Frame at which each scene starts in the final video (transitions overlap neighbours). */
export const sceneStart = (id: SceneId): number => {
  let at = 0;
  for (let i = 0; i < SCENES.length; i++) {
    if (SCENES[i]!.id === id) return at;
    at += SCENES[i]!.frames - (TRANSITIONS[i] ?? 0);
  }
  throw new Error(`Unknown scene ${id}`);
};

export const TOTAL_FRAMES =
  SCENES.reduce((sum, s) => sum + s.frames, 0) -
  TRANSITIONS.reduce((sum, t) => sum + t, 0);

/** Narration, one line per scene; generated with ElevenLabs by scripts/voiceover45.ts. */
export const VOICE_LINES: Array<{
  id: string;
  scene: SceneId;
  offset: number;
  text: string;
}> = [
  { id: "01-hook", scene: "hook", offset: 2, text: "Stop scrolling." },
  {
    id: "02-dream",
    scene: "drone-gaztelugatxe",
    offset: 6,
    text: "Dreaming of a place abroad?",
  },
  {
    id: "03-storm",
    scene: "storm",
    offset: 20,
    text: "Lisbon. Paris. Kyoto. Punta Cana. Where should you buy?",
  },
  {
    id: "04-listing",
    scene: "drone-navagio",
    offset: 4,
    text: "The listing says seven percent.",
  },
  {
    id: "05-reality",
    scene: "shatter",
    offset: 40,
    text: "After every tax, you keep about three.",
  },
  {
    id: "06-taxes",
    scene: "tornado",
    offset: 4,
    text: "Foreign tax. U.S. tax. Your state. Nobody shows you this math.",
  },
  { id: "07-we-do", scene: "drone-krka", offset: 6, text: "AbroadYield does." },
  {
    id: "08-questions",
    scene: "speedrun",
    offset: 8,
    text: "Twelve questions. Three minutes.",
  },
  {
    id: "09-ranking",
    scene: "shuffle",
    offset: 6,
    text: "Your free ranking, sorted by what you actually keep.",
  },
  {
    id: "10-states",
    scene: "states",
    offset: 10,
    text: "Built for every U.S. state.",
  },
  {
    id: "11-report",
    scene: "report",
    offset: 8,
    text: "Then the full report. Every dollar, explained.",
  },
  {
    id: "12-next",
    scene: "drone-calanques",
    offset: 8,
    text: "Your next address is out there.",
  },
  {
    id: "13-cta",
    scene: "finale",
    offset: 42,
    text: "AbroadYield. Find out what you'll really earn.",
  },
];
