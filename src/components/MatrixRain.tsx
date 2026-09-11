import { useEffect, useRef } from "react";

/** Pluie de caractères style "matrice", rouge néon, discrète, en fond. */
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
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
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

      // fondu bleu-noir : jamais de vert
      ctx.fillStyle = "rgba(5, 7, 12, 0.14)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.font = `${size}px ui-monospace, monospace`;

      for (let i = 0; i < cols; i++) {
        const y = (drops[i] ?? 0) * size;
        const char = glyphs[Math.floor(Math.random() * glyphs.length)] ?? "0";
        const head = Math.random() > 0.985;
        ctx.fillStyle = head
          ? "rgba(255, 170, 175, 0.85)" // tête lumineuse
          : "rgba(255, 40, 60, 0.24)"; // corps rouge néon, discret
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
