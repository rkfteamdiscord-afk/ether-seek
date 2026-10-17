import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, PHOTOS, fontFamily } from "../brand";
import { Flash, Logo, NightBg, clamp, useSpringAt } from "../kit";

/** Ending: photo tiles collapse into the logo, then the name, the promise and the CTA. */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useSpringAt(26, 9, 180);
  const name = useSpringAt(34, 11, 200);
  const line = useSpringAt(46, 14, 200);
  const btn = useSpringAt(58, 8, 220);
  const gather = interpolate(frame, [0, 26], [0, 1], { ...clamp });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBg />
      {PHOTOS.map((p, i) => {
        const a = (i / PHOTOS.length) * Math.PI * 2;
        const r = interpolate(gather, [0, 1], [900, 0]);
        return (
          <Img
            key={p.file}
            src={staticFile(p.file)}
            style={{
              position: "absolute",
              left: "50%",
              top: "38%",
              width: 380,
              height: 500,
              objectFit: "cover",
              borderRadius: 36,
              translate: `calc(-50% + ${Math.cos(a + frame / 15) * r}px) calc(-50% + ${Math.sin(a + frame / 15) * r}px)`,
              rotate: `${(i - 3) * 9 + frame}deg`,
              scale: String(interpolate(gather, [0, 1], [1, 0.1])),
              opacity: interpolate(frame, [20, 28], [1, 0], clamp),
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            scale: String(logo),
            rotate: `${interpolate(logo, [0, 1], [-180, 0])}deg`,
          }}
        >
          <Logo size={190} />
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 150,
            letterSpacing: "-0.055em",
            color: C.white,
            lineHeight: 1,
            scale: String(interpolate(name, [0, 1], [2.4, 1])),
            opacity: name,
            filter: `blur(${interpolate(name, [0, 0.7], [16, 0], clamp)}px)`,
          }}
        >
          AbroadYield
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 60,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#c9d1dd",
            opacity: line,
            translate: `0px ${interpolate(line, [0, 1], [60, 0])}px`,
          }}
        >
          Find out what you’ll{" "}
          <span style={{ color: C.champagne }}>really</span> earn.
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "40px 70px",
            borderRadius: 999,
            background: `linear-gradient(180deg, #f3e6c9, ${C.champagne})`,
            color: C.ink,
            fontFamily,
            fontWeight: 900,
            fontSize: 62,
            letterSpacing: "-0.03em",
            scale: String(
              btn * (1 + Math.max(0, Math.sin((frame - 70) / 4)) * 0.06),
            ),
            boxShadow: `0 0 ${40 + Math.sin(frame / 4) * 30}px rgba(201,166,107,0.7)`,
          }}
        >
          Get my free ranking →
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 40,
            color: "rgba(255,255,255,0.7)",
            opacity: btn,
          }}
        >
          Free · 3 minutes · No card
        </div>
      </AbsoluteFill>
      <Flash at={26} color={C.champagne} />
    </AbsoluteFill>
  );
};
