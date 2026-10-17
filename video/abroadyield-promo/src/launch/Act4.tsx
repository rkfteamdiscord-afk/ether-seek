import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, fontFamily } from "../brand";
import {
  Burst,
  DEST,
  Flash,
  GOLD,
  GOLD_GRAD,
  Glass,
  H,
  Mark,
  Rays,
  Shine,
  Stage,
  Words,
  clamp,
  goldText,
  useProgress,
  useShake,
  useSpring,
} from "./ui";
import { shot, wordAt } from "./vo";

/* 17 — Pricing: free ranking, $39 full report once, Explorer Pass. */
export const Pricing: React.FC = () => {
  const frame = useCurrentFrame();
  const free = wordAt("pricing", 3);
  const price = wordAt("pricing", 7);
  const once = wordAt("pricing", 9);
  const c1 = useSpring(free - 4, 14, 170);
  const c2 = useSpring(price - 4, 12, 190);
  const c3 = useSpring(price + 6, 14, 170);
  const stamp = useSpring(once - 1, 8, 260);
  return (
    <AbsoluteFill style={{ translate: useShake([price, once], 12) }}>
      <Stage />
      <Rays at={price} opacity={0.4} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
        <H size={120} weight={850} style={{ textAlign: "center" }}>
          Simple, <span style={goldText}>one-time</span>
          <br />
          prices.
        </H>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 560,
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        <PriceCard
          p={c1}
          name="Free ranking"
          price="$0"
          note="All countries ranked for you · no card"
        />
        <div style={{ position: "relative" }}>
          <PriceCard
            p={c2}
            name="Full Report"
            price="$39"
            note="Waterfall, simulator, US tax, PDF, assistant"
            featured
            shineAt={price + 8}
          />
          <div
            style={{
              position: "absolute",
              right: 40,
              top: -34,
              padding: "16px 30px",
              borderRadius: 16,
              background: C.white,
              color: C.navy,
              fontFamily,
              fontWeight: 900,
              fontSize: 40,
              letterSpacing: "0.04em",
              rotate: `${interpolate(stamp, [0, 1], [-30, 6])}deg`,
              scale: String(interpolate(stamp, [0, 1], [2.4, 1])),
              opacity: frame >= once - 1 ? 1 : 0,
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            ONCE. NO SUBSCRIPTION
          </div>
        </div>
        <PriceCard
          p={c3}
          name="Explorer Pass"
          price="$89"
          note="Every country for 90 days, re-run anytime"
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 220,
          textAlign: "center",
          fontFamily,
          fontWeight: 600,
          fontSize: 38,
          color: "rgba(255,255,255,0.8)",
          opacity: useProgress(once + 6, 14),
        }}
      >
        14-day money-back guarantee
      </div>
      <Burst x={540} y={1000} at={price} seed="price" />
      <Flash at={price} color={GOLD} peak={0.3} />
    </AbsoluteFill>
  );
};

const PriceCard: React.FC<{
  p: number;
  name: string;
  price: string;
  note: string;
  featured?: boolean;
  shineAt?: number;
}> = ({ p, name, price, note, featured, shineAt = 0 }) => (
  <Glass
    radius={40}
    style={{
      padding: featured ? "50px 50px" : "36px 50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 30,
      opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      transform: `perspective(1600px) translateY(${(1 - p) * 500}px) rotateX(${(1 - p) * 50}deg) scale(${featured ? 1.04 : 0.96})`,
      border: featured ? `3px solid ${GOLD}` : undefined,
      background: featured
        ? "linear-gradient(160deg, rgba(216,184,120,0.28), rgba(216,184,120,0.07))"
        : undefined,
      boxShadow: featured
        ? "0 0 90px rgba(216,184,120,0.35), 0 60px 120px -40px rgba(0,0,0,0.8)"
        : undefined,
      overflow: "hidden",
    }}
  >
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: featured ? 56 : 46,
          fontWeight: 800,
          letterSpacing: "-0.03em",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 30,
          color: "rgba(255,255,255,0.7)",
          marginTop: 8,
          lineHeight: 1.25,
        }}
      >
        {note}
      </div>
    </div>
    <div
      style={{
        fontSize: featured ? 150 : 110,
        fontWeight: 900,
        letterSpacing: "-0.06em",
        ...(featured ? goldText : { color: "#fff" }),
      }}
    >
      {price}
    </div>
    {featured ? <Shine at={shineAt} /> : null}
  </Glass>
);

/* 18 — Your next address is out there: three drone shots cut on the words. */
const AERIALS = [
  {
    src: "drone/santorini-greece.jpg",
    place: "SANTORINI · GREECE",
    move: [1.5, 1.25, -6, 4],
  },
  {
    src: "drone/lagos-portugal.jpg",
    place: "LAGOS · PORTUGAL",
    move: [1.3, 1.6, 5, -3],
  },
  { src: "drone/dubai-uae.jpg", place: "DUBAI · UAE", move: [1.7, 1.3, -3, 7] },
];

export const Next: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("next");
  const cuts = [0, wordAt("next", 2) - 2, wordAt("next", 4) - 2, s.frames];
  const k = frame < cuts[1]! ? 0 : frame < cuts[2]! ? 1 : 2;
  const a = AERIALS[k]!;
  const local = frame - cuts[k]!;
  const len = cuts[k + 1]! - cuts[k]!;
  const t = interpolate(local, [0, len], [0, 1], clamp);
  const ease = Easing.inOut(Easing.cubic)(t);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ perspective: 1200, overflow: "hidden" }}>
        <Img
          key={k}
          src={staticFile(a.src)}
          style={{
            position: "absolute",
            left: "-35%",
            top: "-20%",
            width: "170%",
            height: "140%",
            objectFit: "cover",
            transform: `rotateX(${interpolate(ease, [0, 1], [22, 12])}deg) rotateZ(${interpolate(ease, [0, 1], [a.move[2]!, a.move[3]!])}deg) scale(${interpolate(ease, [0, 1], [a.move[0]!, a.move[1]!])})`,
            transformOrigin: "50% 60%",
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(8,17,31,0.35) 0%, rgba(8,17,31,0) 30%, rgba(8,17,31,0.1) 55%, rgba(8,17,31,0.85) 100%)",
          }}
        />
      </AbsoluteFill>
      <Flash at={cuts[1]!} peak={0.5} />
      <Flash at={cuts[2]!} peak={0.5} />
      <div
        style={{
          position: "absolute",
          top: 210,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.28em",
          color: "rgba(255,255,255,0.85)",
          opacity: interpolate(local, [0, 6], [0, 1], clamp),
        }}
      >
        {a.place}
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 300 }}>
        <Words
          id="next"
          size={140}
          style={{ textShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 19 — Finale: a tunnel of destinations rushes past, the logo lands, the call to action. */
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("finale");
  const drop = s.voiceAt - 2;
  const logo = useSpring(drop, 10, 200);
  const btn = useSpring(wordAt("finale", 6) + 8, 9, 220);
  const ids = Object.keys(DEST);
  return (
    <AbsoluteFill
      style={{ translate: useShake([drop], 26), overflow: "hidden" }}
    >
      <Stage intensity={1.2} />
      <AbsoluteFill style={{ perspective: 900 }}>
        {ids.map((id, i) => {
          const z = interpolate(frame, [i * 1.6, i * 1.6 + 24], [-2800, 900], {
            ...clamp,
            easing: Easing.in(Easing.quad),
          });
          const ang = (i / ids.length) * Math.PI * 2;
          return (
            <Img
              key={id}
              src={staticFile(DEST[id]!.photo)}
              style={{
                position: "absolute",
                left: "50%",
                top: "48%",
                width: 380,
                height: 500,
                objectFit: "cover",
                borderRadius: 28,
                transform: `translate(-50%, -50%) translate3d(${Math.cos(ang) * 540}px, ${Math.sin(ang) * 760}px, ${z}px) rotate(${i * 21}deg)`,
                opacity: interpolate(z, [-2800, -1900, 500, 900], [0, 1, 1, 0]),
              }}
            />
          );
        })}
      </AbsoluteFill>
      <Rays at={drop} opacity={0.6} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          padding: "0 70px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            scale: String(logo),
            rotate: `${interpolate(logo, [0, 1], [-200, 0])}deg`,
            filter: "drop-shadow(0 0 50px rgba(216,184,120,0.6))",
          }}
        >
          <Mark size={230} drawn />
        </div>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            opacity: interpolate(logo, [0, 0.4], [0, 1], clamp),
            translate: `0px ${(1 - logo) * 60}px`,
          }}
        >
          <H size={150} weight={800} style={{ letterSpacing: "-0.055em" }}>
            Abroad<span style={goldText}>Yield</span>
          </H>
          <Shine at={drop + 14} />
        </div>
        <div style={{ marginTop: 10 }}>
          <Words id="finale" size={76} weight={600} color="#dfe5ee" />
        </div>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: 40,
            padding: "40px 76px",
            borderRadius: 999,
            background: GOLD_GRAD,
            color: C.ink,
            fontFamily,
            fontWeight: 850,
            fontSize: 60,
            letterSpacing: "-0.03em",
            opacity: frame > wordAt("finale", 6) + 8 ? 1 : 0,
            scale: String(
              btn *
                (1 +
                  Math.max(0, Math.sin((frame - wordAt("finale", 6)) / 5)) *
                    0.04),
            ),
            boxShadow: `0 0 ${60 + Math.sin(frame / 5) * 25}px rgba(216,184,120,0.7)`,
          }}
        >
          Get my free ranking →
          <Shine at={wordAt("finale", 6) + 26} color="rgba(255,255,255,0.8)" />
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 38,
            color: "rgba(255,255,255,0.75)",
            opacity: btn,
          }}
        >
          Free · 3 minutes · No card
        </div>
      </AbsoluteFill>
      <Burst x={540} y={720} at={drop} count={48} spread={800} seed="fin" />
      <Flash at={drop} color={GOLD} peak={0.6} />
      {/* Fade to navy at the very end */}
      <AbsoluteFill
        style={{
          background: C.ink,
          opacity: interpolate(frame, [s.frames - 14, s.frames], [0, 1], clamp),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
