import { useEffect, useRef, useState } from "react";
import { halloweenOffer } from "@/lib/seasonal-offer";
import type { HalloweenPhase } from "./HalloweenArrival";

/** Little sheet ghost with a wavy hem; purely decorative. */
export function GhostSprite({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={`ghost-sprite ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id="ghost-sheet" cx="40%" cy="28%" r="80%">
          <stop offset="0" stopColor="oklch(0.99 0.01 290)" />
          <stop offset=".6" stopColor="oklch(0.9 0.04 290)" />
          <stop offset="1" stopColor="oklch(0.78 0.07 290)" stopOpacity=".35" />
        </radialGradient>
      </defs>
      <path className="ghost-sheet" d="M50 6C24 6 12 26 12 52v52l10-8 9 10 10-9 9 10 9-10 10 9 9-10 10 8V52C88 26 76 6 50 6Z" fill="url(#ghost-sheet)" />
      <ellipse cx="38" cy="48" rx="6" ry="8" fill="oklch(0.2 0.04 295)" />
      <ellipse cx="62" cy="48" rx="6" ry="8" fill="oklch(0.2 0.04 295)" />
      <circle cx="40" cy="45" r="2" fill="white" /><circle cx="64" cy="45" r="2" fill="white" />
      <ellipse className="ghost-mouth" cx="50" cy="66" rx="5" ry="6" fill="oklch(0.25 0.05 295)" />
      <ellipse cx="29" cy="60" rx="5" ry="3" fill="oklch(0.8 0.12 10)" opacity=".45" />
      <ellipse cx="71" cy="60" rx="5" ry="3" fill="oklch(0.8 0.12 10)" opacity=".45" />
    </svg>
  );
}

type Drifter = { x: number; base: number; speed: number; amp: number; freq: number; phase: number; size: number };

/**
 * Translucent ghosts gliding across the whole page behind the content, fading in and
 * out as they drift. Positions are written straight to the DOM; hidden from assistive
 * tech, never clickable and absent when the visitor prefers reduced motion.
 */
export function GhostSwarm() {
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const spawn = (fromLeft: boolean, size: number): Drifter => ({
      x: fromLeft ? -size - random(0, 400) : window.innerWidth + random(0, 400),
      base: random(0.12, 0.85) * window.innerHeight,
      speed: random(18, 40) * (fromLeft ? 1 : -1),
      amp: random(20, 70), freq: random(0.25, 0.6), phase: random(0, Math.PI * 2), size,
    });
    const ghosts = refs.current.map((_, i) => {
      const ghost = spawn(i % 2 === 0, [70, 46, 58, 38, 52][i] ?? 50);
      ghost.x = random(0, window.innerWidth);
      return ghost;
    });
    let last = performance.now(), raf = 0;
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05), t = now / 1000;
      last = now;
      ghosts.forEach((ghost, i) => {
        const element = refs.current[i];
        if (!element) return;
        ghost.x += ghost.speed * dt;
        if (ghost.x > window.innerWidth + 120 || ghost.x < -ghost.size - 120) Object.assign(ghost, spawn(ghost.speed < 0, ghost.size));
        const y = ghost.base + Math.sin(t * ghost.freq + ghost.phase) * ghost.amp;
        const tilt = Math.cos(t * ghost.freq + ghost.phase) * 8;
        const fade = 0.28 + 0.27 * (0.5 + 0.5 * Math.sin(t * 0.35 + ghost.phase * 2));
        element.style.opacity = fade.toFixed(2);
        element.style.transform = `translate3d(${ghost.x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg) scaleX(${ghost.speed < 0 ? -1 : 1})`;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="ghost-swarm" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} ref={(node) => { refs.current[i] = node; }} className={`swarm-ghost swarm-ghost-${i}`}>
          <GhostSprite />
        </div>
      ))}
    </div>
  );
}

const tips: Record<string, string> = {
  accueil: "Bouh ! Bienvenue chez Ȥrk. Descends, je te fais la visite…",
  services: "Ici : sites web, applis mobiles, bots et cybersécurité. Tout est fait sur mesure.",
  apropos: "Avec Ȥrk, tu parles directement à la personne qui crée ton projet.",
  methode: "3 étapes : on échange, Ȥrk construit, puis il t’accompagne après la mise en ligne.",
  contact: `Psst… avec le code ${halloweenOffer.code}, tu as −${halloweenOffer.discountPercent} % sur ta commande !`,
};

/**
 * A guide ghost that floats in with a short tip each time a new part of the page
 * reaches the middle of the screen. Each tip shows once per visit, kept in memory
 * only. The bubble is announced politely to screen readers and never takes clicks.
 */
export function GhostGuide({ phase }: { phase: HalloweenPhase }) {
  const [tip, setTip] = useState<{ id: string; text: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const seen = useRef(new Set<string>());
  useEffect(() => {
    if (phase === "arrival" || phase === "releasing") return;
    let hide = 0;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.find((item) => item.isIntersecting);
      const id = entry?.target.id;
      if (!id || !tips[id] || seen.current.has(id)) return;
      seen.current.add(id);
      setTip({ id, text: tips[id]! });
      setVisible(true);
      window.clearTimeout(hide);
      hide = window.setTimeout(() => setVisible(false), 6500);
    }, { rootMargin: "-45% 0px -45% 0px" });
    Object.keys(tips).forEach((id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => { observer.disconnect(); window.clearTimeout(hide); };
  }, [phase]);
  return (
    <div className="ghost-guide" data-visible={visible ? "true" : "false"}>
      <div className="ghost-guide-sprite" aria-hidden="true"><GhostSprite /></div>
      <p className="ghost-guide-bubble" role="status" aria-live="polite">{tip?.text ?? ""}</p>
    </div>
  );
}
