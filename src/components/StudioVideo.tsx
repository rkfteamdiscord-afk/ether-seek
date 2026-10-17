import { useEffect, useRef } from "react";

/**
 * The studio's 30-second vertical video, shown in a glass phone frame.
 * It plays muted while it is on screen and pauses when scrolled away; with
 * reduced motion it never starts by itself, and the controls are always there.
 */
export function StudioVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) element.play().catch(() => undefined);
      else element.pause();
    }, { threshold: 0.4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="studio-video">
      <video
        ref={video}
        src="/zrk-video.mp4"
        poster="/zrk-video-poster.jpg"
        muted
        loop
        playsInline
        controls
        preload="metadata"
        aria-label="Vidéo de présentation du studio Ȥrk : sites web, applications mobiles, bots et cybersécurité"
      />
    </div>
  );
}
