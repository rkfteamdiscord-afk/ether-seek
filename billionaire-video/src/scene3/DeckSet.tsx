import React from "react";
import { Easing, interpolate, random } from "remotion";
import { Billionaire, Phone, SHOULDER_R, poseAt, wristPosition } from "./Billionaire";
import { T, ramp } from "./timeline";

// Eye-level set on the aft deck: horizon, infinity pool, teak, white sofa,
// champagne. Coordinates are a 1080 x 1920 frame. `backdrop` fades the
// environment out during the final zoom so only the sofa and the man remain
// on the aerial yacht.

const LANDING = { x: 236, y: 1296 };

const FlyingPhone: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.phoneRelease) return null;
  const p = poseAt(T.phoneRelease);
  const from = wristPosition(SHOULDER_R, p.rUpper, p.rFore, p.shrug);
  const t = ramp(frame, [T.phoneRelease, T.phoneLands], [0, 1], Easing.linear);
  const x = from.x + (LANDING.x - from.x) * t;
  const arc = -110 * 4 * t * (1 - t);
  const bounce = frame > T.phoneLands ? -14 * Math.sin(ramp(frame, [T.phoneLands, T.phoneLands + 4], [0, Math.PI], Easing.linear)) : 0;
  const y = from.y + (LANDING.y - from.y) * t + arc + bounce;
  const spin = interpolate(t, [0, 1], [180, 450 + 90]) + (frame > T.phoneLands ? 0 : 0);
  return (
    <g transform={`translate(${x}, ${y}) rotate(${spin}) scale(1, ${frame >= T.phoneLands ? 0.55 : 1})`}>
      <Phone />
    </g>
  );
};

const Champagne: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {/* low marble side table */}
    <path d="M870,1470 L1060,1470 L1050,1500 L880,1500 Z" fill="#efeae2" />
    <rect x={900} y={1500} width={130} height={150} fill="#d9d2c6" />
    <path d="M870,1470 L1060,1470" stroke="#c9a54a" strokeWidth={4} />
    {/* silver ice bucket with bottle */}
    <path d="M900,1390 L990,1390 L980,1470 L910,1470 Z" fill="url(#silver)" />
    <path d="M928,1390 L926,1270 Q930,1240 944,1232 L946,1200 L956,1200 L958,1232 Q972,1240 974,1270 L972,1390 Z" fill="#0f2a1c" />
    <rect x={943} y={1196} width={18} height={26} fill="#d4af37" />
    <path d="M934,1300 L968,1300 L968,1340 L934,1340 Z" fill="#e9dcae" />
    {/* flute with rising bubbles */}
    <path d="M1010,1380 L1036,1380 L1030,1440 L1024,1446 L1024,1466 L1036,1470 L1010,1470 L1022,1466 L1022,1446 L1016,1440 Z" fill="#ffffff" opacity={0.55} />
    <path d="M1012,1392 L1034,1392 L1030,1438 L1016,1438 Z" fill="#f3d27a" opacity={0.85} />
    {[0, 1, 2, 3].map((i) => {
      const cycle = (frame + i * 9) % 36;
      return <circle key={i} cx={1020 + (i % 2) * 6} cy={1436 - cycle * 1.3} r={1.8} fill="#fff8dc" opacity={cycle < 32 ? 0.9 : 0} />;
    })}
  </g>
);

const Sofa: React.FC = () => (
  <g>
    <rect x={120} y={1140} width={840} height={210} rx={46} fill="url(#sofaBack)" />
    {/* back cushions */}
    <rect x={160} y={1160} width={250} height={170} rx={34} fill="#fbfaf6" />
    <rect x={415} y={1160} width={250} height={170} rx={34} fill="#f7f5ef" />
    <rect x={670} y={1160} width={250} height={170} rx={34} fill="#fbfaf6" />
    {/* seat */}
    <rect x={130} y={1420} width={820} height={170} rx={16} fill="#e4dfd4" />
    <rect x={130} y={1300} width={820} height={135} rx={30} fill="#f2efe8" />
    <rect x={100} y={1200} width={80} height={400} rx={36} fill="#f6f3ed" />
    <rect x={900} y={1200} width={80} height={400} rx={36} fill="#f6f3ed" />
    <rect x={150} y={1428} width={780} height={14} rx={7} fill="#d8d2c6" />
    {/* navy accent cushion, precisely aligned of course */}
    <rect x={720} y={1210} width={130} height={110} rx={24} fill="#1d2b4f" />
    <path d="M730,1265 L840,1265" stroke="#d4af37" strokeWidth={3} />
  </g>
);

const Backdrop: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={1100} fill="url(#deckSky)" />
    <circle cx={880} cy={300} r={260} fill="url(#sunGlow)" />
    <circle cx={880} cy={300} r={62} fill="#fffbe9" />
    {/* distant islands */}
    <path d="M-200,700 Q60,640 220,690 Q300,660 380,700 Z" fill="#6c9bb0" opacity={0.6} />
    <rect x={-400} y={700} width={1880} height={460} fill="url(#deckSea)" />
    {/* sparkling sea */}
    {new Array(28).fill(0).map((_, i) => {
      const x = random(`sx${i}`) * 1080;
      const y = 710 + random(`sy${i}`) * 330;
      const tw = 0.5 + 0.5 * Math.sin(frame / 4 + i * 1.7);
      return <ellipse key={i} cx={(x + frame * 0.6) % 1180 - 50} cy={y} rx={14 + (y - 700) / 14} ry={1.6} fill="#ffffff" opacity={tw * 0.7} />;
    })}
    {/* infinity pool: the water spills into the horizon */}
    <path d="M-400,1010 L1480,1010 L1480,1150 L-400,1150 Z" fill="url(#deckPool)" />
    <path d="M-400,1010 L1480,1010" stroke="#ffffff" strokeWidth={3} opacity={0.6} />
    {new Array(10).fill(0).map((_, i) => (
      <path
        key={i}
        d={`M${-100 + i * 140 + Math.sin(frame / 10 + i) * 20},${1050 + (i % 3) * 30} q30,-8 60,0 t60,0`}
        stroke="#e8ffff"
        strokeWidth={2.5}
        fill="none"
        opacity={0.55}
      />
    ))}
    <rect x={-400} y={1140} width={1880} height={18} fill="#f4f1ea" />
    {/* teak deck in perspective */}
    <path d="M-400,1158 L1480,1158 L1480,2320 L-400,2320 Z" fill="#a8774a" />
    {new Array(16).fill(0).map((_, i) => {
      const top = -200 + i * 100;
      const bottom = 540 + (top - 540) * 2.6;
      return <path key={i} d={`M${top},1158 L${bottom},2200`} stroke="#6f4a2c" strokeWidth={3} opacity={0.7} />;
    })}
    <ellipse cx={540} cy={1600} rx={520} ry={110} fill="#000000" opacity={0.18} />
  </g>
);

export const DeckDefs: React.FC = () => (
  <>
    <linearGradient id="deckSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3f9ad8" />
      <stop offset="75%" stopColor="#9fd4f0" />
      <stop offset="100%" stopColor="#e7f5fb" />
    </linearGradient>
    <radialGradient id="sunGlow">
      <stop offset="0%" stopColor="#fff7d6" stopOpacity={0.95} />
      <stop offset="100%" stopColor="#fff7d6" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="deckSea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#1b8fb0" />
      <stop offset="100%" stopColor="#14b5c0" />
    </linearGradient>
    <linearGradient id="deckPool" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3fd6dc" />
      <stop offset="100%" stopColor="#7eeae8" />
    </linearGradient>
    <linearGradient id="sofaBack" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#e2ddd2" />
    </linearGradient>
    <linearGradient id="silver" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#8f949a" />
      <stop offset="40%" stopColor="#f2f4f6" />
      <stop offset="100%" stopColor="#7a8086" />
    </linearGradient>
    <radialGradient id="deckFeather" cx="0.5" cy="0.5" r="0.5">
      <stop offset="70%" stopColor="#fff" />
      <stop offset="100%" stopColor="#000" />
    </radialGradient>
    <mask id="deckMask" maskContentUnits="userSpaceOnUse">
      <rect x={-400} y={-400} width={1880} height={2720} fill="url(#deckFeather)" />
    </mask>
  </>
);

export const DeckSet: React.FC<{ frame: number; backdrop: number }> = ({ frame, backdrop }) => (
  <g>
    {backdrop > 0 ? (
      <g opacity={backdrop} mask={backdrop < 1 ? "url(#deckMask)" : undefined}>
        <Backdrop frame={frame} />
      </g>
    ) : null}
    <Sofa />
    <Champagne frame={frame} />
    <Billionaire frame={frame} />
    <FlyingPhone frame={frame} />
  </g>
);
