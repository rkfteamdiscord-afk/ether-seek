import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { halloweenOffer } from "@/lib/seasonal-offer";
import { PumpkinPatch } from "./RealPumpkin";
import { ArrowRight, Check, X } from "lucide-react";
import { HalloweenWeather } from "./HalloweenWeather";
import { HalloweenStaircase } from "./HalloweenStaircase";
import { FogShader } from "./FogShader";
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

type Waypoint = { t: number; x: number; y: number; loop?: boolean };

/** Smooth Catmull-Rom flight through each group of waypoints, banking with the direction of travel. */
function flightKeyframes(flights: Waypoint[][]): Keyframe[] {
  const frames: Keyframe[] = [];
  const frame = (offset: number, x: number, y: number, bank: number, opacity: number) =>
    frames.push({ offset, opacity, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${bank.toFixed(1)}deg)` });
  flights.forEach((points, flightIndex) => {
    const first = points[0]!, last = points[points.length - 1]!;
    // Turns already completed in this flight, so a loop-the-loop never unwinds afterwards.
    let turns = 0, previousAngle = 0;
    if (flightIndex > 0) frame(Math.max(first.t - .001, frames.at(-1)?.offset as number ?? 0), first.x, first.y, 0, 0);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)]!, p1 = points[i]!, p2 = points[i + 1]!, p3 = points[Math.min(i + 2, points.length - 1)]!;
      const hold = p1.x === p2.x && p1.y === p2.y;
      const samples = hold ? 8 : p1.loop ? 22 : 14;
      for (let step = 0; step < samples; step++) {
        const u = step / samples, u2 = u * u, u3 = u2 * u;
        const at = (a: number, b: number, c: number, d: number) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        const slope = (a: number, b: number, c: number, d: number) => .5 * ((-a + c) + 2 * (2 * a - 5 * b + 4 * c - d) * u + 3 * (-a + 3 * b - 3 * c + d) * u2);
        const x = at(p0.x, p1.x, p2.x, p3.x), y = at(p0.y, p1.y, p2.y, p3.y);
        const dx = slope(p0.x, p1.x, p2.x, p3.x), dy = slope(p0.y, p1.y, p2.y, p3.y);
        const offset = p1.t + (p2.t - p1.t) * u;
        let bank: number;
        if (p1.loop) {
          // Follow the full direction of travel, unwrapped, so she rolls right round.
          let angle = Math.atan2(dy, dx) * 180 / Math.PI;
          while (angle - previousAngle > 180) angle -= 360;
          while (angle - previousAngle < -180) angle += 360;
          previousAngle = angle;
          bank = angle;
          turns = Math.round(angle / 360);
        } else {
          // Hovering wobbles on the broom; cruising banks into the turn.
          bank = (hold ? Math.sin(offset * 420) * 6 : Math.max(-24, Math.min(24, Math.atan2(dy, Math.max(Math.abs(dx), 1)) * 180 / Math.PI * .6))) + turns * 360;
          previousAngle = bank;
        }
        const bob = hold ? Math.sin(offset * 260) * 5 : Math.sin(offset * 90) * 7;
        frame(offset, x, y + bob, bank, 1);
      }
    }
    frame(last.t, last.x, last.y, turns * 360, 1);
    if (flightIndex < flights.length - 1) frame(Math.min(last.t + .001, 1), last.x, last.y, turns * 360, 0);
  });
  return frames;
}

type Burst = { at: number; x: number; y: number };

/** Golden sparks shed from the broom, plus a burst wherever the logo changes hands. */
function sparkleTrail(canvas: HTMLCanvasElement, flight: HTMLElement, size: number, bursts: Burst[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const dpr = Math.min(window.devicePixelRatio, 1.5);
  canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sparks: Array<{ x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number; r: number }> = [];
  const start = performance.now();
  let previous = start, raf = 0;
  const pending = [...bursts];
  const draw = (now: number) => {
    const dt = Math.min((now - previous) / 1000, .05);
    previous = now;
    const box = flight.getBoundingClientRect();
    const visible = Number(getComputedStyle(flight).opacity) > .5 && box.right > 0 && box.left < window.innerWidth && box.bottom > 0;
    if (visible) for (let i = 0; i < 3; i++) {
      sparks.push({ x: box.left + size * (.08 + Math.random() * .08), y: box.top + size * (.6 + Math.random() * .1), vx: -20 - Math.random() * 50, vy: -10 + Math.random() * 40, life: 0, max: .6 + Math.random() * .7, hue: 55 + Math.random() * 40, r: 1 + Math.random() * 2.4 });
    }
    while (pending[0] && now - start >= pending[0].at) {
      const burst = pending.shift()!;
      for (let i = 0; i < 46; i++) {
        const angle = Math.random() * Math.PI * 2, speed = 60 + Math.random() * 170;
        sparks.push({ x: burst.x, y: burst.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: .7 + Math.random() * .6, hue: 50 + Math.random() * 60, r: 1.5 + Math.random() * 2.5 });
      }
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "lighter";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i]!;
      spark.life += dt;
      if (spark.life > spark.max) { sparks.splice(i, 1); continue; }
      spark.x += spark.vx * dt; spark.y += spark.vy * dt; spark.vy += 40 * dt; spark.vx *= .985;
      const fade = 1 - spark.life / spark.max;
      ctx.globalAlpha = fade;
      ctx.fillStyle = `hsl(${spark.hue - 20}, 100%, 68%)`;
      ctx.beginPath(); ctx.arc(spark.x, spark.y, spark.r * (.4 + fade * .6), 0, Math.PI * 2); ctx.fill();
      if (spark.r > 2.6) { ctx.globalAlpha = fade * .25; ctx.beginPath(); ctx.arc(spark.x, spark.y, spark.r * 3, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(raf);
}

export function HalloweenArrival({ phase, onPhaseChange }: { phase: HalloweenPhase; onPhaseChange: (phase: HalloweenPhase) => void }) {
  const [open, setOpen] = useState(false);
  const flightRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);
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
    const trail = trailRef.current;
    if (!headerLogo || !flight || !logo) { onPhaseChange("ready"); return; }
    const rect = headerLogo.getBoundingClientRect();
    const width = window.innerWidth, height = window.innerHeight;
    const size = width < 640 ? 170 : 230;
    // Reach with the left hand, so the character stays inside the screen.
    const pickupX = rect.left + rect.width - size * .04;
    const pickupY = rect.top + rect.height / 2 - size * .29;
    const bagX = pickupX + size * .56;
    const bagY = pickupY + size * .5;
    const duration = 12000;
    const grab = .31, giveBack = .86;
    const pickup = { x: pickupX, y: pickupY };
    // Three flights, always heading right; the cuts between them happen off screen.
    const flights: Waypoint[][] = [
      [
        { t: 0, x: -size, y: height * .5 },
        { t: .05, x: width * .24, y: height * .38 },
        // Loop-the-loop in the middle of the screen.
        { t: .085, x: width * .44, y: height * .5, loop: true },
        { t: .11, x: width * .56, y: height * .32, loop: true },
        { t: .135, x: width * .46, y: height * .12, loop: true },
        { t: .16, x: width * .35, y: height * .3, loop: true },
        { t: .175, x: width * .46, y: height * .48 },
        { t: .195, x: width + size * .4, y: height * .14 },
      ],
      [
        { t: .205, x: -size * 1.1, y: -size * .6 },
        { t: .26, x: pickupX - width * .12, y: pickupY + height * .12 },
        { t: grab, ...pickup },
        { t: .36, ...pickup },
        { t: .41, x: width * .48, y: height * .3 },
        { t: .47, x: width + size * .3, y: height * .08 },
      ],
      [
        { t: .7, x: -size, y: height * .38 },
        { t: .77, x: width * .2, y: height * .3 },
        { t: giveBack - .02, x: pickupX + 10, y: pickupY + 30 },
        { t: giveBack, ...pickup },
        { t: .9, ...pickup },
        { t: .95, x: width * .55, y: height * .1 },
        { t: 1, x: width + size, y: -size },
      ],
    ];
    const animations = [flight.animate(flightKeyframes(flights), { duration, fill: "both", easing: "linear" }),
    headerLogo.animate([{ opacity: 1, offset: 0 }, { opacity: 1, offset: grab + .02 }, { opacity: 0, offset: grab + .03 }, { opacity: 0, offset: giveBack + .02 }, { opacity: 1, offset: giveBack + .03 }, { opacity: 1 }], { duration, fill: "both" }),
    logo.animate([
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)`, opacity: 0, offset: 0 },
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)`, opacity: 0, offset: grab + .02 },
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1.25) rotate(-8deg)`, opacity: 1, offset: grab + .03 },
      { transform: `translate(${bagX}px, ${bagY}px) scale(.55) rotate(20deg)`, opacity: 1, offset: grab + .06 },
      { transform: `translate(${bagX}px, ${bagY + 15}px) scale(.1)`, opacity: 0, offset: grab + .075 },
      { transform: `translate(${bagX}px, ${bagY}px) scale(.15)`, opacity: 0, offset: giveBack - .005 },
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1.25) rotate(8deg)`, opacity: 1, offset: giveBack + .02 },
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)`, opacity: 1, offset: giveBack + .028 },
      { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)`, opacity: 0, offset: giveBack + .03 },
      { opacity: 0, offset: 1 },
    ], { duration, fill: "both" })];
    const stopTrail = trail ? sparkleTrail(trail, flight, size, [
      { at: duration * (grab + .025), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      { at: duration * (giveBack + .02), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    ]) : () => {};
    const take = window.setTimeout(() => headerLogo.setAttribute("data-stolen", "true"), duration * (grab + .03));
    const restore = window.setTimeout(() => headerLogo.removeAttribute("data-stolen"), duration * (giveBack + .03));
    const timer = window.setTimeout(() => onPhaseChange("releasing"), duration);
    return () => { stopTrail(); window.clearTimeout(take); window.clearTimeout(restore); window.clearTimeout(timer); headerLogo.removeAttribute("data-stolen"); animations.forEach(animation => animation.cancel()); };
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
      <div className="arrival-vignette" aria-hidden="true" />
      <div className="arrival-blackout" aria-hidden="true">
        <svg className="arrival-bolt" viewBox="0 0 120 600" fill="none"><path d="M76 0 44 180l28 8-52 190 24 6L4 600l80-256-26-6 44-160-28-8Z" /><path d="m58 250-40 60m66-130 30 50" /></svg>
      </div>
      <div className="arrival-mist" aria-hidden="true">
        <HalloweenWeather layer="back" />
        <div className="arrival-stairs-stage"><HalloweenStaircase /></div>
        <FogShader variant="dense" />
        <div className="arrival-fog-drift"><span /><span /><span /></div>
        <HalloweenWeather layer="front" />
      </div>
      <div className="arrival-flash" aria-hidden="true" />
      <div className="arrival-version" aria-hidden="true"><strong>Ȥrk <em>Halloween</em></strong><span>version 11.3.2</span></div>
      <canvas ref={trailRef} className="arrival-trail" aria-hidden="true" />
      <div ref={flightRef} className="arrival-flight" aria-hidden="true"><FlyingWitch /><span className="stolen-zrk">Ȥrk</span></div>
      <div ref={logoRef} className="arrival-logo" aria-hidden="true">Ȥrk<span>.</span></div>
      <Button variant="outline" size="sm" className="arrival-skip" onClick={() => onPhaseChange("ready")}><X className="h-4 w-4" /> Passer l’animation</Button>
    </div>}
    {phase === "ready" && <div className="pumpkin-surprise">
      <Button variant="ghost" className="pumpkin-trigger" aria-label="Clique sur la citrouille" onClick={() => { onPhaseChange("revealed"); setOpen(true); }}>
        <PumpkinPatch className="pumpkin-trigger-art" /><span>Clique dessus !</span>
      </Button>
    </div>}
    {phase === "releasing" && <div className="candy-burst" aria-hidden="true"><div className="reveal-witch"><FlyingWitch /></div>{Array.from({ length: 32 }, (_, i) => <span key={i} className={`burst-candy candy-${i % 16}`}><svg width="32" height="24" viewBox="0 0 80 50"><path d="m22 14-18-9 4 20-4 20 18-9m36-22 18-9-4 20 4 20-18-9" className="deco-violet" /><rect x="20" y="8" width="40" height="34" rx="10" className="deco-orange" /><path d="m31 10 12 30m1-30 12 30" fill="none" className="deco-gold" strokeWidth="5" /></svg></span>)}</div>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border-seasonal/30 text-center">
        <PumpkinPatch className="mx-auto h-32 w-48" />
        <DialogHeader><DialogTitle className="text-center font-display text-3xl">Bravo !</DialogTitle><DialogDescription className="text-center text-base">Tu as −{halloweenOffer.discountPercent} % sur toutes les prestations avec le code</DialogDescription></DialogHeader>
        <strong className="rounded-md border border-dashed border-seasonal bg-seasonal-soft py-4 font-mono text-2xl text-seasonal">{halloweenOffer.code}</strong>
        <Button asChild onClick={() => setOpen(false)}><a href="#contact">Contacter Ȥrk <ArrowRight className="h-4 w-4" /></a></Button>
        <Button variant="ghost" onClick={() => setOpen(false)}><Check className="h-4 w-4" /> Continuer la visite</Button>
      </DialogContent>
    </Dialog>
  </>;
}