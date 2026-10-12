import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { halloweenOffer } from "@/lib/seasonal-offer";
import pumpkins from "@/assets/halloween-pumpkins.png";
import { ArrowRight, Check, X } from "lucide-react";

export type HalloweenPhase = "arrival" | "ready" | "revealed";

export function FlyingWitch() {
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
  useEffect(() => {
    if (phase !== "arrival") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onPhaseChange("ready");
      return;
    }
    const timer = window.setTimeout(() => onPhaseChange("ready"), 8500);
    return () => window.clearTimeout(timer);
  }, [phase, onPhaseChange]);

  return <>
    {phase === "arrival" && <div className="halloween-arrival">
      <div className="arrival-flight" aria-hidden="true"><FlyingWitch /><span className="stolen-zrk">Ȥrk</span></div>
      <div className="arrival-logo" aria-hidden="true">Ȥrk</div>
      <div className="arrival-mist" aria-hidden="true"><span /><span /><span /></div>
      <Button variant="outline" size="sm" className="arrival-skip" onClick={() => onPhaseChange("ready")}><X className="h-4 w-4" /> Passer l’animation</Button>
    </div>}
    {phase === "ready" && <div className="pumpkin-surprise">
      <Button variant="ghost" className="pumpkin-trigger" aria-label="Clique sur la citrouille" onClick={() => { onPhaseChange("revealed"); setOpen(true); }}>
        <img src={pumpkins} alt="" /><span>Clique dessus !</span>
      </Button>
    </div>}
    {phase === "revealed" && <div className="candy-burst" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <span key={i} className={`burst-candy candy-${i}`}><svg width="32" height="24" viewBox="0 0 80 50"><path d="m22 14-18-9 4 20-4 20 18-9m36-22 18-9-4 20 4 20-18-9" className="deco-violet" /><rect x="20" y="8" width="40" height="34" rx="10" className="deco-orange" /><path d="m31 10 12 30m1-30 12 30" fill="none" className="deco-gold" strokeWidth="5" /></svg></span>)}</div>}
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