import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { C, fontFamily } from "../brand";
import {
  Flash,
  Kicker,
  SampleNote,
  clamp,
  useShake,
  useSpringAt,
} from "../kit";

const BARS = [
  { label: "Advertised", value: 7.0, color: C.sand },
  { label: "After costs", value: 4.3, color: C.steel },
  { label: "After all taxes", value: 3.1, color: C.navy },
];

/** The twist: 7.0% counts down to 3.1% while bars collapse. Figures from the site's Portugal example. */
export const RealNumber: React.FC = () => {
  const frame = useCurrentFrame();
  const n = interpolate(frame, [18, 62], [7.0, 3.1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const land = useSpringAt(62, 7, 300);
  return (
    <AbsoluteFill style={{ background: C.ivory, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          padding: "0 80px 120px",
          justifyContent: "center",
          gap: 30,
          translate: useShake([62], 30),
        }}
      >
        <Kicker delay={0}>The real number</Kicker>
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 84,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: C.navy,
          }}
        >
          A 7% listing pays…
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 380,
            letterSpacing: "-0.07em",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            color: interpolateColors(frame, [18, 62], [C.champagne, C.navy]),
            scale: String(
              1 + land * 0.08 - (frame > 62 ? (frame - 62) * 0.0015 : 0),
            ),
            transformOrigin: "left center",
          }}
        >
          {n.toFixed(1)}%
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 34,
            marginTop: 30,
          }}
        >
          {BARS.map((b, i) => {
            const grow = interpolate(
              frame,
              [6 + i * 14, 26 + i * 14],
              [0, b.value / 7],
              {
                ...clamp,
                easing: Easing.out(Easing.back(1.6)),
              },
            );
            return (
              <div key={b.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily,
                    fontSize: 50,
                    fontWeight: 600,
                    color: C.navy,
                    marginBottom: 12,
                  }}
                >
                  <span>{b.label}</span>
                  <span style={{ fontWeight: 800 }}>{b.value.toFixed(1)}%</span>
                </div>
                <div
                  style={{
                    height: 34,
                    borderRadius: 99,
                    background: "rgba(15,31,58,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${grow * 100}%`,
                      borderRadius: 99,
                      background: b.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <SampleNote
        dark={false}
        text="Portugal example · $250k, after local + US taxes · sample data"
      />
      <Flash at={0} color={C.champagne} />
    </AbsoluteFill>
  );
};
