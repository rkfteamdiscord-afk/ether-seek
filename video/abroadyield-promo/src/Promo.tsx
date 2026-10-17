import React from "react";
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { pushCut } from "@remotion/transitions/push-cut";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";
import { C } from "./brand";
import { Costs } from "./scenes/Costs";
import { Cta } from "./scenes/Cta";
import { Experts } from "./scenes/Experts";
import { Hook } from "./scenes/Hook";
import { PhotoBlitz } from "./scenes/PhotoBlitz";
import { Ranking } from "./scenes/Ranking";
import { RealNumber } from "./scenes/RealNumber";
import { UsTax } from "./scenes/UsTax";
import { Waterfall } from "./scenes/Waterfall";

/** 9:16 promo, ~24 s: hook, destinations, the real number, four features, CTA. */
export const Promo: React.FC = () => {
  const { fps, width, height } = useVideoConfig();
  return (
    <>
      {/* Original soundtrack synced to these cuts: scripts/soundtrack.py */}
      <Audio src={staticFile("audio/soundtrack.wav")} />
      <TransitionSeries>
        <TransitionSeries.Sequence
          name="Hook"
          durationInFrames={66}
          premountFor={fps}
        >
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut({ flashColor: C.champagne })}
          timing={linearTiming({ durationInFrames: 10 })}
        />
        <TransitionSeries.Sequence
          name="Destinations"
          durationInFrames={124}
          premountFor={fps}
        >
          <PhotoBlitz />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 12,
          })}
        />
        <TransitionSeries.Sequence
          name="Real number"
          durationInFrames={96}
          premountFor={fps}
        >
          <RealNumber />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-top-left" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />
        <TransitionSeries.Sequence
          name="Costs"
          durationInFrames={75}
          premountFor={fps}
        >
          <Costs />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={flip({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 14,
          })}
        />
        <TransitionSeries.Sequence
          name="Ranking"
          durationInFrames={96}
          premountFor={fps}
        >
          <Ranking />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={clockWipe({ width, height })}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence
          name="Waterfall"
          durationInFrames={84}
          premountFor={fps}
        >
          <Waterfall />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={iris({ width, height })}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence
          name="US tax"
          durationInFrames={70}
          premountFor={fps}
        >
          <UsTax />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 12,
          })}
        />
        <TransitionSeries.Sequence
          name="Experts"
          durationInFrames={70}
          premountFor={fps}
        >
          <Experts />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut({ flashColor: C.white })}
          timing={linearTiming({ durationInFrames: 10 })}
        />
        <TransitionSeries.Sequence
          name="CTA"
          durationInFrames={135}
          premountFor={fps}
        >
          <Cta />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
