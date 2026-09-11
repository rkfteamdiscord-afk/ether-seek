import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";

/**
 * Enveloppe une carte et lui applique une inclinaison 3D qui suit la souris.
 * Les variables CSS --rx/--ry (rotation) et --mx/--my (reflet) sont posées sur
 * le conteneur puis héritées par l'élément `.card-3d` / `.card-glare` enfant.
 */
export function TiltCard({
  children,
  className = "",
  max = 12,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--ry", `${-(py - 0.5) * max * 2}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ "--mx": "50%", "--my": "50%" } as CSSProperties}
      className={`[perspective:1000px] ${className}`}
    >
      {children}
    </div>
  );
}
