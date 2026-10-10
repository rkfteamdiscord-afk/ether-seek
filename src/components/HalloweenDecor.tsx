import pumpkins from "@/assets/halloween-pumpkins.png";

export function Cobweb({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`halloween-web ${className}`} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M2 2H118M2 2V118M2 2L112 48M2 2L87 87M2 2L48 112" />
      <path d="M25 2Q22 11 24 11Q21 19 19 19Q11 21 11 24Q11 22 2 25M49 2Q43 20 46 20Q41 36 36 36Q20 41 20 46Q20 43 2 49M74 2Q64 29 69 29Q60 53 53 53Q29 60 29 69Q29 64 2 74M99 2Q86 39 92 39Q80 71 71 71Q39 80 39 92Q39 86 2 99M118 2Q107 48 112 48Q100 85 87 87Q48 100 48 112Q48 107 2 118" />
    </svg>
  );
}

export function Pumpkins({ className = "" }: { className?: string }) {
  return <img src={pumpkins} width={992} height={672} loading="lazy" alt="" aria-hidden="true" className={`halloween-pumpkins ${className}`} />;
}

export function HalloweenGarland() {
  return (
    <div className="halloween-garland" aria-hidden="true">
      <span className="halloween-string" />
      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
        <svg key={n} viewBox="0 0 80 40" className="halloween-bat" fill="currentColor">
          <path d="M40 17 35 9 33 19C23 9 10 7 1 5L10 27Q16 20 23 31Q29 24 35 35L40 39 45 35Q51 24 57 31Q64 20 70 27L79 5C65 8 55 11 47 19L45 9Z" />
        </svg>
      ))}
    </div>
  );
}