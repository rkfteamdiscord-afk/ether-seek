import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, fontFamily } from "../brand";
import {
  Flash,
  NightBg,
  SampleNote,
  clamp,
  useShake,
  useSpringAt,
} from "../kit";
import { RgbText } from "./fx";

/** "7%" is stamped, cracks into slices that fly off, and "3.1%" lands (Portugal example). */
export const Shatter: React.FC = () => {
  const frame = useCurrentFrame();
  const stamp = useSpringAt(0, 8, 300);
  const BREAK = 42;
  const land = useSpringAt(BREAK + 10, 8, 260);
  const slices = [0, 1, 2, 3, 4];
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.ivory }}>
      <AbsoluteFill style={{ translate: useShake([2, BREAK, BREAK + 12], 40) }}>
        <div
          style={{
            position: "absolute",
            top: 260,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily,
            fontWeight: 800,
            fontSize: 64,
            letterSpacing: "-0.03em",
            color: C.navy,
          }}
        >
          {frame < BREAK ? "The listing says" : "You actually keep"}
        </div>
        {frame < BREAK + 30
          ? slices.map((i) => {
              const t = Math.max(0, frame - BREAK);
              const dir = i % 2 ? 1 : -1;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 560,
                    height: 520,
                    textAlign: "center",
                    fontFamily,
                    fontWeight: 900,
                    fontSize: 520,
                    lineHeight: 1,
                    letterSpacing: "-0.07em",
                    color: C.champagne,
                    clipPath: `inset(${i * 20}% 0 ${80 - i * 20}% 0)`,
                    transform: `translate(${dir * t * t * 3}px, ${t * t * (i - 2) * 1.5}px) rotate(${dir * t * 2.5}deg) scale(${interpolate(stamp, [0, 1], [3, 1])})`,
                    opacity: interpolate(t, [0, 25], [1, 0], clamp),
                  }}
                >
                  7%
                </div>
              );
            })
          : null}
        {frame >= BREAK + 10 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 600,
              scale: String(interpolate(land, [0, 1], [0.2, 1])),
            }}
          >
            <RgbText size={400} delay={BREAK + 10} color={C.navy}>
              3.1%
            </RgbText>
          </div>
        ) : null}
      </AbsoluteFill>
      <SampleNote
        dark={false}
        text="Portugal example · after costs, local + US taxes · sample data"
      />
      <Flash at={BREAK} color={C.champagne} />
    </AbsoluteFill>
  );
};

const WORDS = [
  "FOREIGN TAX",
  "US FEDERAL",
  "STATE TAX",
  "NIIT",
  "FX RISK",
  "CLOSING COSTS",
  "VACANCY",
  "FEES",
];

/** The costs spiral into the centre like a drain, then collapse into one word. */
export const Tornado: React.FC = () => {
  const frame = useCurrentFrame();
  const collapse = interpolate(frame, [70, 90], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const reveal = useSpringAt(88, 9, 240);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBg tint="#8a6224" />
      <AbsoluteFill
        style={{ translate: useShake([88], 50), rotate: `${frame * 0.6}deg` }}
      >
        {WORDS.map((w, i) => {
          const a = (i / WORDS.length) * Math.PI * 2 + frame / 9;
          const r =
            interpolate(frame, [0, 70], [900, 260], clamp) * (1 - collapse);
          return (
            <div
              key={w}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                translate: `calc(-50% + ${Math.cos(a) * r}px) calc(-50% + ${Math.sin(a) * r * 1.6}px)`,
                rotate: `${(a * 180) / Math.PI + 90}deg`,
                fontFamily,
                fontWeight: 900,
                fontSize: 70,
                letterSpacing: "-0.03em",
                color: i % 2 ? C.white : C.champagne,
                whiteSpace: "nowrap",
                opacity: 1 - collapse,
              }}
            >
              − {w}
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 80px",
        }}
      >
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 120,
            lineHeight: 0.95,
            letterSpacing: "-0.05em",
            color: C.white,
            textAlign: "center",
            scale: String(interpolate(reveal, [0, 1], [0, 1])),
            rotate: `${interpolate(reveal, [0, 1], [-200, 0])}deg`,
          }}
        >
          Nobody shows you
          <br />
          <span style={{ color: C.champagne }}>this math.</span>
        </div>
      </AbsoluteFill>
      <Flash at={88} />
    </AbsoluteFill>
  );
};
