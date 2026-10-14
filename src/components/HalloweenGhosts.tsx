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

type Pointing = { text: string; target: string };

const offer = `−${halloweenOffer.discountPercent} %`;
const whatsapp = '#contact a[href*="whatsapp"]';

/** Tips shown when a part of the page reaches the middle of the screen. */
const tips: Record<string, Pointing> = {
  accueil: { text: "Bouh ! Bienvenue chez Ȥrk. Clique sur moi si tu as une question, je connais tous ses secrets…", target: "#accueil h1" },
  services: { text: "Ici : sites web, applis mobiles, bots et cybersécurité. Tout est fait sur mesure.", target: "#services article" },
  apropos: { text: "Avec Ȥrk, tu parles directement à la personne qui crée ton projet.", target: "#apropos h2" },
  methode: { text: "3 étapes : on échange, Ȥrk construit, puis il t’accompagne après la mise en ligne.", target: "#methode article" },
  contact: { text: `Psst… avec le code ${halloweenOffer.code}, tu as ${offer} sur ta commande !`, target: whatsapp },
};

/** Questions the ghost can answer, only from what the page itself says. */
const faq: Array<{ question: string; keys: string[]; answer: Pointing }> = [
  { question: "Tu crées quoi ?", keys: ["cree", "creer", "fais", "faire", "service", "site", "app", "bot", "propose"], answer: { text: "Des sites web, des applis iOS et Android, des bots Telegram, WhatsApp et Discord, et de la cybersécurité. Regarde ici !", target: "#services article" } },
  { question: "Combien ça coûte ?", keys: ["prix", "cout", "coute", "tarif", "combien", "devis", "budget", "cher"], answer: { text: "Chaque projet est sur mesure, donc le prix dépend de ton idée. Écris à Ȥrk : il te répondra directement.", target: whatsapp } },
  { question: "Il y a une promo ?", keys: ["promo", "code", "reduc", "remise", "offre", "halloween", "pourcent"], answer: { text: `Oui ! ${offer} sur toutes les prestations avec le code ${halloweenOffer.code}.`, target: ".halloween-offer, #contact .rounded-full.border-seasonal\\/40" } },
  { question: "Comment contacter Ȥrk ?", keys: ["contact", "whatsapp", "mail", "joindre", "ecrire", "parler", "appeler", "message"], answer: { text: "Par WhatsApp, Discord ou e-mail : les boutons sont juste là !", target: whatsapp } },
  { question: "Qui est Ȥrk ?", keys: ["qui", "zrk", "ȥrk", "developpeur", "fondateur"], answer: { text: "Un développeur indépendant : il s’occupe de ton projet de A à Z, du premier échange à la mise en ligne.", target: "#apropos h2" } },
  { question: "Comment ça se passe ?", keys: ["etape", "comment", "deroule", "passe", "methode", "process"], answer: { text: "3 étapes : on échange, Ȥrk construit et teste avec toi, puis il t’accompagne après la livraison.", target: "#methode article" } },
  { question: "Quels délais ?", keys: ["delai", "temps", "quand", "rapide", "duree", "semaine"], answer: { text: "Ça dépend de ton projet : demande-le à Ȥrk dès le premier échange, il te suit clairement tout du long.", target: whatsapp } },
  { question: "Le site m’appartient ?", keys: ["appartient", "proprie", "mien", "a moi", "droits"], answer: { text: "Oui : tu reçois une solution qui t’appartient vraiment.", target: "#apropos .decor-anchor.glass" } },
  { question: "C’est sécurisé ?", keys: ["secur", "cyber", "hack", "protection", "donnees", "fiable"], answer: { text: "La sécurité est pensée dès le début : accès, données et hébergement.", target: "#services article:nth-of-type(4)" } },
  { question: "Tu as un Discord ?", keys: ["discord", "serveur", "communaute"], answer: { text: "Oui ! Rejoins le serveur Discord de Ȥrk, le bouton est là.", target: '#accueil a[href*="discord"]' } },
];

const fallback: Pointing = { text: "Hmm… mes pouvoirs de fantôme ont des limites ! Pose ta question directement à Ȥrk sur WhatsApp.", target: whatsapp };

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function answerFor(question: string): Pointing {
  const text = normalize(question);
  let best: Pointing = fallback, score = 0;
  for (const entry of faq) {
    const hits = entry.keys.filter((key) => text.includes(normalize(key))).length;
    if (hits > score) { score = hits; best = entry.answer; }
  }
  return best;
}

/** Stretching magic wand held by a zombie finger, from the guide ghost to whatever it talks about. */
function ZombieWand({ origin, target }: { origin: React.RefObject<HTMLElement | null>; target: Element | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wand = ref.current;
    if (!wand || !target) return;
    let raf = 0;
    const place = () => {
      const from = origin.current?.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const visible = from && to.bottom > 0 && to.top < window.innerHeight && to.width > 0;
      wand.dataset["active"] = visible ? "true" : "false";
      if (visible) {
        const ox = from.left + from.width * 0.82, oy = from.top + from.height * 0.5;
        const tx = to.left + Math.min(to.width / 2, 48), ty = to.top + Math.min(to.height / 2, 28);
        const length = Math.max(60, Math.hypot(tx - ox, ty - oy) - 6);
        wand.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0) rotate(${Math.atan2(ty - oy, tx - ox).toFixed(4)}rad)`;
        wand.style.width = `${length.toFixed(1)}px`;
      }
      raf = requestAnimationFrame(place);
    };
    raf = requestAnimationFrame(place);
    target.classList.add("guide-highlight");
    return () => { cancelAnimationFrame(raf); target.classList.remove("guide-highlight"); wand.dataset["active"] = "false"; };
  }, [origin, target]);
  return (
    <div ref={ref} className="zombie-wand" data-active="false" aria-hidden="true">
      <div className="zombie-wand-grow">
        <svg viewBox="0 0 54 26" className="zombie-finger">
          <defs>
            <linearGradient id="zf-skin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="oklch(0.74 0.07 135)" /><stop offset="1" stopColor="oklch(0.45 0.06 145)" />
            </linearGradient>
          </defs>
          <path d="M0 5Q16 2 34 6L46 8Q53 10 52 14Q51 18 45 18L34 19Q16 23 0 21Z" fill="url(#zf-skin)" stroke="oklch(0.3 0.04 150)" strokeWidth="1" />
          <path d="M16 8q2 4 0 9M30 8q2 4 0 10" fill="none" stroke="oklch(0.35 0.05 150)" strokeWidth="1" />
          <path d="M44 9 51 11 50 16 44 17Z" fill="oklch(0.3 0.04 60)" />
          <ellipse cx="24" cy="15" rx="3" ry="2" fill="oklch(0.45 0.12 20 / .6)" />
        </svg>
        <span className="wand-stick" />
        <span className="wand-star">✦</span>
      </div>
    </div>
  );
}

/**
 * The guide ghost. It floats in with a short tip each time a new part of the page
 * reaches the middle of the screen, and answers questions when clicked, pointing at
 * the matching part of the page with its zombie-finger wand. Tips show once per
 * visit, questions are matched in the browser and never stored or sent; only the
 * ghost button and its question panel take clicks.
 */
export function GhostGuide({ phase }: { phase: HalloweenPhase }) {
  const [tip, setTip] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [log, setLog] = useState<Array<{ from: "ghost" | "you"; text: string }>>([{ from: "ghost", text: "Bouh ! Choisis une question ou écris la tienne, je te montre la réponse sur la page." }]);
  const [target, setTarget] = useState<Element | null>(null);
  const seen = useRef(new Set<string>());
  const button = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pointTimer = useRef(0);
  const ready = phase !== "arrival" && phase !== "releasing";

  const point = (selector: string, scroll: boolean, duration: number) => {
    const element = document.querySelector(selector);
    if (!element) return;
    if (scroll) element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    setTarget(element);
    window.clearTimeout(pointTimer.current);
    pointTimer.current = window.setTimeout(() => setTarget(null), duration);
  };

  useEffect(() => {
    if (!ready) return;
    let hide = 0;
    const observer = new IntersectionObserver((entries) => {
      const id = entries.find((item) => item.isIntersecting)?.target.id;
      if (!id || !tips[id] || seen.current.has(id)) return;
      seen.current.add(id);
      setTip(tips[id]!.text);
      setVisible(true);
      if (!document.querySelector(".ghost-guide[data-open='true']")) point(tips[id]!.target, false, 6500);
      window.clearTimeout(hide);
      hide = window.setTimeout(() => setVisible(false), 6500);
    }, { rootMargin: "-45% 0px -45% 0px" });
    Object.keys(tips).forEach((id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => { observer.disconnect(); window.clearTimeout(hide); };
  }, [ready]);

  useEffect(() => () => { window.clearTimeout(pointTimer.current); window.clearTimeout(bubbleTimer.current); }, []);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const bubbleTimer = useRef(0);
  const ask = (question: string, answer: Pointing) => {
    setLog((current) => [...current, { from: "you" as const, text: question }, { from: "ghost" as const, text: answer.text }].slice(-6));
    window.clearTimeout(bubbleTimer.current);
    if (window.innerWidth < 640) {
      // On a phone the panel would hide what the wand points at: fold it and answer in the bubble.
      setOpen(false);
      button.current?.focus();
      setTip(answer.text);
      setVisible(true);
      bubbleTimer.current = window.setTimeout(() => setVisible(false), 9000);
    } else {
      setVisible(false);
    }
    point(answer.target, true, 9000);
  };

  if (!ready) return null;
  return (
    <>
      <div className="ghost-guide" data-visible={visible && !open ? "true" : "false"} data-open={open ? "true" : "false"}>
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
          </div>
          <div className="ghost-chat-chips">
            {faq.map((entry) => <button key={entry.question} type="button" onClick={() => ask(entry.question, entry.answer)}>{entry.question}</button>)}
          </div>
          <form className="ghost-chat-form" onSubmit={(event) => { event.preventDefault(); const question = draft.trim(); if (!question) return; ask(question, answerFor(question)); setDraft(""); }}>
            <label htmlFor="ghost-question" className="sr-only">Ta question</label>
            <input ref={input} id="ghost-question" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Écris ta question…" autoComplete="off" maxLength={140} />
            <button type="submit">Demander</button>
          </form>
        </section>
      </div>
      <ZombieWand origin={button} target={target} />
    </>
  );
}
