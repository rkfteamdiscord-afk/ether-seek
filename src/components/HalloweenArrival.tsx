import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { halloweenOffer } from "@/lib/seasonal-offer";
import pumpkins from "@/assets/halloween-pumpkins.png";
import { ArrowRight, Check, X } from "lucide-react";
import { HalloweenWeather } from "./HalloweenWeather";
import flyingWitch from "@/assets/halloween-flying-witch.png";

export type HalloweenPhase = "arrival" | "releasing" | "ready" | "revealed";

export function FlyingWitch() {
  return <img src={flyingWitch} width={1024} height={768} alt="" aria-hidden="true" className="flying-witch-image" />;
}

function LegacyWitch() {
  return <svg viewBox="0 0 240 180" fill="none" aria-hidden="true">
    <path d="M19 136 215 108M19 126 7 141 30 153 47 133" className="deco-gold" strokeWidth="8" strokeLinecap="round" />
    <path d="M95 65Q60 74 69 110L120 124 147 94 116 73Z" className="deco-violet" />
    <path d="m116 115 24 24 29-7m-71-15 22 34 30-1" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
    <circle cx="112" cy="54" r="21" className="deco-light" />
    <path d="m126 51 17 9-17 5" className="deco-light" />
    <path d="M75 41 98 5 128 40Z" className="deco-violet" /><path d="M67 42H141" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
    <path d="M106 80 148 87 164 66" className="deco-light" strokeWidth="9" strokeLinecap="round" />
    <path d="m160 64 33-29" className="deco-gold" strokeWidth="5" />
    <path d="M166 102Q181 90 198 102L211 150Q184 168 157 148Z" className="deco-orange" />
    <path d="M170 103Q183 75 198 103" stroke="currentColor" strokeWidth="4" />
    <path d="m174 137 6-8 7 9 7-9 6 8" className="deco-gold" />
    <circle cx="122" cy="53" r="3" fill="currentColor" />
  </svg>;
}

export function WitchDuel() {
  return <div className="witch-duel" aria-hidden="true">
    <div className="duelist duelist-left"><FlyingWitch /></div>
    <div className="duelist duelist-right"><FlyingWitch /></div>
    <svg className="duel-spells" viewBox="0 0 1000 250" preserveAspectRatio="none" fill="none">
      <path className="spell spell-a" d="M100 160Q430-80 900 130" />
      <path className="spell spell-b" d="M900 150Q560 300 100 140" />
      <path className="spell spell-c" d="M120 140Q520 10 880 150" />
    </svg>
    <span className="duel-spark">✦</span>
  </div>;
}

export function HalloweenArrival({ phase, onPhaseChange }: { phase: HalloweenPhase; onPhaseChange: (phase: HalloweenPhase) => void }) {
  const [open, setOpen] = useState(false);
  const flightRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (revealTimer.current) clearTimeout(revealTimer.current); }, []);
  useEffect(() => {
    // Clear a remembered contact anchor only on entry, not after an intentional CTA click.
    if (window.location.hash === "#contact") window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });
    const frame = requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
    return () => { cancelAnimationFrame(frame); window.history.scrollRestoration = previous; };
  }, []);
  useEffect(() => {
    if (phase !== "arrival") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onPhaseChange("ready");
      return;
    }
    const headerLogo = document.querySelector<HTMLElement>("[data-header-logo]");
    const flight = flightRef.current;
    const logo = logoRef.current;
    if (!headerLogo || !flight || !logo) { onPhaseChange("ready"); return; }
    const rect = headerLogo.getBoundingClientRect();
    const size = window.innerWidth < 640 ? 170 : 230;
    // Reach with the left hand, so the character stays inside the screen.
    const pickupX = rect.left + rect.width - size * .04;
    const pickupY = rect.top + rect.height / 2 - size * .29;
    const bagX = pickupX + size * .56;
    const bagY = pickupY + size * .5;
    const duration = 12000;
    const animations = [flight.animate([
      { transform: `translate(-260px, 220px) rotate(-15deg)`, offset: 0 },
      { transform: `translate(${window.innerWidth * .45}px, 180px) rotate(0deg)`, offset: .12 },
      { transform: `translate(${window.innerWidth * .48}px, 60px) rotate(180deg)`, offset: .19 },
      { transform: `translate(${window.innerWidth * .3}px, 210px) rotate(360deg)`, offset: .26 },
      { transform: `translate(${pickupX}px, ${pickupY}px) rotate(360deg)`, offset: .32 },
      { transform: `translate(${pickupX}px, ${pickupY}px) rotate(360deg)`, offset: .38 },
      { transform: `translate(${window.innerWidth * .65}px, 160px) rotate(370deg)`, offset: .47 },
      { transform: `translate(${window.innerWidth + 260}px, 100px) rotate(360deg)`, offset: .55 },
      { transform: `translate(${window.innerWidth * .65}px, 180px) rotate(355deg)`, offset: .75 },
      { transform: `translate(${pickupX}px, ${pickupY}px) rotate(360deg)`, offset: .86 },
      { transform: `translate(${pickupX}px, ${pickupY}px) rotate(360deg)`, offset: .9 },
      { transform: `translate(${window.innerWidth + 260}px, -180px) rotate(340deg)`, offset: 1 },
    ], { duration, fill: "both", easing: "linear" }),
    headerLogo.animate([{ opacity: 1, offset: 0 }, { opacity: 1, offset: .33 }, { opacity: 0, offset: .34 }, { opacity: 0, offset: .89 }, { opacity: 1, offset: .9 }, { opacity: 1 }], { duration, fill: "both" }),
    logo.animate([
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)`, opacity: 0, offset: 0 },
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)`, opacity: 0, offset: .33 },
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)`, opacity: 1, offset: .34 },
      { transform: `translate(${bagX}px, ${bagY}px) scale(.55) rotate(20deg)`, opacity: 1, offset: .375 },
      { transform: `translate(${bagX}px, ${bagY + 15}px) scale(.1)`, opacity: 0, offset: .39 },
      { transform: `translate(${bagX}px, ${bagY}px) scale(.15)`, opacity: 0, offset: .86 },
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)`, opacity: 1, offset: .89 },
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)`, opacity: 0, offset: .9 },
      { opacity: 0, offset: 1 },
    ], { duration, fill: "both" })];
    const take = window.setTimeout(() => headerLogo.setAttribute("data-stolen", "true"), duration * .34);
    const restore = window.setTimeout(() => headerLogo.removeAttribute("data-stolen"), duration * .9);
    const timer = window.setTimeout(() => onPhaseChange("releasing"), duration);
    return () => { window.clearTimeout(take); window.clearTimeout(restore); window.clearTimeout(timer); headerLogo.removeAttribute("data-stolen"); animations.forEach(animation => animation.cancel()); };
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase !== "releasing") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { onPhaseChange("ready"); return; }
    const originX = window.innerWidth - 85, originY = window.innerHeight - 70;
    const animations = Array.from(document.querySelectorAll<HTMLElement>("[data-decoration]")).map((element, index) => {
      const rect = element.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return null;
      const x = originX - rect.left, y = originY - rect.top;
      return element.animate([
        { translate: `${x}px ${y}px`, rotate: "-160deg", scale: ".2", opacity: 0 },
        { translate: `${x * .45}px ${Math.min(y - 180, -120)}px`, rotate: "80deg", scale: ".85", opacity: 1, offset: .5 },
        { translate: "0px 0px", rotate: "0deg", scale: "1", opacity: 1 },
      ], { duration: 1500, delay: 650 + index * 18, easing: "cubic-bezier(.2,.65,.3,1)", fill: "backwards" });
    });
    const timer = window.setTimeout(() => onPhaseChange("ready"), 3000);
    return () => { clearTimeout(timer); animations.forEach(animation => animation?.cancel()); };
  }, [phase, onPhaseChange]);

  return <>
    {phase === "arrival" && <div className="halloween-arrival">
      <div ref={flightRef} className="arrival-flight" aria-hidden="true"><FlyingWitch /><span className="stolen-zrk">Ȥrk</span></div>
      <div ref={logoRef} className="arrival-logo" aria-hidden="true">Ȥrk<span>.</span></div>
      <div className="arrival-mist" aria-hidden="true"><HalloweenWeather /></div>
      <div className="arrival-version" aria-hidden="true"><img src={pumpkins} alt="" /><strong>Ȥrk Halloween</strong><span>version 11.3.2</span><img src={pumpkins} alt="" /></div>
      <Button variant="outline" size="sm" className="arrival-skip" onClick={() => onPhaseChange("ready")}><X className="h-4 w-4" /> Passer l’animation</Button>
    </div>}
    {phase === "ready" && <div className="pumpkin-surprise">
      <Button variant="ghost" className="pumpkin-trigger" aria-label="Clique sur la citrouille" onClick={() => { onPhaseChange("revealed"); setOpen(true); }}>
        <img src={pumpkins} alt="" /><span>Clique dessus !</span>
      </Button>
    </div>}
    {phase === "releasing" && <div className="candy-burst" aria-hidden="true"><div className="reveal-witch"><FlyingWitch /></div>{Array.from({ length: 32 }, (_, i) => <span key={i} className={`burst-candy candy-${i % 16}`}><svg width="32" height="24" viewBox="0 0 80 50"><path d="m22 14-18-9 4 20-4 20 18-9m36-22 18-9-4 20 4 20-18-9" className="deco-violet" /><rect x="20" y="8" width="40" height="34" rx="10" className="deco-orange" /><path d="m31 10 12 30m1-30 12 30" fill="none" className="deco-gold" strokeWidth="5" /></svg></span>)}</div>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border-seasonal/30 text-center">
        <img src={pumpkins} alt="" className="mx-auto h-32 w-48 object-contain" />
        <DialogHeader><DialogTitle className="text-center font-display text-3xl">Bravo !</DialogTitle><DialogDescription className="text-center text-base">Tu as −{halloweenOffer.discountPercent} % sur toutes les prestations avec le code</DialogDescription></DialogHeader>
        <strong className="rounded-md border border-dashed border-seasonal bg-seasonal-soft py-4 font-mono text-2xl text-seasonal">{halloweenOffer.code}</strong>
        <Button asChild onClick={() => setOpen(false)}><a href="#contact">Contacter Ȥrk <ArrowRight className="h-4 w-4" /></a></Button>
        <Button variant="ghost" onClick={() => setOpen(false)}><Check className="h-4 w-4" /> Continuer la visite</Button>
      </DialogContent>
    </Dialog>
  </>;
}