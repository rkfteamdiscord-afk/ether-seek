/** Zombies for the Halloween page. Decorative only: aria-hidden and never clickable. */

function ZombieSkin({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="35%" cy="30%" r="80%">
      <stop offset="0" stopColor="oklch(0.74 0.07 135)" />
      <stop offset=".55" stopColor="oklch(0.56 0.07 140)" />
      <stop offset="1" stopColor="oklch(0.34 0.05 150)" />
    </radialGradient>
  );
}

/** A rotting hand clawing its way out of a dirt mound, then sinking back. */
export function ZombieHand({ className = "" }: { className?: string }) {
  return (
    <div className={`zombie-hand ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 160">
        <defs>
          <ZombieSkin id="zh-skin" />
          <clipPath id="zh-ground"><rect x="0" y="0" width="120" height="138" /></clipPath>
        </defs>
        <g clipPath="url(#zh-ground)">
          <g className="zh-arm">
            <path d="M48 160 50 92Q49 80 52 70H70Q73 82 72 92L76 160Z" fill="url(#zh-skin)" />
            <path d="M44 160 46 118 52 126 56 114 62 124 68 112 74 124 80 116 80 160Z" fill="oklch(0.3 0.06 300)" />
            <path d="M58 100q4 6 1 12M64 84q-3 5 0 9" fill="none" stroke="oklch(0.3 0.05 150)" strokeWidth="1.4" />
            <ellipse cx="66" cy="96" rx="4" ry="6" fill="oklch(0.42 0.1 20 / .7)" />
            <path d="M47 72Q44 54 52 46H72Q80 54 76 72Z" fill="url(#zh-skin)" />
            <g className="zh-fingers" fill="url(#zh-skin)" stroke="oklch(0.28 0.04 150)" strokeWidth="1">
              <path d="M50 50 38 24Q36 18 41 18L54 44Z" />
              <path d="M56 46 52 12Q52 6 57 7L62 44Z" />
              <path d="M64 45 68 10Q70 4 74 7L71 46Z" />
              <path d="M71 49 84 22Q88 17 91 22L78 52Z" />
              <path d="M75 64 92 54Q97 52 96 57L79 70Z" />
              <path d="M52 8 56 7 57 13 53 14Z" fill="oklch(0.92 0.02 85)" />
              <path d="M38 19 41 17 43 22 40 23Z" fill="oklch(0.25 0.03 60)" />
              <path d="M69 8 73 7 73 12 70 12Z" fill="oklch(0.25 0.03 60)" />
            </g>
          </g>
        </g>
        <path d="M2 150Q20 128 44 134Q60 124 78 134Q100 126 118 150Z" fill="oklch(0.28 0.04 55)" />
        <path d="M14 142q6-6 12-2M84 136q8-4 14 2M50 132q5-3 9 0" fill="none" stroke="oklch(0.42 0.05 60)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="136" r="4" fill="oklch(0.34 0.04 55)" /><circle cx="92" cy="139" r="3" fill="oklch(0.34 0.04 55)" />
      </svg>
    </div>
  );
}

/** A shambling zombie that crosses the bottom of the screen now and then, deep in the fog. */
export function ZombieWalker() {
  return (
    <div className="zombie-walker" aria-hidden="true">
      <svg viewBox="0 0 130 230" className="zombie-walker-body">
        <defs><ZombieSkin id="zw-skin" /></defs>
        <g className="zw-leg zw-leg-b">
          <path d="M60 140 56 196 48 214H66L68 196 72 140Z" fill="oklch(0.25 0.05 260)" />
          <path d="M46 212H70V220H42Z" fill="oklch(0.18 0.02 60)" />
        </g>
        <g className="zw-arm zw-arm-back">
          <path d="M70 76 112 86 114 96 70 92Z" fill="oklch(0.3 0.06 300)" />
          <path d="M108 85 124 88Q128 92 124 95L110 96Z" fill="url(#zw-skin)" />
        </g>
        <path d="M44 72Q60 64 80 72L86 142 76 136 70 146 62 136 54 146 46 136 40 142Z" fill="oklch(0.3 0.06 300)" />
        <path d="M50 88 56 100M70 110 66 124M58 118l6-4" stroke="oklch(0.2 0.04 300)" strokeWidth="2" />
        <ellipse cx="64" cy="106" rx="5" ry="7" fill="oklch(0.45 0.12 20 / .6)" />
        <g className="zw-leg zw-leg-a">
          <path d="M50 140 46 196 38 214H56L58 196 62 140Z" fill="oklch(0.28 0.05 260)" />
          <path d="M36 212H60V220H32Z" fill="oklch(0.2 0.02 60)" />
          <path d="M50 170h8" stroke="oklch(0.2 0.04 260)" strokeWidth="2" />
        </g>
        <g className="zw-head">
          <path d="M44 44Q42 16 64 14Q86 16 84 44Q84 62 74 70H56Q44 62 44 44Z" fill="url(#zw-skin)" />
          <path d="M44 30Q48 12 62 12Q70 8 80 16Q74 16 72 22Q66 14 58 20Q50 18 44 30Z" fill="oklch(0.2 0.03 60)" />
          <ellipse cx="56" cy="40" rx="6" ry="7" fill="oklch(0.15 0.03 150)" />
          <ellipse cx="74" cy="40" rx="5" ry="6" fill="oklch(0.15 0.03 150)" />
          <circle className="zw-eye" cx="74" cy="40" r="2.4" fill="oklch(0.9 0.17 120)" />
          <circle cx="56" cy="41" r="1.4" fill="oklch(0.8 0.03 90)" />
          <path d="M56 58Q65 64 76 57" fill="none" stroke="oklch(0.18 0.03 150)" strokeWidth="2" />
          <path d="M58 57v4M63 59v4M68 59v4M73 57v4" stroke="oklch(0.85 0.02 85)" strokeWidth="1.4" />
          <path d="M80 26q4 4 2 9" stroke="oklch(0.42 0.1 20)" strokeWidth="2" fill="none" />
        </g>
        <g className="zw-arm zw-arm-front">
          <path d="M66 78 108 82 110 92 66 90Z" fill="oklch(0.33 0.06 300)" />
          <path d="M106 81 122 82Q128 86 123 90L108 92Z" fill="url(#zw-skin)" />
          <path d="M122 82 128 80M123 86l6 0M122 89l5 2" stroke="oklch(0.4 0.06 145)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
