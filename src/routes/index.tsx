import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "atmospherexplore — a room that answers to attention" },
      {
        name: "description",
        content:
          "Six faint signals in a dark room. Linger, and they open. No menu until you ask for one.",
      },
      { property: "og:title", content: "atmospherexplore" },
      {
        property: "og:description",
        content: "Six faint signals in a dark room. Linger, and they open.",
      },
    ],
  }),
  component: Atmosphere,
});

type Signal = {
  id: string;
  label: string;
  whisper: string;
  body: string;
  x: number;
  y: number;
  hue: string;
};

const SIGNALS: Signal[] = [
  {
    id: "i",
    label: "the long room",
    whisper: "it is longer at night",
    body: "Nothing is stored here. The room simply keeps the shape of whoever waited in it last, and lets it go by morning.",
    x: 22,
    y: 30,
    hue: "oklch(0.82 0.07 74 / 0.5)",
  },
  {
    id: "ii",
    label: "low tide, inland",
    whisper: "water where no water is",
    body: "Sound arrives before weather. If you hold still long enough, the floor reads like a shoreline and you are the thing left behind.",
    x: 68,
    y: 22,
    hue: "oklch(0.66 0.05 240 / 0.5)",
  },
  {
    id: "iii",
    label: "a borrowed lamp",
    whisper: "returned unlit",
    body: "Light is on loan here. Use it briefly, on one thing at a time, and expect the edges to stay unaccounted for.",
    x: 44,
    y: 56,
    hue: "oklch(0.84 0.06 82 / 0.5)",
  },
  {
    id: "iv",
    label: "unfinished corridor",
    whisper: "it ends politely",
    body: "There was a plan for this passage. What remains is the intention, thinned out — walkable, but only slowly.",
    x: 82,
    y: 62,
    hue: "oklch(0.6 0.04 300 / 0.45)",
  },
  {
    id: "v",
    label: "someone's weather",
    whisper: "not yours, still felt",
    body: "A climate left running in an empty room. Warm at the centre, cold at the wall, no explanation offered.",
    x: 14,
    y: 72,
    hue: "oklch(0.7 0.05 190 / 0.45)",
  },
  {
    id: "vi",
    label: "the quiet exit",
    whisper: "you may already be through it",
    body: "Every visit ends the same way: attention loosens, the grain settles, and the room continues without you.",
    x: 56,
    y: 86,
    hue: "oklch(0.8 0.05 40 / 0.45)",
  },
];

const NUMERALS = ["one", "two", "three", "four", "five", "six"];

function Atmosphere() {
  const [entered, setEntered] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [open, setOpen] = useState<Signal | null>(null);
  const [menu, setMenu] = useState(false);
  const [cursor, setCursor] = useState({ x: 50, y: 45 });
  const frame = useRef<number | null>(null);

  const reveal = useCallback((s: Signal) => {
    setOpen(s);
    setFound((prev) => (prev.includes(s.id) ? prev : [...prev, s.id]));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        setCursor({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMenu(false);
      }
      if (e.key === "/" || e.key === "m") setMenu((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const complete = found.length === SIGNALS.length;
  const counted = useMemo(
    () => (found.length === 0 ? "nothing yet" : `${NUMERALS[found.length - 1]} of six`),
    [found.length],
  );

  return (
    <main className="grain vignette relative min-h-screen overflow-hidden bg-background">
      {/* drifting pools of light */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="pool breathe h-[52vmax] w-[52vmax]"
          style={{
            left: "-12vmax",
            top: "-14vmax",
            background: "radial-gradient(circle, oklch(0.84 0.06 82 / 0.16), transparent 70%)",
          }}
        />
        <div
          className="pool breathe h-[46vmax] w-[46vmax]"
          style={{
            right: "-14vmax",
            bottom: "-10vmax",
            animationDelay: "5s",
            background: "radial-gradient(circle, oklch(0.6 0.06 250 / 0.15), transparent 70%)",
          }}
        />
        <div
          className="pool breathe h-[30vmax] w-[30vmax]"
          style={{
            left: "40%",
            top: "45%",
            animationDelay: "9s",
            background: "radial-gradient(circle, oklch(0.78 0.04 60 / 0.1), transparent 70%)",
          }}
        />
        {/* the light that follows attention */}
        <div
          className="hidden md:block"
          style={{
            position: "absolute",
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
            width: "38vmax",
            height: "38vmax",
            transform: "translate(-50%, -50%)",
            transition: "left 1.6s cubic-bezier(0.16,1,0.3,1), top 1.6s cubic-bezier(0.16,1,0.3,1)",
            background: "radial-gradient(circle, oklch(0.9 0.03 80 / 0.07), transparent 65%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* threshold */}
      <section
        aria-hidden={entered}
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center px-6 text-center transition-all duration-[2600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          entered
            ? "pointer-events-none opacity-0 blur-md"
            : "bg-background/70 opacity-100 backdrop-blur-xl"
        }`}
      >
        <h1 className="font-display text-[clamp(2rem,6vw,4.25rem)] font-light tracking-[0.22em] lowercase slow-rise text-foreground/90">
          atmospherexplore
        </h1>
        <p
          className="slow-rise mt-8 max-w-xs text-[0.7rem] leading-relaxed tracking-[0.28em] text-muted-foreground uppercase"
          style={{ animationDelay: "1.2s" }}
        >
          a dark room, kept warm
        </p>
        <button
          onClick={() => setEntered(true)}
          className="slow-rise mt-16 border-b border-border/70 pb-2 text-[0.68rem] tracking-[0.4em] text-foreground/60 uppercase transition-all duration-1000 hover:border-ember/70 hover:tracking-[0.55em] hover:text-ember"
          style={{ animationDelay: "2.4s" }}
        >
          step inside
        </button>
      </section>

      {/* the field of signals */}
      <div
        className={`relative z-10 min-h-screen transition-all duration-[3000ms] ${
          entered ? "opacity-100 blur-0" : "pointer-events-none opacity-0 blur-xl"
        }`}
      >
        <div className="relative mx-auto h-[190vh] w-full max-w-6xl md:h-screen">
          {SIGNALS.map((s, i) => {
            const seen = found.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => reveal(s)}
                onFocus={() => void 0}
                className="group absolute -translate-x-1/2 -translate-y-1/2 px-6 py-5 text-left"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                <span
                  className={`flicker block h-[5px] w-[5px] rounded-full transition-all duration-[1400ms] group-hover:h-2 group-hover:w-2 ${
                    seen ? "opacity-100" : ""
                  }`}
                  style={{
                    background: s.hue,
                    boxShadow: `0 0 18px 6px ${s.hue}`,
                    animationDelay: `${i * 700}ms`,
                  }}
                />
                <span className="pointer-events-none absolute top-full left-0 mt-3 block w-52 opacity-0 blur-sm transition-all delay-300 duration-[1600ms] group-hover:opacity-100 group-hover:blur-0 group-focus-visible:opacity-100 group-focus-visible:blur-0">
                  <span className="font-display block text-base lowercase italic text-foreground/85">
                    {s.label}
                  </span>
                  <span className="mt-1 block text-[0.6rem] tracking-[0.3em] text-muted-foreground uppercase">
                    {s.whisper}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* progressive discovery marker */}
        <p className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 text-[0.58rem] tracking-[0.42em] text-muted-foreground/70 uppercase transition-opacity duration-[2000ms]">
          {complete ? "the room is fully lit — briefly" : `noticed: ${counted}`}
        </p>
      </div>

      {/* hidden menu: edge-hover on desktop, small mark on touch */}
      <div
        onMouseEnter={() => setMenu(true)}
        onMouseLeave={() => setMenu(false)}
        className={`fixed top-0 right-0 z-30 flex h-full items-center transition-all duration-[1600ms] ${
          entered ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full w-14 items-center justify-end pr-5 md:w-24">
          <button
            aria-label="reveal the index"
            onClick={() => setMenu((m) => !m)}
            className="text-[0.55rem] tracking-[0.4em] text-muted-foreground/60 uppercase [writing-mode:vertical-rl] transition-colors duration-1000 hover:text-ember"
          >
            elsewhere
          </button>
        </div>
        <nav
          className={`absolute top-0 right-0 h-full w-72 border-l border-border/60 bg-card/40 px-8 py-16 backdrop-blur-2xl transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-80 ${
            menu ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0"
          }`}
        >
          <p className="text-[0.55rem] tracking-[0.4em] text-muted-foreground uppercase">
            what you have noticed
          </p>
          <ul className="mt-8 space-y-5">
            {SIGNALS.map((s) => {
              const seen = found.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    disabled={!seen}
                    onClick={() => reveal(s)}
                    className={`font-display text-left text-lg lowercase transition-all duration-1000 ${
                      seen
                        ? "text-foreground/85 hover:text-ember hover:italic"
                        : "cursor-default text-muted-foreground/35 blur-[3px] select-none"
                    }`}
                  >
                    {seen ? s.label : "— — — —"}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-12 text-[0.58rem] leading-loose tracking-[0.22em] text-muted-foreground/70 uppercase">
            press / to hide this again
          </p>
        </nav>
      </div>

      {/* revealed fragment */}
      <div
        onClick={() => setOpen(null)}
        className={`fixed inset-0 z-40 flex items-center justify-center px-8 transition-all duration-[1800ms] ${
          open
            ? "bg-background/55 opacity-100 backdrop-blur-lg"
            : "pointer-events-none opacity-0 backdrop-blur-none"
        }`}
      >
        {open ? (
          <article className="max-w-md text-center">
            <p className="text-[0.55rem] tracking-[0.45em] text-muted-foreground uppercase">
              {open.whisper}
            </p>
            <h2 className="font-display mt-6 text-[clamp(1.7rem,4vw,2.6rem)] leading-tight font-light lowercase italic text-foreground/90">
              {open.label}
            </h2>
            <p className="mt-8 text-sm leading-[2] font-light text-muted-foreground">{open.body}</p>
            <p className="mt-12 text-[0.55rem] tracking-[0.4em] text-muted-foreground/60 uppercase">
              anywhere to let it go
            </p>
          </article>
        ) : null}
      </div>
    </main>
  );
}
