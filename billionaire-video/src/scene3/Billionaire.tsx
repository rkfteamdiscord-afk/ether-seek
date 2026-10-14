import React from "react";
import { Easing } from "remotion";
import { T, ramp } from "./timeline";

// The billionaire, drawn in deck-set coordinates (1080 x 1920, seated on the
// sofa). He never smiles: the mouth is a flat line with slightly lowered corners.

const SKIN = "#c8977a";
const SKIN_SHADE = "#a87459";
const SUIT = "#18203a";
const SUIT_LIGHT = "#252f52";
const HAIR = "#33261d";
const GREY = "#8d8a86";
const GOLD = "#d4af37";

export const SHOULDER_R = { x: 398, y: 1062 }; // his right, viewer's left (phone)
export const SHOULDER_L = { x: 682, y: 1062 }; // his left, viewer's right (watch)
const UPPER = 190;
const FORE = 168;

type Pose = {
  rUpper: number; // absolute angle, 0 = straight down, positive swings to viewer-left
  rFore: number;
  lUpper: number;
  lFore: number;
  hx: number; // head turn -1 (viewer-left) .. 1 (viewer-right)
  down: number; // 0 .. 1 looking down
  tilt: number; // degrees
  px: number; // pupils
  py: number;
  blink: number; // 0 open .. 1 closed
  brow: number; // eyebrow raise
  mouthOpen: number;
  shrug: number; // sigh: shoulders up
  phoneInHand: boolean;
  screenGlow: number;
};

const seq = (f: number, keys: number[], values: number[]) =>
  ramp(f, keys, values, Easing.bezier(0.4, 0, 0.2, 1));

export const poseAt = (f: number): Pose => {
  const watchUp = seq(f, [T.watchStart, T.watchStart + 7, T.phoneStart - 4, T.phoneStart], [0, 1, 1, 0]);
  const phoneUp = seq(f, [T.phoneStart, T.phoneStart + 6, T.tossStart], [0, 1, 1]);
  const toss = ramp(f, [T.tossStart, T.tossStart + 4, T.tossStart + 12], [0, 1, 0], Easing.bezier(0.3, 0, 0.3, 1));
  const sigh = seq(f, [T.sighStart, T.sighStart + 6, T.sighStart + 13], [0, 1, 0]);
  const lookView = seq(f, [T.cutToDeck - 1, T.cutToDeck + 8, T.sighStart, T.sighStart + 8], [0.55, 0.62, 0.62, 0]);

  // Eye roll: pupils sweep left -> up -> right -> centre over half a second.
  const roll = ramp(f, [T.cutToEyeRoll + 1, T.cutToEyeRoll + 11], [0, 1], Easing.bezier(0.45, 0, 0.55, 1));
  const rolling = f >= T.cutToEyeRoll + 1 && f <= T.cutToEyeRoll + 13;
  const rollAngle = Math.PI + roll * Math.PI; // from left, through the top, to the right
  const rollAmount = rolling ? Math.sin(Math.min(1, roll * 1.05) * Math.PI) ** 0.4 : 0;

  const blinkAt = (s: number) => seq(f, [s, s + 2, s + 4], [0, 1, 0]);
  const slowBlink = seq(f, [T.drop + 4, T.drop + 8, T.drop + 13], [0, 1, 0]);

  let px = lookView * 0.9 - phoneUp * 0.4 + watchUp * 0.55;
  let py = watchUp * 0.75 + phoneUp * 0.8 - sigh * 0.1;
  if (rolling) {
    px = Math.cos(rollAngle) * rollAmount;
    py = Math.sin(rollAngle) * rollAmount;
  }

  return {
    rUpper: 14 + phoneUp * 14 + toss * 20,
    rFore: -58 + phoneUp * -86 + toss * 150,
    lUpper: -14 - watchUp * 18,
    lFore: 62 + watchUp * 74,
    hx: lookView * 0.62 - phoneUp * 0.28 + watchUp * 0.32,
    down: watchUp * 0.8 + phoneUp * 0.7 + sigh * 0.25,
    tilt: lookView * 3 - phoneUp * 3 + watchUp * 4 - rollAmount * 4,
    px,
    py,
    blink: Math.max(blinkAt(62), blinkAt(T.sighStart + 7), slowBlink * 0.85),
    brow: rollAmount * 1 + sigh * 0.3,
    mouthOpen: sigh,
    shrug: sigh,
    phoneInHand: f < T.phoneRelease,
    screenGlow: phoneUp * (f < T.phoneRelease ? 1 : 0),
  };
};

const rad = (deg: number) => (deg * Math.PI) / 180;
// Direction of a limb drawn along +y and rotated by `deg` (SVG rotate is clockwise).
const dir = (deg: number) => ({ x: -Math.sin(rad(deg)), y: Math.cos(rad(deg)) });

export const wristPosition = (shoulder: { x: number; y: number }, upper: number, fore: number, shrug: number) => {
  const a = dir(upper);
  const b = dir(fore);
  return {
    x: shoulder.x + a.x * UPPER + b.x * FORE,
    y: shoulder.y - shrug * 16 + a.y * UPPER + b.y * FORE,
  };
};

const Sleeve: React.FC<{ length: number; width: number; cuff?: boolean }> = ({ length, width, cuff }) => (
  <>
    <rect x={-width / 2} y={-10} width={width} height={length + 20} rx={width / 2} fill={SUIT} />
    <rect x={-width / 2 + 6} y={0} width={width * 0.28} height={length} rx={8} fill={SUIT_LIGHT} opacity={0.6} />
    {cuff ? <rect x={-width / 2 + 3} y={length - 6} width={width - 6} height={14} rx={6} fill="#f4f1ea" /> : null}
  </>
);

const Hand: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <g transform={flip ? "scale(-1,1)" : undefined}>
    <path d="M-24,4 C-30,30 -22,62 2,66 C22,68 30,46 28,20 C27,8 20,0 2,-2 C-12,-3 -20,-2 -24,4 Z" fill={SKIN} />
    {/* thumb */}
    <path d="M22,14 C36,18 42,34 34,44 C30,48 24,42 22,34 Z" fill={SKIN_SHADE} />
    <path d="M-14,40 L16,42 M-14,50 L14,52" stroke={SKIN_SHADE} strokeWidth={2} opacity={0.5} />
  </g>
);

const Watch: React.FC = () => (
  <g>
    <rect x={-27} y={-10} width={54} height={22} rx={6} fill={GOLD} />
    <circle cx={0} cy={1} r={21} fill={GOLD} stroke="#a8862a" strokeWidth={3} />
    <circle cx={0} cy={1} r={15} fill="#0e1a2c" />
    <path d="M0,1 L0,-10 M0,1 L8,4" stroke="#f5e7b5" strokeWidth={2.5} strokeLinecap="round" />
    <circle cx={-6} cy={-5} r={4} fill="#ffffff" opacity={0.35} />
  </g>
);

export const Phone: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <g>
    <rect x={-22} y={-40} width={44} height={84} rx={9} fill="#0b0b0f" stroke="#555" strokeWidth={2} />
    <rect x={-18} y={-35} width={36} height={74} rx={6} fill={glow > 0 ? "#5f8fbf" : "#14161c"} opacity={0.4 + glow * 0.6} />
  </g>
);

const Arm: React.FC<{
  shoulder: { x: number; y: number };
  upper: number;
  fore: number;
  shrug: number;
  side: "r" | "l";
  pose: Pose;
}> = ({ shoulder, upper, fore, shrug, side, pose }) => (
  <g transform={`translate(${shoulder.x}, ${shoulder.y - shrug * 16}) rotate(${upper})`}>
    <Sleeve length={UPPER} width={74} />
    <g transform={`translate(0, ${UPPER}) rotate(${fore - upper})`}>
      <Sleeve length={FORE} width={64} cuff />
      {side === "l" ? (
        <g transform={`translate(0, ${FORE - 2})`}>
          <Watch />
        </g>
      ) : null}
      <g transform={`translate(0, ${FORE + 8})`}>
        <Hand flip={side === "l"} />
        {side === "r" && pose.phoneInHand ? (
          <g transform="translate(4, 40) rotate(180)">
            <Phone glow={pose.screenGlow} />
          </g>
        ) : null}
      </g>
    </g>
  </g>
);

const Head: React.FC<{ pose: Pose }> = ({ pose }) => {
  const fx = pose.hx * 24; // features shift with head turn
  const fy = pose.down * 16;
  const eyeY = 838 + fy;
  const pupil = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={eyeY} rx={17} ry={10 * (1 - pose.blink)} fill="#f2ece4" />
      <circle cx={cx + pose.px * 8} cy={eyeY + pose.py * 6} r={7 * (1 - pose.blink * 0.9)} fill="#3b2617" />
      <circle cx={cx + pose.px * 8} cy={eyeY + pose.py * 6} r={3 * (1 - pose.blink)} fill="#0b0705" />
      {/* heavy, unimpressed eyelid */}
      <path
        d={`M${cx - 19},${eyeY - 3 + pose.blink * 12} Q${cx},${eyeY - 14 + pose.blink * 24 - pose.brow * 3} ${cx + 19},${eyeY - 3 + pose.blink * 12}`}
        stroke={SKIN_SHADE}
        strokeWidth={4 + pose.blink * 8}
        fill="none"
      />
    </g>
  );
  const lens = (cx: number) => (
    <path
      d={`M${cx - 40},${eyeY - 16} Q${cx},${eyeY - 24} ${cx + 40},${eyeY - 16} Q${cx + 44},${eyeY + 20} ${cx + 8},${eyeY + 30} Q${cx - 34},${eyeY + 32} ${cx - 40},${eyeY - 16} Z`}
      fill="url(#lensTint)"
      stroke={GOLD}
      strokeWidth={4}
    />
  );
  const left = 500 + fx;
  const right = 580 + fx;
  return (
    <g transform={`rotate(${pose.tilt}, 540, 940)`}>
      {/* neck */}
      <path d="M498,900 L498,1010 Q540,1030 582,1010 L582,900 Z" fill={SKIN_SHADE} />
      {/* ears */}
      <ellipse cx={457 + fx * 0.3} cy={850 + fy} rx={14} ry={26} fill={SKIN_SHADE} />
      <ellipse cx={623 + fx * 0.3} cy={850 + fy} rx={14} ry={26} fill={SKIN_SHADE} />
      {/* face */}
      <ellipse cx={540 + fx * 0.25} cy={850} rx={84} ry={106} fill="url(#skinShade)" />
      {/* jaw stubble */}
      <path
        d={`M${468 + fx * 0.3},${880 + fy} Q${540 + fx * 0.5},${980} ${612 + fx * 0.3},${880 + fy} Q${600 + fx * 0.4},${952} ${540 + fx * 0.5},${957} Q${480 + fx * 0.4},${952} ${468 + fx * 0.3},${880 + fy} Z`}
        fill="#5b4537"
        opacity={0.22}
      />
      {/* hair: slicked back, greying temples */}
      <path
        d={`M${454 + fx * 0.2},${840} Q${446},${742} ${540 + fx * 0.2},${730} Q${636},${740} ${626 + fx * 0.2},${840} Q${614},${786} ${540 + fx * 0.3},${776} Q${470},${780} ${454 + fx * 0.2},${840} Z`}
        fill={HAIR}
      />
      <path d={`M${458 + fx * 0.2},${838} Q${458},${800} ${474 + fx * 0.2},${786}`} stroke={GREY} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={`M${622 + fx * 0.2},${838} Q${622},${800} ${606 + fx * 0.2},${786}`} stroke={GREY} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={`M${480 + fx * 0.2},${760} Q${540},${742} ${604 + fx * 0.2},${758}`} stroke="#4a382b" strokeWidth={4} fill="none" opacity={0.8} />
      {/* eyebrows: flat and serious */}
      <path d={`M${left - 26},${eyeY - 30 - pose.brow * 12} L${left + 24},${eyeY - 27 - pose.brow * 10}`} stroke={HAIR} strokeWidth={9} strokeLinecap="round" />
      <path d={`M${right - 24},${eyeY - 27 - pose.brow * 10} L${right + 26},${eyeY - 30 - pose.brow * 12}`} stroke={HAIR} strokeWidth={9} strokeLinecap="round" />
      {pupil(left)}
      {pupil(right)}
      {/* aviators: gradient tint lets the bored eyes show through */}
      {lens(left)}
      {lens(right)}
      <path d={`M${left + 40},${eyeY - 14} Q${540 + fx},${eyeY - 22} ${right - 40},${eyeY - 14}`} stroke={GOLD} strokeWidth={4} fill="none" />
      <path d={`M${left - 40},${eyeY - 14} L${458 + fx * 0.3},${eyeY - 8}`} stroke={GOLD} strokeWidth={4} />
      <path d={`M${right + 40},${eyeY - 14} L${622 + fx * 0.3},${eyeY - 8}`} stroke={GOLD} strokeWidth={4} />
      <path d={`M${left - 28},${eyeY - 10} L${left - 8},${eyeY + 14}`} stroke="#ffffff" strokeWidth={5} opacity={0.35} strokeLinecap="round" />
      <path d={`M${right - 28},${eyeY - 10} L${right - 8},${eyeY + 14}`} stroke="#ffffff" strokeWidth={5} opacity={0.35} strokeLinecap="round" />
      {/* nose */}
      <path d={`M${540 + fx * 1.2},${850 + fy} Q${552 + fx * 1.4},${892 + fy} ${540 + fx * 1.3},${900 + fy} Q${530 + fx},${903 + fy} ${522 + fx},${897 + fy}`} stroke={SKIN_SHADE} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* mouth: never a smile */}
      {pose.mouthOpen > 0.05 ? (
        <ellipse cx={540 + fx} cy={933 + fy} rx={14 - pose.mouthOpen * 4} ry={3 + pose.mouthOpen * 8} fill="#5a2f26" />
      ) : (
        <path d={`M${514 + fx},${936 + fy} Q${540 + fx},${933 + fy} ${566 + fx},${936 + fy} M${514 + fx},${936 + fy} l-4,3 M${566 + fx},${936 + fy} l4,3`} stroke="#6e3a2e" strokeWidth={5} fill="none" strokeLinecap="round" />
      )}
      {/* screen glow on the face while he scrolls */}
      <ellipse cx={520} cy={900} rx={90} ry={110} fill="#8fc4ff" opacity={pose.screenGlow * 0.12} />
    </g>
  );
};

export const BillionaireDefs: React.FC = () => (
  <>
    <linearGradient id="lensTint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#120c08" stopOpacity={0.9} />
      <stop offset="55%" stopColor="#2a1a10" stopOpacity={0.62} />
      <stop offset="100%" stopColor="#6b4a2c" stopOpacity={0.35} />
    </linearGradient>
    <radialGradient id="skinShade" cx="0.42" cy="0.38" r="0.75">
      <stop offset="0%" stopColor="#dcaa8b" />
      <stop offset="70%" stopColor={SKIN} />
      <stop offset="100%" stopColor={SKIN_SHADE} />
    </radialGradient>
    <linearGradient id="suitShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#10162b" />
      <stop offset="45%" stopColor={SUIT_LIGHT} />
      <stop offset="100%" stopColor="#0d1224" />
    </linearGradient>
  </>
);

export const Billionaire: React.FC<{ frame: number }> = ({ frame }) => {
  const pose = poseAt(frame);
  const breathe = Math.sin(frame / 14) * 2;
  const lift = pose.shrug * 16;
  return (
    <g>
      {/* legs: seated, thighs foreshortened toward the camera */}
      <path d="M560,1440 L648,1440 L640,1606 L570,1606 Z" fill="#141a30" />
      <path d="M436,1440 L526,1440 L516,1606 L446,1606 Z" fill="#141a30" />
      <path d="M426,1296 L542,1296 L538,1446 Q480,1462 424,1446 Z" fill={SUIT} />
      <path d="M538,1296 L654,1296 L658,1446 Q600,1462 542,1446 Z" fill={SUIT} />
      <path d="M440,1310 L530,1310 L528,1360 L438,1360 Z" fill={SUIT_LIGHT} opacity={0.55} />
      <path d="M550,1310 L640,1310 L642,1360 L552,1360 Z" fill={SUIT_LIGHT} opacity={0.55} />
      <path d="M430,1600 Q414,1640 466,1642 L530,1642 Q534,1608 514,1600 Z" fill="#160d08" />
      <path d="M566,1600 Q556,1638 606,1640 L664,1638 Q662,1606 640,1598 Z" fill="#1c110a" />
      <path d="M462,1622 L512,1622 M600,1620 L650,1620" stroke="#6b4a2c" strokeWidth={3} opacity={0.6} />

      {/* torso */}
      <g transform={`translate(0, ${breathe * 0.5 - lift * 0.4})`}>
        <path
          d={`M${392},${1062 - lift} Q540,${1018 - lift * 0.6} ${688},${1062 - lift} L660,1340 L420,1340 Z`}
          fill="url(#suitShade)"
        />
        {/* open white shirt, no tie */}
        <path d="M498,1010 L540,1112 L582,1010 L600,1030 L560,1210 L520,1210 L480,1030 Z" fill="#f4f1ea" />
        <path d="M510,1012 L540,1080 L570,1012 Z" fill={SKIN_SHADE} />
        {/* lapels */}
        <path d="M478,1026 L536,1220 L500,1240 L446,1080 Z" fill="#0f1528" />
        <path d="M602,1026 L544,1220 L580,1240 L634,1080 Z" fill="#0f1528" />
        <path d="M600,1150 L640,1150 L636,1162 L604,1162 Z" fill={GOLD} />
        <circle cx={540} cy={1270} r={7} fill="#0a0e1c" />
      </g>

      <Head pose={{ ...pose, tilt: pose.tilt }} />

      <Arm shoulder={SHOULDER_R} upper={pose.rUpper} fore={pose.rFore} shrug={pose.shrug} side="r" pose={pose} />
      <Arm shoulder={SHOULDER_L} upper={pose.lUpper} fore={pose.lFore} shrug={pose.shrug} side="l" pose={pose} />
    </g>
  );
};
