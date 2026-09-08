import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Globe,
  Smartphone,
  Send,
  MessageCircle,
  Bot,
  Code2,
  ArrowUpRight,
  Terminal,
} from "lucide-react";
import bannerAsset from "@/assets/zrk-banner.png.asset.json";
import avatarAsset from "@/assets/zrk-avatar.gif.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ȥrk — Développeur web, apps & bots" },
      {
        name: "description",
        content:
          "Ȥrk conçoit des sites web, des applications publiées sur l'App Store et le Play Store, et des bots Telegram, WhatsApp et Discord sur mesure.",
      },
      { property: "og:title", content: "Ȥrk — Développeur web, apps & bots" },
      {
        property: "og:description",
        content:
          "Sites web, applications mobiles, bots Telegram / WhatsApp / Discord — conçus et livrés par Ȥrk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Ȥrk",
          jobTitle: "Développeur full-stack",
          description:
            "Sites web, applications mobiles et bots Telegram, WhatsApp, Discord sur mesure.",
        }),
      },
    ],
  }),
  component: Portfolio,
});

const DISCORD_URL = "https://discord.gg/m6Gf2bHFhF";

const SERVICES = [
  {
    icon: Globe,
    num: "01",
    title: "Sites web",
    desc: "Vitrines, portfolios, plateformes — rapides, soignés, optimisés pour le référencement.",
  },
  {
    icon: Smartphone,
    num: "02",
    title: "Applications mobiles",
    desc: "Des apps publiables sur l'App Store et le Play Store, de l'idée jusqu'à la mise en ligne.",
  },
  {
    icon: Send,
    num: "03",
    title: "Bots Telegram",
    desc: "Automatisation, paiements, modération, notifications — des bots qui travaillent pour vous.",
  },
  {
    icon: MessageCircle,
    num: "04",
    title: "Bots WhatsApp",
    desc: "Réponses automatiques, service client, diffusion — votre business joignable 24/7.",
  },
  {
    icon: Bot,
    num: "05",
    title: "Bots Discord",
    desc: "Modération, tickets, économie, musique — tout ce qu'une communauté peut demander.",
  },
  {
    icon: Code2,
    num: "06",
    title: "Et bien plus",
    desc: "Scripts, APIs, outils internes, intégrations sur mesure — parlez-moi de votre projet.",
  },
];

const STACK = [
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Vue",
  "React Native",
  "PostgreSQL",
  "Tailwind",
];

function Portfolio() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="grain relative min-h-screen overflow-x-clip bg-background text-foreground">
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen flex-col">
        {/* bannière */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={bannerAsset.url}
            alt="Bannière Ȥrk — code et néon rouge"
            className={`h-full w-full object-cover transition-all duration-[2500ms] ease-out ${
              ready ? "scale-100 opacity-60" : "scale-110 opacity-0"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        {/* nav minimaliste */}
        <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
          <span className="font-mono text-sm tracking-[0.35em] text-primary uppercase">
            Ȥrk<span className="text-destructive">.</span>
          </span>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 border border-border/70 px-4 py-2 text-[0.65rem] tracking-[0.3em] uppercase transition-all duration-500 hover:border-primary hover:bg-primary/10"
          >
            Discord
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </header>

        {/* contenu hero */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div
            className={`relative transition-all duration-[1800ms] ${
              ready ? "opacity-100 blur-0" : "opacity-0 blur-md"
            }`}
          >
            <div className="absolute -inset-4 rounded-full bg-destructive/25 blur-3xl" />
            <img
              src={avatarAsset.url}
              alt="Logo néon Ȥrk"
              className="relative h-36 w-36 rounded-full border border-primary/40 object-cover shadow-[0_0_60px_-8px] shadow-destructive/50 md:h-44 md:w-44"
            />
          </div>

          <p
            className="mt-10 flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.45em] text-muted-foreground uppercase transition-all delay-300 duration-[1500ms]"
            style={{ opacity: ready ? 1 : 0 }}
          >
            <Terminal className="h-3.5 w-3.5 text-destructive" />
            développeur full-stack
          </p>

          <h1 className="font-display mt-5 text-[clamp(3.2rem,11vw,7.5rem)] leading-none font-light tracking-tight">
            Ȥ<span className="text-destructive drop-shadow-[0_0_25px_oklch(0.55_0.17_25/60%)]">rk</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-relaxed font-light text-muted-foreground md:text-base">
            Je construis des <span className="text-foreground">sites web</span>, des{" "}
            <span className="text-foreground">applications</span> publiées sur l'App Store et le
            Play Store, et des <span className="text-foreground">bots</span> Telegram, WhatsApp et
            Discord — sur mesure, du premier prototype à la mise en production.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden border border-destructive bg-destructive/15 px-8 py-4 text-[0.7rem] font-medium tracking-[0.3em] uppercase transition-all duration-500 hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_0_50px_-5px] hover:shadow-destructive/60"
            >
              Commander un projet
              <ArrowUpRight className="ml-2 inline h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
            <a
              href="#services"
              className="px-6 py-4 text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase transition-colors duration-500 hover:text-foreground"
            >
              voir les services ↓
            </a>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="relative mx-auto max-w-6xl px-6 py-28 md:px-12 md:py-36">
        <div className="mb-16 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.45em] text-destructive uppercase">
              // services
            </p>
            <h2 className="font-display mt-4 text-[clamp(2rem,5vw,3.5rem)] leading-tight font-light">
              Ce que je peux
              <br />
              construire pour vous
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-xs leading-loose text-muted-foreground md:block">
            Chaque projet est unique. Vous décrivez l'idée, je m'occupe du reste — design, code,
            mise en ligne.
          </p>
        </div>

        <div className="grid gap-px border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.num}
              className="group relative bg-background p-8 transition-colors duration-700 hover:bg-card md:p-10"
            >
              <span className="font-mono text-[0.6rem] tracking-[0.35em] text-muted-foreground/60">
                {s.num}
              </span>
              <s.icon className="mt-6 h-7 w-7 text-muted-foreground transition-all duration-700 group-hover:scale-110 group-hover:text-destructive" />
              <h3 className="font-display mt-5 text-xl font-light tracking-wide">{s.title}</h3>
              <p className="mt-3 text-[0.8rem] leading-relaxed text-muted-foreground">{s.desc}</p>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-destructive transition-all duration-700 group-hover:w-full" />
            </article>
          ))}
        </div>
      </section>

      {/* ===== STACK ===== */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-12">
          <p className="font-mono text-[0.62rem] tracking-[0.45em] text-muted-foreground uppercase">
            // technologies
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {STACK.map((t) => (
              <span
                key={t}
                className="font-display text-lg font-light tracking-wide text-muted-foreground transition-colors duration-500 hover:text-primary md:text-xl"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="mx-auto max-w-6xl px-6 py-28 md:px-12 md:py-36">
        <p className="font-mono text-[0.62rem] tracking-[0.45em] text-destructive uppercase">
          // comment ça marche
        </p>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "On discute",
              d: "Rejoignez le Discord et décrivez votre idée : site, app, bot… on définit le projet ensemble.",
            },
            {
              n: "2",
              t: "Je construis",
              d: "Design, développement, tests. Vous suivez l'avancement étape par étape.",
            },
            {
              n: "3",
              t: "C'est en ligne",
              d: "Livraison complète : site hébergé, app publiée sur les stores ou bot déployé 24/7.",
            },
          ].map((step) => (
            <div key={step.n} className="group">
              <span className="font-display text-6xl font-light text-muted-foreground/25 transition-colors duration-700 group-hover:text-destructive/70">
                {step.n}
              </span>
              <h3 className="font-display mt-4 text-2xl font-light">{step.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="relative overflow-hidden border-t border-border/50">
        <img
          src={bannerAsset.url}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/80" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-32 text-center md:py-44">
          <h2 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-tight font-light">
            Un projet en tête ?
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Site web, application mobile, bot Telegram, WhatsApp ou Discord — envoyez votre demande
            sur le serveur Discord, réponse rapide garantie.
          </p>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-12 inline-flex items-center gap-3 border border-destructive bg-destructive px-10 py-5 text-[0.72rem] font-medium tracking-[0.3em] text-destructive-foreground uppercase transition-all duration-500 hover:shadow-[0_0_70px_-8px] hover:shadow-destructive/70"
          >
            <Bot className="h-4 w-4" />
            Faire une demande
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="flex flex-col items-center justify-between gap-4 border-t border-border/50 px-6 py-8 sm:flex-row md:px-12">
        <span className="font-mono text-[0.62rem] tracking-[0.35em] text-muted-foreground uppercase">
          © 2026 Ȥrk — tous droits réservés
        </span>
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[0.62rem] tracking-[0.35em] text-muted-foreground uppercase transition-colors duration-500 hover:text-destructive"
        >
          discord.gg/m6Gf2bHFhF
        </a>
      </footer>
    </main>
  );
}
