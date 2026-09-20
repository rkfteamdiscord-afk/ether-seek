import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  Code2,
  Globe2,
  HeartHandshake,
  MessageCircle,
  Send,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import bannerHd from "@/assets/zrk-banner-hd-wide.png";

const avatarUrl = "/zrk-avatar.gif";
const discordUrl = "https://discord.gg/XJRjPvYHB3";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ȥrk — Création de sites web et applications" },
      {
        name: "description",
        content:
          "Ȥrk conçoit des sites web, applications iOS et Android, bots et solutions numériques sécurisées sur mesure.",
      },
      { property: "og:title", content: "Ȥrk — Studio de création numérique" },
      {
        property: "og:description",
        content: "Sites web, applications mobiles, bots et cybersécurité : un accompagnement humain, complet et sur mesure.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Portfolio,
});

const services = [
  {
    icon: Globe2,
    title: "Sites web",
    text: "Sites vitrines, portfolios, boutiques et plateformes rapides, élégants et pensés pour convertir vos visiteurs.",
  },
  {
    icon: Smartphone,
    title: "Applications mobiles",
    text: "Applications iOS et Android prêtes à être publiées sur l’App Store et le Play Store.",
  },
  {
    icon: Bot,
    title: "Bots & automatisations",
    text: "Bots Telegram, WhatsApp et Discord conçus autour de vos besoins, de votre communauté ou de votre activité.",
  },
  {
    icon: ShieldCheck,
    title: "Cybersécurité",
    text: "Audit, protection des accès et bonnes pratiques intégrés pour livrer des produits solides et fiables.",
  },
];

const commitments = [
  "Un interlocuteur unique du premier échange à la livraison",
  "Une solution conçue sur mesure, sans modèle générique",
  "Un suivi clair et régulier pendant toute la création",
  "La sécurité prise en compte dès le début du projet",
];

function Portfolio() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background font-body text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a href="#accueil" className="font-display text-2xl font-extrabold text-foreground" aria-label="Accueil Ȥrk">
            Ȥrk<span className="text-primary">.</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="Navigation principale">
            <a className="transition-colors hover:text-foreground" href="#services">Services</a>
            <a className="transition-colors hover:text-foreground" href="#apropos">À propos</a>
            <a className="transition-colors hover:text-foreground" href="#methode">Méthode</a>
          </nav>
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Discuter du projet <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      <section id="accueil" className="relative border-b border-border bg-secondary/45">
        <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-primary shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Studio digital indépendant
            </div>
            <h1 className="font-display text-5xl leading-[1.05] font-extrabold sm:text-6xl lg:text-7xl">
              Ȥrk crée vos sites et applications avec sérieux.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Je transforme une idée en un produit numérique clair, moderne et fiable : site web, application mobile, bot ou outil sur mesure. Vous échangez directement avec moi, simplement, du cadrage à la mise en ligne.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 hover:shadow-lg"
              >
                Commander un site <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3.5 font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Découvrir mes services
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Sur mesure</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Sécurisé</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Accompagnement direct</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-md border border-primary/15 bg-primary/5" />
            <div className="relative overflow-hidden rounded-md border border-border bg-card p-4 shadow-xl">
              <img src={avatarUrl} alt="Photo de profil de Ȥrk" className="aspect-square w-full rounded-sm object-cover" />
              <div className="flex items-center justify-between gap-4 px-2 pb-1 pt-5">
                <div>
                  <p className="font-display text-2xl font-bold">Ȥrk</p>
                  <p className="mt-1 text-sm text-muted-foreground">Créateur de produits numériques</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BadgeCheck className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-primary">Ce que je crée</p>
            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Une solution complète pour votre projet.</h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              De la première maquette à la publication, je construis des produits utiles, agréables à utiliser et simples à faire évoluer.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <article key={service.title} className="group rounded-md border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold">{service.title}</h3>
                <p className="mt-3 max-w-xl leading-7 text-muted-foreground">{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="apropos" className="border-y border-border bg-secondary/55 py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase text-primary">À propos de moi</p>
            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Je suis Ȥrk.</h2>
            <div className="mt-7 overflow-hidden rounded-md border border-border bg-card p-3 shadow-sm">
              <img src={bannerHd} alt="L’univers visuel du studio Ȥrk" className="aspect-[16/9] w-full rounded-sm object-cover" />
            </div>
          </div>
          <div className="space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
            <p>
              Je suis développeur indépendant et fondateur de <strong className="font-semibold text-foreground">Ȥrk</strong>. J’accompagne les particuliers, créateurs, communautés et entreprises qui veulent donner vie à une idée numérique sans devoir coordonner plusieurs prestataires.
            </p>
            <p>
              Mon cœur de métier est la <strong className="font-semibold text-foreground">création de sites web et d’applications mobiles</strong>. Je m’occupe de l’apparence, du fonctionnement, des données, de la mise en ligne et du suivi. Je développe aussi des bots Telegram, WhatsApp et Discord ainsi que des outils d’automatisation adaptés à votre activité.
            </p>
            <p>
              Ma spécialisation en cybersécurité n’est pas là pour donner une image inquiétante : elle me permet surtout de concevoir des projets plus fiables. Les accès, les données et l’hébergement sont réfléchis avec sérieux dès le départ.
            </p>
            <p>
              Je privilégie une relation simple et transparente. Vous parlez directement avec la personne qui conçoit votre projet, vous suivez son avancement et vous recevez une solution qui vous appartient vraiment.
            </p>
            <div className="grid gap-3 pt-3 sm:grid-cols-2">
              {commitments.map((item) => (
                <div key={item} className="flex gap-3 rounded-md border border-border bg-background p-4 text-sm leading-6 text-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="methode" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Une collaboration simple</p>
              <h2 className="mt-4 font-display text-4xl font-bold">Votre idée, accompagnée de A à Z.</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { icon: MessageCircle, n: "01", t: "On échange", d: "Vous m’expliquez votre idée, vos objectifs et votre budget." },
                { icon: Code2, n: "02", t: "Je construis", d: "Je conçois, développe et teste votre solution avec vous." },
                { icon: HeartHandshake, n: "03", t: "Je vous accompagne", d: "Je mets le projet en ligne et reste disponible après la livraison." },
              ].map((step) => (
                <article key={step.n}>
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                    <span className="text-sm font-bold text-muted-foreground">{step.n}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">{step.t}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.d}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-primary/15 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-center lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-primary-foreground/70">Parlons de votre idée</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Besoin d’un site, d’une app ou d’un bot ?</h2>
            <p className="mt-4 leading-7 text-primary-foreground/80">Présentez-moi votre projet sur Discord. Je vous répondrai directement pour voir comment le réaliser.</p>
          </div>
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-background px-6 py-3.5 font-semibold text-foreground shadow-md transition hover:bg-secondary"
          >
            <Send className="h-4 w-4" /> Commander un site
          </a>
        </div>
      </section>

      <footer className="bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© 2026 Ȥrk — Création numérique sur mesure</p>
          <p>Design sous les conseils de Madame Eliza</p>
        </div>
      </footer>
    </main>
  );
}