import { useEffect, useRef } from "react";

/** Pluie de caractères style "matrice", discrète, en fond. */
export function MatrixRain({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const glyphs = "アカサタナハマヤラワ0123456789ȤRKabcdef<>/{}[]$#@*".split("");
    let cols = 0;
    let drops: number[] = [];
    const size = 16;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(canvas.offsetWidth / size);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 60) return;
      last = t;

      ctx.fillStyle = "rgba(6, 10, 14, 0.14)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.font = `${size}px ui-monospace, monospace`;

      for (let i = 0; i < cols; i++) {
        const y = (drops[i] ?? 0) * size;
        const char = glyphs[Math.floor(Math.random() * glyphs.length)] ?? "0";
        ctx.fillStyle = Math.random() > 0.985 ? "rgba(120, 200, 255, 0.85)" : "rgba(60, 140, 200, 0.45)";
        ctx.fillText(char, i * size, y);
        if (y > canvas.offsetHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i] = (drops[i] ?? 0) + 1;
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} />;
}
