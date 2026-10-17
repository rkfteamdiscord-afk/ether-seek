import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, fontFamily } from "../brand";
import {
  Burst,
  Count,
  DEST,
  Flash,
  GOLD,
  GOLD_GRAD,
  Glass,
  H,
  Mark,
  Phone,
  Rays,
  SampleNote,
  Shine,
  Stage,
  Tap,
  Words,
  clamp,
  expoOut,
  goldText,
  useProgress,
  useShake,
  useSpring,
} from "./ui";
import { shot, wordAt } from "./vo";

/* 06 — The promise: your real return, after three layers of tax. */
const LAYERS = [
  {
    w: 7,
    title: "Foreign tax",
    sub: "Local tax on rent, treaty-aware",
    icon: "◍",
  },
  {
    w: 9,
    title: "US federal tax",
    sub: "Foreign tax credit + NIIT",
    icon: "★",
  },
  { w: 12, title: "Your state", sub: "All 50 states + DC", icon: "◆" },
];

export const PromiseShot: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("promise");
  const result = useSpring(s.voiceEnd - 6, 12, 190);
  const arc = useProgress(4, 50);
  return (
    <AbsoluteFill>
      <Stage />
      {/* Flight arc from the US to abroad */}
      <svg
        width={1080}
        height={520}
        style={{ position: "absolute", top: 520, left: 0 }}
      >
        <path
          d="M140 400 C 340 60, 740 60, 940 400"
          stroke="rgba(216,184,120,0.7)"
          strokeWidth={4}
          strokeDasharray="4 16"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          style={{ strokeDasharray: `${arc} 1` }}
        />
        <circle cx={140} cy={400} r={14} fill="#fff" />
        <circle cx={940} cy={400} r={14} fill={GOLD} opacity={arc} />
        <text
          x={140}
          y={460}
          fill="rgba(255,255,255,0.75)"
          fontFamily={fontFamily}
          fontSize={30}
          fontWeight={700}
          textAnchor="middle"
          letterSpacing="4"
        >
          USA
        </text>
        <text
          x={940}
          y={460}
          fill={GOLD}
          fontFamily={fontFamily}
          fontSize={30}
          fontWeight={700}
          textAnchor="middle"
          letterSpacing="4"
          opacity={arc}
        >
          ABROAD
        </text>
        {(() => {
          const t = arc;
          const x =
            (1 - t) ** 3 * 140 +
            3 * (1 - t) ** 2 * t * 340 +
            3 * (1 - t) * t * t * 740 +
            t ** 3 * 940;
          const y =
            (1 - t) ** 3 * 400 +
            3 * (1 - t) ** 2 * t * 60 +
            3 * (1 - t) * t * t * 60 +
            t ** 3 * 400;
          return (
            <circle
              cx={x}
              cy={y}
              r={10}
              fill="#fff"
              style={{ filter: "drop-shadow(0 0 12px #fff)" }}
            />
          );
        })()}
      </svg>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
        <Words id="promise" size={150} />
        <div
          style={{
            marginTop: 26,
            fontFamily,
            fontSize: 44,
            fontWeight: 500,
            color: "rgba(255,255,255,0.75)",
            opacity: useProgress(wordAt("promise", 3), 12),
          }}
        >
          on property abroad
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 100,
          right: 100,
          top: 1010,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {LAYERS.map((l, i) => {
          const at = wordAt("promise", l.w) - 3;
          const p = interpolate(frame - at, [0, 14], [0, 1], {
            ...clamp,
            easing: expoOut,
          });
          return (
            <Glass
              key={l.title}
              radius={34}
              style={{
                padding: "30px 38px",
                display: "flex",
                alignItems: "center",
                gap: 30,
                opacity: p,
                transform: `perspective(1600px) translateX(${(1 - p) * (i % 2 ? 700 : -700)}px) rotateY(${(1 - p) * (i % 2 ? -50 : 50)}deg)`,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 24,
                  background: GOLD_GRAD,
                  color: C.navy,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 46,
                  fontWeight: 900,
                }}
              >
                {l.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 50,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {l.title}
                </div>
                <div
                  style={{
                    fontSize: 32,
                    color: "rgba(255,255,255,0.65)",
                    marginTop: 4,
                  }}
                >
                  {l.sub}
                </div>
              </div>
              <div style={{ fontSize: 50, fontWeight: 800, color: GOLD }}>
                −
              </div>
            </Glass>
          );
        })}
        <div
          style={{
            marginTop: 20,
            alignSelf: "center",
            padding: "26px 54px",
            borderRadius: 99,
            background: GOLD_GRAD,
            color: C.navy,
            fontFamily,
            fontWeight: 800,
            fontSize: 50,
            letterSpacing: "-0.02em",
            scale: String(result),
            opacity: frame > s.voiceEnd - 6 ? 1 : 0,
            boxShadow: "0 0 60px rgba(216,184,120,0.55)",
          }}
        >
          = What you really keep
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 07 — 12 questions, 3 minutes: the questionnaire on a phone, tapped through at speed. */
const QUESTIONS = [
  [
    "Are you a US citizen or green card holder?",
    ["US citizen", "Green card holder", "Neither"],
  ],
  ["Where do you live?", ["In the US", "Abroad"]],
  ["Household income", ["Under $100k", "$150k – $250k", "Over $250k"]],
  ["Filing status", ["Single", "Married filing jointly"]],
  ["Cash available", ["$100k", "$250k", "$500k+"]],
  ["Property budget", ["$150k", "$300k", "$600k"]],
  ["Financing", ["All cash", "Local mortgage", "US loan"]],
  ["Your main goal", ["Income", "Growth", "Future home"]],
  ["Rental strategy", ["Long-term", "Short-term"]],
  ["Risk tolerance", ["Low", "Medium", "High"]],
  ["Lifestyle", ["Beach", "City", "Mountains"]],
  ["Where should we send it?", ["you@email.com"]],
] as const;

export const Questions: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("questions");
  const start = 8;
  const per = Math.max(
    3,
    Math.floor((s.voiceEnd - start - 4) / QUESTIONS.length),
  );
  const q = Math.min(
    QUESTIONS.length - 1,
    Math.max(0, Math.floor((frame - start) / per)),
  );
  const local = frame - start - q * per;
  const done = frame > start + per * QUESTIONS.length;
  const phone = useSpring(0, 16, 120);
  const check = useSpring(start + per * QUESTIONS.length, 9, 240);
  const [title, options] = QUESTIONS[q]!;
  const pick = q % options.length === 0 ? Math.min(1, options.length - 1) : 0;
  return (
    <AbsoluteFill>
      <Stage />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
        <Words id="questions" size={130} />
      </AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, top: 380 }}>
        <Phone
          scale={0.62}
          rx={interpolate(phone, [0, 1], [50, 10])}
          ry={interpolate(frame, [0, s.frames], [-14, 10])}
          y={interpolate(phone, [0, 1], [1400, 0])}
        >
          <div style={{ padding: "150px 64px", fontFamily, color: C.ink }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 34,
                fontWeight: 700,
                color: "#7c8798",
              }}
            >
              <span>
                Question {q + 1} of {QUESTIONS.length}
              </span>
              <span style={{ color: "#9a7a43" }}>~3 min</span>
            </div>
            <div
              style={{
                height: 16,
                borderRadius: 99,
                background: "#e8e2d6",
                marginTop: 24,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${((q + (done ? 1 : Math.min(1, local / per))) / QUESTIONS.length) * 100}%`,
                  background: GOLD_GRAD,
                  borderRadius: 99,
                }}
              />
            </div>
            <div
              key={q}
              style={{
                marginTop: 90,
                opacity: interpolate(local, [0, 2], [0, 1], clamp),
                translate: `${interpolate(local, [0, 3], [120, 0], { ...clamp, easing: expoOut })}px 0px`,
              }}
            >
              <div
                style={{
                  fontSize: 76,
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.05,
                  minHeight: 250,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  marginTop: 50,
                  display: "flex",
                  flexDirection: "column",
                  gap: 28,
                }}
              >
                {options.map((o, i) => {
                  const on = i === pick && local >= per - 3;
                  return (
                    <div
                      key={o}
                      style={{
                        padding: "40px 44px",
                        borderRadius: 34,
                        fontSize: 46,
                        fontWeight: 700,
                        border: `4px solid ${on ? C.navy : "#e2dccf"}`,
                        background: on ? C.navy : "#fff",
                        color: on ? "#fff" : C.ink,
                      }}
                    >
                      {o}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {done ? (
            <AbsoluteFill
              style={{
                background: C.navy,
                alignItems: "center",
                justifyContent: "center",
                gap: 40,
              }}
            >
              <div
                style={{
                  width: 260,
                  height: 260,
                  borderRadius: 999,
                  background: GOLD_GRAD,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 160,
                  color: C.navy,
                  fontWeight: 900,
                  scale: String(check),
                }}
              >
                ✓
              </div>
              <div
                style={{
                  fontFamily,
                  fontSize: 70,
                  fontWeight: 800,
                  color: "#fff",
                  opacity: check,
                }}
              >
                Ranking ready
              </div>
            </AbsoluteFill>
          ) : null}
        </Phone>
        {!done ? (
          <Tap x={540} y={990 + pick * 106} at={start + q * per + per - 3} />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/* 08 — Free ranking: every country scored 0–100, rows sort themselves. */
const RANK = [
  { id: "ae", score: 78 },
  { id: "pa", score: 74 },
  { id: "th", score: 72 },
  { id: "ie", score: 70 },
  { id: "jp", score: 70 },
  { id: "cr", score: 64 },
  { id: "gr", score: 62 },
];
const START_ORDER = [5, 2, 6, 0, 3, 1, 4];

export const Ranking: React.FC = () => {
  const frame = useCurrentFrame();
  const sortAt = wordAt("ranking", 5);
  const sort = useProgress(sortAt, 22);
  const panel = useSpring(0, 16, 130);
  return (
    <AbsoluteFill>
      <Stage />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
        <Words id="ranking" size={150} />
        <div
          style={{
            marginTop: 26,
            padding: "12px 28px",
            borderRadius: 99,
            border: `2px solid ${GOLD}`,
            color: GOLD,
            fontFamily,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.12em",
            opacity: useProgress(wordAt("ranking", 3), 12),
          }}
        >
          NO CARD NEEDED
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 620,
          transform: `perspective(2200px) rotateX(${interpolate(panel, [0, 1], [35, 6])}deg) translateY(${interpolate(panel, [0, 1], [1200, 0])}px)`,
        }}
      >
        <Glass radius={46} style={{ padding: "40px 36px", height: 1080 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "0 10px 26px",
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 800 }}>Your ranking</div>
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
              }}
            >
              Score 0–100
            </div>
          </div>
          <div style={{ position: "relative" }}>
            {RANK.map((r, i) => {
              const startSlot = START_ORDER.indexOf(i);
              const slot = interpolate(sort, [0, 1], [startSlot, i]);
              const enter = interpolate(
                frame - (6 + startSlot * 3),
                [0, 12],
                [0, 1],
                { ...clamp, easing: expoOut },
              );
              const top = i === 0 && sort > 0.95;
              return (
                <div
                  key={r.id}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: slot * 138,
                    height: 120,
                    borderRadius: 30,
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    padding: "0 26px 0 14px",
                    background: top
                      ? "rgba(216,184,120,0.18)"
                      : "rgba(255,255,255,0.06)",
                    border: `2px solid ${top ? GOLD : "rgba(255,255,255,0.1)"}`,
                    opacity: enter,
                    translate: `${(1 - enter) * 400}px 0px`,
                    zIndex: 10 - i,
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      fontSize: 36,
                      fontWeight: 800,
                      color: GOLD,
                      textAlign: "center",
                    }}
                  >
                    {sort > 0.6 ? i + 1 : "–"}
                  </div>
                  <Img
                    src={staticFile(DEST[r.id]!.photo)}
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: 22,
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 42,
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {DEST[r.id]!.name}
                    </div>
                    <div
                      style={{
                        height: 10,
                        borderRadius: 99,
                        background: "rgba(255,255,255,0.12)",
                        marginTop: 12,
                        width: 380,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 99,
                          width: `${r.score * enter}%`,
                          background:
                            r.score >= 68
                              ? GOLD_GRAD
                              : "linear-gradient(90deg,#9fb6d6,#6f8db8)",
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 56,
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      <Count to={r.score} at={8 + startSlot * 3} len={26} />
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: r.score >= 68 ? GOLD : "rgba(255,255,255,0.55)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {r.score >= 68 ? "STRONG FIT" : "POSSIBLE"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Shine at={sortAt + 24} />
        </Glass>
      </div>
      <SampleNote text="Example profile: married couple in NY, $200k income, cash buyer · sample data" />
    </AbsoluteFill>
  );
};

/* 09 — The numbers: 17 destinations, 51 state tax codes, 4 tax layers. */
export const Numbers: React.FC = () => {
  const frame = useCurrentFrame();
  const b1 = wordAt("numbers", 0);
  const b2 = wordAt("numbers", 2);
  const b3 = wordAt("numbers", 6);
  const beat = frame < b2 - 4 ? 0 : frame < b3 - 4 ? 1 : 2;
  const beatStart = [b1, b2, b3][beat]!;
  const enter = useSpring(beatStart - 4, 12, 220);
  const ids = Object.keys(DEST);
  const big = ["17", "51", "4"][beat]!;
  const label = ["destinations", "state tax codes", "layers of tax"][beat]!;
  return (
    <AbsoluteFill style={{ translate: useShake([b1, b2, b3], 14) }}>
      <Stage grid={beat !== 0} />
      {beat === 0 ? (
        <AbsoluteFill style={{ perspective: 1400 }}>
          {ids.map((id, i) => {
            const a = (i / ids.length) * Math.PI * 2 + frame / 26;
            const z = Math.sin(a) * 520;
            return (
              <Img
                key={id}
                src={staticFile(DEST[id]!.photo)}
                style={{
                  position: "absolute",
                  left: 540 - 130,
                  top: 960 - 170,
                  width: 260,
                  height: 340,
                  objectFit: "cover",
                  borderRadius: 26,
                  transform: `translate3d(${Math.cos(a) * 560}px, ${Math.sin(a * 2) * 90 - 40}px, ${z}px) rotateY(${-Math.cos(a) * 35}deg)`,
                  opacity:
                    interpolate(z, [-520, 0, 520], [0.35, 0.75, 1]) *
                    interpolate(frame, [0, 10], [0, 1], clamp),
                  filter: z < 0 ? "blur(3px) brightness(0.6)" : undefined,
                  boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
                }}
              />
            );
          })}
        </AbsoluteFill>
      ) : null}
      {beat === 1 ? (
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 1180,
            width: 860,
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 18,
          }}
        >
          {Array.from({ length: 51 }, (_, i) => {
            const t = frame - b2 - (i % 10) * 1.2 - Math.floor(i / 10) * 2;
            const on = interpolate(t, [0, 8], [0, 1], clamp);
            return (
              <div
                key={i}
                style={{
                  height: 68,
                  borderRadius: 14,
                  background: on > 0.5 ? GOLD_GRAD : "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  scale: String(0.6 + on * 0.4),
                  boxShadow:
                    on > 0.5 ? "0 0 22px rgba(216,184,120,0.5)" : undefined,
                }}
              />
            );
          })}
        </div>
      ) : null}
      {beat === 2 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1130,
            perspective: 1600,
          }}
        >
          {["Local tax", "US federal", "State tax", "NIIT"].map((name, i) => {
            const p = interpolate(frame - b3 - i * 4, [0, 14], [0, 1], {
              ...clamp,
              easing: expoOut,
            });
            return (
              <div
                key={name}
                style={{
                  position: "absolute",
                  left: 190,
                  width: 700,
                  height: 150,
                  top: 340 - i * 110 - (1 - p) * 700,
                  transform: "rotateX(58deg) rotateZ(-30deg)",
                  borderRadius: 30,
                  background:
                    i % 2 ? "rgba(255,255,255,0.12)" : "rgba(216,184,120,0.3)",
                  border: `2.5px solid ${i % 2 ? "rgba(255,255,255,0.4)" : GOLD}`,
                  opacity: p,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 46,
                  color: "#fff",
                  boxShadow: "0 30px 50px rgba(0,0,0,0.4)",
                }}
              >
                {name}
              </div>
            );
          })}
        </div>
      ) : null}
      <AbsoluteFill
        style={{ alignItems: "center", paddingTop: beat === 0 ? 300 : 260 }}
      >
        <div
          key={beat}
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 440,
            lineHeight: 1,
            letterSpacing: "-0.07em",
            scale: String(interpolate(enter, [0, 1], [2.2, 1])),
            filter: `blur(${interpolate(enter, [0, 0.6], [20, 0], clamp)}px)`,
            opacity: frame >= beatStart - 4 ? 1 : 0,
            ...goldText,
          }}
        >
          <Count to={Number(big)} at={beatStart - 4} len={16} />
        </div>
        <H
          size={84}
          weight={700}
          style={{ marginTop: -10, opacity: enter, letterSpacing: "-0.03em" }}
        >
          {label}
        </H>
      </AbsoluteFill>
      <Flash at={b2 - 4} peak={0.35} />
      <Flash at={b3 - 4} peak={0.35} />
    </AbsoluteFill>
  );
};

/* 10 — Unlock the full report: the padlock opens, the report cover rises. */
export const Unlock: React.FC = () => {
  const frame = useCurrentFrame();
  const open = wordAt("unlock", 1);
  const shackle = useProgress(open, 10);
  const lockOut = useProgress(open + 10, 12);
  const cover = useSpring(open + 8, 14, 150);
  return (
    <AbsoluteFill style={{ translate: useShake([open], 14) }}>
      <Stage />
      <Rays at={open} opacity={0.55} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 220 }}>
        <Words id="unlock" size={140} />
      </AbsoluteFill>
      {/* Padlock */}
      <div
        style={{
          position: "absolute",
          left: 540 - 130,
          top: 900,
          width: 260,
          height: 320,
          opacity: 1 - lockOut,
          scale: String(1 + lockOut * 0.6),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 45,
            top: interpolate(shackle, [0, 1], [0, -70]),
            width: 170,
            height: 190,
            borderRadius: "90px 90px 0 0",
            border: `28px solid ${GOLD}`,
            borderBottom: "none",
            rotate: `${shackle * -18}deg`,
            transformOrigin: "15% 100%",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 140,
            width: 260,
            height: 190,
            borderRadius: 40,
            background: GOLD_GRAD,
            boxShadow: "0 0 80px rgba(216,184,120,0.6)",
          }}
        />
      </div>
      <Burst
        x={540}
        y={1050}
        at={open + 2}
        count={36}
        spread={650}
        seed="unlock"
      />
      {/* Report cover */}
      <div
        style={{
          position: "absolute",
          left: 190,
          width: 700,
          top: 640,
          height: 960,
          opacity: frame > open + 8 ? 1 : 0,
          transform: `perspective(2000px) translateY(${interpolate(cover, [0, 1], [700, 0])}px) rotateX(${interpolate(cover, [0, 1], [60, 8])}deg) rotateY(${interpolate(frame, [open, open + 60], [-16, 8], clamp)}deg)`,
        }}
      >
        <Glass
          radius={30}
          style={{
            height: "100%",
            padding: 60,
            background: `linear-gradient(160deg, #18315a 0%, ${C.navy} 60%, #0a1628 100%)`,
            overflow: "hidden",
          }}
        >
          <Mark size={110} drawn />
          <div
            style={{
              marginTop: 60,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: GOLD,
            }}
          >
            FULL REPORT
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              marginTop: 16,
              lineHeight: 1,
            }}
          >
            Portugal
          </div>
          <div
            style={{
              fontSize: 34,
              color: "rgba(255,255,255,0.65)",
              marginTop: 16,
            }}
          >
            Prepared for your profile
          </div>
          <div
            style={{
              marginTop: 70,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {[
              "Executive summary",
              "Returns, step by step",
              "US tax module",
              "Best cities",
              "Buying checklist",
            ].map((t, i) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  gap: 20,
                  fontSize: 34,
                  fontWeight: 600,
                  opacity: interpolate(
                    frame - open - 18 - i * 3,
                    [0, 8],
                    [0, 1],
                    clamp,
                  ),
                }}
              >
                <span style={{ color: GOLD, width: 40 }}>
                  {String.fromCharCode(97 + i)}
                </span>
                {t}
              </div>
            ))}
          </div>
          <Shine at={open + 26} />
        </Glass>
      </div>
      <Flash at={open} color={GOLD} peak={0.35} />
    </AbsoluteFill>
  );
};
