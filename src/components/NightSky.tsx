/* Fixed Halloween night behind the page: glows, moon, stars and grain.
   Purely decorative, hidden from assistive tech and never clickable. */
export function NightSky() {
  return (
    <div className="night-sky" aria-hidden="true">
      <div className="night-glow night-glow-violet" />
      <div className="night-glow night-glow-ember" />
      <div className="night-stars" />
      <div className="night-stars night-stars-far" />
      <div className="night-moon">
        <span className="night-moon-crater" />
        <span className="night-moon-crater" />
        <span className="night-moon-crater" />
      </div>
      <div className="night-grain" />
    </div>
  );
}
