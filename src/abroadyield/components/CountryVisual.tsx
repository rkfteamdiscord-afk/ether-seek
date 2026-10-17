import { useState } from "react";
import { cn } from "@/lib/utils";
import { bundledPhoto } from "../lib/photos";
import type { Country } from "../types";

/**
 * Country tile: the admin-provided photo, else the bundled destination photo, else (when the
 * photo cannot load) an editorial illustration
 * in the brand's champagne line art — arches and tiled roofs for Europe, palms and a sun for
 * Latin America, a skyline for the Gulf.
 */
const THEMES: Record<string, { from: string; to: string; art: "europe" | "latam" | "gulf" }> = {
  Europe: { from: "#14284a", to: "#2b4f7e", art: "europe" },
  "Latin America": { from: "#123a37", to: "#2a6a5f", art: "latam" },
  "Middle East": { from: "#3b2a12", to: "#8a6224", art: "gulf" },
};

export function CountryVisual({
  country,
  className,
  illustrated = false,
}: {
  country: Country;
  className?: string;
  /** Skip photos (used where a photo has already failed). */
  illustrated?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const photo = country.imageUrl
    ? { src: country.imageUrl, alt: country.imageAlt ?? "" }
    : (() => {
        const p = bundledPhoto(country.id);
        return p ? { src: p.src, alt: p.shows } : undefined;
      })();
  if (photo && !failed && !illustrated) {
    return (
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        ref={(img) => {
          // A photo that failed before hydration never fires onError.
          if (img?.complete && img.naturalWidth === 0) setFailed(true);
        }}
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  const theme = THEMES[country.region] ?? THEMES["Europe"]!;
  return (
    <div
      aria-hidden
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 120% at 85% 0%, ${theme.to} 0%, ${theme.from} 70%)`,
      }}
    >
      <svg
        viewBox="0 0 320 140"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <circle cx="262" cy="34" r="16" fill="#e6d6b8" opacity="0.85" />
        <circle cx="262" cy="34" r="26" stroke="#e6d6b8" opacity="0.25" />
        <g stroke="#e6d6b8" strokeWidth="1.1" opacity="0.7">
          {theme.art === "europe" ? (
            <>
              {[20, 70, 120, 170].map((x, i) => (
                <path key={x} d={`M${x},140 V${96 - (i % 2) * 10} a20,20 0 0 1 40,0 V140`} />
              ))}
              <path d="M210,140 V92 L240,70 L270,92 V140" />
              <path d="M236,140 v-22 h10 v22" />
            </>
          ) : theme.art === "latam" ? (
            <>
              {[40, 110, 190].map((x, i) => (
                <g key={x}>
                  <path
                    d={`M${x},140 C${x + 4},${110 - i * 6} ${x + 2},${90 - i * 6} ${x + 8},${74 - i * 6}`}
                  />
                  <path
                    d={`M${x + 8},${74 - i * 6} c-18,-2 -26,6 -30,12 M${x + 8},${74 - i * 6} c16,-6 26,0 32,6 M${x + 8},${74 - i * 6} c-6,-14 -18,-18 -26,-16 M${x + 8},${74 - i * 6} c8,-12 20,-14 28,-10`}
                  />
                </g>
              ))}
              <path d="M0,126 C60,118 120,132 180,124 S280,118 320,124" opacity="0.6" />
            </>
          ) : (
            <>
              <path d="M30,140 V96 h18 V140 M58,140 V70 h14 V140 M82,140 V104 h20 V140" />
              <path d="M128,140 V40 l8,-18 l8,18 V140" />
              <path d="M160,140 V82 h22 V140 M192,140 V60 q10,-14 20,0 V140 M222,140 V98 h26 V140" />
            </>
          )}
        </g>
        <path d="M0,139.5 H320" stroke="#e6d6b8" opacity="0.4" />
      </svg>
      <span className="absolute top-3 left-4 font-[family-name:var(--font-ay-head)] text-xl font-semibold tracking-tight text-white/90">
        {country.id === "ae" ? "Dubai" : country.name.replace(/\s*\(.*\)$/, "")}
      </span>
    </div>
  );
}
