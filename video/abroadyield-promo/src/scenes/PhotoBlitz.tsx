import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, PHOTOS, fontFamily } from "../brand";
import { Flash, clamp, useSpringAt } from "../kit";

const PER = 17;

const Shot: React.FC<{ file: string; city: string; i: number }> = ({
  file,
  city,
  i,
}) => {
  const frame = useCurrentFrame();
  const s = useSpringAt(0, 14, 260);
  const dir = i % 2 ? 1 : -1;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.ink }}>
      <Img
        src={staticFile(file)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, PER + 4], [1.45, 1.08], clamp)),
          rotate: `${interpolate(s, [0, 1], [dir * 7, 0])}deg`,
          translate: `${interpolate(frame, [0, PER], [dir * 60, 0], clamp)}px 0px`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,17,31,0.35), rgba(8,17,31,0.05) 40%, rgba(8,17,31,0.8))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 300,
          fontFamily,
          fontWeight: 900,
          fontSize: city.length > 10 ? 120 : 160,
          letterSpacing: "-0.05em",
          lineHeight: 0.95,
          color: C.white,
          translate: `${interpolate(s, [0, 1], [dir * -700, 0])}px 0px`,
          transform: `skewX(${interpolate(s, [0, 1], [dir * 20, 0])}deg)`,
        }}
      >
        {city}
      </div>
      <Flash at={0} />
    </AbsoluteFill>
  );
};

/** 2–6s: seven destinations, one every ~half second, with a pulsing "7% yield" sticker. */
export const PhotoBlitz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = useSpringAt(6, 8, 260);
  return (
    <AbsoluteFill>
      {PHOTOS.map((p, i) => (
        <Sequence
          key={p.file}
          from={i * PER}
          durationInFrames={i === PHOTOS.length - 1 ? 200 : PER}
          premountFor={fps}
        >
          <Shot file={p.file} city={p.city} i={i} />
        </Sequence>
      ))}
      <div
        style={{
          position: "absolute",
          top: 260,
          right: 80,
          padding: "28px 40px",
          borderRadius: 999,
          background: C.champagne,
          color: C.ink,
          fontFamily,
          fontWeight: 900,
          fontSize: 64,
          letterSpacing: "-0.03em",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
          scale: String(pop * (1 + Math.sin(frame / 3) * 0.05)),
          rotate: `${8 + Math.sin(frame / 5) * 4}deg`,
        }}
      >
        “7% yield!”
      </div>
    </AbsoluteFill>
  );
};
