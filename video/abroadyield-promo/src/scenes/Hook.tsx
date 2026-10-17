import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { Flash, NightBg, Slam, clamp, useShake } from "../kit";

/** 0–2s: three words slam in, camera shakes on each hit, then punches in. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBg />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          translate: useShake([0, 10, 20], 34),
          scale: String(interpolate(frame, [36, 66], [1, 1.35], clamp)),
        }}
      >
        <Slam delay={0} size={170} rotate={-10}>
          BUYING
        </Slam>
        <Slam delay={10} size={170} rotate={8}>
          A HOME
        </Slam>
        <Slam delay={20} size={190} color={C.champagne} rotate={-6}>
          ABROAD?
        </Slam>
      </AbsoluteFill>
      <Flash at={0} />
      <Flash at={10} color={C.champagne} />
      <Flash at={20} />
    </AbsoluteFill>
  );
};
