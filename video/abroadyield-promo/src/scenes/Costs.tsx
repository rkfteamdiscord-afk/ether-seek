import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, fontFamily } from "../brand";
import { Kicker, NightBg, clamp, useShake, useSpringAt } from "../kit";

const ITEMS = ["Foreign tax", "US tax", "Closing costs", "Currency risk"];

const Card: React.FC<{ label: string; i: number }> = ({ label, i }) => {
  const delay = 6 + i * 9;
  const s = useSpringAt(delay, 10, 240);
  const dir = i % 2 ? 1 : -1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "38px 46px",
        borderRadius: 40,
        background: i % 2 ? "rgba(255,255,255,0.08)" : C.ivory,
        border: "2px solid rgba(255,255,255,0.15)",
        color: i % 2 ? C.white : C.navy,
        fontFamily,
        fontWeight: 800,
        fontSize: 92,
        letterSpacing: "-0.04em",
        translate: `${interpolate(s, [0, 1], [dir * 1100, 0])}px 0px`,
        rotate: `${interpolate(s, [0, 1], [dir * 18, dir * -2])}deg`,
      }}
    >
      <span style={{ color: C.champagne, fontWeight: 900 }}>−</span>
      {label}
    </div>
  );
};

/** What eats the yield: four cards fly in from alternating sides. */
export const Costs: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBg tint="#8a6224" />
      <AbsoluteFill
        style={{
          padding: "0 80px",
          justifyContent: "center",
          gap: 34,
          translate: useShake([10, 19, 28, 37], 18),
          scale: String(interpolate(frame, [45, 75], [1, 1.12], clamp)),
        }}
      >
        <Kicker>What the listing leaves out</Kicker>
        {ITEMS.map((label, i) => (
          <Card key={label} label={label} i={i} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
