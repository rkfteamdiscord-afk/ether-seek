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

// A schematic strip (not to scale): the US on the left, destinations spread west to east.
const ORIGIN = { x: 70, y: 92, label: "United States" };
const DESTINATIONS = [
  { x: 190, y: 150, label: "Mexico" },
  { x: 285, y: 172, label: "Costa Rica" },
  { x: 545, y: 104, label: "Portugal" },
  { x: 625, y: 128, label: "Spain" },
  { x: 705, y: 100, label: "Italy" },
  { x: 785, y: 136, label: "Greece" },
  { x: 920, y: 158, label: "Dubai" },
];

/** Decorative band for the hero: flight arcs from the US to each destination, drawn in on load. */
export function RouteMap({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1000 210" className={cn("ay-route-map", className)}>
      <defs>
        <pattern id="ay-dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.2" />
        </pattern>
        <linearGradient id="ay-arc" x1="0" x2="1">
          <stop offset="0" stopColor="#eadfcb" stopOpacity="0.2" />
          <stop offset="1" stopColor="#eadfcb" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="ay-fade" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.12" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.88" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="ay-fade-mask">
          <rect width="1000" height="210" fill="url(#ay-fade)" />
        </mask>
      </defs>
      <rect width="1000" height="210" fill="url(#ay-dots)" mask="url(#ay-fade-mask)" />
      {DESTINATIONS.map((d, i) => {
        const mx = (ORIGIN.x + d.x) / 2;
        const lift = Math.min(86, 24 + Math.abs(d.x - ORIGIN.x) * 0.075);
        const my = Math.min(ORIGIN.y, d.y) - lift;
        return (
          <g key={d.label} style={{ "--i": i } as CSSProperties}>
            <path
              className="ay-arc"
              d={`M${ORIGIN.x},${ORIGIN.y} Q${mx},${my} ${d.x},${d.y}`}
              fill="none"
              stroke="url(#ay-arc)"
              strokeWidth="1.6"
              pathLength={1}
            />
            <circle className="ay-dest" cx={d.x} cy={d.y} r="4" fill="#eadfcb" />
            <circle
              className="ay-dest-ring"
              cx={d.x}
              cy={d.y}
              r="4"
              fill="none"
              stroke="#eadfcb"
              strokeWidth="1"
            />
            <text
              className="ay-dest"
              x={d.x}
              y={d.y + 22}
              textAnchor="middle"
              fill="#eadfcb"
              fontSize="14"
              fontWeight="600"
            >
              {d.label}
            </text>
          </g>
        );
      })}
      <circle cx={ORIGIN.x} cy={ORIGIN.y} r="6" fill="#ffffff" />
      <circle
        className="ay-dest-ring"
        cx={ORIGIN.x}
        cy={ORIGIN.y}
        r="6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1"
      />
      <text
        x={ORIGIN.x}
        y={ORIGIN.y + 26}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="14"
        fontWeight="600"
      >
        {ORIGIN.label}
      </text>
    </svg>
  );
}

/**
 * Decorative spotlight that follows a fine pointer through a critically damped spring
 * (Apple: damping 1.0, response ≈ 0.4s). It starts from the current on-screen position, so it
 * can be redirected at any moment, and it writes only to its own element's style.
 */
export function Spotlight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || prefersReducedMotion()) return;
    if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;
    const response = 0.4;
    const omega = (2 * Math.PI) / response;
    const pos = { x: host.clientWidth * 0.7, y: host.clientHeight * 0.3 };
    const vel = { x: 0, y: 0 };
    const target = { ...pos };
    let frame = 0;
    let last = 0;
    const step = (now: number) => {
      const dt = Math.min(0.032, last ? (now - last) / 1000 : 0.016);
      last = now;
      for (const axis of ["x", "y"] as const) {
        // x'' = −ω²(x − target) − 2ω·x'  (critically damped: no overshoot)
        const acc = -omega * omega * (pos[axis] - target[axis]) - 2 * omega * vel[axis];
        vel[axis] += acc * dt;
        pos[axis] += vel[axis] * dt;
      }
      el.style.setProperty("--x", `${pos.x}px`);
      el.style.setProperty("--y", `${pos.y}px`);
      const settled =
        Math.abs(pos.x - target.x) + Math.abs(pos.y - target.y) < 0.5 &&
        Math.abs(vel.x) + Math.abs(vel.y) < 0.5;
      frame = settled ? 0 : requestAnimationFrame(step);
      if (settled) last = 0;
    };
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(step);
    };
    host.addEventListener("pointermove", onMove);
    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={ref} aria-hidden className={cn("ay-spotlight", className)} />;
}
