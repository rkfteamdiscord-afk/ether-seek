import { useEffect } from "react";
import { extraMotifs, ExtraIllustration, type ExtraMotif } from "./HalloweenExtras";
import { PumpkinPatch } from "./RealPumpkin";
import ghost from "@/assets/halloween-ghost.webp";
import witchKit from "@/assets/halloween-witch-kit.webp";

type WebDrawing = { radials: string; spiral: string; loose: string; dew: Array<[number, number]> };

/** Corner orb web: radials from the corner, sagging capture spiral, a few broken threads and dew. */
function weaveWeb(seed: number): WebDrawing {
  let state = seed;
  const random = () => ((state = (state * 16807) % 2147483647) - 1) / 2147483646;
  const corner = 1;
  const angles = Array.from({ length: 9 }, (_, i) => (i / 8) * (Math.PI / 2) + (i > 0 && i < 8 ? (random() - 0.5) * 0.12 : 0));
  const reach = (angle: number) => Math.min(118 / Math.max(Math.cos(angle), 0.0001), 118 / Math.max(Math.sin(angle), 0.0001));
  const point = (angle: number, radius: number) => [corner + Math.cos(angle) * radius, corner + Math.sin(angle) * radius] as const;
  const radials = angles.map((angle) => { const [x, y] = point(angle, reach(angle)); return `M${corner} ${corner}L${x.toFixed(1)} ${y.toFixed(1)}`; }).join("");
  const rings = [11, 19, 28, 38, 49, 61, 74, 88, 103];
  const dew: Array<[number, number]> = [];
  let spiral = "";
  rings.forEach((ring, r) => {
    for (let i = 0; i < angles.length - 1; i++) {
      if (random() < 0.07) continue;
      const r1 = ring * (1 + (random() - 0.5) * 0.08), r2 = ring * (1 + (random() - 0.5) * 0.08);
      if (r1 > reach(angles[i]!) - 2 || r2 > reach(angles[i + 1]!) - 2) continue;
      const [x1, y1] = point(angles[i]!, r1), [x2, y2] = point(angles[i + 1]!, r2);
      const sag = 0.84 - r * 0.004;
      const cx = corner + ((x1 + x2) / 2 - corner) * sag, cy = corner + ((y1 + y2) / 2 - corner) * sag;
      spiral += `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      if (random() < 0.16) dew.push([+x1.toFixed(1), +y1.toFixed(1)]);
    }
  });
  const [lx, ly] = point(angles[5]!, rings[6]!);
  const loose = `M${lx.toFixed(1)} ${ly.toFixed(1)}q${(4 + random() * 6).toFixed(1)} 12 ${(-2 + random() * 4).toFixed(1)} 24`;
  return { radials, spiral, loose, dew };
}

const webs = [weaveWeb(11), weaveWeb(47), weaveWeb(83)];

export function Cobweb({ className = "" }: { className?: string }) {
  const web = webs[[...className].reduce((sum, char) => sum + char.charCodeAt(0), 0) % webs.length]!;
  return (
    <svg viewBox="0 0 120 120" className={`halloween-web ${className}`} fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <path d={web.radials} className="web-radial" vectorEffect="non-scaling-stroke" />
      <path d={web.spiral} className="web-spiral" vectorEffect="non-scaling-stroke" />
      <path d={web.loose} className="web-loose" vectorEffect="non-scaling-stroke" />
      {/* Dew drops twinkle in four groups: one animation per group instead of one per drop. */}
      {[0, 1, 2, 3].map((group) => (
        <g key={group} className="web-dew" style={{ animationDelay: `${group}s` }}>
          {web.dew.filter((_, i) => i % 4 === group).map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" />)}
        </g>
      ))}
    </svg>
  );
}

const decoShades = {
  orange: ["oklch(0.86 0.15 70)", "oklch(0.72 0.19 48)", "oklch(0.5 0.17 35)"],
  gold: ["oklch(0.97 0.1 95)", "oklch(0.86 0.15 85)", "oklch(0.64 0.13 70)"],
  violet: ["oklch(0.72 0.14 310)", "oklch(0.55 0.17 305)", "oklch(0.34 0.13 295)"],
  light: ["oklch(1 0 0)", "oklch(0.95 0.02 85)", "oklch(0.78 0.03 285)"],
  green: ["oklch(0.88 0.16 135)", "oklch(0.72 0.17 140)", "oklch(0.48 0.13 150)"],
  stone: ["oklch(0.78 0.02 285)", "oklch(0.6 0.03 285)", "oklch(0.42 0.03 285)"],
} as const;

/** Shared light-to-shadow gradients that give every flat motif some volume. Rendered once. */
export function DecorDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {Object.entries(decoShades).map(([name, [light, mid, shade]]) => (
          <linearGradient key={name} id={`deco-fill-${name}`} x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor={light} />
            <stop offset=".5" stopColor={mid} />
            <stop offset="1" stopColor={shade} />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}

export function Pumpkins({ className = "" }: { className?: string }) {
  return <PumpkinPatch className={`halloween-pumpkins ${className}`} />;
}

export function HalloweenGarland() {
  return (
    <div className="halloween-garland" aria-hidden="true">
      <span className="halloween-string" />
      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
        <svg key={n} viewBox="0 0 80 40" className="halloween-bat" fill="currentColor">
          <path d="M40 17 35 9 33 19C23 9 10 7 1 5L10 27Q16 20 23 31Q29 24 35 35L40 39 45 35Q51 24 57 31Q64 20 70 27L79 5C65 8 55 11 47 19L45 9Z" />
        </svg>
      ))}
    </div>
  );
}

const originalMotifs = ["ghost", "spider", "moon", "lantern", "witch", "candy", "cat", "potion", "candle", "skull", "broom", "owl", "bat", "bone", "leaf", "crystal", "hat", "eye", "lollipop", "gravestone"] as const;
type OriginalMotif = (typeof originalMotifs)[number];
type Motif = OriginalMotif | ExtraMotif;
const motifs: readonly Motif[] = [...originalMotifs, ...extraMotifs];

/** Decorative illustrations only: never carry information or intercept input. */
function Illustration({ kind }: { kind: Motif }) {
  if (kind === "ghost" || kind === "witch") {
    return <img src={kind === "ghost" ? ghost : witchKit} alt="" width={kind === "ghost" ? 336 : 496} height={kind === "ghost" ? 496 : 336} loading="lazy" decoding="async" />;
  }
  const drawings: Record<Exclude<OriginalMotif, "ghost" | "witch">, React.ReactNode> = {
    spider: <><path d="M50 0V35M39 43 20 30 10 43M38 50 15 48 6 61M39 59 22 69 18 83M61 43 80 30 90 43M62 50 85 48 94 61M61 59 78 69 82 83" fill="none"/><ellipse cx="50" cy="56" rx="15" ry="20"/><circle cx="45" cy="48" r="3" className="deco-light"/><circle cx="55" cy="48" r="3" className="deco-light"/></>,
    moon: <><path d="M68 12A38 38 0 1 0 86 70C48 84 27 42 68 12Z" className="deco-gold"/><path d="m79 18 3 7 8 3-8 3-3 7-3-7-8-3 8-3Z" className="deco-gold"/></>,
    lantern: <><path d="M38 25V15Q50 3 62 15V25M26 29H74L80 79H20ZM18 82H82M30 24H70"/><path d="M37 39H63V71H37Z" className="deco-gold"/><path d="M50 43Q33 62 50 68Q68 61 50 43Z" className="deco-orange"/></>,
    candy: <><path d="m23 35-15-9 3 24-3 24 19-11M77 35l15-9-3 24 3 24-19-11" className="deco-violet"/><rect x="22" y="31" width="56" height="38" rx="15" className="deco-orange"/><path d="m38 32 13 36M56 32l13 32" className="deco-light"/></>,
    cat: <><path d="M26 46 24 16 43 30Q50 25 57 30L76 16 74 46Q84 71 66 78H34Q16 71 26 46Z"/><path d="M70 76Q97 97 88 54M30 55H10M70 55H90" fill="none"/><path d="m33 46 10 3-8 6M67 46l-10 3 8 6" className="deco-gold"/><path d="m46 59 4 4 4-4" className="deco-orange"/></>,
    potion: <><path d="M39 10H61V37Q90 53 80 77Q50 98 20 77Q10 53 39 37Z" className="deco-violet"/><path d="M25 60Q50 49 75 60V76Q50 88 25 76Z" className="deco-green"/><path d="M35 9H65V22H35Z" className="deco-gold"/><circle cx="45" cy="65" r="5" className="deco-light"/><circle cx="59" cy="73" r="3" className="deco-light"/></>,
    candle: <><path d="M31 44H69V86H31Z" className="deco-light"/><path d="M32 45Q40 66 43 47Q53 74 58 47L69 45" className="deco-gold"/><path d="M50 8Q20 35 50 43Q74 30 50 8Z" className="deco-orange"/><path d="M50 25Q39 39 50 40Q61 36 50 25Z" className="deco-gold"/><path d="M22 88H78"/></>,
    skull: <><path d="M24 65Q5 16 50 13Q95 16 76 65L65 69V85H35V69Z" className="deco-light"/><ellipse cx="35" cy="47" rx="10" ry="12"/><ellipse cx="65" cy="47" rx="10" ry="12"/><path d="m50 57-7 12h14ZM43 74V85M57 74V85"/></>,
    broom: <><path d="m68 10-30 51" fill="none" className="deco-gold"/><path d="m31 48 22 13-8 31L8 71Z" className="deco-gold"/><path d="m28 58-12 16M36 63 24 81M45 67 34 86" fill="none"/><path d="m29 49 23 13" fill="none" className="deco-violet"/></>,
    owl: <><path d="M25 30 20 10 40 22Q50 18 60 22L80 10 75 30Q97 80 50 88Q3 80 25 30Z" className="deco-violet"/><circle cx="35" cy="43" r="15" className="deco-light"/><circle cx="65" cy="43" r="15" className="deco-light"/><circle cx="35" cy="43" r="6"/><circle cx="65" cy="43" r="6"/><path d="m44 57 6 12 6-12" className="deco-gold"/><path d="m34 72 8 5m16 0 8-5" fill="none"/></>,
    bat: <><path d="m50 39-9-14-3 17Q21 23 4 20L16 66Q27 54 37 72L50 82 63 72Q73 54 84 66L96 20Q79 23 62 42l-3-17Z"/><circle cx="45" cy="55" r="3" className="deco-gold"/><circle cx="55" cy="55" r="3" className="deco-gold"/></>,
    bone: <path d="M24 20Q5 7 9 27Q0 44 22 43L65 79Q65 100 82 88Q101 93 91 73Q93 59 76 61L34 29Q43 11 24 20Z" className="deco-light"/>,
    leaf: <><path d="m50 10 9 24 19-12-3 27 17 5-20 17-22 5-22-5L8 54l17-5-3-27 19 12Z" className="deco-orange"/><path d="M50 30V93M30 49l20 16 20-16" fill="none" className="deco-gold"/></>,
    crystal: <><circle cx="50" cy="43" r="32" className="deco-violet"/><path d="M29 27Q40 17 54 19" fill="none" className="deco-light"/><path d="m50 30 4 9 10 4-10 4-4 10-4-10-10-4 10-4Z" className="deco-gold"/><path d="M31 74H69L79 91H21Z"/></>,
    hat: <><path d="M27 70 52 8Q73 9 78 31L61 23 75 70Z" className="deco-violet"/><ellipse cx="50" cy="76" rx="44" ry="12" className="deco-violet"/><path d="m32 57 37 2 4 11H28Z" className="deco-orange"/><path d="M45 58H58V70H45Z" className="deco-gold"/></>,
    eye: <><circle cx="50" cy="50" r="36" className="deco-light"/><circle cx="50" cy="50" r="19" className="deco-green"/><circle cx="50" cy="50" r="10"/><circle cx="55" cy="44" r="4" className="deco-light"/><path d="m16 38 15 5-8 8M84 61l-16-4 8-9" fill="none" className="deco-orange"/></>,
    lollipop: <><path d="M50 54V95" fill="none" className="deco-light"/><circle cx="50" cy="35" r="29" className="deco-orange"/><path d="M50 35Q37 29 45 20Q61 8 71 30Q80 51 52 55Q24 58 26 31" fill="none" className="deco-light"/></>,
    gravestone: <><path d="M22 89V38Q22 10 50 10Q78 10 78 38V89Z" className="deco-stone"/><path d="M50 27V57M37 39H63M13 90H87" fill="none"/><path d="m28 75 8-8 8 8M59 70l10 6" fill="none"/></>,
  };
  return <svg viewBox="0 0 100 100" fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{kind in drawings ? drawings[kind as keyof typeof drawings] : <ExtraIllustration kind={kind as ExtraMotif} />}</svg>;
}

export function HalloweenScene({ chapter }: { chapter: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <div className={`halloween-scene scene-${chapter}`} aria-hidden="true">
      <div className={`halloween-fog fog-chapter-${chapter}`}>
        {[0, 1, 2, 3, 4].map((n) => <svg key={n} viewBox="0 0 1400 160" preserveAspectRatio="none"><path d="M-100 140C0 40 110 160 180 90S320 155 420 78S555 146 670 65S830 150 950 86S1130 145 1220 62S1400 115 1500 65L1500 200H-100Z"/><path d="M-100 120Q160 70 290 130T640 100T1000 125T1500 80" fill="none" stroke="currentColor" strokeWidth="35"/></svg>)}
      </div>
      <div className="halloween-wisps">{[0, 1, 2].map((n) => <svg key={n} className={`wisp-${n}`} viewBox="0 0 160 220" fill="none"><path d="M80 230C-10 155 155 135 70 90S125 30 80-20" stroke="currentColor" strokeWidth="18"/><path d="M95 230C15 160 140 120 85 60" stroke="currentColor" strokeWidth="7"/></svg>)}</div>
      {motifs.slice(chapter * 12, chapter * 12 + 8).map((kind, i) => <div key={kind} data-decoration={kind} className={`halloween-prop slot-${i} prop-${kind}`}><Illustration kind={kind}/></div>)}
    </div>
  );
}

export function AttachedDecor({ chapter, index }: { chapter: 0 | 1 | 2 | 3 | 4; index: 0 | 1 | 2 | 3 }) {
  const kind = motifs[chapter * 12 + 8 + index];
  if (!kind) return null;
  return <span aria-hidden="true" data-decoration={kind} className={`halloween-prop attached-decor attached-${index} prop-${kind}`}><Illustration kind={kind} /></span>;
}
/** Jack-o'-lantern hanging on a string, swinging with a flickering glow. Decorative only. */
export function SwingingLantern({ className = "" }: { className?: string }) {
  return (
    <div className={`swinging-lantern ${className}`} aria-hidden="true">
      <span className="swinging-lantern-string" />
      <svg viewBox="0 0 100 90" className="swinging-lantern-pumpkin">
        <ellipse cx="50" cy="52" rx="44" ry="34" fill="url(#deco-fill-orange)" />
        <path d="M30 22Q20 52 30 84M70 22Q80 52 70 84M50 18V86" fill="none" stroke="oklch(0.5 0.17 35)" strokeWidth="2.5" opacity=".6" />
        <path d="M46 20Q44 8 52 4L56 7Q51 11 53 20Z" fill="url(#deco-fill-green)" />
        <g className="lantern-face" fill="oklch(0.95 0.15 90)">
          <path d="M26 44 36 34 42 46Z" /><path d="M74 44 64 34 58 46Z" /><path d="M46 54 50 47 54 54Z" />
          <path d="M24 60Q50 82 76 60L70 62 66 68 60 63 54 70 48 64 42 70 36 63 31 67Z" />
        </g>
      </svg>
    </div>
  );
}

/** Translucent ghost drifting slowly across a section, behind the content. Decorative only. */
export function DriftingGhost({ className = "" }: { className?: string }) {
  return (
    <div className={`drifting-ghost ${className}`} aria-hidden="true">
      <img src={ghost} alt="" width={672} height={992} loading="lazy" />
    </div>
  );
}

/** Cluster of wax candles with living flames, drips, glow and a thread of smoke. Decorative only. */
export function CandleCluster({ className = "" }: { className?: string }) {
  return (
    <div className={`candle-cluster ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`real-candle real-candle-${i}`}>
          <span className="candle-smoke" />
          <span className="candle-glow" />
          <span className="candle-flame"><span className="candle-core" /></span>
          <span className="candle-wick" />
          <span className="candle-wax"><span className="candle-drip" /><span className="candle-drip" /></span>
        </div>
      ))}
    </div>
  );
}

/**
 * Pauses every decoration animation in the parts of the page that are off screen
 * (hundreds of candles, dew drops and lanterns otherwise keep animating out of sight).
 * Nothing visible changes: a part wakes up shortly before it scrolls into view.
 */
export function usePauseOffscreenDecor() {
  useEffect(() => {
    const parts = document.querySelectorAll<HTMLElement>(".night-page > :is(section, aside, footer)");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) (entry.target as HTMLElement).toggleAttribute("data-offscreen", !entry.isIntersecting);
    }, { rootMargin: "300px 0px" });
    parts.forEach((part) => observer.observe(part));
    return () => { observer.disconnect(); parts.forEach((part) => part.removeAttribute("data-offscreen")); };
  }, []);
}
