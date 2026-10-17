import { Link } from "@tanstack/react-router";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Country } from "../types";
import { CountryVisual } from "./CountryVisual";
import { buttonClass } from "./ui";

/**
 * Full-bleed, film-like hero: destination photographs cross-fade every few seconds while the
 * camera slowly pushes in (Ken Burns). Photos come from the admin's photo URL for each country,
 * else from /abroadyield/photos/<slug>.jpg; until a photo exists, the illustrated scene is used.
 *
 * Accessibility: auto-advancing content has a visible pause control (WCAG 2.2.2), pauses while
 * it has keyboard focus and when off-screen, and keeps advancing with reduced motion but with a
 * plain cross-fade and no camera movement.
 */

export interface Slide {
  country: Country;
  place: string;
  photo: string;
  alt: string;
  /** Says what the photo shows when it is not the city the figures are for. */
  photoCaption: string;
  gross: number;
  afterTax: number;
}

const DURATION = 3800;

export function CinematicHero({
  slides,
  children,
  onStart,
}: {
  slides: Slide[];
  children: ReactNode;
  onStart?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const root = useRef<HTMLElement>(null);
  const running = !paused && !focused && visible && slides.length > 1;

  // A photo that failed before hydration never reaches onError: catch it here so its frame shows
  // the illustrated scene instead of an empty one.
  useEffect(() => {
    const broken: Record<string, boolean> = {};
    root.current?.querySelectorAll<HTMLImageElement>("img[data-photo]").forEach((img) => {
      if (img.complete && img.naturalWidth === 0) broken[img.dataset["photo"] ?? ""] = true;
    });
    if (Object.keys(broken).length) setFailed((f) => ({ ...f, ...broken }));
  }, []);
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), DURATION);
    return () => window.clearTimeout(id);
  }, [running, index, slides.length]);

  const current = slides[index];

  return (
    <section
      ref={root}
      className="ay-cinema ay-under-nav relative isolate overflow-hidden"
      data-nav-tone="dark"
      aria-roledescription="carousel"
      aria-label="Destinations"
      onFocusCapture={(e) => e.target.matches(":focus-visible") && setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      {/* Film frames */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.country.id}
              className={cn(
                "ay-frame",
                active && "ay-frame-active",
                i % 2 ? "ay-kb-left" : "ay-kb-right",
              )}
              data-running={running}
            >
              {failed[slide.photo] ? (
                <CountryVisual country={slide.country} className="ay-frame-media" illustrated />
              ) : (
                <img
                  src={slide.photo}
                  data-photo={slide.photo}
                  alt=""
                  className="ay-frame-media"
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "low"}
                  loading={i === 0 ? "eager" : "lazy"}
                  onError={() => setFailed((f) => ({ ...f, [slide.photo]: true }))}
                />
              )}
            </div>
          );
        })}
        <div className="ay-cinema-scrim" />
        <div className="ay-hero-grain" />
      </div>

      <div className="mx-auto flex min-h-[min(86vh,820px)] w-full max-w-6xl flex-col justify-end px-4 pt-28 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl">{children}</div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/abroadyield/start"
            className={buttonClass("sand", "ay-shine px-7 text-lg")}
            onClick={onStart}
          >
            Get my free ranking <ArrowRight aria-hidden className="size-5" />
          </Link>
          <a
            href="#example"
            className="ay-btn inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-2.5 text-lg font-semibold text-white backdrop-blur-md hover:bg-white/15"
          >
            See the numbers
          </a>
        </div>

        {/* Caption + chapter bar */}
        {current ? (
          <div className="mt-10 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <p aria-live={running ? "off" : "polite"} className="text-white/85">
              <span className="font-[family-name:var(--font-ay-head)] text-2xl font-semibold tracking-tight text-white">
                {current.place}
              </span>
              <span className="mx-3 text-white/40">·</span>
              advertised <strong className="text-white">{(current.gross * 100).toFixed(1)}%</strong>
              <span className="mx-2 text-white/50">→</span>
              you keep about{" "}
              <strong className="text-ay-sand-2">{(current.afterTax * 100).toFixed(1)}%</strong>
              <span className="block text-sm text-white/55">
                Example after costs, local and US taxes. Sample data – to be verified.
                {current.photoCaption && !failed[current.photo] ? ` ${current.photoCaption}.` : ""}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <ol className="flex gap-1.5" aria-label="Choose a destination">
                {slides.map((slide, i) => (
                  <li key={slide.country.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-current={i === index}
                      aria-label={`Show ${slide.place}`}
                      className="group flex h-11 w-9 items-center sm:w-12"
                    >
                      <span className="ay-chapter relative block h-[3px] w-full overflow-hidden rounded-full bg-white/25">
                        <span
                          className={cn(
                            "ay-chapter-fill absolute inset-0 origin-left rounded-full bg-white",
                            i < index && "ay-chapter-done",
                            i === index && "ay-chapter-now",
                          )}
                          data-running={running}
                          style={{ animationDuration: `${DURATION}ms` }}
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              {slides.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                  className="ay-btn inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md"
                >
                  {paused ? (
                    <Play aria-hidden className="size-4" />
                  ) : (
                    <Pause aria-hidden className="size-4" />
                  )}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
