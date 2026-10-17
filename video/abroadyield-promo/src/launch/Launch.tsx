import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { LogoReveal, Listing, Nobody, Open, Reality } from "./Act1";
import { Numbers, PromiseShot, Questions, Ranking, Unlock } from "./Act2";
import {
  Assistant,
  Deliver,
  Sections,
  Simulator,
  Trust,
  Waterfall,
} from "./Act3";
import { Finale, Next, Pricing } from "./Act4";
import { Shot, type Move } from "./ui";
import { SHOTS, type ShotId } from "./vo";
import { VOICE_READY } from "./vo-timings.generated";

const SCENES: Record<ShotId, { C: React.FC; enter: Move; exit: Move }> = {
  open: { C: Open, enter: "none", exit: "zoom" },
  listing: { C: Listing, enter: "zoom", exit: "whip-up" },
  reality: { C: Reality, enter: "whip-up", exit: "zoom" },
  nobody: { C: Nobody, enter: "zoom", exit: "zoom" },
  logo: { C: LogoReveal, enter: "zoom", exit: "whip-left" },
  promise: { C: PromiseShot, enter: "whip-left", exit: "whip-up" },
  questions: { C: Questions, enter: "whip-up", exit: "whip-left" },
  ranking: { C: Ranking, enter: "whip-left", exit: "zoom" },
  numbers: { C: Numbers, enter: "zoom", exit: "zoom" },
  unlock: { C: Unlock, enter: "zoom", exit: "zoom" },
  waterfall: { C: Waterfall, enter: "zoom", exit: "whip-left" },
  simulator: { C: Simulator, enter: "whip-left", exit: "whip-up" },
  sections: { C: Sections, enter: "whip-up", exit: "whip-left" },
  assistant: { C: Assistant, enter: "whip-left", exit: "zoom" },
  deliver: { C: Deliver, enter: "zoom", exit: "whip-up" },
  trust: { C: Trust, enter: "whip-up", exit: "zoom" },
  pricing: { C: Pricing, enter: "zoom", exit: "zoom" },
  next: { C: Next, enter: "zoom", exit: "zoom" },
  finale: { C: Finale, enter: "zoom", exit: "none" },
};

/** Music sits under the voice: -10 dB while a line is spoken, eased in and out. */
const musicVolume = (f: number) => {
  if (!VOICE_READY) return 1;
  let duck = 0;
  for (const s of SHOTS) {
    const a = s.from + s.voiceAt;
    const b = s.from + s.voiceEnd;
    duck = Math.max(
      duck,
      interpolate(f, [a - 6, a, b, b + 10], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
  }
  return 1 - duck * 0.68;
};

/** AbroadYield launch film, 9:16. Every shot is cut to its voice-over line (see vo.ts). */
export const Launch: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#060d19" }}>
      <Audio
        src={staticFile("launch/soundtrack-launch.wav")}
        volume={musicVolume}
      />
      {VOICE_READY
        ? SHOTS.map((s) => (
            <Sequence
              key={`vo-${s.id}`}
              from={s.from + s.voiceAt}
              premountFor={fps}
            >
              <Audio src={staticFile(`launch/voice/${s.id}.mp3`)} />
            </Sequence>
          ))
        : null}
      {SHOTS.map((s) => {
        const { C: Scene, enter, exit } = SCENES[s.shot];
        return (
          <Sequence
            key={s.id}
            name={s.id}
            from={s.from}
            durationInFrames={s.frames}
            premountFor={fps}
          >
            <Shot frames={s.frames} enter={enter} exit={exit}>
              <Scene />
            </Shot>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
