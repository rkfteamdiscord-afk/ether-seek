import { useEffect, useRef } from "react";

/**
 * Magic sparks that trail the mouse pointer. Only for fine pointers without a
 * reduced-motion preference; the canvas never takes clicks and only animates while
 * sparks are alive.
 */
export function CursorSparkles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener("resize", resize);
    const sparks: Array<{ x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number; r: number }> = [];
    let raf = 0, last = 0, running = false;
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "lighter";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i]!;
        spark.life += dt;
        if (spark.life > spark.max) { sparks.splice(i, 1); continue; }
        spark.x += spark.vx * dt; spark.y += spark.vy * dt; spark.vy += 60 * dt;
        const fade = 1 - spark.life / spark.max;
        ctx.globalAlpha = fade;
        ctx.fillStyle = `hsl(${spark.hue}, 100%, 68%)`;
        ctx.beginPath(); ctx.arc(spark.x, spark.y, spark.r * fade + 0.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (sparks.length) raf = requestAnimationFrame(draw);
      else running = false;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      for (let i = 0; i < 2; i++) {
        sparks.push({ x: event.clientX, y: event.clientY, vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.8) * 40, life: 0, max: 0.5 + Math.random() * 0.5, hue: Math.random() < 0.7 ? 30 + Math.random() * 25 : 275 + Math.random() * 30, r: 1 + Math.random() * 2 });
      }
      if (sparks.length > 160) sparks.splice(0, sparks.length - 160);
      if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(draw); }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="cursor-sparkles" aria-hidden="true" />;
}
