import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, fontFamily } from "../brand";
import { clamp } from "../kit";

/**
 * Simulated drone shot: an aerial photo laid on a tilted plane, flown forward while the camera
 * yaws and climbs, with a viewfinder overlay (corner brackets, REC, altitude, location).
 */
export const Drone: React.FC<{
  src: string;
  place: string;
  /** Camera move preset: forward fly-over, orbit, or top-down rise. */
  move?: "fly" | "orbit" | "rise";
  children?: React.ReactNode;
}> = ({ src, place, move = "fly", children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const ease = Easing.inOut(Easing.cubic)(t);
  const tilt = move === "rise" ? 0 : interpolate(ease, [0, 1], [34, 18]);
  const yaw =
    move === "orbit"
      ? interpolate(ease, [0, 1], [-14, 14])
      : interpolate(ease, [0, 1], [-4, 3]);
  const scale =
    move === "rise"
      ? interpolate(ease, [0, 1], [1.9, 1.15])
      : interpolate(ease, [0, 1], [1.25, 1.75]);
  const forward = move === "fly" ? interpolate(ease, [0, 1], [0, 220]) : 0;
  return (
    <AbsoluteFill
      style={{ background: C.ink, overflow: "hidden", perspective: 1100 }}
    >
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: "-40%",
          top: "-25%",
          width: "180%",
          height: "150%",
          objectFit: "cover",
          transform: `rotateX(${tilt}deg) rotateZ(${yaw}deg) scale(${scale}) translateY(${forward}px)`,
          transformOrigin: "50% 60%",
        }}
      />
      {/* Haze at the horizon and a vignette */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(220,230,240,0.35) 0%, rgba(220,230,240,0) 22%, rgba(8,17,31,0) 60%, rgba(8,17,31,0.75) 100%)",
        }}
      />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px rgba(0,0,0,0.65)" }} />
      <Hud place={place} />
      {children}
    </AbsoluteFill>
  );
};

const Bracket: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: "absolute",
      width: 90,
      height: 90,
      borderColor: "rgba(255,255,255,0.85)",
      ...style,
    }}
  />
);

export const Hud: React.FC<{ place: string }> = ({ place }) => {
  const frame = useCurrentFrame();
  const alt = Math.round(interpolate(frame, [0, 90], [82, 146], clamp));
  return (
    <AbsoluteFill style={{ fontFamily, color: "white", pointerEvents: "none" }}>
      <Bracket
        style={{
          left: 60,
          top: 160,
          borderLeft: "5px solid",
          borderTop: "5px solid",
        }}
      />
      <Bracket
        style={{
          right: 60,
          top: 160,
          borderRight: "5px solid",
          borderTop: "5px solid",
        }}
      />
      <Bracket
        style={{
          left: 60,
          bottom: 160,
          borderLeft: "5px solid",
          borderBottom: "5px solid",
        }}
      />
      <Bracket
        style={{
          right: 60,
          bottom: 160,
          borderRight: "5px solid",
          borderBottom: "5px solid",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 190,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: "0.12em",
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 99,
            background: "#ff3b30",
            opacity: Math.floor(frame / 12) % 2 ? 1 : 0.25,
          }}
        />
        REC
      </div>
      <div
        style={{
          position: "absolute",
          right: 90,
          top: 190,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: "0.08em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        ALT {alt} M
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          bottom: 190,
          padding: "12px 22px",
          borderRadius: 99,
          background: "rgba(8,17,31,0.55)",
          border: "2px solid rgba(255,255,255,0.4)",
          fontWeight: 700,
          fontSize: 34,
        }}
      >
        ◉ {place}
      </div>
    </AbsoluteFill>
  );
};

/** Big text with a chromatic-aberration split that snaps together. */
export const RgbText: React.FC<{
  children: React.ReactNode;
  size: number;
  delay?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size, delay = 0, color = C.white, style }) => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [delay, delay + 10], [36, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const jitter =
    frame >= delay && frame < delay + 10 ? Math.sin(frame * 9) * 10 : 0;
  const base: React.CSSProperties = {
    fontFamily,
    fontWeight: 900,
    fontSize: size,
    letterSpacing: "-0.055em",
    lineHeight: 0.92,
    textAlign: "center",
    whiteSpace: "pre-line",
    opacity: frame < delay ? 0 : 1,
  };
  return (
    <div style={{ position: "relative", ...style }}>
      <div
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          color: "#ff2d55",
          mixBlendMode: "screen",
          translate: `${-split + jitter}px ${jitter / 2}px`,
        }}
      >
        {children}
      </div>
      <div
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          color: "#00e5ff",
          mixBlendMode: "screen",
          translate: `${split - jitter}px ${-jitter / 2}px`,
        }}
      >
        {children}
      </div>
      <div style={{ ...base, position: "relative", color }}>{children}</div>
    </div>
  );
};

/** Caption slab for drone shots: slides up, holds, exits sideways. */
export const DroneLine: React.FC<{
  children: React.ReactNode;
  accent?: string;
  delay?: number;
}> = ({ children, accent, delay = 8 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const enter = interpolate(frame, [delay, delay + 12], [1, 0], {
    ...clamp,
    easing: Easing.out(Easing.back(1.4)),
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [0, 1],
    { ...clamp, easing: Easing.in(Easing.cubic) },
  );
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px" }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 118,
          lineHeight: 0.96,
          letterSpacing: "-0.05em",
          color: C.white,
          textShadow: "0 10px 50px rgba(0,0,0,0.55)",
          translate: `${exit * -1300}px ${enter * 500}px`,
          rotate: `${enter * 8 - exit * 10}deg`,
          opacity: frame < delay ? 0 : 1,
        }}
      >
        {children}
        {accent ? <div style={{ color: C.champagne }}>{accent}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
