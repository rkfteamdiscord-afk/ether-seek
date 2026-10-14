import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BillionaireDefs } from "./Billionaire";
import { DeckDefs, DeckSet } from "./DeckSet";
import { DECK, cameraAt } from "./timeline";
import { YachtDefs, YachtWorld } from "./YachtWorld";

// Scene 3 — boredom on the yacht (11 s -> 18 s of the full edit).
// Single vector world filmed by a virtual camera: wide drone shot, deck
// shots, face close-up, then one continuous zoom out to the whole yacht.
export const Scene3Yacht: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cam = cameraAt(frame);
  // The eye-level deck environment hands over to the aerial world as we zoom out.
  const backdrop = interpolate(cam.z * DECK.k, [0.6, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b6f8c" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute" }}>
        <defs>
          <YachtDefs />
          <DeckDefs />
          <BillionaireDefs />
          <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
            <stop offset="55%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 24} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <g transform={`translate(${width / 2}, ${height / 2}) scale(${cam.z}) translate(${-cam.fx}, ${-cam.fy})`}>
          {backdrop < 1 ? <YachtWorld frame={frame} /> : null}
          <g transform={`translate(${DECK.x}, ${DECK.y}) scale(${DECK.k})`}>
            <DeckSet frame={frame} backdrop={backdrop} />
          </g>
        </g>
        {/* warm luxury grade, vignette and film grain */}
        <rect width={width} height={height} fill="#ffb15c" opacity={0.07} style={{ mixBlendMode: "soft-light" }} />
        <rect width={width} height={height} fill="url(#vignette)" />
        <rect width={width} height={height} filter="url(#grain)" opacity={0.06} />
      </svg>
      <Audio name="Music" src={staticFile("scene3-music.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
