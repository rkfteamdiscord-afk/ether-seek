import { cn } from "@/lib/utils";

/** Horseshoe with a sprig of leaves: the EquiMarge mark. */
export function LogoMark({ className }: { className?: string | undefined }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="var(--primary)" />
      <path
        d="M12 28.5V19a8 8 0 0 1 16 0v9.5"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g fill="var(--primary)">
        <circle cx="12" cy="20" r="0.9" />
        <circle cx="12.6" cy="24.5" r="0.9" />
        <circle cx="28" cy="20" r="0.9" />
        <circle cx="27.4" cy="24.5" r="0.9" />
        <circle cx="20" cy="11" r="0.9" />
      </g>
      <path d="M20 30c0-3 1.2-5.6 4.4-6.8C24.4 26.6 22.6 29.4 20 30Z" fill="oklch(0.82 0.08 80)" />
      <path d="M20 30c0-2.4-1-4.4-3.4-5.4.1 2.6 1.2 4.6 3.4 5.4Z" fill="oklch(0.82 0.08 80)" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="font-serif-em text-xl font-semibold tracking-tight text-foreground">
          Equi<span className="text-primary">Marge</span>
        </span>
      )}
    </span>
  );
}

const HORSE_PATH =
  "M16 64C16.8 61.2 19.0 58.0 22 54C25.0 50.0 30.0 44.3 34 40C38.0 35.7 43.0 31.3 46 28C49.0 24.7 50.8 22.7 52 20C53.2 17.3 52.2 12.2 53 12C53.8 11.8 55.8 18.8 57 19C58.2 19.2 59.2 12.5 60 13C60.8 13.5 60.0 18.5 62 22C64.0 25.5 68.3 29.7 72 34C75.7 38.3 79.7 44.0 84 48C88.3 52.0 91.7 55.7 98 58C104.3 60.3 114.0 61.7 122 62C130.0 62.3 139.3 59.7 146 60C152.7 60.3 158.0 62.0 162 64C166.0 66.0 167.5 69.3 170 72C172.5 74.7 175.2 75.3 177 80C178.8 84.7 180.7 93.0 181 100C181.3 107.0 180.2 118.5 179 122C177.8 125.5 174.8 124.7 174 121C173.2 117.3 174.7 105.8 174 100C173.3 94.2 170.5 86.3 170 86C169.5 85.7 171.3 94.0 171 98C170.7 102.0 168.8 105.0 168 110C167.2 115.0 166.3 122.0 166 128C165.7 134.0 165.8 142.2 166 146C166.0 146.0 167.0 151.0 167 151C167.0 151.0 157.0 151.0 157 151C157.0 151.0 158.0 146.0 158 146C158.2 142.2 158.3 133.0 158 128C157.7 123.0 156.7 116.7 156 116C155.3 115.3 154.7 119.0 154 124C153.3 129.0 152.2 141.5 152 146C152.0 146.0 153.0 151.0 153 151C153.0 151.0 143.0 151.0 143 151C143.0 151.0 144.0 146.0 144 146C144.3 141.5 145.0 130.0 145 124C145.0 118.0 146.5 112.7 144 110C141.5 107.3 135.7 108.3 130 108C124.3 107.7 116.0 108.3 110 108C104.0 107.7 97.2 103.3 94 106C90.8 108.7 91.7 117.3 91 124C90.3 130.7 90.0 141.5 90 146C90.0 146.0 91.0 151.0 91 151C91.0 151.0 81.0 151.0 81 151C81.0 151.0 82.0 146.0 82 146C82.3 141.5 83.0 130.0 83 124C83.0 118.0 82.5 110.0 82 110C81.5 110.0 80.8 118.0 80 124C79.2 130.0 77.3 141.5 77 146C77.0 146.0 78.0 151.0 78 151C78.0 151.0 68.0 151.0 68 151C68.0 151.0 70.0 146.0 70 146C70.7 141.5 72.0 131.7 72 124C72.0 116.3 71.3 106.0 70 100C68.7 94.0 66.3 92.3 64 88C61.7 83.7 59.0 78.0 56 74C53.0 70.0 49.7 65.3 46 64C42.3 62.7 37.7 64.7 34 66C30.3 67.3 26.8 71.2 24 72C21.2 72.8 18.3 72.3 17 71C15.7 69.7 15.2 66.8 16 64Z";

/** Standing horse in profile, facing left. Uses currentColor. */
export function HorseSilhouette({ className }: { className?: string | undefined }) {
  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden="true">
      <path fill="currentColor" d={HORSE_PATH} />
    </svg>
  );
}

/** Calm stable scene for the landing hero: hills, barn, fence and a horse. */
export function StableScene({ className }: { className?: string | undefined }) {
  return (
    <svg
      viewBox="0 0 640 440"
      className={className}
      role="img"
      aria-label="Illustration : une écurie au milieu des prés, un cheval derrière la clôture"
    >
      <defs>
        <linearGradient id="em-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.95 0.03 85)" />
          <stop offset="1" stopColor="oklch(0.92 0.04 75)" />
        </linearGradient>
        <linearGradient id="em-hill-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.8 0.05 135)" />
          <stop offset="1" stopColor="oklch(0.74 0.055 135)" />
        </linearGradient>
        <linearGradient id="em-hill-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.66 0.07 138)" />
          <stop offset="1" stopColor="oklch(0.56 0.07 140)" />
        </linearGradient>
      </defs>
      <rect width="640" height="440" rx="28" fill="url(#em-sky)" />
      <circle cx="500" cy="110" r="46" fill="oklch(0.9 0.08 85)" />
      <circle cx="500" cy="110" r="70" fill="oklch(0.9 0.08 85)" opacity="0.25" />
      <path
        d="M0 250c80-40 170-58 260-40s170 10 240-22 110-18 140 0v252H0Z"
        fill="url(#em-hill-back)"
      />
      {/* Trees */}
      <g fill="oklch(0.55 0.06 140)">
        <circle cx="80" cy="214" r="30" />
        <circle cx="108" cy="224" r="22" />
        <circle cx="590" cy="200" r="26" />
      </g>
      <g fill="oklch(0.45 0.05 60)">
        <rect x="77" y="236" width="6" height="22" rx="2" />
        <rect x="587" y="220" width="6" height="20" rx="2" />
      </g>
      {/* Barn */}
      <g>
        <rect x="330" y="186" width="190" height="96" fill="oklch(0.86 0.05 70)" />
        <path d="M318 192 425 128l107 64Z" fill="oklch(0.55 0.09 50)" />
        <rect x="402" y="214" width="46" height="68" rx="4" fill="oklch(0.5 0.07 55)" />
        <path d="M402 214 448 282M448 214 402 282" stroke="oklch(0.86 0.05 70)" strokeWidth="3" />
        <rect x="350" y="206" width="30" height="24" rx="3" fill="oklch(0.42 0.05 60)" />
        <rect x="470" y="206" width="30" height="24" rx="3" fill="oklch(0.42 0.05 60)" />
        <circle cx="425" cy="166" r="11" fill="oklch(0.96 0.02 85)" />
      </g>
      <path d="M0 300c90-30 200-36 320-18s220 20 320-8v166H0Z" fill="url(#em-hill-front)" />
      {/* Horse */}
      <path d={HORSE_PATH} transform="translate(118 232) scale(0.95)" fill="oklch(0.42 0.06 55)" />
      {/* Fence */}
      <g stroke="oklch(0.95 0.02 85)" strokeWidth="7" strokeLinecap="round">
        <path d="M30 352h580M30 386h580" />
        <path d="M60 336v80M190 336v80M320 336v80M450 336v80M580 336v80" />
      </g>
      {/* Hay bales */}
      <g>
        <rect x="520" y="300" width="64" height="40" rx="8" fill="oklch(0.84 0.1 85)" />
        <path d="M530 310h44M530 320h44M530 330h44" stroke="oklch(0.74 0.1 80)" strokeWidth="2" />
      </g>
    </svg>
  );
}
