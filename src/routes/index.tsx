import { useState } from "react";
import { Button } from "@/components/ui/button";
import { halloweenOffer } from "@/lib/seasonal-offer";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Ghost,
  Sparkles,
  X,
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
import { Cobweb, Pumpkins, HalloweenGarland, HalloweenScene, AttachedDecor, DecorDefs, SwingingLantern, DriftingGhost, CandleCluster } from "@/components/HalloweenDecor";
import { SpiderWalkers } from "@/components/SpiderWalkers";
import { GhostSwarm, GhostGuide } from "@/components/HalloweenGhosts";
import { CursorSparkles } from "@/components/CursorSparkles";
import { PumpkinDefs, RealPumpkin } from "@/components/RealPumpkin";
import { ZombieHand } from "@/components/Zombies";
import { HalloweenArrival, WitchDuel, type HalloweenPhase } from "@/components/HalloweenArrival";
import { NightSky } from "@/components/NightSky";
import { StudioVideo } from "@/components/StudioVideo";

const avatarUrl = "/zrk-avatar.gif";
const discordUrl = "https://discord.gg/4qRhB4c5me";
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
  const [showOffer, setShowOffer] = useState(true);
  const [phase, setPhase] = useState<HalloweenPhase>("arrival");
  return (
    <main data-halloween-phase={phase} className="night-page relative min-h-screen overflow-x-hidden font-body text-foreground">
      <NightSky />
      <DecorDefs />
      <PumpkinDefs />
      <GhostSwarm />
      <SpiderWalkers />
      <GhostGuide phase={phase} />
      <CursorSparkles />
      <HalloweenArrival phase={phase} onPhaseChange={setPhase} />
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
        <div className="liquid-bar mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full pl-6 pr-2.5">
          <a href="#accueil" data-header-logo className="font-brand text-2xl font-extrabold text-foreground" aria-label="Accueil Ȥrk">
            Ȥrk<span className="text-seasonal">.</span>
          </a>
          <nav className="liquid-nav hidden items-center gap-1 rounded-full p-1 text-sm font-medium md:flex" aria-label="Navigation principale">
            <a className="nav-pill" href="#services">Services</a>
            <a className="nav-pill" href="#apropos">À propos</a>
            <a className="nav-pill" href="#methode">Méthode</a>
          </nav>
          <Button asChild className="halloween-button ember-button h-11 rounded-full bg-seasonal px-5 font-semibold text-seasonal-foreground hover:bg-seasonal/90">
            <a href="#contact"><Cobweb /><AttachedDecor chapter={0} index={0} /> Commander un site <ArrowRight className="h-4 w-4" /></a>
          </Button>
        </div>
      </header>

      {showOffer && (
        <aside data-guide="promo-bandeau" role="status" aria-label="Offre Halloween" className="halloween-offer relative border-b border-seasonal/30 bg-seasonal-soft text-foreground">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-2.5 lg:px-10">
            <Pumpkins className="pumpkins-notice" />
            <p className="flex-1 text-sm leading-6">
              <strong className="text-seasonal">Halloween : −{halloweenOffer.discountPercent} %</strong> sur toutes les prestations avec le code{" "}
              <strong className="rounded-md border border-seasonal/40 bg-background/40 px-2 py-0.5 font-bold tracking-wide">{halloweenOffer.code}</strong>
            </p>
            <Button variant="ghost" size="icon" aria-label="Fermer l’offre Halloween" onClick={() => setShowOffer(false)} className="shrink-0 rounded-full text-foreground hover:bg-foreground/10 hover:text-foreground">
              <X />
            </Button>
          </div>
        </aside>
      )}

      <section id="accueil" className="halloween-stage relative">
        <WitchDuel />
        <HalloweenScene chapter={0} />
        <CandleCluster className="candles-hero" />
        <RealPumpkin carved className="ground-pumpkin gp-hero-a" />
        <RealPumpkin skin="deep" className="ground-pumpkin gp-hero-b" />
        <ZombieHand className="zh-hero" />
        <SwingingLantern className="lantern-extra-hero" />
        <HalloweenGarland /><SwingingLantern className="lantern-extra-hero-bottom" />
        <Cobweb className="web-section-left" />
        <Cobweb className="web-section-right" />
        <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <div className="decor-anchor glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-foreground/90">
              <AttachedDecor chapter={0} index={3} />
              <Ghost className="h-4 w-4 text-seasonal" aria-hidden="true" />
              Studio digital indépendant
              <span className="mx-1 hidden h-1 w-1 rounded-full bg-seasonal sm:inline-block" aria-hidden="true" />
              <span className="hidden text-seasonal sm:inline">Édition Halloween</span>
            </div>
            <h1 data-guide="accueil-titre" className="halloween-title font-display text-5xl leading-[1.05] font-extrabold sm:text-6xl lg:text-7xl">
              <Cobweb />
              <span className="zrk-identity">Ȥrk</span> crée vos <span className="ember-text pr-2">sites et applications</span> avec sérieux.
            </h1>
            <p data-guide="accueil-texte" className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
              Je transforme une idée en un produit numérique clair, moderne et fiable : site web, application mobile, bot ou outil sur mesure. Vous échangez directement avec moi, simplement, du cadrage à la mise en ligne.
            </p>
            <div data-guide="accueil-boutons" className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="halloween-button ember-button h-auto min-h-13 rounded-full bg-seasonal px-7 py-3.5 text-base font-semibold text-seasonal-foreground hover:bg-seasonal/90">
                <a href="#contact"><Cobweb /> Commander un site <MessageCircle className="h-4 w-4" /></a>
              </Button>
              <Button asChild variant="outline" size="lg" className="decor-anchor glass h-auto min-h-13 whitespace-normal rounded-full px-7 py-3.5 text-base hover:bg-card/80">
                <a data-guide="discord" href={discordUrl} target="_blank" rel="noopener noreferrer">
                  <AttachedDecor chapter={0} index={1} />
                  <DiscordIcon /> Rejoindre le serveur Discord
                </a>
              </Button>
            </div>
            <div data-guide="accueil-promesse" className="mt-11 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-seasonal" /> Sur mesure</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-seasonal" /> Sécurisé</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-seasonal" /> Accompagnement direct</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="portrait-halo" aria-hidden="true" />
            <AttachedDecor chapter={0} index={2} />
            <Cobweb className="web-avatar" />
            <Pumpkins className="pumpkins-avatar" />
            <div className="glass relative overflow-hidden rounded-[1.75rem] p-3 shadow-2xl">
              <img src={avatarUrl} alt="Photo de profil de Ȥrk" className="zrk-portrait aspect-square w-full rounded-[1.25rem] object-cover" />
              <div className="flex items-center justify-between gap-4 px-3 pb-2 pt-5">
                <div>
                  <p className="font-brand text-2xl font-bold">Ȥrk</p>
                  <p className="mt-1 text-sm text-muted-foreground">Créateur de produits numériques</p>
                </div>
                <div className="spell-icon flex h-11 w-11 items-center justify-center rounded-full bg-seasonal-soft text-seasonal">
                  <BadgeCheck className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="halloween-stage relative py-24 lg:py-32">
        <HalloweenScene chapter={1} />
        <SwingingLantern className="lantern-services-left" />
        <SwingingLantern className="lantern-right" />
        <DriftingGhost className="ghost-high" />
        <RealPumpkin carved className="ground-pumpkin gp-services-a" />
        <RealPumpkin skin="ghost" carved className="ground-pumpkin gp-services-b" />
        <ZombieHand className="zh-services" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rise-in max-w-3xl">
            <p className="eyebrow"><Sparkles className="h-4 w-4" aria-hidden="true" /> Ce que je crée</p>
            <h2 className="halloween-title moon-text mt-5 font-display text-4xl leading-tight font-bold sm:text-6xl"><Cobweb />Une solution complète pour votre projet.</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              De la première maquette à la publication, je construis des produits utiles, agréables à utiliser et simples à faire évoluer.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {services.map((service, index) => (
              <article key={service.title} data-guide={`service-${index}`} className="halloween-card spell-card glass rise-in group p-8">
                <AttachedDecor chapter={1} index={index as 0 | 1 | 2 | 3} />
                <Cobweb className="web-card" />
                <div className="flex items-center justify-between">
                  <div className="spell-icon flex h-13 w-13 items-center justify-center rounded-2xl bg-seasonal-soft text-seasonal">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-sm text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-7 font-display text-2xl font-bold sm:text-3xl">{service.title}</h3>
                <p className="mt-3 max-w-xl leading-7 text-muted-foreground">{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="apropos" className="halloween-stage relative border-y border-border/40 bg-secondary/55 py-24 lg:py-32">
        <HalloweenScene chapter={2} />
        <SwingingLantern className="lantern-about-left" />
        <SwingingLantern className="lantern-about-right" />
        <CandleCluster className="candles-about" />
        <CandleCluster className="candles-about-right" />
        <DriftingGhost className="ghost-about-top" />
        <RealPumpkin skin="deep" carved className="ground-pumpkin gp-about-a" />
        <RealPumpkin className="ground-pumpkin gp-about-b" />
        <ZombieHand className="zh-about" />
        <ZombieHand className="zh-about-left" />
        <ZombieHand className="zh-about-right-2" />
        <DriftingGhost className="ghost-about-right" />
        <ZombieHand className="zh-about-right" />
        <RealPumpkin skin="ghost" className="ground-pumpkin gp-about-right" />
        <DriftingGhost className="ghost-about-bottom" />
        <SwingingLantern className="lantern-about-bottom-left" />
        <CandleCluster className="candles-about-bottom-right" />
        <SwingingLantern className="lantern-about-bottom-right" />
        <Cobweb className="web-section-right" />
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <div className="rise-in">
            <p className="eyebrow"><Ghost className="h-4 w-4" aria-hidden="true" /> À propos de moi</p>
            <h2 data-guide="apropos-titre" className="decor-anchor mt-5 font-display text-4xl font-bold sm:text-6xl"><AttachedDecor chapter={2} index={0} />Je suis <span className="zrk-identity ember-text">Ȥrk</span>.</h2>
            <div className="decor-anchor glass mt-9 rounded-[1.5rem] p-2.5 shadow-2xl">
              <AttachedDecor chapter={2} index={1} />
              <img src={bannerHd} alt="L’univers visuel du studio Ȥrk" className="aspect-[16/9] w-full rounded-[1.1rem] object-cover" />
            </div>
          </div>
          <div className="rise-in space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
            <p>
              Je suis développeur indépendant et fondateur de <strong className="font-semibold text-foreground">Ȥrk</strong>. J’accompagne les particuliers, créateurs, communautés et entreprises qui veulent donner vie à une idée numérique sans devoir coordonner plusieurs prestataires.
            </p>
            <p data-guide="apropos-metier">
              Mon cœur de métier est la <strong className="font-semibold text-foreground">création de sites web et d’applications mobiles</strong>. Je m’occupe de l’apparence, du fonctionnement, des données, de la mise en ligne et du suivi. Je développe aussi des bots Telegram, WhatsApp et Discord ainsi que des outils d’automatisation adaptés à votre activité.
            </p>
            <p>
              Ma spécialisation en cybersécurité n’est pas là pour donner une image inquiétante : elle me permet surtout de concevoir des projets plus fiables. Les accès, les données et l’hébergement sont réfléchis avec sérieux dès le départ.
            </p>
            <p data-guide="apropos-propriete">
              Je privilégie une relation simple et transparente. Vous parlez directement avec la personne qui conçoit votre projet, vous suivez son avancement et vous recevez une solution qui vous appartient vraiment.
            </p>
            <div data-guide="apropos-engagements" className="grid gap-3 pt-4 sm:grid-cols-2">
              {commitments.map((item, index) => (
                <div key={item} className="decor-anchor glass flex gap-3 rounded-2xl p-4 text-sm leading-6 text-foreground">
                  {index < 2 && <AttachedDecor chapter={2} index={index === 0 ? 2 : 3} />}
                  <Check className="mt-1 h-4 w-4 shrink-0 text-seasonal" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="methode" className="halloween-stage relative py-24 lg:py-32">
        <HalloweenScene chapter={3} />
        <SwingingLantern className="lantern-method-left" />
        <SwingingLantern className="lantern-method-left-top" />
        <CandleCluster className="candles-method" />
        <CandleCluster className="candles-method-right" />
        <CandleCluster className="candles-method-top-right" />
        <CandleCluster className="candles-method-left" />
        <CandleCluster className="candles-method-right-2" />
        <SwingingLantern className="lantern-left" />
        <DriftingGhost className="ghost-low ghost-reverse" />
        <DriftingGhost className="ghost-method-top" />
        <DriftingGhost className="ghost-method-right" />
        <RealPumpkin skin="deep" className="ground-pumpkin gp-method-left" />
        <RealPumpkin skin="deep" className="ground-pumpkin gp-method-left-3" />
        <RealPumpkin skin="deep" className="ground-pumpkin gp-method-left-2" />
        <RealPumpkin carved className="ground-pumpkin gp-method-a" />
        <ZombieHand className="zh-method" />
        <ZombieHand className="zh-method-2" />
        <ZombieHand className="zh-method-left" />
        <ZombieHand className="zh-method-right-edge" />
        <DriftingGhost className="ghost-method-bottom" />
        <DriftingGhost className="ghost-method-bottom-left" />
        <SwingingLantern className="lantern-method-right" />
        <CandleCluster className="candles-method-bottom-right" />
        <CandleCluster className="candles-method-bottom-right-2" />
        <SwingingLantern className="lantern-method-bottom-left" />
        <SwingingLantern className="lantern-method-bottom-right" />
        <CandleCluster className="candles-method-bottom-right-3" />
        <CandleCluster className="candles-method-bottom-right-4" />
        <RealPumpkin skin="ghost" className="ground-pumpkin gp-method-bottom-left" />
        <DriftingGhost className="ghost-method-bottom-right" />
        <RealPumpkin skin="deep" className="ground-pumpkin gp-method-right" />
        <RealPumpkin skin="deep" className="ground-pumpkin gp-method-right-2" />
        <RealPumpkin skin="deep" className="ground-pumpkin gp-method-right-3" />
        <Cobweb className="web-section-left" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rise-in max-w-2xl">
            <p className="eyebrow">Une collaboration simple</p>
            <h2 className="decor-anchor moon-text mt-5 font-display text-4xl font-bold sm:text-6xl"><AttachedDecor chapter={3} index={0} />Votre idée, accompagnée de A à Z.</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { icon: MessageCircle, n: "01", t: "On échange", d: "Vous m’expliquez votre idée, vos objectifs et votre budget." },
              { icon: Code2, n: "02", t: "Je construis", d: "Je conçois, développe et teste votre solution avec vous." },
              { icon: HeartHandshake, n: "03", t: "Je vous accompagne", d: "Je mets le projet en ligne et reste disponible après la livraison." },
            ].map((step, index) => (
              <article key={step.n} data-guide={`etape-${index}`} className="decor-anchor spell-card glass rise-in p-8">
                <AttachedDecor chapter={3} index={index === 0 ? 1 : index === 1 ? 2 : 3} />
                <div className="flex items-start justify-between">
                  <span className="step-number ember-text">{step.n}</span>
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-8 font-display text-2xl font-bold">{step.t}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{step.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="video" className="halloween-stage relative py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1fr_auto] lg:px-10">
          <div className="rise-in max-w-xl">
            <p className="eyebrow">Le studio en 50 secondes</p>
            <h2 className="moon-text mt-5 font-display text-4xl font-bold sm:text-6xl">Tout Ȥrk, en une vidéo.</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">Sites web, applications mobiles, bots et cybersécurité : un aperçu rapide de ce que je crée, en format vertical.</p>
          </div>
          <StudioVideo />
        </div>
      </section>

      <section id="contact" className="halloween-stage halloween-contact relative text-foreground">
        <HalloweenScene chapter={4} />
        <DriftingGhost className="ghost-contact-left" />
        <CandleCluster className="candles-contact" />
        <RealPumpkin carved className="ground-pumpkin gp-contact-a" />
        <RealPumpkin skin="ghost" className="ground-pumpkin gp-contact-b" />
        <SwingingLantern className="lantern-right lantern-short" />
        <DriftingGhost className="ghost-contact-top" />
        <Cobweb className="web-section-right" />
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="cauldron-panel rise-in flex flex-col items-start justify-between gap-10 px-7 py-12 sm:px-12 lg:flex-row lg:items-center lg:py-16">
            <div className="max-w-2xl">
              <p className="eyebrow">Parlons de votre idée</p>
              <h2 className="decor-anchor mt-4 font-display text-4xl font-bold sm:text-5xl"><AttachedDecor chapter={4} index={0} />Besoin d’un site, d’une app ou d’un bot ?</h2>
              <p data-guide="contact-promo" className="mt-6 inline-flex items-center gap-2 rounded-full border border-seasonal/40 bg-seasonal-soft px-4 py-2 text-sm font-medium text-seasonal"><Ghost className="h-4 w-4 shrink-0" aria-hidden="true" /> −{halloweenOffer.discountPercent} % sur toute prestation · Code {halloweenOffer.code}</p>
              <p className="mt-5 leading-7 text-muted-foreground">Présentez-moi votre projet par WhatsApp, Discord ou e-mail. Je vous répondrai directement pour voir comment le réaliser.</p>
            </div>
            <div data-guide="contact-boutons" className="halloween-contact-buttons relative flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:min-w-64">
              <Cobweb />
              <a
                data-guide="whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="decor-anchor ember-button inline-flex items-center justify-center gap-2 rounded-full bg-seasonal px-6 py-4 font-semibold text-seasonal-foreground"
              >
                <AttachedDecor chapter={4} index={1} />
                <WhatsAppIcon className="h-5 w-5" /> WhatsApp
              </a>
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="decor-anchor glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-foreground transition hover:bg-card"
              >
                <AttachedDecor chapter={4} index={2} />
                <DiscordIcon className="h-5 w-5 text-discord" /> Discord
              </a>
              <a
                href={emailUrl}
                className="decor-anchor glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-foreground transition hover:bg-card"
              >
                <AttachedDecor chapter={4} index={3} />
                <Mail className="h-5 w-5 text-primary" /> E-mail
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-border/40 bg-background/70 backdrop-blur">
        <Ghost className="halloween-footer-ghost h-8 w-8 text-seasonal" aria-hidden="true" />
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© 2026 <span className="font-brand font-semibold text-foreground">Ȥrk</span> — Création numérique sur mesure</p>
          <p className="flex items-center gap-4">Designed by Eliza <a href="/admin" className="rounded-full border border-border/60 px-3 py-1 text-xs transition-colors hover:border-seasonal hover:text-seasonal">🛡️ Admin</a></p>
        </div>
      </footer>
    </main>
  );
}
