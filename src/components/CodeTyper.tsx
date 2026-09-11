import { useEffect, useRef, useState } from "react";

const LINES = [
  "$ ssh zrk@prod --secure",
  "> établissement du tunnel chiffré…",
  "const bot = new Client({ intents: ALL });",
  "await bot.login(process.env.TOKEN);",
  "audit(): 0 faille critique détectée",
  "app.listen(443, () => log('online 24/7'));",
  "✓ build livré — client notifié",
];

/** Terminal qui tape du code caractère par caractère, en boucle. */
export function CodeTyper({ className = "" }: { className?: string }) {
  const [display, setDisplay] = useState<string[]>([""]);
  const st = useRef({ line: 0, char: 0, done: [] as string[] });

  useEffect(() => {
    let timer: number;
    const tick = () => {
      const s = st.current;
      const full = LINES[s.line] ?? "";
      if (s.char <= full.length) {
        setDisplay([...s.done, full.slice(0, s.char)]);
        s.char += 1;
        timer = window.setTimeout(tick, 26 + Math.random() * 46);
        return;
      }
      s.done = [...s.done, full];
      s.line += 1;
      s.char = 0;
      if (s.line >= LINES.length) {
        timer = window.setTimeout(() => {
          st.current = { line: 0, char: 0, done: [] };
          setDisplay([""]);
          tick();
        }, 2800);
      } else {
        timer = window.setTimeout(tick, 360);
      }
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 border-b border-border/60 bg-background/60 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
        <span className="ml-3 font-mono text-[0.6rem] tracking-[0.3em] text-muted-foreground uppercase">
          zrk@terminal
        </span>
      </div>
      <pre className="min-h-[13rem] overflow-x-auto px-5 py-5 font-mono text-[0.72rem] leading-relaxed text-[color:var(--matrix)] md:text-[0.8rem]">
        {display.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap">
            <span className="mr-3 select-none text-muted-foreground/40">
              {String(i + 1).padStart(2, "0")}
            </span>
            {l}
            {i === display.length - 1 && (
              <span className="ml-0.5 inline-block w-2 animate-pulse bg-[color:var(--matrix)] text-transparent">
                .
              </span>
            )}
          </div>
        ))}
      </pre>
    </div>
  );
}
