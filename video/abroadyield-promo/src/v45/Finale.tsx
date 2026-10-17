import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, PHOTOS, fontFamily } from "../brand";
import { Flash, Logo, NightBg, clamp, useShake, useSpringAt } from "../kit";
import { RgbText } from "./fx";

/** Ending: a tunnel of destination photos rushes past the camera, then the logo, name and CTA. */
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useSpringAt(34, 9, 200);
  const line = useSpringAt(56, 12, 200);
  const btn = useSpringAt(70, 8, 240);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <NightBg />
      <AbsoluteFill style={{ perspective: 900 }}>
        {PHOTOS.map((p, i) => {
          const z = interpolate(frame, [i * 3, i * 3 + 26], [-2600, 900], {
            ...clamp,
            easing: Easing.in(Easing.quad),
          });
          const a = (i / PHOTOS.length) * Math.PI * 2;
          return (
            <Img
              key={p.file}
              src={staticFile(p.file)}
              style={{
                position: "absolute",
                left: "50%",
                top: "45%",
                width: 420,
                height: 560,
                objectFit: "cover",
                borderRadius: 30,
                transform: `translate(-50%, -50%) translate3d(${Math.cos(a) * 520}px, ${Math.sin(a) * 700}px, ${z}px) rotate(${i * 23}deg)`,
                opacity: interpolate(z, [-2600, -1800, 500, 900], [0, 1, 1, 0]),
              }}
            />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          padding: "0 80px",
          textAlign: "center",
          translate: useShake([34], 36),
        }}
      >
        <div
          style={{
            scale: String(logo),
            rotate: `${interpolate(logo, [0, 1], [-540, 0])}deg`,
          }}
        >
          <Logo size={210} />
        </div>
        {frame >= 40 ? (
          <RgbText size={150} delay={40}>
            AbroadYield
          </RgbText>
        ) : null}
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 62,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#c9d1dd",
            opacity: line,
            translate: `0px ${interpolate(line, [0, 1], [80, 0])}px`,
          }}
        >
          Find out what you’ll{" "}
          <span style={{ color: C.champagne }}>really</span> earn.
        </div>
        <div
          style={{
            marginTop: 30,
            padding: "40px 72px",
            borderRadius: 999,
            background: `linear-gradient(180deg, #f3e6c9, ${C.champagne})`,
            color: C.ink,
            fontFamily,
            fontWeight: 900,
            fontSize: 64,
            letterSpacing: "-0.03em",
            scale: String(
              btn * (1 + Math.max(0, Math.sin((frame - 80) / 4)) * 0.07),
            ),
            boxShadow: `0 0 ${50 + Math.sin(frame / 4) * 30}px rgba(201,166,107,0.75)`,
          }}
        >
          Get my free ranking →
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 42,
            color: "rgba(255,255,255,0.75)",
            opacity: btn,
          }}
        >
          Free · 3 minutes · No card
        </div>
      </AbsoluteFill>
      <Flash at={34} color={C.champagne} />
    </AbsoluteFill>
  );
};
