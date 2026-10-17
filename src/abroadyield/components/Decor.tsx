import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative layers (all aria-hidden, pointer-events: none, static: they never move on their own).
 * Champagne line art evokes the destinations without stock photos: Mediterranean arches,
 * a compass rose and a horizon line.
 */

export function Arches({ className }: { className?: string }) {
  const arch = (x: number, w: number, h: number) =>
    `M${x},420 L${x},${420 - h + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w},${420 - h + w / 2} L${x + w},420`;
  return (
    <svg aria-hidden viewBox="0 0 860 420" className={cn("ay-arches", className)} fill="none">
      <g stroke="currentColor" strokeWidth="1.2">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={arch(40 + i * 160, 120, 300 - Math.abs(2 - i) * 34)} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={`in-${i}`}
            d={arch(58 + i * 160, 84, 262 - Math.abs(2 - i) * 34)}
            opacity="0.55"
          />
        ))}
        <path d="M0,420 H860" />
        <path d="M20,436 H840" opacity="0.4" />
      </g>
    </svg>
  );
}

export function Compass({ className, size = 220 }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="-110 -110 220 220"
      width={size}
      height={size}
      className={cn("ay-watermark", className)}
      fill="none"
    >
      <g stroke="currentColor" strokeWidth="1">
        <circle r="100" />
        <circle r="78" opacity="0.6" />
        <circle r="6" />
        {Array.from({ length: 32 }, (_, i) => {
          const a = (i * Math.PI) / 16;
          const r1 = i % 4 === 0 ? 84 : 92;
          // Rounded so server and browser render identical attributes (no hydration mismatch).
          const at = (r: number, f: (x: number) => number) => Math.round(f(a) * r * 100) / 100;
          return (
            <line
              key={i}
              x1={at(r1, Math.cos)}
              y1={at(r1, Math.sin)}
              x2={at(100, Math.cos)}
              y2={at(100, Math.sin)}
            />
          );
        })}
      </g>
      <g fill="currentColor">
        <path d="M0,-96 L9,-9 L0,0 L-9,-9Z" />
        <path d="M0,96 L9,9 L0,0 L-9,9Z" opacity="0.5" />
        <path d="M96,0 L9,9 L0,0 L9,-9Z" opacity="0.5" />
        <path d="M-96,0 L-9,9 L0,0 L-9,-9Z" opacity="0.5" />
      </g>
    </svg>
  );
}

/** The midnight hero's backdrop: two soft light pools, champagne arches and a horizon rule. */
export function HeroDecor() {
  return (
    <div aria-hidden className="ay-hero-deco">
      <span
        className="ay-orb"
        style={{ width: 520, height: 520, left: "-8%", top: "-18%", background: "#2f5a8f" }}
      />
      <span
        className="ay-orb"
        style={{ width: 460, height: 460, right: "-6%", top: "10%", background: "#8a6224" }}
      />
      <Arches />
      <Compass className="absolute top-24 left-[46%] hidden lg:block" size={180} />
      <span className="ay-horizon" />
    </div>
  );
}

/** Small ornamental label used above section titles. */
export function Ornament({ children }: { children: ReactNode }) {
  return <span className="ay-ornament">{children}</span>;
}
