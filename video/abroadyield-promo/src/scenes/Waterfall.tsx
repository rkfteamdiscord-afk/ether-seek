import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, fontFamily } from "../brand";
import {
  Kicker,
  NightBg,
  SampleNote,
  clamp,
  useShake,
  useSpringAt,
} from "../kit";

// Portugal example from the site: $250k at 7% gross; about $7,900 kept.
const STEPS = [
  { label: "Gross\nrent", amount: 17500, from: 0, to: 17500, color: C.sand },
  {
    label: "Running\ncosts",
    amount: -6750,
    from: 10750,
    to: 17500,
    color: C.steel,
  },
  {
    label: "Local +\nUS tax",
    amount: -2850,
    from: 7900,
    to: 10750,
    color: C.steel,
  },
  { label: "You\nkeep", amount: 7900, from: 0, to: 7900, color: C.champagne },
];
const H = 760;
const MAX = 17500;

const Bar: React.FC<{ i: number }> = ({ i }) => {
  const step = STEPS[i]!;
  const s = useSpringAt(10 + i * 10, 9, 200);
  const top = H - (step.to / MAX) * H;
  const height = ((step.to - step.from) / MAX) * H;
  return (
    <div style={{ position: "relative", width: 200, height: H }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: top - interpolate(s, [0, 1], [900, 0]),
          height,
          borderRadius: 22,
          background: step.color,
          opacity: s,
          boxShadow: i === 3 ? `0 0 80px ${C.champagne}` : "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -20,
          right: -20,
          top: top - 74,
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 46,
          color: C.white,
          opacity: s,
        }}
      >
        {step.amount < 0 ? "−" : ""}$
        {Math.abs(step.amount).toLocaleString("en-US")}
      </div>
      <div
        style={{
          position: "absolute",
          top: H + 24,
          left: -10,
          right: -10,
          textAlign: "center",
          whiteSpace: "pre-line",
          lineHeight: 1.15,
          fontFamily,
          fontWeight: 700,
          fontSize: 38,
          color: "rgba(255,255,255,0.8)",
        }}
      >
        {step.label}
      </div>
    </div>
  );
};

/** Feature 2: every dollar explained, as a falling waterfall. */
export const Waterfall: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBg />
      <AbsoluteFill
        style={{
          padding: "0 80px 120px",
          justifyContent: "center",
          gap: 24,
          translate: useShake([20, 30, 40, 50], 14),
        }}
      >
        <Kicker>Feature 02</Kicker>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 112,
            lineHeight: 0.98,
            letterSpacing: "-0.05em",
            color: C.white,
          }}
        >
          Every dollar,
          <br />
          <span style={{ color: C.champagne }}>explained.</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 110,
            rotate: `${interpolate(frame, [0, 84], [-3, 0], clamp)}deg`,
          }}
        >
          <Bar i={0} />
          <Bar i={1} />
          <Bar i={2} />
          <Bar i={3} />
        </div>
      </AbsoluteFill>
      <SampleNote text="Per year · Portugal example · sample data" />
    </AbsoluteFill>
  );
};
