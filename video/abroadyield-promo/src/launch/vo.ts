/**
 * Launch film: the voice-over script drives the whole edit. Each line belongs to one shot; a shot
 * lasts as long as its line (plus lead-in and tail), so re-timing a line re-flows every shot after
 * it, the captions and the soundtrack (scripts/soundtrack-launch.py reads public/launch/timeline.json).
 *
 * Until the real narration arrives, word timings are estimated from word length and punctuation.
 * When it arrives, put the measured timings in vo-timings.generated.ts (seconds from line start).
 */
import { MEASURED } from "./vo-timings.generated";

export const FPS = 30;

/** One on-screen token, shown when the voice reaches word `w` (index in the spoken line). */
export type Show = { t: string; w: number; gold?: boolean; br?: boolean };

export type ShotId =
  | "open"
  | "listing"
  | "reality"
  | "nobody"
  | "logo"
  | "promise"
  | "questions"
  | "ranking"
  | "numbers"
  | "unlock"
  | "waterfall"
  | "simulator"
  | "sections"
  | "assistant"
  | "deliver"
  | "trust"
  | "pricing"
  | "next"
  | "finale";

export type Line = {
  shot: ShotId;
  text: string;
  /** Key phrase shown on screen, word-synced. Shots design their own layout around it. */
  show?: Show[];
  /** Frames of picture before the voice starts, and after it ends. */
  lead?: number;
  tail?: number;
  /** Minimum shot length in frames (for shots whose animation needs more room than the line). */
  min?: number;
};

export const LINES: Line[] = [
  {
    shot: "open",
    text: "You found it. The perfect place abroad.",
    lead: 26,
    tail: 6,
    show: [
      { t: "The", w: 3 },
      { t: "perfect", w: 4, gold: true },
      { t: "place", w: 5, br: true },
      { t: "abroad.", w: 6 },
    ],
  },
  {
    shot: "listing",
    text: "The listing promises seven percent.",
    lead: 4,
    tail: 8,
    show: [{ t: "7%", w: 3, gold: true }],
  },
  {
    shot: "reality",
    text: "But after every tax, you keep about three.",
    lead: 2,
    tail: 12,
    show: [
      { t: "You", w: 4 },
      { t: "keep", w: 5 },
      { t: "about", w: 6 },
    ],
  },
  {
    shot: "nobody",
    text: "Nobody shows you that math. Until now.",
    lead: 2,
    tail: 10,
    show: [
      { t: "Nobody", w: 0 },
      { t: "shows", w: 1 },
      { t: "you", w: 2, br: true },
      { t: "that", w: 3 },
      { t: "math.", w: 4 },
      { t: "Until", w: 5, br: true, gold: true },
      { t: "now.", w: 6, gold: true },
    ],
  },
  {
    shot: "logo",
    text: "Meet AbroadYield.",
    lead: 18,
    tail: 22,
  },
  {
    shot: "promise",
    text: "Your real return on property abroad. After foreign tax, U.S. tax, and your state.",
    lead: 4,
    tail: 10,
    show: [
      { t: "Your", w: 0 },
      { t: "real", w: 1, gold: true },
      { t: "return", w: 2 },
    ],
  },
  {
    shot: "questions",
    text: "Answer twelve questions. Three minutes.",
    lead: 4,
    tail: 12,
    show: [
      { t: "12", w: 1, gold: true },
      { t: "questions.", w: 2 },
      { t: "3", w: 3, gold: true, br: true },
      { t: "minutes.", w: 4 },
    ],
  },
  {
    shot: "ranking",
    text: "Get your free ranking. Every country, scored for you.",
    lead: 4,
    tail: 14,
    show: [
      { t: "Free", w: 2, gold: true },
      { t: "ranking.", w: 3 },
    ],
  },
  {
    shot: "numbers",
    text: "Seventeen destinations. Fifty-one state tax codes. Four layers of tax.",
    lead: 2,
    tail: 12,
  },
  {
    shot: "unlock",
    text: "Then unlock the full report.",
    lead: 4,
    tail: 10,
    show: [
      { t: "The", w: 3 },
      { t: "full", w: 4, gold: true },
      { t: "report.", w: 5 },
    ],
  },
  {
    shot: "waterfall",
    text: "Every dollar, from gross rent to what actually lands in your account.",
    lead: 2,
    tail: 16,
    show: [
      { t: "Every", w: 0 },
      { t: "dollar.", w: 1, gold: true },
    ],
  },
  {
    shot: "simulator",
    text: "Move the sliders. Price, rent, interest, currency. Your return updates live.",
    lead: 2,
    tail: 14,
    show: [
      { t: "Updates", w: 10 },
      { t: "live.", w: 11, gold: true },
    ],
  },
  {
    shot: "sections",
    text: "Ownership rules. Closing costs. Financing. Best cities. Risks. And a step-by-step checklist.",
    lead: 2,
    tail: 10,
  },
  {
    shot: "assistant",
    text: "Questions? Ask your report. Answers come straight from your numbers.",
    lead: 2,
    tail: 14,
    show: [
      { t: "Ask", w: 1 },
      { t: "your", w: 2 },
      { t: "report.", w: 3, gold: true },
    ],
  },
  {
    shot: "deliver",
    text: "Download your PDF. Talk to vetted experts.",
    lead: 2,
    tail: 12,
  },
  {
    shot: "trust",
    text: "Every number, sourced and dated.",
    lead: 2,
    tail: 12,
    show: [
      { t: "Sourced", w: 2, gold: true },
      { t: "and", w: 3, br: true },
      { t: "dated.", w: 4, gold: true },
    ],
  },
  {
    shot: "pricing",
    text: "Your ranking is free. The full report: thirty-nine dollars, once.",
    lead: 2,
    tail: 16,
  },
  {
    shot: "next",
    text: "Your next address is out there.",
    lead: 10,
    tail: 30,
    min: 110,
    show: [
      { t: "Your", w: 0 },
      { t: "next", w: 1, gold: true },
      { t: "address", w: 2, br: true },
      { t: "is", w: 3 },
      { t: "out", w: 4, br: true },
      { t: "there.", w: 5 },
    ],
  },
  {
    shot: "finale",
    text: "AbroadYield. Find out what you'll really earn.",
    lead: 30,
    tail: 75,
    show: [
      { t: "Find", w: 1 },
      { t: "out", w: 2 },
      { t: "what", w: 3 },
      { t: "you’ll", w: 4, br: true },
      { t: "really", w: 5, gold: true },
      { t: "earn.", w: 6 },
    ],
  },
];

const words = (text: string) => text.split(/\s+/).filter(Boolean);

/** Estimated narration pace for an energetic ad read (ElevenLabs-like). Seconds from line start. */
const estimate = (text: string): { starts: number[]; end: number } => {
  let t = 0;
  const starts: number[] = [];
  for (const w of words(text)) {
    starts.push(t);
    const letters = w.replace(/[^A-Za-z0-9]/g, "").length;
    t += 0.1 + 0.052 * letters;
    if (/[.?!:]$/.test(w)) t += 0.3;
    else if (/,$/.test(w)) t += 0.14;
  }
  return { starts, end: t - 0.2 };
};

export type TimedLine = Line & {
  index: number;
  id: string;
  /** Shot start and length in the film, frames. */
  from: number;
  frames: number;
  /** Voice start within the shot, frames. */
  voiceAt: number;
  /** Word start frames within the shot. */
  wordAt: number[];
  voiceEnd: number;
};

export const SHOTS: TimedLine[] = (() => {
  let at = 0;
  return LINES.map((line, index) => {
    const id = `${String(index + 1).padStart(2, "0")}-${line.shot}`;
    const timing = MEASURED[id] ?? estimate(line.text);
    const lead = line.lead ?? 4;
    const voiceEnd = lead + Math.round(timing.end * FPS);
    const frames = Math.max(line.min ?? 0, voiceEnd + (line.tail ?? 10));
    const shot: TimedLine = {
      ...line,
      index,
      id,
      from: at,
      frames,
      voiceAt: lead,
      wordAt: timing.starts.map((s) => lead + Math.round(s * FPS)),
      voiceEnd,
    };
    at += frames;
    return shot;
  });
})();

export const TOTAL_FRAMES = SHOTS.reduce((sum, s) => sum + s.frames, 0);

export const shot = (id: ShotId): TimedLine => {
  const s = SHOTS.find((x) => x.shot === id);
  if (!s) throw new Error(`Unknown shot ${id}`);
  return s;
};

/** Frame (within the shot) at which spoken word `w` starts. */
export const wordAt = (id: ShotId, w: number): number => {
  const s = shot(id);
  return s.wordAt[Math.min(w, s.wordAt.length - 1)] ?? s.voiceAt;
};
