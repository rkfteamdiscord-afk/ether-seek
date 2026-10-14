import { useEffect, useRef } from "react";
import fogTexture from "@/assets/halloween-fog-texture.jpg";

/**
 * Procedural night weather, entirely browser-side.
 * "back" paints the violet fog bank and distant rain; "front" adds heavy close
 * rain and splashes on a transparent canvas, so scenery can sit between them.
 */
export function HalloweenWeather({ layer = "back" }: { layer?: "back" | "front" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const palette = getComputedStyle(document.documentElement);
    const cloud = palette.getPropertyValue("--halloween-smoke").trim();
    const light = palette.getPropertyValue("--deco-light").trim();
    const night = palette.getPropertyValue("--night-deep").trim();
    const texture = document.createElement("canvas");
    texture.width = 640; texture.height = 360;
    const paint = texture.getContext("2d");
    if (!paint) return;
    const photograph = new Image();
    photograph.src = fogTexture;
    for (let i = 0; i < 160; i++) {
      const x = Math.random() * 640, y = Math.random() * 360;
      const radius = 30 + Math.random() * 100;
      const gradient = paint.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, i % 3 === 0 ? light : cloud);
      gradient.addColorStop(1, "transparent");
      paint.globalAlpha = .035 + Math.random() * .09;
      paint.fillStyle = gradient;
      paint.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    let width = 0, height = 0, raf = 0;
    const resize = () => {
      width = window.innerWidth; height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener("resize", resize);
    const front = layer === "front";
    const drops = Array.from({ length: front ? 170 : 260 }, () => ({ x: Math.random(), y: Math.random(), depth: front ? .75 + Math.random() * .25 : .25 + Math.random() * .5 }));
    const splashes: Array<{ x: number; y: number; age: number }> = [];
    const start = performance.now();
    let previous = start;
    const draw = (now: number) => {
      const time = (now - start) / 1000;
      const dt = Math.min((now - previous) / 1000, .05);
      previous = now;
      ctx.clearRect(0, 0, width, height);
      if (!front) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = night; ctx.globalAlpha = .9;
        ctx.fillRect(0, 0, width, height);
        // The fog photograph is screened on top of the night so it glows instead of greying out.
        ctx.globalCompositeOperation = "screen";
        for (let layerIndex = 0; layerIndex < 5; layerIndex++) {
          const offset = Math.sin(time * .17 + layerIndex * 1.9) * width * .18;
          ctx.globalAlpha = layerIndex === 0 ? .3 : .1;
          const source = photograph.complete && photograph.naturalWidth > 0 ? photograph : texture;
          ctx.drawImage(source, -width * .3 + offset, -height * .25 + Math.cos(time * .15 + layerIndex) * 65, width * 1.6, height * 1.5);
        }
        // Tint the bank violet so it reads as a Halloween night rather than a grey sky.
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = .55; ctx.fillStyle = "rgb(120, 92, 175)";
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        const haze = ctx.createLinearGradient(0, 0, 0, height);
        haze.addColorStop(0, "transparent"); haze.addColorStop(1, cloud);
        ctx.globalAlpha = .45; ctx.fillStyle = haze; ctx.fillRect(0, 0, width, height);
      }
      ctx.strokeStyle = light;
      for (const drop of drops) {
        const fall = (drop.y + time * (.55 + drop.depth * .9)) % 1;
        const y = fall * (height + 80) - 40;
        const x = (drop.x * width - time * 120 * drop.depth + width * 10) % width;
        ctx.globalAlpha = front ? .28 + drop.depth * .3 : .1 + drop.depth * .3;
        ctx.lineWidth = front ? 1 + drop.depth * .8 : .5 + drop.depth;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6 * drop.depth, y + 14 + drop.depth * (front ? 34 : 22)); ctx.stroke();
        if (front && fall > .985 && splashes.length < 60) splashes.push({ x, y: height - 8 - Math.random() * 30, age: 0 });
      }
      if (front) {
        ctx.lineWidth = 1.1;
        for (let i = splashes.length - 1; i >= 0; i--) {
          const splash = splashes[i]!;
          splash.age += dt;
          if (splash.age > .45) { splashes.splice(i, 1); continue; }
          const progress = splash.age / .45;
          ctx.globalAlpha = (1 - progress) * .55;
          ctx.beginPath(); ctx.ellipse(splash.x, splash.y, 3 + progress * 12, 1 + progress * 3, 0, Math.PI, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [layer]);
  return <canvas ref={ref} className={`arrival-weather arrival-weather-${layer}`} aria-hidden="true" />;
}
