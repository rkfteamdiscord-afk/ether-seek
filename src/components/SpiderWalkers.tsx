import { useEffect, useRef } from "react";

type Hat = "witch" | "tophat" | "wizard";

/** Cartoon spider seen from the front, wearing a little hat. Purely decorative. */
export function HatSpider({ hat }: { hat: Hat }) {
  return (
    <svg viewBox="0 0 100 100" className="hat-spider" aria-hidden="true">
      <g className="spider-legs spider-legs-a" fill="none" stroke="var(--spider-ink)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M37 54 20 38 8 52" /><path d="M36 64 16 60 6 76" />
        <path d="M63 59 82 48 94 62" /><path d="M64 69 81 72 88 90" />
      </g>
      <g className="spider-legs spider-legs-b" fill="none" stroke="var(--spider-ink)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M37 59 18 48 6 62" /><path d="M36 69 19 72 12 90" />
        <path d="M63 54 80 38 92 52" /><path d="M64 64 84 60 94 76" />
      </g>
      <ellipse cx="50" cy="62" rx="19" ry="18" fill="url(#spider-body)" />
      <ellipse cx="44" cy="54" rx="6" ry="3.5" fill="var(--spider-sheen)" opacity=".35" />
      <circle cx="43" cy="60" r="5.4" fill="var(--deco-light)" /><circle cx="57" cy="60" r="5.4" fill="var(--deco-light)" />
      <circle className="spider-pupil" cx="44" cy="61" r="2.6" fill="var(--spider-ink)" /><circle className="spider-pupil" cx="58" cy="61" r="2.6" fill="var(--spider-ink)" />
      <path d="M45 71q5 3.5 10 0" fill="none" stroke="var(--deco-light)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m46.5 72.5 1 3 1-2.6m3 0 1 2.6 1-3" fill="var(--deco-light)" />
      {hat === "witch" && <g>
        <path d="M33 47Q50 41 67 47L64 50Q50 46 36 50Z" fill="var(--hat-violet)" />
        <path d="M39 46 53 12Q58 9 61 15L57 19 61 45Z" fill="var(--hat-violet)" />
        <path d="M39.5 44 60.5 43.5 61 39.5 40.5 40Z" fill="var(--deco-orange)" />
        <rect x="47" y="39.5" width="6" height="4.5" rx="1" fill="none" stroke="var(--deco-gold)" strokeWidth="1.4" />
      </g>}
      {hat === "tophat" && <g>
        <ellipse cx="50" cy="47" rx="17" ry="3.6" fill="var(--spider-ink)" />
        <path d="M39 46V24Q50 21 61 24V46Q50 48 39 46Z" fill="var(--spider-ink)" />
        <path d="M39 41Q50 43 61 41V36Q50 38 39 36Z" fill="var(--deco-orange)" />
        <path d="M42 26Q44 24 47 24.5" fill="none" stroke="var(--spider-sheen)" strokeWidth="1.2" opacity=".6" />
      </g>}
      {hat === "wizard" && <g>
        <path d="M34 48Q50 43 66 48Q50 52 34 48Z" fill="var(--hat-blue)" />
        <path d="M37 47 46 18Q49 9 55 12L63 47Q50 50 37 47Z" fill="var(--hat-blue)" />
        <path d="m51 25 1.6 3.4 3.6.5-2.7 2.5.7 3.6-3.2-1.8-3.2 1.8.7-3.6-2.7-2.5 3.6-.5Z" fill="var(--deco-gold)" />
        <circle cx="44" cy="40" r="1.3" fill="var(--deco-gold)" /><circle cx="58" cy="37" r="1.1" fill="var(--deco-gold)" />
      </g>}
    </svg>
  );
}

/** Shared gradient for every spider body; rendered once so ids stay unique. */
export function SpiderDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="spider-body" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="var(--spider-sheen)" />
          <stop offset=".45" stopColor="var(--spider-mid)" />
          <stop offset="1" stopColor="var(--spider-ink)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

type Walker = { x: number; y: number; tx: number; ty: number; wait: number; speed: number; side: -1 | 1 };
type Dangler = { x: number; length: number; target: number; wait: number; climbing: boolean };

const crawlerHats: Hat[] = ["witch", "tophat", "wizard"];

/**
 * Hat-wearing spiders that stroll along the edges of the viewport, plus one that
 * drops on a silk thread. Positions are written straight to the DOM each frame,
 * never through React state. Hidden from assistive tech and never clickable.
 */
export function SpiderWalkers() {
  const crawlerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const danglerRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const top = () => 90;
    // Width of the free strip beside the 80rem content column, never narrower than one spider.
    const margin = () => Math.max(56, Math.min(170, (window.innerWidth - 1280) / 2 + 20));
    const pickWaypoint = (walker: Walker) => {
      const w = window.innerWidth, h = window.innerHeight;
      const edge = margin();
      // Stay in the side margins so the reading column stays clear.
      if (Math.random() < 0.1) {
        // A rare crossing hugs the very bottom of the screen, away from the text.
        walker.side = walker.side === 1 ? -1 : 1;
        walker.ty = h - 58;
        walker.y = Math.max(walker.y, h - 58);
      } else {
        walker.ty = random(top(), h - 70);
      }
      // On narrow screens there is no free margin, so peek in from the very edge instead.
      walker.tx = w < 640 ? (walker.side === -1 ? -14 : w - 34) : walker.side === -1 ? random(6, edge) : random(w - edge - 60, w - 66);
    };
    const crawlers: Walker[] = crawlerRefs.current.map((_, i) => {
      const side: -1 | 1 = i % 2 === 0 ? -1 : 1;
      const walker: Walker = { x: side === -1 ? 10 : window.innerWidth - 70, y: random(140, window.innerHeight - 100), tx: 0, ty: 0, wait: random(0.5, 2.5), speed: random(34, 52), side };
      pickWaypoint(walker);
      return walker;
    });
    const edgeX = () => {
      const w = window.innerWidth;
      if (w < 640) return Math.random() < 0.5 ? -12 : w - 36;
      return Math.random() < 0.5 ? random(4, margin() - 52) : random(w - margin(), w - 56);
    };
    const dangler: Dangler = { x: edgeX(), length: 0, target: random(120, window.innerHeight * 0.45), wait: 1.5, climbing: false };

    let last = performance.now(), raf = 0;
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      crawlers.forEach((walker, i) => {
        const element = crawlerRefs.current[i];
        if (!element) return;
        const dx = walker.tx - walker.x, dy = walker.ty - walker.y, distance = Math.hypot(dx, dy);
        let moving = false;
        if (walker.wait > 0) walker.wait -= dt;
        else if (distance < 2) { walker.wait = random(0.8, 3.2); pickWaypoint(walker); }
        else {
          const move = Math.min(distance, walker.speed * dt);
          walker.x += (dx / distance) * move; walker.y += (dy / distance) * move;
          moving = true;
        }
        const tilt = moving ? Math.max(-14, Math.min(14, (dx / Math.max(distance, 1)) * 14)) : 0;
        element.style.transform = `translate3d(${walker.x.toFixed(1)}px, ${walker.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg) scaleX(${dx < 0 ? -1 : 1})`;
        element.dataset["walking"] = moving ? "true" : "false";
      });

      const element = danglerRef.current, thread = threadRef.current;
      if (element && thread) {
        if (dangler.wait > 0) dangler.wait -= dt;
        else {
          const goal = dangler.climbing ? 0 : dangler.target;
          const delta = goal - dangler.length;
          dangler.length += Math.sign(delta) * Math.min(Math.abs(delta), (dangler.climbing ? 45 : 70) * dt);
          if (Math.abs(delta) < 1) {
            dangler.wait = dangler.climbing ? random(2, 5) : random(2.5, 5);
            if (dangler.climbing) {
              dangler.x = edgeX();
              dangler.target = random(110, window.innerHeight * 0.5);
            }
            dangler.climbing = !dangler.climbing;
          }
        }
        const sway = Math.sin(now / 900) * 4;
        thread.style.transform = `translate3d(${(dangler.x + 30).toFixed(1)}px, 72px, 0) rotate(${(-sway * 0.15).toFixed(2)}deg)`;
        thread.style.height = `${dangler.length.toFixed(1)}px`;
        element.style.transform = `translate3d(${(dangler.x + sway).toFixed(1)}px, ${(72 + dangler.length - 18).toFixed(1)}px, 0)`;
        element.dataset["walking"] = dangler.wait > 0 ? "false" : "true";
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="spider-walkers" aria-hidden="true">
      <SpiderDefs />
      {crawlerHats.map((hat, i) => (
        <div key={hat} ref={(node) => { crawlerRefs.current[i] = node; }} className={`spider-walker spider-crawler crawler-${i}`}>
          <HatSpider hat={hat} />
        </div>
      ))}
      <div ref={threadRef} className="spider-thread" />
      <div ref={danglerRef} className="spider-walker spider-dangler">
        <HatSpider hat="witch" />
      </div>
    </div>
  );
}
