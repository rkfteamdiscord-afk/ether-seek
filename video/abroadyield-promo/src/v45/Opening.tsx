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
import { C, fontFamily } from "../brand";
import { Flash, NightBg, clamp, useShake, useSpringAt } from "../kit";
import { RgbText } from "./fx";

/** 0–2s: "STOP SCROLLING." slams with chromatic split and shake, then the frame punches in. */
export const Hook45: React.FC = () => {
  const frame = useCurrentFrame();
  const word2 = useSpringAt(16, 9, 260);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBg />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
          translate: useShake([0, 16, 34], 40),
          scale: String(
            interpolate(frame, [0, 6, 40, 60], [3, 1, 1, 1.6], clamp),
          ),
          rotate: `${interpolate(frame, [0, 6], [-12, 0], clamp)}deg`,
        }}
      >
        <RgbText size={250}>STOP</RgbText>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 150,
            letterSpacing: "-0.05em",
            color: C.champagne,
            translate: `${interpolate(word2, [0, 1], [-1400, 0])}px 0px`,
            transform: `skewX(${interpolate(word2, [0, 1], [-30, 0])}deg)`,
          }}
        >
          SCROLLING.
        </div>
      </AbsoluteFill>
      <Flash at={0} />
      <Flash at={34} color={C.champagne} />
    </AbsoluteFill>
  );
};

const STORM = [
  { file: "photos/lisbon.jpg", city: "LISBON" },
  { file: "photos/paris.jpg", city: "PARIS" },
  { file: "photos/playa-del-carmen.jpg", city: "MEXICO" },
  { file: "photos/rome.jpg", city: "ROME" },
  { file: "photos/kyoto.jpg", city: "KYOTO" },
  { file: "photos/london.jpg", city: "LONDON" },
  { file: "photos/malaga.jpg", city: "SPAIN" },
  { file: "photos/punta-cana.jpg", city: "PUNTA CANA" },
  { file: "photos/athens.jpg", city: "ATHENS" },
  { file: "photos/dubrovnik.jpg", city: "DUBROVNIK" },
  { file: "photos/dubai-marina.jpg", city: "DUBAI" },
  { file: "photos/la-serrana.jpg", city: "COLOMBIA" },
  { file: "photos/berlin.jpg", city: "BERLIN" },
  { file: "photos/tamarindo.jpg", city: "COSTA RICA" },
  { file: "photos/krabi.jpg", city: "THAILAND" },
  { file: "photos/cliffs-of-moher.jpg", city: "IRELAND" },
  { file: "photos/guna-yala.jpg", city: "PANAMA" },
];
const PER = 8;
type Entry = "zoom" | "left" | "right" | "spin" | "drop" | "flipX";
const ENTRIES: Entry[] = ["zoom", "left", "spin", "right", "drop", "flipX"];

const StormShot: React.FC<{ file: string; city: string; i: number }> = ({
  file,
  city,
  i,
}) => {
  const frame = useCurrentFrame();
  const s = useSpringAt(0, 13, 320);
  const entry = ENTRIES[i % ENTRIES.length]!;
  const inv = 1 - s;
  const transform =
    entry === "zoom"
      ? `scale(${1.1 + inv * 2.4})`
      : entry === "left"
        ? `translateX(${-inv * 1200}px) scale(1.15)`
        : entry === "right"
          ? `translateX(${inv * 1200}px) scale(1.15)`
          : entry === "spin"
            ? `rotate(${inv * 180}deg) scale(${1.15 + inv})`
            : entry === "drop"
              ? `translateY(${-inv * 2000}px) scale(1.15)`
              : `perspective(900px) rotateY(${inv * 90}deg) scale(1.15)`;
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
          transform: `${transform} scale(${1 + frame * 0.012})`,
          filter: `blur(${inv * 14}px) saturate(1.15)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,17,31,0.2), rgba(8,17,31,0) 40%, rgba(8,17,31,0.7))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 330,
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: city.length > 8 ? 130 : 170,
          letterSpacing: "-0.05em",
          color: C.white,
          textShadow: "0 12px 40px rgba(0,0,0,0.5)",
          scale: String(interpolate(s, [0, 1], [2.2, 1])),
          rotate: `${(i % 2 ? 1 : -1) * inv * 25}deg`,
        }}
      >
        {city}
      </div>
    </AbsoluteFill>
  );
};

/** 17 destinations, one every 8 frames, each entering a different way. Flashes stay under 3/s. */
export const Storm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {STORM.map((p, i) => (
        <Sequence
          key={p.file}
          from={i * PER}
          durationInFrames={i === STORM.length - 1 ? 200 : PER + 2}
          premountFor={fps}
        >
          <StormShot file={p.file} city={p.city} i={i} />
        </Sequence>
      ))}
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: 44,
          letterSpacing: "0.3em",
          color: C.white,
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        WHERE NEXT?
      </div>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: "50%",
          translate: "-50% 0",
          fontFamily,
          fontWeight: 900,
          fontSize: 54,
          color: C.champagne,
          fontVariantNumeric: "tabular-nums",
          textShadow: "0 4px 24px rgba(0,0,0,0.75)",
        }}
      >
        {String(Math.min(STORM.length, Math.floor(frame / PER) + 1)).padStart(
          2,
          "0",
        )}{" "}
        / {STORM.length}
      </div>
      {STORM.map((_, i) =>
        i % 3 === 0 ? <Flash key={i} at={i * PER} /> : null,
      )}
    </AbsoluteFill>
  );
};
