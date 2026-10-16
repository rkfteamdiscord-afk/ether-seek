import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Motion helpers. Rules (ui-ux-pro-max "Subtle" tier): short fades with an 8–16px rise,
 * deceleration easing, one or two focal animations per view, content fully visible without
 * JavaScript, and no motion at all when the visitor prefers reduced motion.
 */

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** True once the element has entered the viewport (immediately when motion is reduced). */
export function useInView<T extends Element>(options: { once?: boolean; margin?: string } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (options.once !== false) observer.disconnect();
        } else if (options.once === false) setInView(false);
      },
      { rootMargin: options.margin ?? "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.once, options.margin]);
  return { ref, inView };
}

/**
 * Fades its content up when it scrolls into view. Server-rendered HTML is visible; only
 * elements that start below the fold are hidden, after hydration, until they arrive.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "pending" | "shown">("idle");
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already visible: leave it alone
    setState("pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={cn(
        state === "pending" && "ay-reveal-pending",
        state === "shown" && "ay-revealed",
        className,
      )}
      style={{ "--ay-delay": `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Counts from 0 to `value` when visible (eased); renders the final value on the server and with reduced motion. */
export function CountUp({
  value,
  format,
  duration = 1100,
  className,
}: {
  value: number;
  format: (v: number) => string;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!inView || prefersReducedMotion()) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <span aria-hidden>{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}

// Approximate positions on a 1000×500 equirectangular canvas (x = (lon + 180) / 360, y = (90 − lat) / 180).
const ORIGIN = { x: 290, y: 138, label: "US" };
const DESTINATIONS = [
  { x: 474, y: 140, label: "Lisbon" },
  { x: 490, y: 136, label: "Madrid" },
  { x: 535, y: 133, label: "Rome" },
  { x: 565, y: 146, label: "Athens" },
  { x: 222, y: 196, label: "Mexico City" },
  { x: 265, y: 224, label: "San José" },
  { x: 653, y: 180, label: "Dubai" },
];

/** Decorative route map for the hero: flight arcs from the US to each destination. */
export function RouteMap({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="180 50 520 220"
      className={cn("ay-route-map", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="ay-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.22" />
        </pattern>
        <linearGradient id="ay-arc" x1="0" x2="1">
          <stop offset="0" stopColor="#eadfcb" stopOpacity="0.15" />
          <stop offset="1" stopColor="#eadfcb" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect x="180" y="50" width="520" height="220" fill="url(#ay-dots)" />
      {DESTINATIONS.map((d, i) => {
        const mx = (ORIGIN.x + d.x) / 2;
        const lift = Math.max(40, Math.abs(d.x - ORIGIN.x) * 0.35);
        const my = Math.min(ORIGIN.y, d.y) - lift;
        return (
          <g key={d.label} style={{ "--i": i } as CSSProperties}>
            <path
              className="ay-arc"
              d={`M${ORIGIN.x},${ORIGIN.y} Q${mx},${my} ${d.x},${d.y}`}
              fill="none"
              stroke="url(#ay-arc)"
              strokeWidth="1.4"
              pathLength={1}
            />
            <circle className="ay-dest" cx={d.x} cy={d.y} r="3.2" fill="#eadfcb" />
            <circle
              className="ay-dest-ring"
              cx={d.x}
              cy={d.y}
              r="3.2"
              fill="none"
              stroke="#eadfcb"
              strokeWidth="1"
            />
          </g>
        );
      })}
      <circle cx={ORIGIN.x} cy={ORIGIN.y} r="5" fill="#ffffff" />
      <circle
        className="ay-dest-ring"
        cx={ORIGIN.x}
        cy={ORIGIN.y}
        r="5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1"
      />
    </svg>
  );
}
