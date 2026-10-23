import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, Globe2, LayoutDashboard, Lock, MessagesSquare, Rocket, Sparkles, TriangleAlert, Zap, Gift } from "lucide-react";
import { NightSky } from "@/components/NightSky";
import { SiteHeader } from "@/components/SiteHeader";
import { useLang } from "@/lib/i18n";
import { hostingCopy } from "@/lib/site-copy";

const discordUrl = "https://discord.gg/4qRhB4c5me";

export const Route = createFileRoute("/hosting")({
  head: () => ({
    meta: [
      { title: "Ȥrk. Hosting — Coming soon" },
      { name: "description", content: "Ȥrk. is preparing a hosting service for Discord bots, websites and digital projects, with a web panel. Coming soon." },
      { property: "og:title", content: "Ȥrk. Hosting — Coming soon" },
      { property: "og:description", content: "Bot hosting, website hosting and a web panel. Your projects. Our infrastructure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HostingPage,
});

const comingIcons = [Bot, Globe2, LayoutDashboard, MessagesSquare];
const planIcons = [Gift, Zap];

/**
 * The hosting service, announced but not open yet: everything says "soon", nothing
 * promises a price, a limit or a date. The panel button is greyed out and only shows
 * a "Soon…" notice in the middle of the screen.
 */
function HostingPage() {
  const { lang } = useLang();
  const t = hostingCopy[lang];
  const [notice, setNotice] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showSoon = () => {
    setNotice(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(false), 2600);
  };

  return (
    <main className="night-page relative min-h-screen overflow-x-clip font-body text-foreground">
      <NightSky />
      <SiteHeader page="hosting" />

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 text-center lg:px-10 lg:pt-28">
        <p className="eyebrow justify-center"><Rocket className="h-4 w-4" aria-hidden="true" /> {t.eyebrow}</p>
        <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl">
          <span className="zrk-identity">Ȥrk<span className="text-seasonal">.</span></span> <span className="moon-text">{t.title}</span>
        </h1>
        <p className="soon-badge mx-auto mt-8">{t.soon}</p>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">{t.intro}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button type="button" aria-disabled="true" aria-label={t.panelLabel} onClick={showSoon} className="panel-locked inline-flex min-h-13 items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-semibold">
            <Lock className="h-4 w-4" aria-hidden="true" /> {t.panel}
          </button>
          <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="glass inline-flex min-h-13 items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-semibold text-foreground">
            <MessagesSquare className="h-4 w-4 text-discord" aria-hidden="true" /> {t.discord}
          </a>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <p className="eyebrow"><Sparkles className="h-4 w-4" aria-hidden="true" /> {t.soon}</p>
        <h2 className="moon-text mt-5 font-display text-4xl font-bold sm:text-5xl">{t.comingTitle}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {t.coming.map((item, index) => {
            const Icon = comingIcons[index] ?? Bot;
            return (
              <article key={item.title} className="spell-card glass p-8">
                <div className="spell-icon flex h-13 w-13 items-center justify-center rounded-2xl bg-seasonal-soft text-seasonal"><Icon className="h-6 w-6" /></div>
                <h3 className="mt-6 font-display text-2xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <h2 className="moon-text font-display text-4xl font-bold sm:text-5xl">{t.plansTitle}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {t.plans.map((plan, index) => {
            const Icon = planIcons[index] ?? Gift;
            return (
              <article key={plan.title} className={`spell-card glass relative p-8 ${index === 1 ? "plan-premium" : ""}`}>
                <span className="soon-chip">{t.soon}</span>
                <Icon className="h-7 w-7 text-seasonal" aria-hidden="true" />
                <h3 className="mt-6 font-display text-3xl font-bold">{plan.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{plan.text}</p>
              </article>
            );
          })}
        </div>
        <p className="mt-8 inline-flex items-start gap-2 rounded-2xl border border-seasonal/40 bg-seasonal-soft px-4 py-3 text-sm leading-6 text-foreground">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-seasonal" aria-hidden="true" /> {t.warning}
        </p>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-8 text-center lg:px-10">
        <p className="font-display text-3xl font-extrabold sm:text-5xl">
          <span className="zrk-identity">Ȥrk<span className="text-seasonal">.</span></span> — <span className="ember-text">{t.tagline}</span>
        </p>
      </section>

      <footer className="relative border-t border-border/40 bg-background/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-muted-foreground lg:px-10">© 2026 <span className="font-brand font-semibold text-foreground">Ȥrk</span>. — {t.tagline}</div>
      </footer>

      <div className="soon-notice" data-visible={notice ? "true" : "false"} role="status" aria-live="polite">
        {notice && <div className="soon-notice-card"><Rocket className="h-8 w-8 text-seasonal" aria-hidden="true" /><strong>{t.panelSoon}</strong><span>{t.panelSoonText}</span></div>}
      </div>
    </main>
  );
}
