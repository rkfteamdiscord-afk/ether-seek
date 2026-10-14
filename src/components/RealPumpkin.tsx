/**
 * Photo-like pumpkins drawn in SVG: ribbed lobes each shaded on their own, a fibrous
 * skin texture, soft key light and specular highlight, a ground shadow, a twisted
 * stem and, for jack-o'-lanterns, a carved face lit from inside by a flickering flame.
 * Decorative only. Mount <PumpkinDefs /> once per page; every pumpkin shares it.
 */
type Skin = "orange" | "deep" | "ghost";

const lobes = [-3, 3, -2, 2, -1, 1, 0].map((k) => ({
  cx: 100 + k * 21,
  rx: 33 - Math.abs(k) * 3.2,
  ry: 56 - Math.abs(k) * 4.5,
  k,
}));

const skins: Record<Skin, [string, string, string]> = {
  orange: ["oklch(0.83 0.16 62)", "oklch(0.7 0.19 48)", "oklch(0.42 0.13 38)"],
  deep: ["oklch(0.74 0.18 45)", "oklch(0.58 0.19 35)", "oklch(0.33 0.11 30)"],
  ghost: ["oklch(0.97 0.02 90)", "oklch(0.88 0.03 85)", "oklch(0.62 0.04 75)"],
};

export function PumpkinDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {(Object.keys(skins) as Skin[]).map((skin) => (
          <radialGradient key={skin} id={`pk-lobe-${skin}`} cx="46%" cy="42%" r="62%">
            <stop offset="0" stopColor={skins[skin][0]} />
            <stop offset=".6" stopColor={skins[skin][1]} />
            <stop offset=".9" stopColor={skins[skin][2]} stopOpacity=".85" />
            <stop offset="1" stopColor={skins[skin][2]} />
          </radialGradient>
        ))}
        <linearGradient id="pk-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity=".28" />
          <stop offset=".45" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity=".45" />
        </linearGradient>
        <linearGradient id="pk-stem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="oklch(0.35 0.05 110)" />
          <stop offset=".4" stopColor="oklch(0.55 0.08 115)" />
          <stop offset=".7" stopColor="oklch(0.42 0.07 105)" />
          <stop offset="1" stopColor="oklch(0.26 0.04 90)" />
        </linearGradient>
        <radialGradient id="pk-fire" cx="50%" cy="60%" r="65%">
          <stop offset="0" stopColor="oklch(0.99 0.06 100)" />
          <stop offset=".35" stopColor="oklch(0.9 0.16 85)" />
          <stop offset=".7" stopColor="oklch(0.72 0.2 50)" />
          <stop offset="1" stopColor="oklch(0.5 0.19 35)" />
        </radialGradient>
        <clipPath id="pk-body">
          {lobes.map(({ cx, rx, ry, k }) => <ellipse key={k} cx={cx} cy="104" rx={rx} ry={ry} />)}
        </clipPath>
        {/* Soft creases, vertical skin fibres and yellowish mottling, like a real rind. */}
        <filter id="pk-skin" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.5 0.018" numOctaves="3" seed="7" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 .25  0 0 0 0 .1  0 0 0 0 0  0 0 0 .22 0" result="fibres" />
          <feComposite in="fibres" in2="soft" operator="in" result="maskedFibres" />
          <feBlend in="maskedFibres" in2="soft" mode="multiply" result="textured" />
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="21" result="blotch" />
          <feColorMatrix in="blotch" type="matrix" values="0 0 0 0 1  0 0 0 0 .86  0 0 0 0 .35  1.4 0 0 0 -.62" result="patches" />
          <feComposite in="patches" in2="soft" operator="in" result="maskedPatches" />
          <feBlend in="maskedPatches" in2="textured" mode="soft-light" />
        </filter>
        <radialGradient id="pk-dimple" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="oklch(0.25 0.08 35)" stopOpacity=".7" />
          <stop offset="1" stopColor="oklch(0.25 0.08 35)" stopOpacity="0" />
        </radialGradient>
        <filter id="pk-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="pk-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
    </svg>
  );
}

/** One pumpkin as an SVG group in a 200×170 box, so several can share one picture. */
export function PumpkinShape({ skin = "orange", carved = false, x = 0, y = 0, scale = 1, squat = 1 }: { skin?: Skin; carved?: boolean; x?: number; y?: number; scale?: number; squat?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="100" cy="160" rx="82" ry="9" fill="black" opacity=".45" filter="url(#pk-blur)" />
      <g transform={`translate(100 104) scale(1 ${squat}) translate(-100 -104)`}>
        <g clipPath="url(#pk-body)">
          <g filter="url(#pk-skin)">
            {lobes.map(({ cx, rx, ry, k }) => (
              <ellipse key={k} cx={cx} cy="104" rx={rx} ry={ry} fill={`url(#pk-lobe-${skin})`} />
            ))}
          </g>
          <rect x="20" y="44" width="160" height="120" fill="url(#pk-light)" />
          <ellipse cx="100" cy="54" rx="34" ry="14" fill="url(#pk-dimple)" />
          <ellipse cx="100" cy="158" rx="50" ry="10" fill="url(#pk-dimple)" />
          <ellipse cx="76" cy="80" rx="9" ry="22" fill="white" opacity=".26" filter="url(#pk-soft)" />
          <ellipse cx="122" cy="84" rx="5" ry="14" fill="white" opacity=".12" filter="url(#pk-soft)" />
        </g>
        {carved && (
          <g className="pk-face">
            <g fill="oklch(0.22 0.07 35)" transform="translate(2 3)">
              <path d="M60 86 76 66 88 90Z" /><path d="M140 86 124 66 112 90Z" /><path d="M94 104 100 94 106 104Z" />
              <path d="M54 116Q100 150 146 116L136 119 130 129 120 121 112 133 100 124 88 133 80 121 70 129 64 119Z" />
            </g>
            <g className="pk-fire" fill="url(#pk-fire)">
              <path d="M60 86 76 66 88 90Z" /><path d="M140 86 124 66 112 90Z" /><path d="M94 104 100 94 106 104Z" />
              <path d="M54 116Q100 150 146 116L136 119 130 129 120 121 112 133 100 124 88 133 80 121 70 129 64 119Z" />
            </g>
            <g className="pk-fire-glow" fill="oklch(0.85 0.18 70)" filter="url(#pk-blur)" opacity=".7">
              <path d="M60 86 76 66 88 90Z" /><path d="M140 86 124 66 112 90Z" />
              <path d="M54 116Q100 150 146 116L136 119 130 129 120 121 112 133 100 124 88 133 80 121 70 129 64 119Z" />
            </g>
          </g>
        )}
      </g>
      <path d="M95 52Q92 34 97 24Q103 14 113 12L116 17Q108 21 106 30Q104 40 107 52Z" fill="url(#pk-stem)" />
      <path d="M98 50Q96 36 100 26M103 51Q101 38 104 28" fill="none" stroke="oklch(0.25 0.04 100 / .6)" strokeWidth="1" />
      <ellipse cx="114.5" cy="14.5" rx="3" ry="2.2" fill="oklch(0.78 0.06 95)" />
    </g>
  );
}

/** A single pumpkin picture. */
export function RealPumpkin({ skin = "orange", carved = false, className = "" }: { skin?: Skin; carved?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 200 172" className={`real-pumpkin ${carved ? "is-carved" : ""} ${className}`} aria-hidden="true">
      <PumpkinShape skin={skin} carved={carved} squat={0.92} />
    </svg>
  );
}

/** Three pumpkins piled together: a big jack-o'-lantern between two smaller ones. */
export function PumpkinPatch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 190" className={`real-pumpkin pumpkin-patch is-carved ${className}`} aria-hidden="true">
      <PumpkinShape skin="deep" x={-14} y={70} scale={0.62} squat={0.85} />
      <PumpkinShape skin="ghost" carved x={176} y={78} scale={0.56} squat={0.9} />
      <PumpkinShape skin="orange" carved x={50} y={8} scale={1} squat={0.92} />
    </svg>
  );
}
