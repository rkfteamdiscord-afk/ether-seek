import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, fontFamily } from "../brand";
import { Flash, Kicker, SampleNote, clamp, useSpringAt } from "../kit";

// After-tax yields from the site's hero examples (New York married couple, cash purchase).
const ROWS = [
  { place: "Dubai", net: 4.1 },
  { place: "Athens", net: 2.7 },
  { place: "Costa Rica", net: 2.4 },
  { place: "Lisbon", net: 2.2 },
  { place: "Rome", net: 1.9 },
];

const Row: React.FC<{ i: number; place: string; net: number }> = ({
  i,
  place,
  net,
}) => {
  const frame = useCurrentFrame();
  const s = useSpringAt(14 + i * 6, 12, 220);
  const fill = interpolate(frame, [22 + i * 6, 46 + i * 6], [0, net / 4.1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "30px 36px",
        borderRadius: 34,
        background: i === 0 ? C.navy : C.white,
        color: i === 0 ? C.white : C.navy,
        boxShadow: "0 24px 50px -30px rgba(15,31,58,0.6)",
        fontFamily,
        translate: `0px ${interpolate(s, [0, 1], [500, 0])}px`,
        rotate: `${interpolate(s, [0, 1], [i % 2 ? 6 : -6, 0])}deg`,
        opacity: s,
      }}
    >
      <div
        style={{ fontSize: 60, fontWeight: 900, width: 70, color: C.champagne }}
      >
        {i + 1}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.03em" }}
        >
          {place}
        </div>
        <div
          style={{
            height: 16,
            marginTop: 14,
            borderRadius: 99,
            background:
              i === 0 ? "rgba(255,255,255,0.15)" : "rgba(15,31,58,0.08)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${fill * 100}%`,
              borderRadius: 99,
              background: C.champagne,
            }}
          />
        </div>
      </div>
      <div style={{ fontSize: 58, fontWeight: 900, letterSpacing: "-0.03em" }}>
        {net.toFixed(1)}%
      </div>
    </div>
  );
};

/** Feature 1: the free ranking, sorted by what you keep. */
export const Ranking: React.FC = () => {
  const title = useSpringAt(0, 12, 200);
  return (
    <AbsoluteFill style={{ background: C.ivory, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ padding: "0 80px 140px", justifyContent: "center", gap: 26 }}
      >
        <Kicker>Feature 01</Kicker>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 112,
            lineHeight: 0.98,
            letterSpacing: "-0.05em",
            color: C.navy,
            marginBottom: 24,
            scale: String(interpolate(title, [0, 1], [1.6, 1])),
            transformOrigin: "left top",
          }}
        >
          Free ranking
          <br />
          <span style={{ color: C.champagne }}>in 3 minutes.</span>
        </div>
        {ROWS.map((r, i) => (
          <Row key={r.place} i={i} place={r.place} net={r.net} />
        ))}
      </AbsoluteFill>
      <SampleNote
        dark={false}
        text="Return you keep after taxes · examples, sample data"
      />
      <Flash at={0} />
    </AbsoluteFill>
  );
};
