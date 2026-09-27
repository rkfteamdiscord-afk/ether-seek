import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Bot,
  Code2,
  Globe2,
  HeartHandshake,
  MessageCircle,
  Mail,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import bannerHd from "@/assets/zrk-banner-hd-wide.png";

const avatarUrl = "/zrk-avatar.gif";
const discordUrl = "https://discord.gg/XJRjPvYHB3";
const emailUrl = "mailto:zrk.pro.dev@gmail.com";
const whatsappUrl =
  "https://api.whatsapp.com/send?phone=33787444309&text=" +
  encodeURIComponent("Bonjour Ȥrk, je souhaite commander un site / une application.");

const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const DiscordIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

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
            href={whatsappUrl}
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
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 hover:shadow-lg"
              >
                Commander un site <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={emailUrl}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3.5 font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <Mail className="h-4 w-4" /> Me contacter par e-mail
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
            <p className="mt-4 leading-7 text-primary-foreground/80">Présentez-moi votre projet par WhatsApp, Discord ou e-mail. Je vous répondrai directement pour voir comment le réaliser.</p>
          </div>
          <div className="flex w-full shrink-0 flex-wrap gap-3 sm:w-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-background px-5 py-3.5 font-semibold text-foreground shadow-md transition hover:bg-secondary sm:flex-none"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
            </a>
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-background px-5 py-3.5 font-semibold text-foreground shadow-md transition hover:bg-secondary sm:flex-none"
            >
              <DiscordIcon className="h-4 w-4 text-[#5865F2]" /> Discord
            </a>
            <a
              href={emailUrl}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-background px-5 py-3.5 font-semibold text-foreground shadow-md transition hover:bg-secondary sm:flex-none"
            >
              <Mail className="h-4 w-4 text-primary" /> E-mail
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© 2026 Ȥrk — Création numérique sur mesure</p>
          <p>Designed by Eliza</p>
        </div>
      </footer>
    </main>
  );
}
