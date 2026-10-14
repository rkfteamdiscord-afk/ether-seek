import React from "react";
import { random } from "remotion";

// Elevated three-quarter view of the superyacht cruising on a turquoise sea.
// World coordinates match a 1080 x 1920 frame at zoom 1.

const Wake: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {new Array(14).fill(0).map((_, i) => {
      const age = ((frame + i * 6) % 84) / 84;
      const x = 150 - age * 900;
      const spread = 20 + age * 160;
      return (
        <g key={i} opacity={(1 - age) * 0.75}>
          <ellipse cx={x} cy={1240 + age * 40 - spread * 0.25} rx={60 + age * 120} ry={6 + age * 6} fill="#f4ffff" />
          <ellipse cx={x} cy={1240 + age * 40 + spread * 0.35} rx={60 + age * 120} ry={6 + age * 6} fill="#f4ffff" />
        </g>
      );
    })}
    <path d="M150,1220 L-600,1150 L-600,1380 L150,1262 Z" fill="#bff3f1" opacity={0.35} />
  </g>
);

export const YachtDefs: React.FC = () => (
  <>
    <linearGradient id="worldSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2c86cf" />
      <stop offset="100%" stopColor="#bfe6f6" />
    </linearGradient>
    <linearGradient id="worldSea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#1a7fa8" />
      <stop offset="35%" stopColor="#13a7b8" />
      <stop offset="100%" stopColor="#0b6f8c" />
    </linearGradient>
    <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#cfd6dc" />
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#0e1a2a" />
      <stop offset="50%" stopColor="#3d5c78" />
      <stop offset="100%" stopColor="#0e1a2a" />
    </linearGradient>
  </>
);

export const YachtWorld: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={-3000} y={-3000} width={7080} height={3520} fill="url(#worldSky)" />
    <circle cx={900} cy={180} r={300} fill="url(#sunGlow)" />
    <circle cx={900} cy={180} r={70} fill="#fffbe9" />
    <rect x={-3000} y={520} width={7080} height={5000} fill="url(#worldSea)" />
    <path d="M-100,522 Q120,470 300,515 Q380,490 460,522 Z" fill="#5f93ab" opacity={0.55} />
    {/* sun path glitter on the water */}
    {new Array(60).fill(0).map((_, i) => {
      const y = 540 + random(`gy${i}`) * 900;
      const x = 900 + (random(`gx${i}`) - 0.5) * (80 + (y - 520) * 0.7);
      const tw = 0.5 + 0.5 * Math.sin(frame / 3 + i * 2.3);
      return <ellipse key={i} cx={x} cy={y} rx={4 + (y - 520) / 30} ry={1.5} fill="#ffffff" opacity={tw * 0.8} />;
    })}
    {/* rolling swell drifting past */}
    {new Array(40).fill(0).map((_, i) => {
      const y = 560 + random(`wy${i}`) * 1500;
      const x = (((random(`wx${i}`) * 1700 - frame * (1 + (y - 520) / 300)) % 1700) + 1700) % 1700 - 300;
      return <path key={i} d={`M${x},${y} q20,-4 40,0 t40,0`} stroke="#d8fbff" strokeWidth={1 + (y - 520) / 500} fill="none" opacity={0.45} />;
    })}

    <Wake frame={frame} />
    {/* shadow of the hull on the water */}
    <path d="M140,1250 L980,1205 L1040,1230 L180,1290 Z" fill="#064a5e" opacity={0.45} />

    {/* hull */}
    <path d="M120,1110 L960,1062 Q1010,1058 1036,1064 L978,1206 L140,1248 Z" fill="url(#hull)" />
    <path d="M128,1150 L990,1100" stroke="#1d2b4f" strokeWidth={6} />
    <path d="M150,1178 L520,1160 M600,1156 L940,1138" stroke="url(#glass)" strokeWidth={10} strokeLinecap="round" />
    <path d="M140,1248 L978,1206" stroke="#1d2b4f" strokeWidth={8} />
    {/* bow spray */}
    {new Array(8).fill(0).map((_, i) => {
      const a = ((frame * 2 + i * 11) % 30) / 30;
      return <circle key={i} cx={1000 + a * 40} cy={1200 - a * 30 + i * 2} r={4 + a * 6} fill="#ffffff" opacity={1 - a} />;
    })}

    {/* main deck, seen from above */}
    <path d="M120,1110 L960,1062 L905,1032 L176,1066 Z" fill="#b07d4f" />
    {/* aft infinity pool */}
    <path d="M262,1082 L392,1075 L382,1061 L266,1067 Z" fill="#45dbe0" />
    <path d="M262,1082 L392,1075" stroke="#ffffff" strokeWidth={1.5} />

    {/* superstructure tiers */}
    <path d="M420,1072 L900,1047 L870,990 L450,1010 Z" fill="url(#hull)" />
    <path d="M452,1036 L880,1016" stroke="url(#glass)" strokeWidth={16} />
    <path d="M488,1012 L830,996 L805,950 L515,962 Z" fill="#f7f9fb" />
    <path d="M520,984 L808,972" stroke="url(#glass)" strokeWidth={12} />
    <path d="M560,962 L760,953 L740,920 L580,926 Z" fill="#ffffff" />
    <path d="M590,940 L742,934" stroke="url(#glass)" strokeWidth={8} />
    {/* radar arch and mast */}
    <path d="M630,926 Q660,880 700,922" stroke="#e9edf1" strokeWidth={8} fill="none" />
    <path d="M665,900 L665,860" stroke="#e9edf1" strokeWidth={4} />
    <circle cx={665} cy={856} r={6} fill="#ffffff" />
    {/* sun-deck loungers and tender */}
    <path d="M880,1056 L940,1053 L930,1046 L874,1049 Z" fill="#ffffff" />
    <ellipse cx={330} cy={1095} rx={18} ry={4} fill="#ffffff" opacity={0.6} />
  </g>
);
