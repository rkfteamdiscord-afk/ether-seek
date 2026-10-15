import { cn } from "@/lib/utils";
import type { Country } from "../types";

const TINTS: Record<string, [string, string]> = {
  Europe: ["#1d3a66", "#2f5a8f"],
  "Latin America": ["#1d5a52", "#2e7a6c"],
  "Middle East": ["#7a5a1f", "#a3782b"],
};

/** Country tile: the admin-provided photo when there is one, otherwise a calm illustrated card. */
export function CountryVisual({ country, className }: { country: Country; className?: string }) {
  if (country.imageUrl) {
    return (
      <img
        src={country.imageUrl}
        alt={country.imageAlt ?? ""}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  const [from, to] = TINTS[country.region] ?? ["#12284b", "#1d3a66"];
  const code = country.id.toUpperCase();
  return (
    <div
      aria-hidden
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <svg
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-3/4 w-full opacity-30"
      >
        <path d="M0 80 Q40 60 80 72 T160 66 T200 70 V100 H0Z" fill="#eadfcb" />
        <g fill="#ffffff">
          <rect x="20" y="52" width="10" height="30" />
          <rect x="34" y="40" width="12" height="42" />
          <rect x="50" y="58" width="8" height="24" />
          <rect x="120" y="46" width="12" height="36" />
          <rect x="136" y="34" width="9" height="48" />
          <rect x="149" y="56" width="14" height="26" />
        </g>
        <circle cx="170" cy="24" r="9" fill="#eadfcb" />
      </svg>
      <span className="absolute left-4 top-3 font-[family-name:var(--font-ay-head)] text-3xl font-semibold tracking-wider text-white/90">
        {code}
      </span>
    </div>
  );
}
