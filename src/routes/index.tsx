import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Globe,
  Smartphone,
  Send,
  MessageCircle,
  Bot,
  Code2,
  ShieldCheck,
  ArrowUpRight,
  Terminal,
  BadgeCheck,
  Server,
  Cpu,
  Lock,
  Zap,
} from "lucide-react";
import { MatrixRain } from "@/components/MatrixRain";

const bannerUrl = "/zrk-banner.png";
const avatarUrl = "/zrk-avatar.gif";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ȥrk — Dev web, apps, bots & cybersécurité" },
      {
        name: "description",
        content:
          "Ȥrk : prestations sur mesure en sites web, applications App Store / Play Store, bots Telegram, WhatsApp, Discord et cybersécurité. Ancien partenaire Discord.",
      },
      { property: "og:title", content: "Ȥrk — Dev web, apps, bots & cybersécurité" },
      {
        property: "og:description",
        content:
          "Sites web, applications mobiles, bots et cybersécurité — prestations signées Ȥrk, ancien partenaire Discord.",
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
          jobTitle: "Développeur full-stack & expert cybersécurité",
          description:
            "Sites web, applications mobiles, bots Telegram, WhatsApp, Discord et cybersécurité. Ancien partenaire Discord.",
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
    desc: "Vitrines, portfolios, plateformes SaaS — rapides, soignés, optimisés SEO.",
    tags: ["React", "Next", "Tailwind", "SEO"],
  },
  {
    icon: Smartphone,
    num: "02",
    title: "Applications mobiles",
    desc: "Apps publiables sur l'App Store et le Play Store, de l'idée à la validation store.",
    tags: ["React Native", "Expo", "iOS", "Android"],
  },
  {
    icon: Send,
    num: "03",
    title: "Bots Telegram",
    desc: "Automatisation, paiements crypto, modération, notifications, mini-apps.",
    tags: ["Bot API", "Webhooks", "Paiements"],
  },
  {
    icon: MessageCircle,
    num: "04",
    title: "Bots WhatsApp",
    desc: "Réponses automatiques, service client, diffusion — joignable 24/7.",
    tags: ["Cloud API", "CRM", "Broadcast"],
  },
  {
    icon: Bot,
    num: "05",
    title: "Bots Discord",
    desc: "Modération, tickets, économie, giveaways, dashboards web, musique.",
    tags: ["discord.js", "Slash", "Dashboard"],
  },
  {
    icon: ShieldCheck,
    num: "06",
    title: "Cybersécurité",
    desc: "Audit, tests d'intrusion, durcissement serveur, chiffrement, anti-bot, anti-leak.",
    tags: ["Pentest", "OSINT", "Hardening"],
  },
  {
    icon: Server,
    num: "07",
    title: "Infra & hébergement",
    desc: "VPS, Docker, CI/CD, monitoring, sauvegardes automatiques, uptime surveillé.",
    tags: ["Linux", "Docker", "Nginx"],
  },
  {
    icon: Cpu,
    num: "08",
    title: "Automatisation & IA",
    desc: "Scripts, scrapers, APIs, intégrations IA sur mesure dans vos outils.",
    tags: ["Python", "Node", "API"],
  },
  {
    icon: Code2,
    num: "09",
    title: "Et bien plus",
    desc: "Outils internes, systèmes de licences, anti-cheat, intégrations custom.",
    tags: ["Custom", "Sur devis"],
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
  "Redis",
  "Tailwind",
  "Linux",
  "Docker",
  "Nginx",
  "Rust",
  "Pentest",
  "Burp Suite",
  "Wireshark",
];

const STATS = [
  { k: "7+", v: "années de code" },
  { k: "150+", v: "projets livrés" },
  { k: "40+", v: "bots en production" },
  { k: "24/7", v: "monitoring & support" },
];

const FACTS = [
  "Autodidacte depuis l'adolescence, premier bot Discord codé à 14 ans.",
  "Ancien partenaire Discord — serveur reconnu par le programme officiel.",
  "Bots ayant servi des communautés de plus de 300 000 membres cumulés.",
  "Spécialisé cybersécurité : audit offensif, reverse, durcissement d'infra.",
  "Travaille en direct avec le client : pas d'agence, pas d'intermédiaire.",
  "Code documenté, livré avec sources, accès complet et sans dépendance.",
  "Disponible en français et en anglais, réponse généralement sous 24 h.",
  "Confidentialité totale : NDA sur demande, aucune donnée revendue.",
];

function Portfolio() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="grain relative min-h-screen overflow-x-clip bg-background font-body text-foreground">
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={bannerUrl}
            alt="Bannière Ȥrk — code et néon rouge"
            className={`absolute inset-x-0 top-0 max-h-[52vh] w-full object-contain object-top transition-all duration-[2500ms] ease-out ${
              ready ? "opacity-40" : "opacity-0"
            }`}
          />
          <MatrixRain className="absolute inset-0 z-[1] h-full w-full opacity-40" />
          <div className="absolute inset-0 z-[2] bg-linear-to-b from-background/30 via-background/75 to-background" />
        </div>

        {/* nav */}
        <header className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-6 md:px-12">
          <span className="truncate font-display text-sm font-bold tracking-[0.35em] text-primary uppercase">
            Ȥrk<span className="text-[color:var(--matrix)]">_</span>
          </span>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-2 border border-border/70 px-4 py-2 text-[0.65rem] tracking-[0.3em] uppercase transition-all duration-500 hover:border-[color:var(--matrix)] hover:text-[color:var(--matrix)]"
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
            <div className="absolute -inset-4 rounded-lg bg-destructive/25 blur-3xl" />
            <img
              src={avatarUrl}
              alt="Logo néon Ȥrk"
              className="relative h-36 w-36 rounded-lg border border-primary/40 object-cover shadow-[0_0_60px_-8px] shadow-destructive/50 md:h-44 md:w-44"
            />
          </div>

          <p
            className="mt-10 flex flex-wrap items-center justify-center gap-2 font-mono text-[0.62rem] tracking-[0.4em] text-muted-foreground uppercase transition-all delay-300 duration-[1500ms]"
            style={{ opacity: ready ? 1 : 0 }}
          >
            <Terminal className="h-3.5 w-3.5 text-[color:var(--matrix)]" />
            développeur full-stack · cybersécurité
          </p>

          <h1 className="font-display text-glitch mt-5 text-[clamp(3rem,10vw,7rem)] leading-none font-extrabold tracking-tight">
            Ȥ<span className="text-destructive drop-shadow-[0_0_25px_oklch(0.55_0.17_25/60%)]">rk</span>
          </h1>

          <p className="mt-4 inline-flex items-center gap-2 border border-[color:var(--matrix)]/40 bg-[color:var(--matrix)]/5 px-4 py-2 font-mono text-[0.6rem] tracking-[0.25em] text-[color:var(--matrix)] uppercase">
            <BadgeCheck className="h-3.5 w-3.5" />
            ancien partenaire discord
          </p>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Je construis des <span className="text-foreground">sites web</span>, des{" "}
            <span className="text-foreground">applications</span> publiées sur l'App Store et le
            Play Store, et des <span className="text-foreground">bots</span> Telegram, WhatsApp et
            Discord. Je suis aussi{" "}
            <span className="text-[color:var(--matrix)]">spécialisé en cybersécurité</span> — et je
            touche à tous les domaines : chaque prestation est réalisée par moi, du premier prototype
            à la mise en production.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden border border-destructive bg-destructive/15 px-8 py-4 font-display text-[0.7rem] font-bold tracking-[0.3em] uppercase transition-all duration-500 hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_0_50px_-5px] hover:shadow-destructive/60"
            >
              Commander un projet
              <ArrowUpRight className="ml-2 inline h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
            <a
              href="#services"
              className="px-6 py-4 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase transition-colors duration-500 hover:text-[color:var(--matrix)]"
            >
              ./voir_les_services ↓
            </a>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 py-10 md:grid-cols-4 md:px-12">
          {STATS.map((s) => (
            <div key={s.v} className="px-2 py-4 text-center">
              <p className="font-display text-3xl font-extrabold text-[color:var(--matrix)] md:text-4xl">
                {s.k}
              </p>
              <p className="mt-2 font-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground uppercase">
                {s.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SERVICES 3D ===== */}
      <section id="services" className="relative mx-auto max-w-6xl px-6 py-28 md:px-12 md:py-36">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.45em] text-[color:var(--matrix)] uppercase">
              // spécialités
            </p>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,4.5vw,3rem)] leading-tight font-extrabold">
              Ce que je peux
              <br />
              construire pour vous
            </h2>
          </div>
          <p className="max-w-xs font-mono text-xs leading-loose text-muted-foreground md:text-right">
            Chaque projet est unique. Vous décrivez l'idée, je m'occupe du reste — design, code,
            déploiement, maintenance.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.num}
              className="card-3d group relative border border-border/70 bg-card/60 p-7 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.6rem] tracking-[0.35em] text-muted-foreground/60">
                  {s.num}
                </span>
                <s.icon className="h-6 w-6 text-muted-foreground transition-colors duration-500 group-hover:text-[color:var(--matrix)]" />
              </div>
              <h3 className="mt-6 font-display text-lg font-bold tracking-wide">{s.title}</h3>
              <p className="mt-3 text-[0.8rem] leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="border border-border/60 px-2 py-1 font-mono text-[0.55rem] tracking-[0.15em] text-muted-foreground uppercase"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== À PROPOS / FACTS ===== */}
      <section className="border-y border-border/50 bg-card/20">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-12">
          <p className="font-mono text-[0.62rem] tracking-[0.45em] text-[color:var(--matrix)] uppercase">
            // whoami
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-extrabold">
            À propos de Ȥrk
          </h2>
          <div className="mt-10 grid gap-x-12 gap-y-4 md:grid-cols-2">
            {FACTS.map((f) => (
              <p
                key={f}
                className="terminal-line font-mono text-[0.78rem] leading-relaxed text-muted-foreground transition-colors duration-500 hover:text-foreground"
              >
                {f}
              </p>
            ))}
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Lock, t: "Confidentialité", d: "NDA, code privé, données chiffrées." },
              { icon: Zap, t: "Rapidité", d: "Premiers livrables en quelques jours." },
              { icon: ShieldCheck, t: "Sécurité by design", d: "Chaque projet audité avant livraison." },
            ].map((b) => (
              <div key={b.t} className="card-3d border border-border/70 bg-background/70 p-6">
                <b.icon className="h-5 w-5 text-[color:var(--matrix)]" />
                <h3 className="mt-4 font-display text-base font-bold">{b.t}</h3>
                <p className="mt-2 font-mono text-[0.72rem] leading-relaxed text-muted-foreground">
                  {b.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STACK ===== */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:px-12">
        <p className="font-mono text-[0.62rem] tracking-[0.45em] text-muted-foreground uppercase">
          // technologies
        </p>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          {STACK.map((t) => (
            <span
              key={t}
              className="font-display text-base font-medium tracking-wide text-muted-foreground transition-colors duration-500 hover:text-[color:var(--matrix)] md:text-lg"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="mx-auto max-w-6xl px-6 pb-28 md:px-12 md:pb-36">
        <p className="font-mono text-[0.62rem] tracking-[0.45em] text-destructive uppercase">
          // comment ça marche
        </p>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "On discute",
              d: "Rejoignez le Discord et décrivez votre idée : site, app, bot, audit… on cadre le projet et le budget ensemble.",
            },
            {
              n: "2",
              t: "Je construis",
              d: "Design, développement, tests de sécurité. Vous suivez l'avancement étape par étape.",
            },
            {
              n: "3",
              t: "C'est en ligne",
              d: "Livraison complète : site hébergé, app publiée sur les stores ou bot déployé 24/7, avec suivi.",
            },
          ].map((step) => (
            <div key={step.n} className="group">
              <span className="font-display text-5xl font-extrabold text-muted-foreground/25 transition-colors duration-700 group-hover:text-[color:var(--matrix)]/70">
                0{step.n}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">{step.t}</h3>
              <p className="mt-3 font-mono text-[0.78rem] leading-relaxed text-muted-foreground">
                {step.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="relative overflow-hidden border-t border-border/50">
        <img
          src={bannerUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center opacity-20"
        />
        <MatrixRain className="absolute inset-0 h-full w-full opacity-30" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-background/80" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-32 text-center md:py-44">
          <h2 className="font-display text-[clamp(1.9rem,5vw,3.6rem)] leading-tight font-extrabold">
            Un projet en tête ?
          </h2>
          <p className="mx-auto mt-6 max-w-md font-mono text-[0.8rem] leading-relaxed text-muted-foreground">
            Site web, application mobile, bot Telegram, WhatsApp, Discord ou audit de sécurité —
            envoyez votre demande sur le serveur Discord, réponse rapide garantie.
          </p>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-12 inline-flex items-center gap-3 border border-destructive bg-destructive px-10 py-5 font-display text-[0.72rem] font-bold tracking-[0.3em] text-destructive-foreground uppercase transition-all duration-500 hover:shadow-[0_0_70px_-8px] hover:shadow-destructive/70"
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
          className="font-mono text-[0.62rem] tracking-[0.35em] text-muted-foreground uppercase transition-colors duration-500 hover:text-[color:var(--matrix)]"
        >
          discord.gg/m6Gf2bHFhF
        </a>
      </footer>
    </main>
  );
}
