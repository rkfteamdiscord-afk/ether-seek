import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, fontFamily } from "./brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Spring from 0 to 1 starting at `delay` frames. */
export const useSpringAt = (delay: number, damping = 12, stiffness = 180) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness, mass: 0.6 },
  });
};

/** Decaying camera shake triggered at each frame listed in `hits`. */
export const useShake = (hits: number[], amp = 26) => {
  const frame = useCurrentFrame();
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t < 0 || t > 14) continue;
    const decay = Math.exp(-t / 3.5);
    x += Math.sin(t * 2.7) * amp * decay;
    y += Math.cos(t * 3.3) * amp * 0.7 * decay;
  }
  return `${x.toFixed(2)}px ${y.toFixed(2)}px`;
};

/** Midnight background with two drifting light pools and a fine grid. */
export const NightBg: React.FC<{ tint?: string }> = ({
  tint = C.champagne,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 0%, #1d3a66 0%, ${C.navy} 45%, ${C.ink} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: tint,
          opacity: 0.22,
          filter: "blur(140px)",
          left: interpolate(frame, [0, 120], [-300, 300]),
          top: interpolate(frame, [0, 120], [1200, 900]),
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "#2f5a8f",
          opacity: 0.45,
          filter: "blur(120px)",
          right: interpolate(frame, [0, 120], [-260, 120]),
          top: interpolate(frame, [0, 120], [-200, 100]),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          translate: `0px ${interpolate(frame, [0, 120], [0, 90])}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** One word that slams in from huge scale with a skew, at `delay`. */
export const Slam: React.FC<{
  delay: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  from?: number;
  rotate?: number;
}> = ({
  delay,
  children,
  size = 150,
  color = C.white,
  from = 3.2,
  rotate = -8,
}) => {
  const frame = useCurrentFrame();
  const s = useSpringAt(delay, 11, 220);
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: "-0.05em",
        color,
        opacity: frame < delay ? 0 : 1,
        scale: String(interpolate(s, [0, 1], [from, 1])),
        rotate: `${interpolate(s, [0, 1], [rotate, 0])}deg`,
        filter: `blur(${interpolate(s, [0, 0.6], [18, 0], clamp)}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Small uppercase label in champagne. */
export const Kicker: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
}> = ({ children, delay = 0, color = C.champagne }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 800,
        fontSize: 38,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        opacity: interpolate(frame, [delay, delay + 6], [0, 1], clamp),
        translate: `${interpolate(frame, [delay, delay + 10], [-80, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px 0px`,
      }}
    >
      {children}
    </div>
  );
};

/** White flash that fades over a few frames at the start of a scene. */
export const Flash: React.FC<{ at?: number; color?: string }> = ({
  at = 0,
  color = C.white,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: color,
        opacity: interpolate(frame, [at - 1, at, at + 5], [0, 0.85, 0], clamp),
        pointerEvents: "none",
      }}
    />
  );
};

export const SampleNote: React.FC<{ text?: string; dark?: boolean }> = ({
  text = "Example · sample data, to be verified",
  dark = true,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 120,
      textAlign: "center",
      fontFamily,
      fontSize: 30,
      fontWeight: 600,
      color: dark ? "rgba(255,255,255,0.6)" : "rgba(15,31,58,0.6)",
    }}
  >
    {text}
  </div>
);

export const Logo: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size}>
    <circle
      cx="16"
      cy="16"
      r="15"
      fill={C.navy}
      stroke="rgba(234,223,203,0.5)"
      strokeWidth="0.6"
    />
    <path
      d="M4.5 18.5c4-1 7-4.5 11.5-4.5s7.5 3 11.5 2"
      stroke={C.sand}
      strokeWidth="1.6"
      fill="none"
    />
    <path
      d="M9 22l5-5 4 3 6-8"
      stroke="#fff"
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="12" r="1.8" fill={C.sand} />
  </svg>
);

export { clamp };
