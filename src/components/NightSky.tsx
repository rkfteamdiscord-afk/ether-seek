import flyingWitch from "@/assets/halloween-flying-witch.png";
import { FogShader } from "./FogShader";

/* Fixed Halloween night behind the page: glows, moon, drifting clouds, shooting stars,
   bats crossing the moon, stars and grain. Purely decorative, hidden from assistive tech
   and never clickable. */
function SkyBat({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 80 40" className={`sky-bat ${className}`} fill="currentColor">
      <g className="sky-bat-wings">
        <path d="M40 17 35 9 33 19C23 9 10 7 1 5L10 27Q16 20 23 31Q29 24 35 35L40 39 45 35Q51 24 57 31Q64 20 70 27L79 5C65 8 55 11 47 19L45 9Z" />
      </g>
    </svg>
  );
}

// Fixed positions keep server and browser renders identical.
const fireflies = [[6, 62], [13, 30], [21, 78], [29, 48], [38, 86], [47, 70], [55, 40], [63, 82], [71, 58], [79, 26], [86, 74], [93, 44], [17, 54], [67, 34]] as const;
const leaves = [[4, 0], [16, 6], [31, 3], [46, 9], [58, 2], [72, 7], [84, 4], [95, 10]] as const;

export function NightSky() {
  return (
    <div className="night-sky" aria-hidden="true">
      <div className="night-glow night-glow-violet" />
      <div className="night-glow night-glow-ember" />
      <div className="night-stars" />
      <div className="night-stars night-stars-far" />
      <span className="shooting-star shooting-star-a" />
      <span className="shooting-star shooting-star-b" />
      <div className="night-moon">
        <span className="night-moon-crater" />
        <span className="night-moon-crater" />
        <span className="night-moon-crater" />
      </div>
      <div className="sky-bats">
        <SkyBat className="sky-bat-1" />
        <SkyBat className="sky-bat-2" />
        <SkyBat className="sky-bat-3" />
      </div>
      <img src={flyingWitch} alt="" className="sky-witch" />
      <div className="night-cloud night-cloud-a" />
      <div className="night-cloud night-cloud-b" />
      <div className="night-cloud night-cloud-c" />
      <div className="fireflies">
        {fireflies.map(([x, y], i) => <span key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-(i * 1.7) % 9}s, ${-(i * 0.9) % 3}s` }} />)}
      </div>
      <div className="falling-leaves">
        {leaves.map(([x, delay], i) => (
          <svg key={i} viewBox="0 0 100 100" style={{ left: `${x}%`, animationDelay: `${-delay * 2.3}s` }} className={`falling-leaf leaf-${i % 3}`}>
            <path d="m50 10 9 24 19-12-3 27 17 5-20 17-22 5-22-5L8 54l17-5-3-27 19 12Z" />
          </svg>
        ))}
      </div>
      <div className="sky-flash" />
      <svg className="sky-bolt" viewBox="0 0 60 300" fill="none"><path d="M38 0 22 92l14 4-26 96 12 3L2 300l40-128-13-3 22-80-14-4Z" /></svg>
      <FogShader variant="ground" />
      <div className="night-grain" />
    </div>
  );
}
