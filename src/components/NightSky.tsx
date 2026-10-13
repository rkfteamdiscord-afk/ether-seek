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
      <div className="night-cloud night-cloud-a" />
      <div className="night-cloud night-cloud-b" />
      <div className="night-cloud night-cloud-c" />
      <div className="ground-fog">
        <span /><span /><span />
      </div>
      <div className="night-grain" />
    </div>
  );
}
