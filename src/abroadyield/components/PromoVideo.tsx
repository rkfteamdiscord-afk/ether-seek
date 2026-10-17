import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./motion";

/**
 * The 9:16 promo film (source: video/abroadyield-promo, rendered with Remotion; original
 * soundtrack). Plays muted and looped while on screen, as browsers only autoplay without sound;
 * the visitor turns sound on with one tap. With reduced motion it waits for a tap on play.
 */
export function PromoVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const auto = !prefersReducedMotion();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) el.pause();
        else if (auto && !userPaused) void el.play().catch(() => {});
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [userPaused]);

  const toggleSound = () => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted) {
      if (el.ended || el.currentTime > el.duration - 0.5) el.currentTime = 0;
      setUserPaused(false);
      void el.play().catch(() => {});
    }
  };
  const togglePlay = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      setUserPaused(false);
      void el.play().catch(() => {});
    } else {
      setUserPaused(true);
      el.pause();
    }
  };

  return (
    <div className="ay-phone relative mx-auto w-full max-w-[340px]">
      <video
        ref={video}
        className="block aspect-[9/16] w-full rounded-[34px] bg-ay-navy object-cover"
        src="/abroadyield/video/abroadyield-promo.mp4"
        poster="/abroadyield/video/abroadyield-promo-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="AbroadYield in 24 seconds: destinations, the real after-tax return, the free ranking, the report and US tax features"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="absolute inset-x-0 bottom-7 flex justify-center gap-2">
        <button
          type="button"
          onClick={toggleSound}
          className="ay-btn inline-flex min-h-11 items-center gap-2 rounded-full bg-white/90 px-5 font-semibold text-ay-ink shadow-lg backdrop-blur-md"
        >
          {muted ? (
            <VolumeX aria-hidden className="size-5" />
          ) : (
            <Volume2 aria-hidden className="size-5" />
          )}
          {muted ? "Sound on" : "Sound off"}
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause video" : "Play video"}
          className="ay-btn inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-ay-ink shadow-lg backdrop-blur-md"
        >
          {playing ? (
            <Pause aria-hidden className="size-5" />
          ) : (
            <Play aria-hidden className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
