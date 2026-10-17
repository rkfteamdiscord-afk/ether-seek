import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, fontFamily } from "../brand";
import { Flash, Kicker, clamp, useSpringAt } from "../kit";

const CHIPS = [
  "Foreign Tax Credit",
  "Form 1116",
  "FBAR",
  "FATCA",
  "Schedule E",
  "State tax",
  "NIIT",
];

const Chip: React.FC<{ label: string; i: number }> = ({ label, i }) => {
  const frame = useCurrentFrame();
  const s = useSpringAt(8 + i * 4, 9, 260);
  const angle = (i / CHIPS.length) * Math.PI * 2 + frame / 40;
  const r = interpolate(s, [0, 1], [1400, 330]);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "57%",
        translate: `calc(-50% + ${Math.cos(angle) * r}px) calc(-50% + ${Math.sin(angle) * r * 1.25}px)`,
        padding: "22px 34px",
        borderRadius: 999,
        background: i % 3 === 0 ? C.navy : C.white,
        color: i % 3 === 0 ? C.white : C.navy,
        border: `3px solid ${C.navy}`,
        fontFamily,
        fontWeight: 800,
        fontSize: 44,
        whiteSpace: "nowrap",
        rotate: `${Math.sin(frame / 8 + i) * 6}deg`,
      }}
    >
      {label}
    </div>
  );
};

/** Feature 3: US tax rules orbit the flag line. */
export const UsTax: React.FC = () => {
  const frame = useCurrentFrame();
  const center = useSpringAt(4, 8, 200);
  return (
    <AbsoluteFill style={{ background: C.ivory, overflow: "hidden" }}>
      <AbsoluteFill style={{ padding: "230px 80px", gap: 24 }}>
        <Kicker>Feature 03</Kicker>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 112,
            lineHeight: 0.98,
            letterSpacing: "-0.05em",
            color: C.navy,
          }}
        >
          Built for
          <br />
          <span style={{ color: C.champagne }}>US taxpayers.</span>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "57%",
          translate: "-50% -50%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: C.navy,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 110,
          color: C.white,
          scale: String(center),
          rotate: `${interpolate(frame, [0, 66], [-30, 10], clamp)}deg`,
          boxShadow: `0 0 0 24px rgba(201,166,107,0.25)`,
        }}
      >
        US
      </div>
      {CHIPS.map((c, i) => (
        <Chip key={c} label={c} i={i} />
      ))}
      <Flash at={0} />
    </AbsoluteFill>
  );
};
