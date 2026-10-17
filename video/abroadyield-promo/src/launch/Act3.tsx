import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, fontFamily } from "../brand";
import {
  Burst,
  Count,
  GOLD,
  GOLD_GRAD,
  Glass,
  H,
  Kicker,
  Mark,
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
  usd,
} from "./ui";
import { shot, wordAt } from "./vo";

/* 11 — Every dollar: the report's waterfall, from gross rent to what lands in your account. */
const STEPS = [
  { label: "Gross rent", v: 17500, kind: "start" },
  { label: "Vacancy", v: -1050 },
  { label: "Management", v: -1316 },
  { label: "Maintenance", v: -2000 },
  { label: "Insurance", v: -375 },
  { label: "Property tax", v: -875 },
  { label: "Condo / HOA", v: -1080 },
  { label: "Net operating income", v: 10804, kind: "sub" },
  { label: "Local income tax", v: -2701 },
  { label: "US federal (after credit)", v: 0 },
  { label: "US state tax", v: -247 },
  { label: "After-tax income", v: 7856, kind: "total" },
] as const;

export const Waterfall: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("waterfall");
  const card = useSpring(0, 16, 140);
  const lands = wordAt("waterfall", 8);
  const per = Math.max(3, Math.floor((lands - 10) / STEPS.length));
  const W = 400;
  const scaleX = W / 17500;
  let running = 0;
  const rows = STEPS.map((st) => {
    let x0: number;
    let x1: number;
    if ("kind" in st) {
      x0 = 0;
      x1 = st.v;
      running = st.v;
    } else {
      x1 = running;
      x0 = running + st.v;
      running += st.v;
    }
    return { ...st, x0, x1 };
  });
  const push = interpolate(frame, [0, s.frames], [1, 1.07], clamp);
  return (
    <AbsoluteFill>
      <Stage />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 190 }}>
        <Words id="waterfall" size={140} />
        <div
          style={{
            marginTop: 18,
            fontFamily,
            fontSize: 40,
            fontWeight: 500,
            color: "rgba(255,255,255,0.72)",
            opacity: useProgress(wordAt("waterfall", 2), 12),
          }}
        >
          from gross rent to your bank account
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 560,
          transform: `perspective(2200px) rotateX(${interpolate(card, [0, 1], [40, 4])}deg) translateY(${interpolate(card, [0, 1], [1200, 0])}px) scale(${push})`,
        }}
      >
        <Glass
          radius={44}
          style={{ padding: "40px 40px 30px", overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 800 }}>
              Returns, step by step
            </div>
            <div
              style={{
                fontSize: 26,
                color: GOLD,
                fontWeight: 700,
                letterSpacing: "0.14em",
              }}
            >
              YEAR ONE · USD
            </div>
          </div>
          <div
            style={{
              marginTop: 30,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {rows.map((r, i) => {
              const at = 8 + i * per;
              const p = interpolate(frame - at, [0, 10], [0, 1], {
                ...clamp,
                easing: expoOut,
              });
              const isTotal = "kind" in r && r.kind === "total";
              const isSub = "kind" in r;
              const left = Math.min(r.x0, r.x1) * scaleX;
              const width = Math.max(4, Math.abs(r.x1 - r.x0) * scaleX);
              return (
                <div
                  key={r.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 70,
                    opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                  }}
                >
                  <div
                    style={{
                      width: 270,
                      fontSize: 27,
                      fontWeight: isSub ? 800 : 600,
                      color: isSub ? "#fff" : "rgba(255,255,255,0.75)",
                      lineHeight: 1.05,
                    }}
                  >
                    {r.label}
                  </div>
                  <div style={{ position: "relative", width: W, height: 50 }}>
                    <div
                      style={{
                        position: "absolute",
                        left: isSub ? left : left + width * (1 - p),
                        width: width * p,
                        top: 0,
                        bottom: 0,
                        borderRadius: 10,
                        background: isTotal
                          ? GOLD_GRAD
                          : isSub
                            ? "linear-gradient(90deg,#c9d6ea,#8fa8cc)"
                            : "rgba(255,120,120,0.55)",
                        boxShadow: isTotal
                          ? "0 0 40px rgba(216,184,120,0.6)"
                          : undefined,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 150,
                      textAlign: "right",
                      fontSize: 30,
                      fontWeight: 800,
                      fontVariantNumeric: "tabular-nums",
                      color: isTotal ? GOLD : isSub ? "#fff" : "#ff9e9e",
                    }}
                  >
                    {r.v < 0 ? "−" : ""}
                    {usd(Math.abs(r.v) * p)}
                  </div>
                </div>
              );
            })}
          </div>
          <Shine at={lands} />
        </Glass>
      </div>
      <Burst
        x={850}
        y={1500}
        at={8 + 11 * per + 6}
        count={22}
        spread={380}
        seed="wf"
      />
      <SampleNote text="Portugal · $250,000 apartment · sample data, to be verified" />
    </AbsoluteFill>
  );
};

/* 12 — The simulator: four sliders dragged in turn, the result updates live. */
const SLIDERS = [
  {
    label: "Price",
    w: 3,
    from: 0.5,
    to: 0.35,
    fmt: (t: number) => usd(150000 + t * 200000),
  },
  {
    label: "Rent",
    w: 4,
    from: 0.5,
    to: 0.75,
    fmt: (t: number) => `${usd(14000 + t * 7000)}/yr`,
  },
  {
    label: "Interest rate",
    w: 5,
    from: 0.4,
    to: 0.6,
    fmt: (t: number) => `${(3 + t * 5).toFixed(1)}%`,
  },
  {
    label: "Currency",
    w: 6,
    from: 0.5,
    to: 0.3,
    fmt: (t: number) =>
      `${t >= 0.5 ? "+" : "−"}${Math.abs((t - 0.5) * 40).toFixed(0)}% EUR`,
  },
];

export const Simulator: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useSpring(0, 16, 140);
  const pos = SLIDERS.map((sl) => {
    const at = wordAt("simulator", sl.w) - 4;
    return interpolate(frame, [at, at + 16], [sl.from, sl.to], {
      ...clamp,
      easing: expoOut,
    });
  });
  // Illustrative response: yield follows rent/price and currency; cash flow also feels the rate.
  const price = 150000 + pos[0]! * 200000;
  const rent = 14000 + pos[1]! * 7000;
  const fx = 1 + (pos[3]! - 0.5) * 0.4;
  const yieldPct = 3.14 * (rent / 17500) * (250000 / price) * fx;
  const cash = 7856 * (rent / 17500) * fx - (pos[2]! - 0.4) * 9000;
  const live = wordAt("simulator", 10);
  return (
    <AbsoluteFill>
      <Stage />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 190 }}>
        <Kicker at={0}>Sensitivity simulator</Kicker>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 300,
          transform: `perspective(2200px) rotateX(${interpolate(card, [0, 1], [40, 5])}deg) rotateY(${interpolate(frame, [0, 170], [-6, 6], clamp)}deg) translateY(${interpolate(card, [0, 1], [1300, 0])}px)`,
        }}
      >
        <Glass radius={46} style={{ padding: "50px 50px 40px" }}>
          <div style={{ display: "flex", gap: 30 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.1em",
                }}
              >
                AFTER-TAX YIELD
              </div>
              <div
                style={{
                  fontSize: 150,
                  fontWeight: 900,
                  letterSpacing: "-0.06em",
                  lineHeight: 1.05,
                  ...goldText,
                }}
              >
                {yieldPct.toFixed(1)}%
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.1em",
                }}
              >
                CASH FLOW / YR
              </div>
              <div
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  lineHeight: 1.6,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {usd(cash)}
              </div>
            </div>
          </div>
          {/* Live sparkline */}
          <svg width={840} height={170} style={{ marginTop: 10 }}>
            <path
              d={Array.from({ length: 40 }, (_, i) => {
                const x = i * 21.5;
                const y =
                  120 -
                  (yieldPct / 5) * 80 -
                  Math.sin(i / 3 + frame / 8) * 10 -
                  i * (yieldPct - 3) * 0.6;
                return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
              }).join(" ")}
              stroke={GOLD}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              marginTop: 30,
              display: "flex",
              flexDirection: "column",
              gap: 52,
            }}
          >
            {SLIDERS.map((sl, i) => {
              const active =
                Math.abs(frame - (wordAt("simulator", sl.w) + 4)) < 12;
              return (
                <div key={sl.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 38,
                      fontWeight: 700,
                    }}
                  >
                    <span>{sl.label}</span>
                    <span
                      style={{
                        color: active ? GOLD : "rgba(255,255,255,0.8)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {sl.fmt(pos[i]!)}
                    </span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: 14,
                      borderRadius: 99,
                      background: "rgba(255,255,255,0.14)",
                      marginTop: 26,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${pos[i]! * 100}%`,
                        borderRadius: 99,
                        background: GOLD_GRAD,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: `${pos[i]! * 100}%`,
                        top: 7,
                        width: 58,
                        height: 58,
                        marginLeft: -29,
                        marginTop: -29,
                        borderRadius: 99,
                        background: "#fff",
                        boxShadow: active
                          ? `0 0 0 10px rgba(216,184,120,0.35), 0 10px 30px rgba(0,0,0,0.4)`
                          : "0 10px 30px rgba(0,0,0,0.4)",
                        scale: active ? "1.15" : "1",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Glass>
      </div>
      {SLIDERS.map((sl, i) => {
        const at = wordAt("simulator", sl.w) - 4;
        return (
          <Tap
            key={sl.label}
            x={
              120 +
              840 *
                interpolate(frame, [at, at + 16], [sl.from, sl.to], {
                  ...clamp,
                  easing: expoOut,
                })
            }
            y={842 + i * 138}
            at={at + 2}
          />
        );
      })}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 220,
        }}
      >
        <Words id="simulator" size={130} />
      </AbsoluteFill>
      <Shine at={live} />
      <SampleNote text="Illustrative values" bottom={120} />
    </AbsoluteFill>
  );
};

/* 13 — Everything else in the report, item by item, building the table of contents. */
const ITEMS = [
  {
    w: 0,
    letter: "b",
    title: "Ownership rules",
    sub: "Can you buy? Documents and timeline",
  },
  {
    w: 2,
    letter: "c",
    title: "Closing costs",
    sub: "Total acquisition cost, line by line",
  },
  {
    w: 4,
    letter: "d",
    title: "Financing",
    sub: "Cash, local or US loans compared",
  },
  {
    w: 5,
    letter: "g",
    title: "Best cities",
    sub: "Lisbon · Porto · Algarve · Braga",
  },
  { w: 7, letter: "h", title: "Risks", sub: "And how to reduce them" },
  {
    w: 10,
    letter: "i",
    title: "Step-by-step checklist",
    sub: "From first visit to first rent",
  },
];

export const Sections: React.FC = () => {
  const frame = useCurrentFrame();
  const current = ITEMS.reduce(
    (acc, it, i) => (frame >= wordAt("sections", it.w) - 3 ? i : acc),
    -1,
  );
  const hits = ITEMS.map((it) => wordAt("sections", it.w) - 3);
  return (
    <AbsoluteFill style={{ translate: useShake(hits, 8) }}>
      <Stage />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 190 }}>
        <Kicker at={0}>Inside the full report</Kicker>
      </AbsoluteFill>
      {/* The current item, huge */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
        {current >= 0 ? (
          <BigItem
            key={current}
            at={hits[current]!}
            title={ITEMS[current]!.title}
          />
        ) : null}
      </AbsoluteFill>
      {/* The growing list */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 720,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {ITEMS.map((it, i) => {
          const p = interpolate(frame - hits[i]!, [0, 12], [0, 1], {
            ...clamp,
            easing: expoOut,
          });
          const on = i === current;
          return (
            <Glass
              key={it.title}
              radius={30}
              style={{
                padding: "26px 34px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                opacity: p,
                translate: `${(1 - p) * 600}px 0px`,
                border: on ? `2px solid ${GOLD}` : undefined,
                background: on
                  ? "linear-gradient(160deg, rgba(216,184,120,0.24), rgba(216,184,120,0.06))"
                  : undefined,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 20,
                  background: on ? GOLD_GRAD : "rgba(255,255,255,0.1)",
                  color: on ? C.navy : GOLD,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 38,
                  fontWeight: 800,
                }}
              >
                {frame > hits[i]! + 10 && i !== current ? "✓" : it.letter}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {it.title}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    color: "rgba(255,255,255,0.65)",
                    marginTop: 4,
                  }}
                >
                  {it.sub}
                </div>
              </div>
            </Glass>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const BigItem: React.FC<{ at: number; title: string }> = ({ at, title }) => {
  const s = useSpring(at, 12, 230);
  return (
    <H
      size={title.length > 14 ? 92 : 124}
      weight={850}
      style={{
        textAlign: "center",
        scale: String(interpolate(s, [0, 1], [1.6, 1])),
        filter: `blur(${interpolate(s, [0, 0.6], [16, 0], clamp)}px)`,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        ...goldText,
      }}
    >
      {title}
    </H>
  );
};

/* 14 — Ask your report: a question, then an answer grounded in the report's own numbers. */
const QUESTION = "Why is Spain lower than Portugal?";
const ANSWER =
  "On the same $250,000 apartment, Spain's local tax on rent is about $3,990 a year, versus $2,701 in Portugal. That gap is most of the difference.";

export const Assistant: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("assistant");
  const panel = useSpring(0, 16, 140);
  const qStart = 6;
  const qChars = Math.floor(
    interpolate(frame, [qStart, qStart + 26], [0, QUESTION.length], clamp),
  );
  const sent = frame > qStart + 30;
  const aStart = qStart + 44;
  const thinking = frame > qStart + 32 && frame < aStart;
  const aChars = Math.floor(
    interpolate(frame, [aStart, s.frames - 20], [0, ANSWER.length], clamp),
  );
  const cites = useProgress(s.frames - 22, 12);
  return (
    <AbsoluteFill>
      <Stage />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 190 }}>
        <Words id="assistant" size={140} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 470,
          transform: `perspective(2200px) rotateX(${interpolate(panel, [0, 1], [40, 4])}deg) translateY(${interpolate(panel, [0, 1], [1300, 0])}px)`,
        }}
      >
        <Glass
          radius={46}
          style={{ padding: 44, height: 1180, overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              paddingBottom: 30,
              borderBottom: "1.5px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: 22,
                background: GOLD_GRAD,
                color: C.navy,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 900,
              }}
            >
              ✦
            </div>
            <div>
              <div style={{ fontSize: 40, fontWeight: 800 }}>
                Ask your report
              </div>
              <div style={{ fontSize: 26, color: "rgba(255,255,255,0.6)" }}>
                Answers from your report, with sources
              </div>
            </div>
          </div>
          {sent ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 44,
              }}
            >
              <div
                style={{
                  maxWidth: 640,
                  padding: "28px 36px",
                  borderRadius: "36px 36px 8px 36px",
                  background: "#fff",
                  color: C.ink,
                  fontSize: 38,
                  fontWeight: 600,
                }}
              >
                {QUESTION}
              </div>
            </div>
          ) : null}
          {thinking ? (
            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: 40,
                padding: "30px 36px",
                width: 170,
                borderRadius: 36,
                background: "rgba(255,255,255,0.1)",
              }}
            >
              {[0, 1, 2].map((d) => (
                <div
                  key={d}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 99,
                    background: GOLD,
                    opacity:
                      0.4 + 0.6 * Math.max(0, Math.sin((frame - d * 4) / 3)),
                  }}
                />
              ))}
            </div>
          ) : null}
          {frame >= aStart ? (
            <div
              style={{
                marginTop: 40,
                maxWidth: 760,
                padding: "32px 38px",
                borderRadius: "36px 36px 36px 8px",
                background: "rgba(255,255,255,0.1)",
                border: "1.5px solid rgba(255,255,255,0.14)",
                fontSize: 38,
                lineHeight: 1.35,
                fontWeight: 500,
              }}
            >
              {ANSWER.slice(0, aChars)}
              {aChars < ANSWER.length ? (
                <span style={{ color: GOLD }}>▍</span>
              ) : null}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 26,
                  opacity: cites,
                  translate: `0px ${(1 - cites) * 20}px`,
                }}
              >
                {["Returns, step by step", "Local tax"].map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      padding: "10px 20px",
                      borderRadius: 99,
                      border: `1.5px solid ${GOLD}`,
                      color: GOLD,
                    }}
                  >
                    ↗ {c}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {/* Composer */}
          <div
            style={{
              position: "absolute",
              left: 44,
              right: 44,
              bottom: 44,
              padding: "28px 34px",
              borderRadius: 99,
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.16)",
              fontSize: 36,
              color: sent ? "rgba(255,255,255,0.4)" : "#fff",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {sent ? "Ask another question…" : QUESTION.slice(0, qChars)}
              {!sent && Math.floor(frame / 8) % 2 ? (
                <span style={{ color: GOLD }}>|</span>
              ) : null}
            </span>
            <span
              style={{
                width: 60,
                height: 60,
                marginTop: -6,
                borderRadius: 99,
                background: GOLD_GRAD,
                color: C.navy,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
              }}
            >
              ↑
            </span>
          </div>
        </Glass>
      </div>
      <Tap x={918} y={1588} at={qStart + 29} />
      <SampleNote text="Sample data, to be verified" bottom={110} />
    </AbsoluteFill>
  );
};

/* 15 — Download the PDF, talk to vetted experts. */
const EXPERTS = [
  { k: "US tax", who: "CPA / enrolled agent", init: "TX" },
  { k: "Legal", who: "Local attorney", init: "LG" },
  { k: "Mortgage", who: "Cross-border lender", init: "MB" },
  { k: "Property", who: "Buyer's agent", init: "AG" },
];

export const Deliver: React.FC = () => {
  const frame = useCurrentFrame();
  const talk = wordAt("deliver", 3);
  const dl = useProgress(4, Math.max(10, talk - 12));
  const fanOut = useSpring(2, 14, 150);
  const pdfAway = useProgress(talk - 4, 12);
  const expertsIn = useProgress(talk - 4, 10);
  return (
    <AbsoluteFill>
      <Stage />
      {/* PDF beat */}
      <AbsoluteFill
        style={{
          opacity: 1 - pdfAway,
          scale: String(1 - pdfAway * 0.2),
          filter: pdfAway > 0 ? `blur(${pdfAway * 14}px)` : undefined,
        }}
      >
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
          <H size={150} weight={850}>
            Your <span style={goldText}>PDF.</span>
          </H>
        </AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 640,
            height: 900,
            perspective: 1800,
          }}
        >
          {[2, 1, 0].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 540 - 270,
                top: 40,
                width: 540,
                height: 740,
                borderRadius: 24,
                background: i === 0 ? "#fff" : "#f1ece2",
                boxShadow: "0 50px 90px rgba(0,0,0,0.55)",
                transform: `translateX(${(i - 1) * 190 * fanOut}px) rotateY(${(i - 1) * -22 * fanOut}deg) rotateZ(${(i - 1) * 6 * fanOut}deg) translateZ(${-i * 40}px)`,
                padding: 48,
                fontFamily,
                color: C.ink,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Mark size={60} drawn />
                <span style={{ fontSize: 30, fontWeight: 800 }}>
                  AbroadYield
                </span>
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.24em",
                  color: "#9a7a43",
                  marginTop: 40,
                }}
              >
                FULL REPORT
              </div>
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                {["Portugal", "Spain", "Dubai"][i]}
              </div>
              {Array.from({ length: 7 }, (_, l) => (
                <div
                  key={l}
                  style={{
                    height: 16,
                    borderRadius: 8,
                    background: l % 3 ? "#e6e0d4" : "#d8c8a6",
                    marginTop: 26,
                    width: `${90 - ((l * 17) % 35)}%`,
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  right: 30,
                  top: 30,
                  padding: "8px 18px",
                  borderRadius: 10,
                  background: C.navy,
                  color: GOLD,
                  fontWeight: 800,
                  fontSize: 24,
                }}
              >
                PDF
              </div>
            </div>
          ))}
        </div>
        {/* Download progress */}
        <div
          style={{
            position: "absolute",
            left: 540 - 80,
            top: 1490,
            width: 160,
            height: 160,
          }}
        >
          <svg width={160} height={160}>
            <circle
              cx={80}
              cy={80}
              r={70}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={10}
              fill="none"
            />
            <circle
              cx={80}
              cy={80}
              r={70}
              stroke={GOLD}
              strokeWidth={10}
              fill="none"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - dl}
              transform="rotate(-90 80 80)"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 900,
              color: dl >= 1 ? GOLD : "#fff",
              fontFamily,
            }}
          >
            {dl >= 1 ? "✓" : "↓"}
          </div>
        </div>
      </AbsoluteFill>
      {/* Experts beat */}
      {frame >= talk - 4 ? (
        <>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
            <H
              size={124}
              weight={850}
              style={{
                textAlign: "center",
                opacity: expertsIn,
              }}
            >
              Vetted <span style={goldText}>experts.</span>
            </H>
          </AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: 90,
              right: 90,
              top: 560,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 30,
            }}
          >
            {EXPERTS.map((e, i) => {
              const p = interpolate(frame - talk - i * 3, [0, 14], [0, 1], {
                ...clamp,
                easing: expoOut,
              });
              return (
                <Glass
                  key={e.k}
                  radius={36}
                  style={{
                    padding: 40,
                    height: 470,
                    opacity: p,
                    transform: `perspective(1500px) translateY(${(1 - p) * 500}px) rotateX(${(1 - p) * 40}deg)`,
                  }}
                >
                  <div
                    style={{
                      width: 130,
                      height: 130,
                      borderRadius: 99,
                      background: `linear-gradient(145deg, #2c4b7a, ${C.navy})`,
                      border: `3px solid ${GOLD}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 44,
                      fontWeight: 800,
                    }}
                  >
                    {e.init}
                  </div>
                  <div
                    style={{
                      fontSize: 50,
                      fontWeight: 800,
                      marginTop: 34,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {e.k}
                  </div>
                  <div
                    style={{
                      fontSize: 30,
                      color: "rgba(255,255,255,0.65)",
                      marginTop: 6,
                    }}
                  >
                    {e.who}
                  </div>
                  <div
                    style={{
                      marginTop: 30,
                      display: "inline-flex",
                      padding: "10px 22px",
                      borderRadius: 99,
                      background: GOLD_GRAD,
                      color: C.navy,
                      fontSize: 26,
                      fontWeight: 800,
                    }}
                  >
                    ✓ VETTED
                  </div>
                </Glass>
              );
            })}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/* 16 — Every number sourced and dated. */
const SOURCES = [
  "IRS – US income tax treaties",
  "Portal das Finanças (Portugal)",
  "OECD Tax Database",
  "PwC Worldwide Tax Summaries",
  "Tax Foundation – state rates",
  "Agencia Tributaria (Spain)",
  "US Department of State",
];

export const Trust: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 240 }}>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 280,
            letterSpacing: "-0.07em",
            lineHeight: 1,
            ...goldText,
          }}
        >
          <Count to={1200} at={0} len={30} />+
        </div>
        <H
          size={56}
          weight={600}
          color="rgba(255,255,255,0.8)"
          style={{ letterSpacing: "-0.02em" }}
        >
          sourced data points
        </H>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 820,
          height: 520,
          overflow: "hidden",
          maskImage:
            "linear-gradient(180deg, transparent, black 20%, black 80%, transparent)",
        }}
      >
        {[0, 1].map((row) => (
          <div
            key={row}
            style={{
              display: "flex",
              gap: 22,
              marginTop: row ? 26 : 120,
              translate: `${(row ? -1 : 1) * (frame * 7) - (row ? 400 : 1600)}px 0px`,
              whiteSpace: "nowrap",
            }}
          >
            {[...SOURCES, ...SOURCES].map((src, i) => (
              <div
                key={i}
                style={{
                  padding: "22px 30px",
                  borderRadius: 22,
                  border: "1.5px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.06)",
                  fontFamily,
                  fontSize: 32,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {src}
                <span style={{ color: GOLD, marginLeft: 18, fontSize: 26 }}>
                  · dated Oct 1, 2026
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 300,
        }}
      >
        <Words id="trust" size={140} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
