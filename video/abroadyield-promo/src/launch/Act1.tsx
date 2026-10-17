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
  Flash,
  GOLD,
  Glass,
  H,
  Kicker,
  Mark,
  Photo,
  Rays,
  SampleNote,
  Shine,
  Stage,
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

/* 01 — Cold open: a burst of destinations, then a drone glide over Navagio. */
const FLASHES = [
  "photos/kyoto.jpg",
  "photos/punta-cana.jpg",
  "photos/lisbon.jpg",
  "drone/santorini-greece.jpg",
];

export const Open: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("open");
  const montageEnd = FLASHES.length * 6;
  const glide = frame - montageEnd;
  const tag = useProgress(montageEnd + 6, 16);
  return (
    <AbsoluteFill>
      {frame < montageEnd ? (
        <Photo
          key={Math.floor(frame / 6)}
          src={FLASHES[Math.floor(frame / 6)]!}
          from={1.35}
          to={1.12}
          len={6}
          grade={0.15}
        />
      ) : (
        <AbsoluteFill style={{ perspective: 1200, overflow: "hidden" }}>
          <Img
            src={staticFile("drone/navagio-greece.jpg")}
            style={{
              position: "absolute",
              left: "-35%",
              top: "-20%",
              width: "170%",
              height: "140%",
              objectFit: "cover",
              transform: `rotateX(${interpolate(glide, [0, s.frames], [26, 14], clamp)}deg) rotateZ(${interpolate(glide, [0, s.frames], [-5, 4], clamp)}deg) scale(${interpolate(glide, [0, s.frames], [1.55, 1.2], clamp)})`,
              transformOrigin: "50% 60%",
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, rgba(8,17,31,0.25) 0%, rgba(8,17,31,0) 30%, rgba(8,17,31,0.15) 55%, rgba(8,17,31,0.85) 100%)",
            }}
          />
        </AbsoluteFill>
      )}
      {Array.from({ length: FLASHES.length }, (_, i) => (
        <Flash key={i} at={i * 6} peak={i === 0 ? 1 : 0.45} />
      ))}
      <div
        style={{
          position: "absolute",
          top: 210,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: tag,
          translate: `0px ${(1 - tag) * -30}px`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.28em",
            color: "rgba(255,255,255,0.85)",
            padding: "16px 30px",
            borderRadius: 99,
            border: "1.5px solid rgba(255,255,255,0.35)",
            background: "rgba(8,17,31,0.35)",
          }}
        >
          NAVAGIO · GREECE
        </div>
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 380 }}>
        <Words
          id="open"
          size={150}
          style={{ textShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 02 — The listing: a property card arrives and the advertised 7% slams in. */
export const Listing: React.FC = () => {
  const frame = useCurrentFrame();
  const seven = wordAt("listing", 3);
  const card = useSpring(0, 15, 140);
  const stamp = useSpring(seven, 9, 260);
  return (
    <AbsoluteFill style={{ translate: useShake([seven], 22) }}>
      <Stage />
      <Rays at={seven} opacity={0.6} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
        <Kicker at={2}>The listing</Kicker>
        <div
          style={{
            marginTop: 20,
            fontFamily,
            fontWeight: 900,
            fontSize: 470,
            letterSpacing: "-0.07em",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              display: "inline-block",
              opacity: frame >= seven - 2 ? 1 : 0,
              scale: String(interpolate(stamp, [0, 1], [2.6, 1])),
              filter: `blur(${interpolate(stamp, [0, 0.6], [24, 0], clamp)}px)`,
              ...goldText,
            }}
          >
            7%
          </span>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 960,
          transform: `perspective(2000px) rotateX(${interpolate(card, [0, 1], [40, 8])}deg) translateY(${interpolate(card, [0, 1], [900, 0])}px)`,
        }}
      >
        <Glass light radius={48} style={{ overflow: "hidden" }}>
          <div
            style={{ position: "relative", height: 420, overflow: "hidden" }}
          >
            <Img
              src={staticFile("photos/lisbon.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                scale: String(1.1 - card * 0.08),
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 30,
                top: 30,
                padding: "16px 28px",
                borderRadius: 99,
                background: C.navy,
                color: "#fff",
                fontWeight: 800,
                fontSize: 40,
                scale: String(stamp),
                rotate: `${interpolate(stamp, [0, 1], [-25, -4])}deg`,
                boxShadow: `0 0 0 4px ${GOLD}`,
              }}
            >
              7% yield
            </div>
          </div>
          <div style={{ padding: "34px 44px 44px" }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "0.18em",
                color: "#9a7a43",
              }}
            >
              FOR SALE · LISBON
            </div>
            <div
              style={{
                fontSize: 58,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginTop: 10,
              }}
            >
              2-bed apartment
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 18,
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              <span>$250,000</span>
              <span style={{ color: "#5b6b82", fontWeight: 600 }}>
                $17,500 / yr rent
              </span>
            </div>
          </div>
          <Shine at={seven + 4} />
        </Glass>
      </div>
      <Burst x={540} y={560} at={seven} count={34} spread={620} seed="seven" />
      <Flash at={seven} color={GOLD} peak={0.5} />
      <SampleNote text="Illustrative listing" bottom={110} />
    </AbsoluteFill>
  );
};

/* 03 — Reality: the 7% is stripped by costs and taxes down to 3.1%. */
const COSTS = [
  { label: "Vacancy", v: 1050 },
  { label: "Management", v: 1316 },
  { label: "Maintenance", v: 2000 },
  { label: "Insurance", v: 375 },
  { label: "Property tax", v: 875 },
  { label: "Condo fees", v: 1080 },
];
const TAXES = [
  { label: "Local tax on rent", v: 2701 },
  { label: "US federal (after credit)", v: 0 },
  { label: "NY state tax", v: 247 },
];

export const Reality: React.FC = () => {
  const frame = useCurrentFrame();
  const costsEnd = wordAt("reality", 3);
  const land = wordAt("reality", 7);
  const v =
    frame < costsEnd
      ? interpolate(frame, [2, costsEnd], [7, 4.32], {
          ...clamp,
          easing: expoOut,
        })
      : interpolate(frame, [costsEnd + 2, land], [4.32, 3.14], {
          ...clamp,
          easing: expoOut,
        });
  const landed = useSpring(land, 8, 240);
  const chips = [
    ...COSTS.map((c) => ({ ...c, tax: false })),
    ...TAXES.map((c) => ({ ...c, tax: true })),
  ];
  return (
    <AbsoluteFill style={{ translate: useShake([land], 16) }}>
      <Stage glow={frame > land ? GOLD : "#3a6aa8"} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
        <Kicker
          at={0}
          color={frame < costsEnd ? "rgba(255,255,255,0.7)" : GOLD}
        >
          {frame < costsEnd ? "After running costs" : "After every tax"}
        </Kicker>
        <div
          style={{
            marginTop: 10,
            fontFamily,
            fontWeight: 900,
            fontSize: 400,
            letterSpacing: "-0.07em",
            lineHeight: 1,
            scale: String(1 + (frame >= land ? (1 - landed) * 0.25 : 0)),
            ...(frame >= land ? goldText : { color: C.white }),
          }}
        >
          {v.toFixed(1)}%
        </div>
      </AbsoluteFill>
      {/* Deduction chips peel off the number and fall away */}
      {chips.map((c, i) => {
        const at = c.tax
          ? costsEnd + 2 + (i - COSTS.length) * 5
          : 3 + i * Math.max(2, Math.floor((costsEnd - 6) / COSTS.length));
        const t = frame - at;
        if (t < 0 || t > 46) return null;
        const side = i % 2 ? 1 : -1;
        const p = interpolate(t, [0, 46], [0, 1], clamp);
        return (
          <div
            key={c.label}
            style={{
              position: "absolute",
              left: 540,
              top: 700,
              translate: `${side * (120 + p * 330) - 260}px ${p * 760 + p * p * 500}px`,
              rotate: `${side * p * 28}deg`,
              opacity: interpolate(t, [0, 4, 34, 46], [0, 1, 1, 0], clamp),
              padding: "18px 28px",
              width: 520,
              borderRadius: 26,
              display: "flex",
              justifyContent: "space-between",
              fontFamily,
              fontSize: 36,
              fontWeight: 700,
              color: C.white,
              background: c.tax
                ? "rgba(216,184,120,0.18)"
                : "rgba(255,255,255,0.09)",
              border: `1.5px solid ${c.tax ? "rgba(216,184,120,0.6)" : "rgba(255,255,255,0.2)"}`,
            }}
          >
            <span>{c.label}</span>
            <span style={{ color: c.tax ? GOLD : "#ff8f8f" }}>−{usd(c.v)}</span>
          </div>
        );
      })}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          paddingBottom: 330,
          alignItems: "center",
          gap: 30,
        }}
      >
        <Words id="reality" size={120} />
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 44,
            color: "rgba(255,255,255,0.8)",
            opacity: landed,
            translate: `0px ${(1 - landed) * 30}px`,
          }}
        >
          <Count from={17500} to={7856} at={land} len={20} format={usd} /> a
          year, not $17,500
        </div>
      </AbsoluteFill>
      <SampleNote text="Portugal · $250,000 · married couple in NY earning $200k · sample data" />
    </AbsoluteFill>
  );
};

/* 04 — Nobody shows you that math. Until now. */
export const Nobody: React.FC = () => {
  const until = wordAt("nobody", 5);
  const back = useProgress(until - 2, 12);
  return (
    <AbsoluteFill style={{ translate: useShake([until], 20) }}>
      <Stage grid={false} intensity={0.6 + back * 0.6} />
      <Rays at={until} opacity={0.45} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            scale: String(1 - back * 0.08),
            filter: `blur(${back * 2}px)`,
          }}
        >
          <Words id="nobody" size={140} />
        </div>
      </AbsoluteFill>
      <Burst x={540} y={1100} at={until + 3} seed="until" />
      <Flash at={until} color={GOLD} peak={0.35} />
    </AbsoluteFill>
  );
};

/* 05 — Logo: the mark draws itself, the wordmark is unmasked, a gold sweep. */
export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("logo");
  const slide = useProgress(24, 16);
  const word = useProgress(28, 18);
  const tag = useProgress(s.voiceAt + 18, 16);
  const zoom = interpolate(frame, [0, s.frames], [1.06, 1], clamp);
  return (
    <AbsoluteFill style={{ translate: useShake([20], 14) }}>
      <Stage grid={false} intensity={1.3} />
      <Rays at={18} opacity={0.55} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          scale: String(zoom),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 34 * slide }}>
          <div
            style={{
              scale: String(
                interpolate(frame, [0, 20, 30], [1.6, 1.25, 1], {
                  ...clamp,
                  easing: expoOut,
                }),
              ),
              filter: "drop-shadow(0 0 40px rgba(216,184,120,0.55))",
            }}
          >
            <Mark size={interpolate(slide, [0, 1], [300, 170])} at={0} />
          </div>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              clipPath: `inset(-20% ${(1 - word) * 100}% -20% 0)`,
              maxWidth: word * 900,
            }}
          >
            <H
              size={124}
              weight={800}
              style={{ whiteSpace: "nowrap", letterSpacing: "-0.05em" }}
            >
              Abroad<span style={goldText}>Yield</span>
            </H>
            <Shine at={44} len={20} />
          </div>
        </div>
        <div
          style={{
            marginTop: 50,
            fontFamily,
            fontWeight: 500,
            fontSize: 38,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.75)",
            opacity: tag,
            translate: `0px ${(1 - tag) * 20}px`,
          }}
        >
          After-tax returns abroad, built for US taxpayers
        </div>
      </AbsoluteFill>
      <Burst x={540} y={960} at={20} count={40} spread={700} seed="logo" />
      <Flash at={20} color={GOLD} peak={0.4} />
    </AbsoluteFill>
  );
};
