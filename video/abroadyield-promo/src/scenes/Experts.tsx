import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, fontFamily } from "../brand";
import { Kicker, clamp, useSpringAt } from "../kit";

const CARDS = [
  { title: "Branded PDF report", text: "Waterfall, simulator, checklist" },
  { title: "Vetted local experts", text: "Tax, legal and mortgage pros" },
  { title: "Ask your report", text: "An assistant that knows your numbers" },
];

const Card: React.FC<{ i: number }> = ({ i }) => {
  const card = CARDS[i]!;
  const s = useSpringAt(8 + i * 8, 10, 200);
  return (
    <div
      style={{
        padding: "40px 46px",
        borderRadius: 40,
        background: "rgba(251,249,245,0.94)",
        color: C.navy,
        fontFamily,
        rotate: `${interpolate(s, [0, 1], [i % 2 ? 90 : -90, i % 2 ? 2 : -2])}deg`,
        scale: String(interpolate(s, [0, 1], [0.2, 1])),
        opacity: s,
        boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 72, letterSpacing: "-0.04em" }}>
        {card.title}
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 44,
          color: "rgba(15,31,58,0.7)",
          marginTop: 8,
        }}
      >
        {card.text}
      </div>
    </div>
  );
};

/** Feature 4: report, experts, assistant, over a drifting photo. */
export const Experts: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Img
        src={staticFile("photos/athens.jpg")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, 66], [1.25, 1.05], clamp)),
          filter: "blur(6px) brightness(0.55)",
        }}
      />
      <AbsoluteFill
        style={{ padding: "0 80px", justifyContent: "center", gap: 36 }}
      >
        <Kicker>Feature 04</Kicker>
        <Card i={0} />
        <Card i={1} />
        <Card i={2} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
