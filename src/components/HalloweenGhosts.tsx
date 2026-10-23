import { useEffect, useRef, useState } from "react";
import type { HalloweenPhase } from "./HalloweenArrival";
import { askGhost, type GhostReply, type GhostTarget } from "@/lib/ghost-ai";
import { askGhostInBrowser } from "@/lib/ghost-browser-ai";
import { askStep, fallback, faq, guide, tours, type Pointing } from "@/lib/ghost-knowledge";
import { askStepEn, fallbackEn, faqEn, ghostUi, languageHint, toursEn } from "@/lib/ghost-knowledge-en";
import type { Lang } from "@/lib/i18n";

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

/** The ghost's words in each language; English is the site's default. */
const knowledge = {
  en: { tours: toursEn, faq: faqEn, askStep: askStepEn, fallback: fallbackEn },
  fr: { tours, faq, askStep, fallback },
};

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Built-in answer used for the ready-made questions and whenever the AI is unavailable. */
function answerFor(question: string, lang: Lang): Pointing {
  const text = normalize(question);
  let best: Pointing = knowledge[lang].fallback, score = 0;
  for (const entry of knowledge[lang].faq) {
    const hits = entry.keys.filter((key) => text.includes(normalize(key))).length;
    if (hits > score) { score = hits; best = entry.answer; }
  }
  return best;
}

/** Flies the guide ghost itself to whatever it talks about, touches it, then floats back home. */
function useGhostTravel(home: React.RefObject<HTMLElement | null>, target: Element | null, enabled: boolean) {
  // Keep the actual position and speed across target changes: restarting at zero causes a jump.
  const motion = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  useEffect(() => {
    const ghost = home.current;
    const sprite = ghost?.querySelector<HTMLElement>(".ghost-guide-sprite");
    const bubble = ghost?.querySelector<HTMLElement>(".ghost-guide-bubble");
    if (!ghost || !sprite) return;
    let raf = 0, touchedAt = 0, last = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Where the sprite sits at rest: measured once, so each frame reads the page at most once.
    const rest = sprite.getBoundingClientRect();
    const originX = rest.left - motion.current.x, originY = rest.top - motion.current.y, size = rest.width, height = rest.height;
    const set = (key: string, value: string) => { if (ghost.dataset[key] !== value) ghost.dataset[key] = value; };
    // The bubble floats around the sprite (absolutely placed), so choosing its side never moves the ghost.
    // It goes where the ghost will stop: left of it near the right edge, below it near the top.
    let bubbleWidth = "";
    const placeBubble = (x: number, y: number) => {
      // Room on each side, minus the 8px gap to the sprite and a 20px screen margin.
      const right = window.innerWidth - x - size - 28, left = x - 28;
      const flip = right < 240 && left > right;
      set("flip", flip ? "true" : "false");
      set("below", y < 150 ? "true" : "false");
      const width = `${Math.round(Math.min(320, Math.max(150, flip ? left : right)))}px`;
      if (bubble && width !== bubbleWidth) { bubble.style.maxWidth = width; bubbleWidth = width; }
    };
    const place = (now: number) => {
      const m = motion.current;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const returning = touchedAt > 0 && now - touchedAt >= 1600;
      let tx = 0, ty = 0, canTouch = false;
      if (enabled && target && !returning) {
        const to = target.getBoundingClientRect();
        if (to.bottom > 0 && to.top < window.innerHeight && to.width > 0) {
          // Approach from below: the crown of the head meets the element's lower edge.
          const destX = Math.min(Math.max(8, to.left + Math.min(to.width * 0.3, 60) - size / 2), window.innerWidth - size - 8);
          const contactY = Math.min(to.bottom, window.innerHeight - height - 8 + height * 0.05);
          const destY = Math.max(8, contactY - height * 0.05);
          tx = destX - originX; ty = destY - originY;
          canTouch = true;
          placeBubble(destX, destY);
        }
      }
      if (!canTouch) placeBubble(originX, originY);
      if (reduce) { m.x = tx; m.y = ty; m.vx = m.vy = 0; }
      else {
        // Critically damped spring: eases out of rest, glides, and settles without overshoot or snapping.
        const w = returning || !canTouch ? 5 : 7.5;
        m.vx += (w * w * (tx - m.x) - 2 * w * m.vx) * dt;
        m.vy += (w * w * (ty - m.y) - 2 * w * m.vy) * dt;
        m.x += m.vx * dt; m.y += m.vy * dt;
      }
      if (!touchedAt && canTouch && Math.hypot(tx - m.x, ty - m.y) < 4 && Math.hypot(m.vx, m.vy) < 60) {
        touchedAt = now;
        set("touching", "true");
        target?.classList.add("guide-highlight");
      }
      if (returning && ghost.dataset["touching"] === "true") {
        set("touching", "false");
        target?.classList.remove("guide-highlight");
      }
      set("travel", returning || !canTouch ? "returning" : touchedAt ? "touching" : "flying");
      ghost.style.transform = `translate3d(${m.x.toFixed(2)}px, ${m.y.toFixed(2)}px, 0)`;
      // Back home with nothing to show: stop the loop until the next target.
      if (!canTouch && Math.hypot(m.x, m.y) < 0.4 && Math.hypot(m.vx, m.vy) < 2) {
        Object.assign(m, { x: 0, y: 0, vx: 0, vy: 0 });
        ghost.style.transform = "translate3d(0px, 0px, 0)";
        return;
      }
      raf = requestAnimationFrame(place);
    };
    raf = requestAnimationFrame(place);
    return () => { cancelAnimationFrame(raf); set("touching", "false"); target?.classList.remove("guide-highlight"); };
  }, [home, target, enabled]);
}

/**
 * The guide ghost. Each time a part of the page reaches the middle of the screen it
 * gives a short guided tour of it, flying over to touch each element, then asks whether you have questions. Clicked, it opens a question panel:
 * ready-made questions are answered instantly from the page; typed questions go to a
 * small AI on the server (see ghost-ai.ts), with the built-in answers as a fallback.
 * Nothing is stored; only the ghost button and its panel take clicks.
 */
export function GhostGuide({ phase, lang }: { phase: HalloweenPhase; lang: Lang }) {
  const ui = ghostUi[lang];
  const [tip, setTip] = useState<{ text: string; lang: Lang }>({ text: "", lang });
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [log, setLog] = useState<Array<{ from: "ghost" | "you"; text: string }>>([{ from: "ghost", text: ui.hello }]);
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
  const langRef = useRef(lang);
  langRef.current = lang;
  // The very first tour opens with a French hint pointing at the language button.
  const hintShown = useRef(false);
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

  const say = (text: string, selector: string, duration: number, spoken: Lang = langRef.current) => {
    setTip({ text, lang: spoken });
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
      const words = knowledge[langRef.current];
      const tour = words.tours[id];
      if (!tour) return;
      const hint = !hintShown.current && langRef.current === "en";
      hintShown.current = true;
      const steps: Array<Pointing & { lang?: Lang }> = [...(hint ? [{ ...languageHint, lang: "fr" as const }] : []), ...tour, words.askStep];
      steps.forEach((item, i) => {
        tourTimers.current.push(window.setTimeout(() => { if (!openRef.current) say(item.text, item.target, i === 0 && hint ? 6500 : step, item.lang); }, i === 0 ? 0 : i * step + (hint ? 1900 : 0)));
      });
    };
    const observer = new IntersectionObserver((entries) => {
      const id = entries.find((item) => item.isIntersecting)?.target.id;
      if (id && knowledge[langRef.current].tours[id]) play(id);
    }, { rootMargin: "-45% 0px -45% 0px" });
    Object.keys(tours).forEach((id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => { observer.disconnect(); stopTour(); };
  }, [ready]);

  // Switching language: the panel greets in the new language and pending tour steps stop.
  const shownLang = useRef(lang);
  useEffect(() => {
    if (shownLang.current === lang) return;
    shownLang.current = lang;
    hintShown.current = true;
    stopTour();
    setVisible(false);
    setTarget(null);
    setLog([{ from: "ghost", text: ghostUi[lang].hello }]);
    lastTour.current.clear();
  }, [lang]);

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
    try { result = await askGhost({ data: { question, history, lang } }); } catch { result = null; }
    // No server or no Groq key (static hosting): ask the keyless AI straight from the browser.
    if (!result) result = await askGhostInBrowser(question, history, lang);
    setThinking(false);
    reply(result ? { text: result.answer, target: targetSelectors[result.target] } : answerFor(question, lang));
  };

  useGhostTravel(home, target, ready && !open);

  if (!ready) return null;
  return (
    <>
      <div ref={home} className="ghost-guide" data-visible={visible && !open ? "true" : "false"} data-open={open ? "true" : "false"}>
        <button ref={button} type="button" className="ghost-guide-sprite" aria-label={ui.ask} aria-expanded={open} aria-controls="ghost-chat" onClick={() => setOpen((value) => !value)}>
          <GhostSprite />
          <span className="ghost-head-impact" aria-hidden="true"><i /><i /><i /></span>
          <span className="ghost-guide-badge" aria-hidden="true">?</span>
        </button>
        <p className="ghost-guide-bubble" role="status" aria-live="polite" lang={tip.lang}>{tip.text}</p>
        <section id="ghost-chat" className="ghost-chat" role="dialog" aria-label={ui.dialog} hidden={!open}>
          <header className="ghost-chat-head">
            <strong>{ui.title}</strong>
            <button type="button" className="ghost-chat-close" aria-label={ui.close} onClick={() => { setOpen(false); button.current?.focus(); }}>×</button>
          </header>
          <div className="ghost-chat-log" aria-live="polite">
            {log.map((message, i) => <p key={i} className={`ghost-chat-msg from-${message.from}`}>{message.text}</p>)}
            {thinking && <p className="ghost-chat-msg from-ghost ghost-thinking" aria-label={ui.thinking}><span /><span /><span /></p>}
          </div>
          <div className="ghost-chat-chips">
            {knowledge[lang].faq.map((entry) => <button key={entry.question} type="button" disabled={thinking} onClick={() => askReady(entry.question, entry.answer)}>{entry.question}</button>)}
          </div>
          <form className="ghost-chat-form" onSubmit={(event) => { event.preventDefault(); const question = draft.trim(); if (!question || thinking) return; setDraft(""); void askAi(question); }}>
            <label htmlFor="ghost-question" className="sr-only">{ui.label}</label>
            <input ref={input} id="ghost-question" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={ui.placeholder} autoComplete="off" maxLength={300} />
            <button type="submit" disabled={thinking}>{ui.send}</button>
          </form>
          <p className="ghost-chat-note">{ui.note}</p>
        </section>
      </div>
    </>
  );
}
