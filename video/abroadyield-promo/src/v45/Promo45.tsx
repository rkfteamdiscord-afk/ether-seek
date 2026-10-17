import React from "react";
import { Audio } from "@remotion/media";
import {
  TransitionSeries,
  linearTiming,
  type TransitionPresentation,
} from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { pushCut } from "@remotion/transitions/push-cut";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import { C } from "../brand";
import { Drone, DroneLine } from "./fx";
import { Report, Shuffle, Speedrun, States } from "./Features";
import { Finale } from "./Finale";
import { Hook45, Storm } from "./Opening";
import {
  SCENES,
  TRANSITIONS,
  VOICE_LINES,
  sceneStart,
  type SceneId,
} from "./timeline";
import { Shatter, Tornado } from "./Truth";
import { VOICEOVER_READY } from "./voiceover.generated";

const scene = (id: SceneId): React.ReactNode => {
  switch (id) {
    case "hook":
      return <Hook45 />;
    case "drone-gaztelugatxe":
      return (
        <Drone
          src="drone/gaztelugatxe-spain.jpg"
          place="Gaztelugatxe, Spain"
          move="rise"
        >
          <DroneLine accent="a place abroad?">Dreaming of</DroneLine>
        </Drone>
      );
    case "storm":
      return <Storm />;
    case "drone-navagio":
      return (
        <Drone
          src="drone/navagio-greece.jpg"
          place="Navagio, Greece"
          move="fly"
        >
          <DroneLine accent="says 7%.">The listing</DroneLine>
        </Drone>
      );
    case "shatter":
      return <Shatter />;
    case "tornado":
      return <Tornado />;
    case "drone-krka":
      return (
        <Drone src="drone/krka-croatia.jpg" place="Krka, Croatia" move="orbit">
          <DroneLine accent="runs the real math.">AbroadYield</DroneLine>
        </Drone>
      );
    case "speedrun":
      return <Speedrun />;
    case "shuffle":
      return <Shuffle />;
    case "drone-lagos":
      return (
        <Drone
          src="drone/lagos-portugal.jpg"
          place="Lagos, Portugal"
          move="rise"
        >
          <DroneLine accent="City view?">Sea view?</DroneLine>
        </Drone>
      );
    case "states":
      return <States />;
    case "drone-santorini":
      return (
        <Drone
          src="drone/santorini-greece.jpg"
          place="Santorini, Greece"
          move="orbit"
        >
          <DroneLine accent="Every fee.">Every tax.</DroneLine>
        </Drone>
      );
    case "report":
      return <Report />;
    case "drone-calanques":
      return (
        <Drone
          src="drone/calanques-france.jpg"
          place="Calanques, France"
          move="fly"
        >
          <DroneLine delay={4}>Your next</DroneLine>
        </Drone>
      );
    case "drone-dubai":
      return (
        <Drone src="drone/dubai-uae.jpg" place="Dubai, UAE" move="orbit">
          <DroneLine delay={4}>address</DroneLine>
        </Drone>
      );
    case "drone-tokyo":
      return (
        <Drone src="drone/tokyo-japan.jpg" place="Tokyo, Japan" move="rise">
          <DroneLine delay={4} accent="is waiting.">
            {""}
          </DroneLine>
        </Drone>
      );
    case "finale":
      return <Finale />;
  }
};

/** Cycle of transitions between scenes (all CSS-based, so they render headless). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPresentation = TransitionPresentation<any>;
const transition = (
  i: number,
  width: number,
  height: number,
): AnyPresentation => {
  const kinds: AnyPresentation[] = [
    pushCut({ flashColor: C.champagne }),
    slide({ direction: "from-bottom" }),
    wipe({ direction: "from-top-right" }),
    flip({ direction: "from-left" }),
    clockWipe({ width, height }),
    slide({ direction: "from-right" }),
    iris({ width, height }),
    wipe({ direction: "from-bottom-left" }),
  ];
  return kinds[i % kinds.length]!;
};

/** 45-second 9:16 promo: fast cuts, simulated drone shots, features, CTA. */
export const Promo45: React.FC = () => {
  const { fps, width, height } = useVideoConfig();
  return (
    <>
      <Audio
        src={staticFile("audio/soundtrack45.wav")}
        volume={VOICEOVER_READY ? 0.55 : 1}
      />
      {VOICEOVER_READY
        ? VOICE_LINES.map((line) => (
            <Sequence
              key={line.id}
              from={sceneStart(line.scene) + line.offset}
              premountFor={fps}
            >
              <Audio src={staticFile(`voiceover45/${line.id}.mp3`)} />
            </Sequence>
          ))
        : null}
      <TransitionSeries>
        {SCENES.flatMap((s, i) => {
          const nodes = [
            <TransitionSeries.Sequence
              key={s.id}
              name={s.id}
              durationInFrames={s.frames}
              premountFor={fps}
            >
              {scene(s.id)}
            </TransitionSeries.Sequence>,
          ];
          const t = TRANSITIONS[i];
          if (t !== undefined) {
            nodes.push(
              <TransitionSeries.Transition
                key={`${s.id}-t`}
                presentation={transition(i, width, height)}
                timing={linearTiming({ durationInFrames: t })}
              />,
            );
          }
          return nodes;
        })}
      </TransitionSeries>
    </>
  );
};
