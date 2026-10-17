import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, fontFamily } from "../brand";
import { shot, wordAt, type ShotId } from "./vo";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const GOLD = "#d8b878";
export const GOLD_GRAD = `linear-gradient(180deg, #f6e7c4 0%, ${GOLD} 45%, #a8803f 100%)`;

/** Ease used for most moves: fast out, long settle, like an After Effects "easy ease" at 85%. */
export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
export const expoIn = Easing.bezier(0.7, 0, 0.84, 0);

export const useSpring = (delay: number, damping = 14, stiffness = 170) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness, mass: 0.7 },
  });
};

/** 0→1 over [from, from+len] with the given easing. */
export const useProgress = (from: number, len: number, ease = expoOut) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, from + len], [0, 1], {
    ...clamp,
    easing: ease,
  });
};

/** Decaying camera shake after each hit frame. */
export const useShake = (hits: number[], amp = 18) => {
  const frame = useCurrentFrame();
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t < 0 || t > 16) continue;
    const d = Math.exp(-t / 3.2);
    x += Math.sin(t * 2.9) * amp * d;
    y += Math.cos(t * 3.7) * amp * 0.6 * d;
  }
  return `${x.toFixed(2)}px ${y.toFixed(2)}px`;
};

/* ------------------------------------------------------------------ backgrounds */

/** Film grain: animated SVG turbulence, overlaid softly. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}
    >
      <svg width="100%" height="100%">
        <filter id={`g${frame % 6}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={frame % 6}
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${frame % 6})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Midnight-navy stage: deep radial gradient, two drifting light pools, a fading grid floor. */
export const Stage: React.FC<{
  glow?: string;
  grid?: boolean;
  intensity?: number;
}> = ({ glow = GOLD, grid = true, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 50);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(130% 75% at 50% 18%, #1b3560 0%, ${C.navy} 46%, #060d19 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background: glow,
          opacity: 0.16 * intensity,
          filter: "blur(160px)",
          left: -200 + drift * 160,
          top: 1050 + Math.cos(frame / 60) * 120,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "#3a6aa8",
          opacity: 0.32 * intensity,
          filter: "blur(150px)",
          right: -320 - drift * 120,
          top: -260,
        }}
      />
      {grid ? (
        <AbsoluteFill
          style={{ perspective: 900, perspectiveOrigin: "50% 30%" }}
        >
          <div
            style={{
              position: "absolute",
              left: -1080,
              right: -1080,
              top: 1150,
              height: 1600,
              transform: "rotateX(72deg)",
              transformOrigin: "50% 0%",
              backgroundImage:
                "linear-gradient(rgba(216,184,120,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(216,184,120,0.16) 2px, transparent 2px)",
              backgroundSize: "120px 120px",
              backgroundPosition: `0px ${(frame * 3) % 120}px`,
              maskImage: "linear-gradient(180deg, black 0%, transparent 70%)",
            }}
          />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 340px rgba(0,0,0,0.75)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/** Full-frame photo with a slow push and optional colour grade toward navy. */
export const Photo: React.FC<{
  src: string;
  from?: number;
  to?: number;
  len: number;
  x?: [number, number];
  y?: [number, number];
  grade?: number;
}> = ({
  src,
  from = 1.12,
  to = 1.0,
  len,
  x = [0, 0],
  y = [0, 0],
  grade = 0.35,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, len], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.ink }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(t, [0, 1], [from, to])),
          translate: `${interpolate(t, [0, 1], x)}px ${interpolate(t, [0, 1], y)}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(8,17,31,${grade * 0.8}) 0%, rgba(15,31,58,${grade * 0.25}) 40%, rgba(8,17,31,${0.35 + grade}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ shot transitions */

export type Move =
  | "zoom"
  | "whip-left"
  | "whip-right"
  | "whip-up"
  | "fade"
  | "none"
  | "punch";

/**
 * Wraps a shot with an entrance and an exit (8–10 frames each). Consecutive shots butt-cut, so an
 * exit "zoom" followed by an entrance "zoom" reads as one zoom-through; whips carry motion blur.
 */
export const Shot: React.FC<{
  frames: number;
  enter?: Move;
  exit?: Move;
  children: React.ReactNode;
  bg?: string;
}> = ({ frames, enter = "zoom", exit = "zoom", children, bg = C.ink }) => {
  const frame = useCurrentFrame();
  const IN = 9;
  const OUT = 8;
  const i = interpolate(frame, [0, IN], [1, 0], { ...clamp, easing: expoOut });
  const o = interpolate(frame, [frames - OUT, frames], [0, 1], {
    ...clamp,
    easing: expoIn,
  });
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let blur = 0;
  let opacity = 1;
  let sx = 1;
  let sy = 1;
  const apply = (kind: Move, p: number, dir: 1 | -1) => {
    if (p <= 0) return;
    switch (kind) {
      case "zoom":
        scale *= dir === 1 ? 1 + p * 1.4 : 1 - p * 0.45;
        blur += p * 26;
        opacity *= 1 - p * (dir === 1 ? 0.9 : 0.6);
        break;
      case "punch":
        scale *= 1 + p * 0.25 * (dir === 1 ? 1 : -1);
        blur += p * 10;
        break;
      case "whip-left":
        tx += (dir === 1 ? -1 : 1) * p * 1300;
        sx *= 1 + p * 0.5;
        blur += p * 30;
        break;
      case "whip-right":
        tx += (dir === 1 ? 1 : -1) * p * 1300;
        sx *= 1 + p * 0.5;
        blur += p * 30;
        break;
      case "whip-up":
        ty += (dir === 1 ? -1 : 1) * p * 2100;
        sy *= 1 + p * 0.5;
        blur += p * 30;
        break;
      case "fade":
        opacity *= 1 - p;
        break;
      case "none":
        break;
    }
  };
  apply(enter, i, -1);
  apply(exit, o, 1);
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale * sx}, ${scale * sy})`,
          filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
          opacity,
        }}
      >
        {children}
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ type */

export const H: React.FC<{
  children: React.ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 120, weight = 800, color = C.white, style }) => (
  <div
    style={{
      fontFamily,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 0.98,
      letterSpacing: "-0.045em",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const goldText: React.CSSProperties = {
  backgroundImage: GOLD_GRAD,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: "drop-shadow(0 0 28px rgba(216,184,120,0.45))",
};

/**
 * The shot's key phrase, revealed word by word exactly when the narrator says each word: each
 * token rises out of a soft blur with a short overshoot; gold tokens carry the champagne gradient.
 */
export const Words: React.FC<{
  id: ShotId;
  size?: number;
  align?: "center" | "left";
  style?: React.CSSProperties;
  /** Frame (in the shot) at which the phrase leaves; omitted = stays. */
  outAt?: number;
  color?: string;
  weight?: number;
}> = ({
  id,
  size = 130,
  align = "center",
  style,
  outAt,
  color = C.white,
  weight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = shot(id).show ?? [];
  const lines: Array<typeof tokens> = [[]];
  for (const tk of tokens) {
    if (tk.br && lines[lines.length - 1]!.length) lines.push([]);
    lines[lines.length - 1]!.push(tk);
  }
  const out =
    outAt === undefined
      ? 0
      : interpolate(frame, [outAt, outAt + 8], [0, 1], {
          ...clamp,
          easing: expoIn,
        });
  return (
    <div
      style={{
        fontFamily,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.0,
        letterSpacing: "-0.05em",
        color,
        textAlign: align,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        opacity: 1 - out,
        filter: out > 0 ? `blur(${out * 20}px)` : undefined,
        translate: `0px ${-out * 60}px`,
        ...style,
      }}
    >
      {lines.map((ln, li) => (
        <div
          key={li}
          style={{ display: "flex", gap: "0.24em", flexWrap: "nowrap" }}
        >
          {ln.map((tk) => {
            const at = wordAt(id, tk.w) - 2;
            const s = spring({
              frame: frame - at,
              fps,
              config: { damping: 13, stiffness: 210, mass: 0.6 },
            });
            const vis = frame >= at;
            return (
              <span
                key={`${tk.t}-${tk.w}`}
                style={{
                  display: "inline-block",
                  opacity: vis ? interpolate(s, [0, 0.4], [0, 1], clamp) : 0,
                  translate: `0px ${interpolate(s, [0, 1], [0.45, 0])}em`,
                  scale: String(interpolate(s, [0, 1], [1.18, 1])),
                  filter: `blur(${interpolate(s, [0, 0.7], [16, 0], clamp)}px)`,
                  ...(tk.gold ? goldText : null),
                }}
              >
                {tk.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Small spaced uppercase label. */
export const Kicker: React.FC<{
  children: React.ReactNode;
  at?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, at = 0, color = GOLD, style }) => {
  const p = useProgress(at, 14);
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 700,
        fontSize: 32,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color,
        opacity: p,
        translate: `${(1 - p) * -40}px 0px`,
        display: "flex",
        alignItems: "center",
        gap: 18,
        ...style,
      }}
    >
      <span
        style={{ width: 46 * p, height: 3, background: color, borderRadius: 2 }}
      />
      {children}
    </div>
  );
};

/** Animated number between two values over [at, at+len]. */
export const Count: React.FC<{
  from?: number;
  to: number;
  at: number;
  len?: number;
  format?: (v: number) => string;
  ease?: (t: number) => number;
}> = ({
  from = 0,
  to,
  at,
  len = 24,
  format = (v) => Math.round(v).toLocaleString("en-US"),
  ease = expoOut,
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [at, at + len], [from, to], {
    ...clamp,
    easing: ease,
  });
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>{format(v)}</span>
  );
};

export const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ surfaces */

/** Dark frosted-glass card with a lit top edge. */
export const Glass: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  radius?: number;
  light?: boolean;
}> = ({ children, style, radius = 44, light = false }) => (
  <div
    style={{
      position: "relative",
      borderRadius: radius,
      background: light
        ? "linear-gradient(180deg, #ffffff 0%, #f6f2ea 100%)"
        : "linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 55%, rgba(255,255,255,0.07) 100%)",
      border: light
        ? "1px solid rgba(15,31,58,0.08)"
        : "1.5px solid rgba(255,255,255,0.16)",
      boxShadow: light
        ? "0 60px 120px -40px rgba(0,0,0,0.65), inset 0 1px 0 #fff"
        : "0 60px 120px -40px rgba(0,0,0,0.8), inset 0 1.5px 0 rgba(255,255,255,0.22)",
      color: light ? C.ink : C.white,
      fontFamily,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Phone mock-up. Screen content is laid out on a 900×1900 canvas. */
export const Phone: React.FC<{
  children: React.ReactNode;
  scale?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  y?: number;
  screen?: string;
}> = ({
  children,
  scale = 1,
  rx = 0,
  ry = 0,
  rz = 0,
  y = 0,
  screen = C.ivory,
}) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      width: 900,
      height: 1900,
      marginLeft: -450,
      marginTop: -950,
      transform: `translateY(${y}px) perspective(2400px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
      borderRadius: 130,
      padding: 26,
      background: "linear-gradient(145deg, #2a3a55, #0b1424 40%, #1c2a42)",
      boxShadow:
        "0 100px 160px -50px rgba(0,0,0,0.85), 0 0 0 3px rgba(216,184,120,0.35), inset 0 0 0 2px rgba(255,255,255,0.12)",
    }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 106,
        overflow: "hidden",
        background: screen,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: "50%",
          width: 250,
          height: 70,
          marginLeft: -125,
          borderRadius: 40,
          background: "#05080f",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.06) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  </div>
);

/** A touch: soft dot that presses down, with an expanding ring. Position in parent pixels. */
export const Tap: React.FC<{
  x: number;
  y: number;
  at: number;
  color?: string;
}> = ({ x, y, at, color = C.white }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -6 || t > 18) return null;
  const appear = interpolate(t, [-6, 0, 10, 18], [0, 1, 1, 0], clamp);
  const press = interpolate(t, [-2, 0, 4], [1, 0.8, 1], clamp);
  const ring = interpolate(t, [0, 16], [0, 1], { ...clamp, easing: expoOut });
  return (
    <div
      style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}
    >
      <div
        style={{
          position: "absolute",
          width: 90,
          height: 90,
          left: -45,
          top: -45,
          borderRadius: 99,
          background: color,
          opacity: appear * 0.55,
          scale: String(press),
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 90,
          height: 90,
          left: -45,
          top: -45,
          borderRadius: 99,
          border: `5px solid ${color}`,
          opacity: (1 - ring) * appear,
          scale: String(1 + ring * 1.8),
        }}
      />
    </div>
  );
};

/** Diagonal light sweep across the parent (parent needs overflow hidden + position). */
export const Shine: React.FC<{
  at: number;
  len?: number;
  color?: string;
  width?: number;
}> = ({ at, len = 22, color = "rgba(255,240,210,0.55)", width = 260 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + len], [-0.3, 1.3], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  if (frame < at || frame > at + len) return null;
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-50%",
          height: "200%",
          width,
          left: `${p * 100}%`,
          marginLeft: -width / 2,
          transform: "rotate(20deg)",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Gold particle burst from (x, y) at frame `at`. */
export const Burst: React.FC<{
  x: number;
  y: number;
  at: number;
  count?: number;
  spread?: number;
  seed?: string;
}> = ({ x, y, at, count = 26, spread = 520, seed = "b" }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 40) return null;
  return (
    <div
      style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}
    >
      {Array.from({ length: count }, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const d = (0.35 + random(`${seed}d${i}`) * 0.65) * spread;
        const p = interpolate(t, [0, 34], [0, 1], {
          ...clamp,
          easing: expoOut,
        });
        const size = 6 + random(`${seed}s${i}`) * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              left: Math.cos(a) * d * p - size / 2,
              top: Math.sin(a) * d * p - size / 2 + t * t * 0.08,
              borderRadius: 99,
              background: i % 3 ? GOLD : "#fff6e0",
              opacity: interpolate(t, [0, 6, 40], [0, 1, 0], clamp),
              boxShadow: `0 0 ${size * 2}px ${GOLD}`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Radiating light rays behind a hero element. */
export const Rays: React.FC<{ at: number; opacity?: number }> = ({
  at,
  opacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 20], [0, 1], {
    ...clamp,
    easing: expoOut,
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 2600,
          height: 2600,
          borderRadius: "50%",
          opacity: p * opacity,
          rotate: `${frame * 0.35}deg`,
          scale: String(0.6 + p * 0.4),
          background: `repeating-conic-gradient(from 0deg, rgba(216,184,120,0.22) 0deg 4deg, transparent 4deg 15deg)`,
          maskImage: "radial-gradient(circle, black 0%, transparent 60%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** White (or gold) flash. */
export const Flash: React.FC<{ at: number; color?: string; peak?: number }> = ({
  at,
  color = "#fff",
  peak = 0.8,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: color,
        opacity: interpolate(frame, [at - 1, at, at + 6], [0, peak, 0], clamp),
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
};

export const SampleNote: React.FC<{ text?: string; bottom?: number }> = ({
  text = "Illustrative example · sample data, to be verified",
  bottom = 96,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom,
      textAlign: "center",
      fontFamily,
      fontSize: 26,
      fontWeight: 500,
      letterSpacing: "0.02em",
      color: "rgba(255,255,255,0.5)",
    }}
  >
    {text}
  </div>
);

/** Destination photos available to every shot (one per country, the site's own set). */
export const DEST: Record<string, { name: string; photo: string }> = {
  pt: { name: "Portugal", photo: "photos/lisbon.jpg" },
  es: { name: "Spain", photo: "photos/malaga.jpg" },
  it: { name: "Italy", photo: "photos/rome.jpg" },
  gr: { name: "Greece", photo: "photos/athens.jpg" },
  mx: { name: "Mexico", photo: "photos/playa-del-carmen.jpg" },
  cr: { name: "Costa Rica", photo: "photos/tamarindo.jpg" },
  ae: { name: "Dubai", photo: "photos/dubai-marina.jpg" },
  fr: { name: "France", photo: "photos/paris.jpg" },
  gb: { name: "United Kingdom", photo: "photos/london.jpg" },
  ie: { name: "Ireland", photo: "photos/cliffs-of-moher.jpg" },
  de: { name: "Germany", photo: "photos/berlin.jpg" },
  hr: { name: "Croatia", photo: "photos/dubrovnik.jpg" },
  pa: { name: "Panama", photo: "photos/guna-yala.jpg" },
  co: { name: "Colombia", photo: "photos/la-serrana.jpg" },
  do: { name: "Dominican Rep.", photo: "photos/punta-cana.jpg" },
  th: { name: "Thailand", photo: "photos/krabi.jpg" },
  jp: { name: "Japan", photo: "photos/kyoto.jpg" },
};

/** The AbroadYield mark, drawn on: ring, horizon, rising line, then the dot. */
export const Mark: React.FC<{
  size?: number;
  at?: number;
  drawn?: boolean;
}> = ({ size = 200, at = 0, drawn = false }) => {
  const frame = useCurrentFrame();
  const p = (a: number, l: number) =>
    drawn
      ? 1
      : interpolate(frame, [at + a, at + a + l], [0, 1], {
          ...clamp,
          easing: expoOut,
        });
  const ring = p(0, 16);
  const wave = p(6, 14);
  const line = p(10, 14);
  const dot = drawn
    ? 1
    : spring({
        frame: frame - at - 20,
        fps: 30,
        config: { damping: 8, stiffness: 260 },
      });
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="ayGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e7c4" />
          <stop offset="1" stopColor="#b08a48" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill={C.navy} opacity={ring} />
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="none"
        stroke="url(#ayGold)"
        strokeWidth="0.7"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - ring}
        transform="rotate(-90 16 16)"
      />
      <path
        d="M4.5 18.5c4-1 7-4.5 11.5-4.5s7.5 3 11.5 2"
        stroke={C.sand}
        strokeWidth="1.6"
        fill="none"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - wave}
      />
      <path
        d="M9 22l5-5 4 3 6-8"
        stroke="#fff"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - line}
      />
      <circle cx="24" cy="12" r={1.8 * dot} fill={C.sand} />
    </svg>
  );
};
