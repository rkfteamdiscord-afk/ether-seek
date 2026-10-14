/** Stone staircase climbing through the fog toward a glowing door. Decorative only. */
const STEPS = 16;

const steps = Array.from({ length: STEPS }, (_, i) => {
  const t = i / (STEPS - 1);
  const x = 400 + 120 * Math.sin(t * Math.PI * 1.15 - 0.35) * (1 - t * 0.45);
  const y = 690 - t * 470;
  const width = 340 * Math.pow(1 - t, 1.15) + 52;
  const depth = 20 * (1 - t) + 6;
  const rise = 24 * (1 - t) + 8;
  const round = (value: number) => Math.round(value * 10) / 10;
  return { t, x: round(x), y: round(y), width: round(width), depth: round(depth), rise: round(rise) };
});

const top = steps[STEPS - 1]!;
const door = { x: top.x, y: top.y - top.depth };

function points(list: Array<[number, number]>) {
  return list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

export function HalloweenStaircase() {
  return (
    <svg className="arrival-staircase" viewBox="0 0 800 720" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="stair-tread" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.62 0.03 290)" />
          <stop offset="1" stopColor="oklch(0.46 0.035 290)" />
        </linearGradient>
        <linearGradient id="stair-riser" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.34 0.04 292)" />
          <stop offset="1" stopColor="oklch(0.22 0.04 292)" />
        </linearGradient>
        <radialGradient id="stair-door-light" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="oklch(0.97 0.09 85)" />
          <stop offset=".45" stopColor="oklch(0.8 0.16 60)" />
          <stop offset="1" stopColor="oklch(0.55 0.18 40)" />
        </radialGradient>
        <radialGradient id="stair-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="oklch(0.85 0.15 65)" stopOpacity=".75" />
          <stop offset="1" stopColor="oklch(0.6 0.17 45)" stopOpacity="0" />
        </radialGradient>
        <filter id="stair-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>

      <g className="stair-rays">
        <polygon points={points([[door.x - 18, door.y - 50], [door.x + 18, door.y - 50], [door.x + 260, 720], [door.x - 260, 720]])} fill="url(#stair-halo)" opacity=".28" />
      </g>
      <circle cx={door.x} cy={door.y - 50} r="120" fill="url(#stair-halo)" className="stair-door-halo" />
      <path d={`M${door.x - 40} ${door.y}V${door.y - 78}Q${door.x - 40} ${door.y - 122} ${door.x} ${door.y - 124}Q${door.x + 40} ${door.y - 122} ${door.x + 40} ${door.y - 78}V${door.y}Z`} fill="oklch(0.25 0.04 292)" />
      <path className="stair-door" d={`M${door.x - 30} ${door.y}V${door.y - 76}Q${door.x - 30} ${door.y - 110} ${door.x} ${door.y - 112}Q${door.x + 30} ${door.y - 110} ${door.x + 30} ${door.y - 76}V${door.y}Z`} fill="url(#stair-door-light)" />

      {[...steps].reverse().map((step, index) => {
        const { x, y, width, depth, rise, t } = step;
        const half = width / 2;
        const back = width * 0.46;
        const candle = index % 3 === 1 && t < 0.9;
        const side = index % 2 === 0 ? -1 : 1;
        const cx = Math.round((x + side * (half - 14 * (1 - t) - 6)) * 10) / 10;
        const scale = Math.round((1 - t * 0.7) * 100) / 100;
        return (
          <g key={index} className="stair-step" style={{ opacity: Math.round((0.55 + (1 - t) * 0.45) * 100) / 100 }}>
            <polygon points={points([[x - half, y], [x + half, y], [x + back, y - depth], [x - back, y - depth]])} fill="url(#stair-tread)" />
            <rect x={x - half} y={y} width={width} height={rise} fill="url(#stair-riser)" />
            <path d={`M${(x - half).toFixed(1)} ${y.toFixed(1)}H${(x + half).toFixed(1)}`} stroke="oklch(0.78 0.03 290)" strokeWidth={1.2 * scale + 0.4} opacity=".55" />
            <path d={`M${(x - half * 0.4).toFixed(1)} ${(y + rise * 0.4).toFixed(1)}l${(8 * scale).toFixed(1)} ${(rise * 0.35).toFixed(1)}`} stroke="oklch(0.15 0.03 292)" strokeWidth="1" opacity=".5" />
            {candle && (
              <g className="stair-candle" style={{ animationDelay: `${(index * 0.37) % 1.4}s` }}>
                <ellipse cx={cx} cy={y - depth / 2 - 18 * scale} rx={12 * scale} ry={16 * scale} fill="oklch(0.8 0.17 60)" opacity=".55" filter="url(#stair-glow)" />
                <rect x={cx - 4 * scale} y={y - depth / 2 - 16 * scale} width={8 * scale} height={16 * scale} rx={1.5 * scale} fill="oklch(0.95 0.02 85)" />
                <path className="stair-flame" d={`M${cx} ${y - depth / 2 - 27 * scale}q${5 * scale} ${7 * scale} 0 ${10 * scale}q${-5 * scale} ${-3 * scale} 0 ${-10 * scale}Z`} fill="oklch(0.88 0.15 75)" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
