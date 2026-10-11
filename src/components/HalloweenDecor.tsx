import pumpkins from "@/assets/halloween-pumpkins.png";
import ghost from "@/assets/halloween-ghost.png";
import witchKit from "@/assets/halloween-witch-kit.png";

export function Cobweb({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`halloween-web ${className}`} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M2 2H118M2 2V118M2 2L112 48M2 2L87 87M2 2L48 112" />
      <path d="M25 2Q22 11 24 11Q21 19 19 19Q11 21 11 24Q11 22 2 25M49 2Q43 20 46 20Q41 36 36 36Q20 41 20 46Q20 43 2 49M74 2Q64 29 69 29Q60 53 53 53Q29 60 29 69Q29 64 2 74M99 2Q86 39 92 39Q80 71 71 71Q39 80 39 92Q39 86 2 99M118 2Q107 48 112 48Q100 85 87 87Q48 100 48 112Q48 107 2 118" />
    </svg>
  );
}

export function Pumpkins({ className = "" }: { className?: string }) {
  return <img src={pumpkins} width={992} height={672} loading="lazy" alt="" aria-hidden="true" className={`halloween-pumpkins ${className}`} />;
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

const motifs = ["ghost", "spider", "moon", "lantern", "witch", "candy", "cat", "potion", "candle", "skull", "broom", "owl", "bat", "bone", "leaf", "crystal", "hat", "eye", "lollipop", "gravestone"] as const;
type Motif = (typeof motifs)[number];

/** Decorative illustrations only: never carry information or intercept input. */
function Illustration({ kind }: { kind: Motif }) {
  if (kind === "ghost" || kind === "witch") {
    return <img src={kind === "ghost" ? ghost : witchKit} alt="" width={kind === "ghost" ? 672 : 992} height={kind === "ghost" ? 992 : 672} loading="lazy" />;
  }
  const drawings: Record<Exclude<Motif, "ghost" | "witch">, React.ReactNode> = {
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
  return <svg viewBox="0 0 100 100" fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{drawings[kind]}</svg>;
}

export function HalloweenScene({ chapter }: { chapter: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <div className={`halloween-scene scene-${chapter}`} aria-hidden="true">
      <div className="halloween-fog">
        {[0, 1, 2].map((n) => <svg key={n} viewBox="0 0 1400 160" preserveAspectRatio="none"><path d="M-100 140Q80 30 220 98T530 85T820 80T1120 90T1500 65L1500 200H-100Z"/><path d="M-100 120Q160 70 290 130T640 100T1000 125T1500 80" fill="none" stroke="currentColor" strokeWidth="35"/></svg>)}
      </div>
      {motifs.slice(chapter * 4, chapter * 4 + 4).map((kind, i) => <div key={kind} data-decoration={kind} className={`halloween-prop prop-${i} prop-${kind}`}><Illustration kind={kind}/></div>)}
    </div>
  );
}