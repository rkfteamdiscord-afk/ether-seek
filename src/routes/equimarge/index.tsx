import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  Calculator,
  Check,
  ClipboardList,
  FileText,
  Gauge,
  HandCoins,
  Lightbulb,
  LineChart,
  Lock,
  PiggyBank,
  Smartphone,
  SlidersHorizontal,
  TrendingDown,
  Wheat,
} from "lucide-react";

import { HorseSilhouette, Logo, StableScene } from "@/components/equimarge/Illustrations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { offer, plans } from "@/lib/equimarge/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equimarge/")({
  component: Landing,
});

const signUp = { to: "/equimarge/connexion", search: { mode: "inscription" } } as const;

function PrimaryCta({
  className,
  children = "Essayer gratuitement",
}: {
  className?: string;
  children?: string;
}) {
  return (
    <Link
      {...signUp}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {children}
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}

const problems = [
  {
    icon: TrendingDown,
    title: "Des marges très serrées",
    text: "Une fois le foin, les salaires et le crédit payés, il reste souvent peu, et on ne sait pas toujours où part l'argent.",
  },
  {
    icon: Wheat,
    title: "Le foin et les soins augmentent",
    text: "Une mauvaise saison de fauche ou une hausse du vétérinaire, et vos coûts grimpent sans que vos tarifs suivent.",
  },
  {
    icon: HandCoins,
    title: "Des pensions sous-tarifées",
    text: "Un prix fixé il y a cinq ans ne couvre plus forcément ce que coûte réellement un cheval chez vous.",
  },
  {
    icon: PiggyBank,
    title: "Des chevaux de club qui coûtent plus qu'ils ne rapportent",
    text: "Un poney âgé qui travaille peu mange autant que les autres : sans chiffres, impossible de le voir.",
  },
];

const steps = [
  {
    icon: ClipboardList,
    title: "Saisissez vos dépenses et vos chevaux",
    text: "Foin, paille, maréchal, salaires… et la liste de vos chevaux. Un centre d'exemple vous montre le chemin.",
  },
  {
    icon: Calculator,
    title: "L'outil calcule tout",
    text: "Les dépenses communes sont réparties entre vos chevaux, les frais de chacun lui sont affectés.",
  },
  {
    icon: Lightbulb,
    title: "Recevez des recommandations claires",
    text: "Quelle pension augmenter, quel cheval coûte trop, quelle dépense s'envole : expliqué en une phrase.",
  },
];

const features = [
  {
    icon: HorseIcon,
    title: "Fiche par cheval",
    text: "Club, pension ou propriétaire, avec ses frais de vétérinaire, maréchal, dentiste et compléments.",
  },
  {
    icon: Gauge,
    title: "Tableau de bord",
    text: "Coût moyen d'un cheval, résultat de chaque activité et un voyant vert, orange ou rouge.",
  },
  {
    icon: BellRing,
    title: "Alertes automatiques",
    text: "Pension facturée sous son coût, cheval déficitaire, hausse soudaine d'une dépense.",
  },
  {
    icon: SlidersHorizontal,
    title: "Simulateur",
    text: "Et si j'augmentais la pension de 20 € ? Et si le foin prenait 15 % ? Réponse immédiate.",
  },
  {
    icon: LineChart,
    title: "Évolution mois par mois",
    text: "Vos dépenses et vos recettes en graphiques simples, sur six mois.",
  },
  {
    icon: FileText,
    title: "Rapport mensuel PDF",
    text: "Les chiffres clés et 3 recommandations, à imprimer ou montrer à votre comptable.",
  },
  {
    icon: Smartphone,
    title: "Pensé pour le téléphone",
    text: "Saisissez une facture depuis l'écurie, en quelques secondes, avec de gros boutons.",
  },
  {
    icon: Lock,
    title: "Vos données protégées",
    text: "Chaque compte ne voit que ses propres chiffres. Export complet à tout moment.",
  },
];

const faq = [
  {
    q: "Mes données sont-elles en sécurité ?",
    a: "Oui. La connexion est chiffrée et chaque compte est cloisonné : personne d'autre que vous ne voit vos chevaux, vos dépenses ou vos recettes. Vous pouvez exporter toutes vos données à tout moment depuis les paramètres.",
  },
  {
    q: "Combien de temps faut-il pour prendre l'outil en main ?",
    a: "Environ 15 minutes. Un centre d'exemple de 15 chevaux est déjà rempli pour vous montrer à quoi ressemblent les résultats. Ensuite, vous saisissez vos propres chiffres à votre rythme, puis 15 minutes par mois suffisent.",
  },
  {
    q: "Je ne suis pas à l'aise avec l'informatique, est-ce pour moi ?",
    a: "C'est justement fait pour ça : pas de tableur, pas de jargon. Vous choisissez une catégorie (foin, maréchal…), vous tapez un montant, c'est tout. Chaque chiffre est expliqué en une phrase.",
  },
  {
    q: "Puis-je résilier à tout moment ?",
    a: "Oui, sans engagement et sans frais. L'abonnement est mensuel et vous l'arrêtez en un clic depuis vos paramètres. Vos données restent exportables.",
  },
  {
    q: "Faut-il une carte bancaire pour l'essai ?",
    a: `Non. L'essai gratuit dure ${offer.trialDays} jours, avec toutes les fonctions de l'offre Pro, sans carte bancaire.`,
  },
  {
    q: "Est-ce que ça remplace mon comptable ?",
    a: "Non, EquiMarge est un outil de pilotage au quotidien : il vous aide à fixer vos prix et à repérer ce qui coûte trop. Votre comptable reste indispensable pour la comptabilité officielle.",
  },
];

function HorseIcon(props: { className?: string | undefined }) {
  return <HorseSilhouette className={props.className} />;
}

function Landing() {
  return (
    <div className="overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/equimarge" aria-label="EquiMarge, accueil">
            <Logo />
          </Link>
          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-6 text-[0.98rem] md:flex"
          >
            <a href="#probleme" className="hover:text-primary">
              Le problème
            </a>
            <a href="#fonctionnement" className="hover:text-primary">
              Comment ça marche
            </a>
            <a href="#tarifs" className="hover:text-primary">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-primary">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/equimarge/connexion"
              search={{ mode: "connexion" }}
              className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold hover:text-primary"
            >
              Se connecter
            </Link>
            <PrimaryCta className="hidden min-h-11 px-5 sm:inline-flex" />
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-[1.05fr_1fr] md:pt-16">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
              Pour centres équestres, poneys-clubs et écuries de pension
            </p>
            <h1 className="text-[2.35rem] font-semibold leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
              Savez-vous combien vous coûte <em className="text-primary not-italic">vraiment</em>{" "}
              chaque cheval ?
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Découvrez en 15 minutes ce qui rapporte et ce qui vous fait perdre de l'argent dans
              votre centre équestre.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryCta className="min-h-14 px-8 text-lg" />
              <a
                href="#fonctionnement"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-card px-6 font-semibold hover:border-primary/50"
              >
                Voir comment ça marche
              </a>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] text-muted-foreground">
              {[
                `${offer.trialDays} jours gratuits`,
                "Sans carte bancaire",
                "Résiliable à tout moment",
              ].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <StableScene className="h-auto w-full drop-shadow-[0_20px_40px_oklch(0.45_0.05_80/0.18)]" />
            <div className="absolute -bottom-6 left-3 right-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur sm:left-auto sm:right-[-12px] sm:w-80">
              <p className="text-sm font-semibold text-[var(--em-bad)]">Alerte pension</p>
              <p className="mt-1 text-[0.98rem] leading-snug">
                La pension de Tornado vous coûte <strong>412 €</strong> par mois, vous la facturez{" "}
                <strong>380 €</strong> : vous perdez <strong>32 €</strong> chaque mois.
              </p>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section id="probleme" className="scroll-mt-20 bg-secondary/60 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">Le problème</h2>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              Vous travaillez sept jours sur sept, l'écurie est pleine… et pourtant, en fin de mois,
              il ne reste pas grand-chose. Vous n'êtes pas seul dans ce cas.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {problems.map((p) => (
                <article
                  key={p.title}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--em-brown-soft)] text-[var(--em-brown)]">
                    <p.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className="mt-1 text-muted-foreground">{p.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="fonctionnement" className="scroll-mt-20 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Comment ça marche</h2>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              Trois étapes, sans tableur ni formule.
            </p>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="relative rounded-2xl border border-border bg-card p-6">
                  <span
                    className="font-serif-em text-5xl font-semibold text-[var(--em-sage-soft)]"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <s.icon
                    className="absolute right-6 top-7 h-7 w-7 text-primary"
                    aria-hidden="true"
                  />
                  <h3 className="mt-2 text-xl font-semibold">
                    <span className="sr-only">Étape {i + 1} : </span>
                    {s.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="fonctionnalites" className="scroll-mt-20 bg-[oklch(0.93_0.03_130)] py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Tout ce qu'il faut, rien de compliqué
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <article key={f.title} className="rounded-2xl bg-card p-5 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1 text-[0.98rem] text-muted-foreground">{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="tarifs" className="scroll-mt-20 py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-3xl font-semibold sm:text-4xl">Des tarifs simples</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-lg text-muted-foreground">
              Essai gratuit de {offer.trialDays} jours, sans carte bancaire. Sans engagement
              ensuite.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <PlanCard
                name={plans.essentiel.label}
                price={plans.essentiel.pricePerMonth}
                tagline="Pour les petites structures"
                items={[
                  `Jusqu'à ${offer.essentielHorseLimit} chevaux`,
                  "Tableau de bord et alertes",
                  "Simulateur (prix, foin, cours)",
                  "Rapport mensuel PDF",
                  "Export de vos données",
                ]}
              />
              <PlanCard
                highlighted
                name={plans.pro.label}
                price={plans.pro.pricePerMonth}
                tagline="Pour les centres qui grandissent"
                items={[
                  "Chevaux illimités",
                  "Tout ce qui est dans Essentiel",
                  "Simulateur avancé : arrivées et départs de chevaux",
                  "Rapport mensuel PDF",
                  "Export de vos données",
                ]}
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 bg-secondary/60 py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Questions fréquentes</h2>
            <Accordion type="single" collapsible className="mt-6">
              {faq.map((item, i) => (
                <AccordionItem key={item.q} value={`q${i}`} className="border-border">
                  <AccordionTrigger className="py-5 text-left text-lg font-semibold hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-base text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground">
            <HorseSilhouette className="h-16 w-20 text-[oklch(0.82_0.08_80)]" />
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Prenez 15 minutes pour y voir clair
            </h2>
            <p className="max-w-xl text-lg opacity-90">
              Un centre d'exemple de 15 chevaux vous attend déjà dans l'application.
            </p>
            <Link
              {...signUp}
              className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[oklch(0.97_0.02_85)] px-8 text-lg font-semibold text-primary hover:bg-white"
            >
              Essayer gratuitement
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} EquiMarge — Fait pour les gens de cheval, en France.</p>
        </div>
      </footer>
    </div>
  );
}

function PlanCard({
  name,
  price,
  tagline,
  items,
  highlighted = false,
}: {
  name: string;
  price: number;
  tagline: string;
  items: string[];
  highlighted?: boolean;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-3xl border bg-card p-6 sm:p-8",
        highlighted ? "border-primary shadow-lg" : "border-border",
      )}
    >
      {highlighted && (
        <span className="absolute -top-3 left-6 rounded-full bg-[var(--em-brown)] px-3 py-1 text-sm font-semibold text-white">
          Le plus complet
        </span>
      )}
      <h3 className="text-2xl font-semibold">{name}</h3>
      <p className="text-muted-foreground">{tagline}</p>
      <p className="mt-4">
        <span className="font-serif-em text-5xl font-semibold">{price}&nbsp;€</span>
        <span className="text-muted-foreground"> /mois</span>
      </p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <PrimaryCta
        className={cn(
          "mt-6 w-full",
          !highlighted && "bg-[var(--em-brown)] hover:bg-[var(--em-brown)]/90",
        )}
      >
        {`Essayer ${offer.trialDays} jours gratuitement`}
      </PrimaryCta>
    </article>
  );
}
