import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, fontFamily } from "../brand";
import {
  Flash,
  Kicker,
  NightBg,
  SampleNote,
  clamp,
  useShake,
  useSpringAt,
} from "../kit";

const QUESTIONS = [
  "Citizenship",
  "Where you live",
  "Your income",
  "Filing status",
  "Cash available",
  "Budget",
  "Financing",
  "Your goal",
  "Rental strategy",
  "Risk tolerance",
  "Lifestyle",
  "Email",
];

/** Feature: the questionnaire speed-run — 12 cards flick past, the progress bar fills. */
export const Speedrun: React.FC = () => {
  const frame = useCurrentFrame();
  const step = Math.min(QUESTIONS.length - 1, Math.floor(frame / 6));
  const done = frame > QUESTIONS.length * 6 + 4;
  const pop = useSpringAt(QUESTIONS.length * 6 + 4, 7, 260);
  return (
    <AbsoluteFill style={{ background: C.ivory, overflow: "hidden" }}>
      <AbsoluteFill style={{ padding: "230px 80px", gap: 30 }}>
        <Kicker>Step 1</Kicker>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 112,
            lineHeight: 0.96,
            letterSpacing: "-0.05em",
            color: C.navy,
          }}
        >
          12 questions.
          <br />
          <span style={{ color: C.champagne }}>3 minutes.</span>
        </div>
        <div style={{ position: "relative", height: 640, marginTop: 30 }}>
          {QUESTIONS.map((q, i) => {
            const local = frame - i * 6;
            if (local < -2 || local > 14) return null;
            const out = interpolate(local, [6, 12], [0, 1], {
              ...clamp,
              easing: Easing.in(Easing.cubic),
            });
            const inn = interpolate(local, [-2, 4], [1, 0], {
              ...clamp,
              easing: Easing.out(Easing.back(1.5)),
            });
            return (
              <div
                key={q}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 48,
                  background: C.white,
                  boxShadow: "0 40px 80px -40px rgba(15,31,58,0.6)",
                  padding: 60,
                  fontFamily,
                  color: C.navy,
                  transform: `translateX(${out * -1300 + inn * 900}px) rotate(${out * -18 + inn * 14}deg)`,
                }}
              >
                <div
                  style={{ fontSize: 40, fontWeight: 800, color: C.champagne }}
                >
                  {i + 1} / {QUESTIONS.length}
                </div>
                <div
                  style={{
                    fontSize: 96,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    marginTop: 20,
                  }}
                >
                  {q}
                </div>
                {[0, 1, 2].map((o) => (
                  <div
                    key={o}
                    style={{
                      marginTop: 26,
                      height: 90,
                      borderRadius: 26,
                      border: `4px solid ${o === i % 3 ? C.navy : "rgba(15,31,58,0.15)"}`,
                      background:
                        o === i % 3 ? "rgba(201,166,107,0.25)" : "transparent",
                    }}
                  />
                ))}
              </div>
            );
          })}
          {done ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 48,
                background: C.navy,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily,
                fontWeight: 900,
                fontSize: 120,
                color: C.white,
                scale: String(pop),
              }}
            >
              ✓ Done
            </div>
          ) : null}
        </div>
        <div
          style={{
            height: 24,
            borderRadius: 99,
            background: "rgba(15,31,58,0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((step + 1) / QUESTIONS.length) * 100}%`,
              background: C.champagne,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// After-tax yields from the site's examples (New York married couple, cash purchase).
const START = ["Athens", "Panama City", "Dubai", "Bangkok", "Dublin"];
const SORTED = [
  { place: "Dubai", net: 4.1 },
  { place: "Dublin", net: 3.3 },
  { place: "Bangkok", net: 2.9 },
  { place: "Panama City", net: 2.8 },
  { place: "Athens", net: 2.7 },
];

/** Feature: the ranking — rows start shuffled, then sort themselves by what you keep. */
export const Shuffle: React.FC = () => {
  const frame = useCurrentFrame();
  const sort = interpolate(frame, [30, 60], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.back(1.4)),
  });
  const ROW = 170;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBg />
      <AbsoluteFill
        style={{
          padding: "230px 80px",
          gap: 26,
          translate: useShake([60], 30),
        }}
      >
        <Kicker>Step 2</Kicker>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 112,
            lineHeight: 0.96,
            letterSpacing: "-0.05em",
            color: C.white,
          }}
        >
          Your ranking,
          <br />
          <span style={{ color: C.champagne }}>sorted by profit.</span>
        </div>
        <div style={{ position: "relative", height: ROW * 5, marginTop: 30 }}>
          {SORTED.map((row, rank) => {
            const from = START.indexOf(row.place);
            const y = interpolate(sort, [0, 1], [from * ROW, rank * ROW]);
            const x = Math.sin(sort * Math.PI) * (rank % 2 ? 160 : -160);
            const enter = interpolate(
              frame,
              [from * 4, from * 4 + 10],
              [1, 0],
              { ...clamp, easing: Easing.out(Easing.cubic) },
            );
            return (
              <div
                key={row.place}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: ROW - 24,
                  transform: `translate(${x + enter * 1200}px, ${y}px) rotate(${Math.sin(sort * Math.PI) * (rank % 2 ? 5 : -5)}deg)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  padding: "0 40px",
                  borderRadius: 36,
                  background: frame > 60 && rank === 0 ? C.champagne : C.white,
                  color: C.navy,
                  fontFamily,
                }}
              >
                <div
                  style={{
                    fontSize: 64,
                    fontWeight: 900,
                    width: 70,
                    opacity: frame > 60 ? 1 : 0.2,
                  }}
                >
                  {rank + 1}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 60,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {row.place}
                </div>
                <div style={{ fontSize: 64, fontWeight: 900 }}>
                  {row.net.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <SampleNote text="Return kept after all taxes · examples, sample data" />
    </AbsoluteFill>
  );
};

const STATES =
  "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(
    " ",
  );

/** Feature: every state's tax — 51 tiles ripple in, the viewer's state lights up. */
export const States: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ivory, overflow: "hidden" }}>
      <AbsoluteFill style={{ padding: "230px 70px", gap: 30 }}>
        <Kicker>Step 3</Kicker>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 112,
            lineHeight: 0.96,
            letterSpacing: "-0.05em",
            color: C.navy,
          }}
        >
          Your state&apos;s tax
          <br />
          <span style={{ color: C.champagne }}>is built in.</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 14,
            marginTop: 30,
          }}
        >
          {STATES.map((s, i) => {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const d = (col + row) * 2;
            const p = interpolate(frame, [d, d + 10], [0, 1], {
              ...clamp,
              easing: Easing.out(Easing.back(2)),
            });
            const hot = s === "NY" || s === "CA" || s === "TX" || s === "FL";
            const lit = hot && frame > 45;
            return (
              <div
                key={s}
                style={{
                  height: 104,
                  borderRadius: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily,
                  fontWeight: 900,
                  fontSize: 42,
                  background: lit ? C.champagne : C.navy,
                  color: C.white,
                  transform: `scale(${p}) rotate(${(1 - p) * 90}deg)`,
                }}
              >
                {s}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Flash at={0} />
    </AbsoluteFill>
  );
};

/** Feature: the report — PDF pages fan out in 3D, expert and assistant badges drop in. */
export const Report: React.FC = () => {
  const frame = useCurrentFrame();
  const fan = useSpringAt(6, 11, 160);
  const badges = [
    "Branded PDF report",
    "Vetted local experts",
    "Ask-your-report assistant",
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBg />
      <AbsoluteFill style={{ padding: "230px 80px", gap: 26 }}>
        <Kicker>Step 4</Kicker>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 112,
            lineHeight: 0.96,
            letterSpacing: "-0.05em",
            color: C.white,
          }}
        >
          The full report.
          <br />
          <span style={{ color: C.champagne }}>Every dollar.</span>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 980,
          perspective: 1400,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 440,
              height: 580,
              left: -220,
              top: -290,
              borderRadius: 26,
              background: C.ivory,
              boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7)",
              transform: `rotateY(${(i - 2) * 22 * fan}deg) rotateZ(${(i - 2) * 8 * fan}deg) translateX(${(i - 2) * 150 * fan}px) translateZ(${-Math.abs(i - 2) * 80}px)`,
              padding: 36,
            }}
          >
            <div
              style={{
                height: 26,
                width: "60%",
                borderRadius: 99,
                background: C.navy,
              }}
            />
            {[0.9, 0.7, 0.8, 0.5].map((w, k) => (
              <div
                key={k}
                style={{
                  height: 16,
                  width: `${w * 100}%`,
                  borderRadius: 99,
                  background: "rgba(15,31,58,0.15)",
                  marginTop: 22,
                }}
              />
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 14,
                height: 220,
                marginTop: 30,
              }}
            >
              {[1, 0.62, 0.45, 0.4].map((h, k) => (
                <div
                  key={k}
                  style={{
                    flex: 1,
                    height: `${h * 100 * Math.min(1, fan)}%`,
                    borderRadius: 10,
                    background: k === 3 ? C.champagne : C.steel,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 200,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {badges.map((b, i) => {
          const d = 26 + i * 8;
          const p = interpolate(frame, [d, d + 10], [0, 1], {
            ...clamp,
            easing: Easing.out(Easing.back(2)),
          });
          return (
            <div
              key={b}
              style={{
                alignSelf: i % 2 ? "flex-end" : "flex-start",
                padding: "22px 34px",
                borderRadius: 99,
                background: C.white,
                color: C.navy,
                fontFamily,
                fontWeight: 800,
                fontSize: 46,
                transform: `translateY(${(1 - p) * -900}px) rotate(${(1 - p) * (i % 2 ? 40 : -40)}deg)`,
              }}
            >
              ✓ {b}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
