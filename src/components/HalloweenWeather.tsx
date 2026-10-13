import { useEffect, useRef } from "react";

/** Procedural cloud texture and multi-depth rainfall, entirely browser-side. */
export function HalloweenWeather() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const palette = getComputedStyle(document.documentElement);
    const cloud = palette.getPropertyValue("--halloween-smoke").trim();
    const light = palette.getPropertyValue("--deco-light").trim();
    const texture = document.createElement("canvas");
    texture.width = 640; texture.height = 360;
    const paint = texture.getContext("2d");
    if (!paint) return;
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
    const drops = Array.from({ length: 240 }, () => ({ x: Math.random(), y: Math.random(), depth: .3 + Math.random() * .7 }));
    const start = performance.now();
    const draw = (now: number) => {
      const time = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = cloud; ctx.globalAlpha = .55;
      ctx.fillRect(0, 0, width, height);
      for (let layer = 0; layer < 5; layer++) {
        const offset = Math.sin(time * .17 + layer * 1.9) * width * .18;
        ctx.globalAlpha = .65 - layer * .07;
        ctx.drawImage(texture, -width * .3 + offset, -height * .25 + Math.cos(time * .15 + layer) * 45, width * 1.6, height * 1.5);
      }
      ctx.strokeStyle = light;
      for (const drop of drops) {
        const y = ((drop.y + time * (.5 + drop.depth * .7)) % 1) * (height + 80) - 40;
        const x = (drop.x * width - time * 100 * drop.depth + width * 10) % width;
        ctx.globalAlpha = .12 + drop.depth * .32;
        ctx.lineWidth = .5 + drop.depth;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5 * drop.depth, y + 12 + drop.depth * 22); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="arrival-weather" aria-hidden="true" />;
}