import { useEffect, useRef, useState } from "react";
import type { HalloweenPhase } from "./HalloweenArrival";
import { askGhost, type GhostReply, type GhostTarget } from "@/lib/ghost-ai";
import { askGhostInBrowser } from "@/lib/ghost-browser-ai";
import { askStep, fallback, faq, guide, tours, type Pointing } from "@/lib/ghost-knowledge";

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

/** Where the wand points for each target the AI can choose. */
const targetSelectors: Record<GhostTarget, string> = {
  services: guide("service-0"),
  prix: guide("whatsapp"),
  promo: `${guide("promo-bandeau")}, ${guide("contact-promo")}`,
  contact: guide("contact-boutons"),
  discord: guide("discord"),
  apropos: guide("apropos-titre"),
  methode: guide("etape-0"),
  propriete: guide("apropos-propriete"),
  securite: guide("service-3"),
  accueil: guide("accueil-titre"),
  aucun: "",
};

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Built-in answer used for the ready-made questions and whenever the AI is unavailable. */
function answerFor(question: string): Pointing {
  const text = normalize(question);
  let best: Pointing = fallback, score = 0;
  for (const entry of faq) {
    const hits = entry.keys.filter((key) => text.includes(normalize(key))).length;
    if (hits > score) { score = hits; best = entry.answer; }
  }
  return best;
}

/** Flies the guide ghost itself to whatever it talks about, touches it, then floats back home. */
function useGhostTravel(home: React.RefObject<HTMLElement | null>, target: Element | null, enabled: boolean) {
  // Keep the actual position across target changes: restarting at zero causes a jump.
  const position = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const ghost = home.current;
    const sprite = ghost?.querySelector<HTMLElement>(".ghost-guide-sprite");
    if (!ghost || !sprite) return;
    let raf = 0, touchedAt = 0, last = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const place = (now: number) => {
      const { x, y } = position.current;
      const dt = Math.min(now - last, 50);
      last = now;
      let tx = 0, ty = 0;
      const returning = touchedAt > 0 && now - touchedAt >= 1600;
      let canTouch = false;
      if (enabled && target && !returning) {
        const to = target.getBoundingClientRect();
        const base = sprite.getBoundingClientRect();
        const ox = base.left - x, oy = base.top - y;
        if (to.bottom > 0 && to.top < window.innerHeight && to.width > 0) {
          // The sheet's lower edge meets the element, rather than the speech bubble.
          const destX = Math.min(Math.max(8, to.left + Math.min(to.width * 0.3, 60) - base.width / 2), window.innerWidth - base.width - 8);
          const destY = Math.min(Math.max(8, to.top - base.height * 0.82), window.innerHeight - base.height - 8);
          tx = destX - ox; ty = destY - oy;
          canTouch = true;
        }
      }
      const k = reduce ? 1 : 1 - Math.exp(-dt / (returning || !target || !enabled ? 340 : 170));
      position.current.x += (tx - x) * k;
      position.current.y += (ty - y) * k;
      if (!touchedAt && canTouch && Math.hypot(tx - position.current.x, ty - position.current.y) < 3) {
        touchedAt = now;
        ghost.dataset["touching"] = "true";
        target?.classList.add("guide-highlight");
      }
      if (returning) {
        ghost.dataset["touching"] = "false";
        target?.classList.remove("guide-highlight");
      }
      ghost.dataset["travel"] = returning || !target || !enabled ? "returning" : touchedAt ? "touching" : "flying";
      ghost.style.transform = `translate3d(${position.current.x.toFixed(1)}px, ${position.current.y.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(place);
    };
    raf = requestAnimationFrame(place);
    return () => { cancelAnimationFrame(raf); ghost.dataset["touching"] = "false"; target?.classList.remove("guide-highlight"); };
  }, [home, target, enabled]);
}

/**
 * The guide ghost. Each time a part of the page reaches the middle of the screen it
 * gives a short guided tour of it, flying over to touch each element, then asks whether you have questions. Clicked, it opens a question panel:
 * ready-made questions are answered instantly from the page; typed questions go to a
 * small AI on the server (see ghost-ai.ts), with the built-in answers as a fallback.
 * Nothing is stored; only the ghost button and its panel take clicks.
 */
export function GhostGuide({ phase }: { phase: HalloweenPhase }) {
  const [tip, setTip] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [log, setLog] = useState<Array<{ from: "ghost" | "you"; text: string }>>([{ from: "ghost", text: "Bouh ! Pose-moi n’importe quelle question sur Ȥrk, ou choisis-en une. Je te montre la réponse sur la page." }]);
  const [target, setTarget] = useState<Element | null>(null);
  const lastTour = useRef(new Map<string, number>());
  const tourTimers = useRef<number[]>([]);
  const button = useRef<HTMLButtonElement>(null);
  const home = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pointTimer = useRef(0);
  const bubbleTimer = useRef(0);
  const openRef = useRef(false);
  openRef.current = open;
  const ready = phase !== "arrival" && phase !== "releasing";

  const point = (selector: string, scroll: boolean, duration: number) => {
    window.clearTimeout(pointTimer.current);
    const element = selector ? document.querySelector(selector) : null;
    if (!element) { setTarget(null); return; }
    if (scroll) element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    setTarget(element);
    pointTimer.current = window.setTimeout(() => setTarget(null), duration);
  };

  const stopTour = () => { tourTimers.current.forEach((timer) => window.clearTimeout(timer)); tourTimers.current = []; };

  const say = (text: string, selector: string, duration: number) => {
    setTip(text);
    setVisible(true);
    point(selector, false, duration);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setVisible(false), duration);
  };

  useEffect(() => {
    if (!ready) return;
    const step = 4600;
    const play = (id: string) => {
      const now = Date.now();
      // Replays whenever you come back, but not while you scroll up and down within a few seconds.
      if (now - (lastTour.current.get(id) ?? 0) < 25000 || openRef.current) return;
      lastTour.current.set(id, now);
      stopTour();
      const tour = tours[id];
      if (!tour) return;
      [...tour, askStep].forEach((item, i) => {
        tourTimers.current.push(window.setTimeout(() => { if (!openRef.current) say(item.text, item.target, step); }, i * step));
      });
    };
    const observer = new IntersectionObserver((entries) => {
      const id = entries.find((item) => item.isIntersecting)?.target.id;
      if (id && tours[id]) play(id);
    }, { rootMargin: "-45% 0px -45% 0px" });
    Object.keys(tours).forEach((id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => { observer.disconnect(); stopTour(); };
  }, [ready]);

  useEffect(() => () => { stopTour(); window.clearTimeout(pointTimer.current); window.clearTimeout(bubbleTimer.current); }, []);

  useEffect(() => {
    if (!open) return;
    stopTour();
    setVisible(false);
    input.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const reply = (answer: Pointing) => {
    setLog((current) => [...current, { from: "ghost" as const, text: answer.text }].slice(-8));
    if (window.innerWidth < 640) {
      // On a phone the panel would hide what the ghost flies to: fold it and answer in the bubble.
      setOpen(false);
      button.current?.focus();
      say(answer.text, answer.target, 9000);
      if (answer.target) point(answer.target, true, 9000);
    } else {
      point(answer.target, true, 9000);
    }
  };

  const askReady = (question: string, answer: Pointing) => {
    setLog((current) => [...current, { from: "you" as const, text: question }].slice(-8));
    reply(answer);
  };

  const askAi = async (question: string) => {
    const history = log.slice(1).map((message) => ({ role: message.from === "you" ? "user" as const : "assistant" as const, content: message.text }));
    setLog((current) => [...current, { from: "you" as const, text: question }].slice(-8));
    setThinking(true);
    let result: GhostReply = null;
    try { result = await askGhost({ data: { question, history } }); } catch { result = null; }
    // No server or no Groq key (static hosting): ask the keyless AI straight from the browser.
    if (!result) result = await askGhostInBrowser(question, history);
    setThinking(false);
    reply(result ? { text: result.answer, target: targetSelectors[result.target] } : answerFor(question));
  };

  useGhostTravel(home, target, ready && !open);

  if (!ready) return null;
  return (
    <>
      <div ref={home} className="ghost-guide" data-visible={visible && !open ? "true" : "false"} data-open={open ? "true" : "false"}>
        <button ref={button} type="button" className="ghost-guide-sprite" aria-label="Poser une question au fantôme" aria-expanded={open} aria-controls="ghost-chat" onClick={() => setOpen((value) => !value)}>
          <GhostSprite />
          <span className="ghost-guide-badge" aria-hidden="true">?</span>
        </button>
        <p className="ghost-guide-bubble" role="status" aria-live="polite">{tip}</p>
        <section id="ghost-chat" className="ghost-chat" role="dialog" aria-label="Questions au fantôme" hidden={!open}>
          <header className="ghost-chat-head">
            <strong>Pose-moi une question !</strong>
            <button type="button" className="ghost-chat-close" aria-label="Fermer les questions" onClick={() => { setOpen(false); button.current?.focus(); }}>×</button>
          </header>
          <div className="ghost-chat-log" aria-live="polite">
            {log.map((message, i) => <p key={i} className={`ghost-chat-msg from-${message.from}`}>{message.text}</p>)}
            {thinking && <p className="ghost-chat-msg from-ghost ghost-thinking" aria-label="Le fantôme réfléchit"><span /><span /><span /></p>}
          </div>
          <div className="ghost-chat-chips">
            {faq.map((entry) => <button key={entry.question} type="button" disabled={thinking} onClick={() => askReady(entry.question, entry.answer)}>{entry.question}</button>)}
          </div>
          <form className="ghost-chat-form" onSubmit={(event) => { event.preventDefault(); const question = draft.trim(); if (!question || thinking) return; setDraft(""); void askAi(question); }}>
            <label htmlFor="ghost-question" className="sr-only">Ta question</label>
            <input ref={input} id="ghost-question" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Écris ta question…" autoComplete="off" maxLength={300} />
            <button type="submit" disabled={thinking}>Demander</button>
          </form>
          <p className="ghost-chat-note">Les questions écrites sont envoyées à un service d’IA (Groq ou Pollinations) pour te répondre. Rien n’est enregistré sur le site.</p>
        </section>
      </div>
    </>
  );
}
