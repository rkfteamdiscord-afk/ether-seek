import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  Building2,
  Check,
  ClipboardList,
  FileBarChart2,
  Landmark,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CountryVisual } from "@/abroadyield/components/CountryVisual";
import { CountUp, Reveal, RouteMap } from "@/abroadyield/components/motion";
import { Compass, HeroDecor } from "@/abroadyield/components/Decor";
import { MobileDock } from "@/abroadyield/components/MobileDock";
import { CinematicHero, type Slide } from "@/abroadyield/components/CinematicHero";
import { bundledPhoto } from "@/abroadyield/lib/photos";
import {
  Card,
  Container,
  Disclaimer,
  Eyebrow,
  Pill,
  SectionHeading,
  buttonClass,
} from "@/abroadyield/components/ui";
import {
  computeScenario,
  formatDate,
  formatPct,
  formatPctRange,
  formatUsd,
  headlineSentence,
  roughly,
  runScenario,
} from "@/abroadyield/engine";
import { emptyProfile } from "@/abroadyield/profile";
import { track } from "@/abroadyield/lib/analytics";
import { useSiteData } from "@/abroadyield/store/hooks";
import type { Settings } from "@/abroadyield/types";

const FAQ = (settings: Settings) => [
  {
    q: "Is this tax advice?",
    a: "No. AbroadYield gives educational estimates so you can compare countries and ask better questions. It is not tax, legal, financial or investment advice. Before you decide, talk to a US CPA or enrolled agent and a local attorney.",
  },
  {
    q: "Where does the data come from?",
    a: "From official tax authority publications, land registries, IRS publications and established property-market sources. Every report section lists its sources and the date the data was last verified. Figures still marked “Sample data – to be verified” have not been checked yet.",
  },
  {
    q: "How often is it updated?",
    a: "Tax parameters are reviewed at least once a year and whenever a law changes. Country costs, rents and financing data are reviewed every quarter. Each section shows its own “last verified” date.",
  },
  {
    q: "Can I get a refund?",
    a: `Yes. If the report doesn't help you, ask for a full refund within ${settings.refundDays} days of purchase. No questions asked.`,
  },
  {
    q: "Is my data safe?",
    a: "Your answers are used only to calculate your results. Sensitive financial inputs are encrypted, we never sell your data, and you can delete your account and data at any time from your account page.",
  },
];

export const Route = createFileRoute("/abroadyield/")({
  head: () => ({
    meta: [
      { title: "AbroadYield — Where should you invest abroad? Find out what you'll really earn" },
      {
        name: "description",
        content:
          "Free country ranking in 3 minutes. After-tax returns, financing options and risks — built for US taxpayers buying rental property abroad.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { countries, cities, settings, usTax } = useSiteData();
  useEffect(() => track("landing_view"), []);

  // Live illustration from the engine: an apartment advertised at 7% gross, per country.
  const [exampleId, setExampleId] = useState("pt");
  const exampleChoices = ["pt", "es", "mx", "ae"]
    .map((id) => countries.find((c) => c.id === id && c.published))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const example = useMemo(() => {
    const pt = countries.find((c) => c.id === exampleId) ?? countries[0];
    if (!pt) return null;
    const result = computeScenario({
      priceUsd: 250000,
      potentialRentUsd: 17500,
      strategy: "long",
      vacancy: pt.rental.vacancyLong,
      managementPct: pt.rental.managementLong,
      maintenancePctOfPrice: pt.rental.maintenancePctOfPrice,
      insurancePctOfPrice: pt.rental.insurancePctOfPrice,
      propertyTaxPctOfPrice: pt.rental.propertyTaxPctOfPrice,
      hoaAnnualUsd: pt.rental.hoaMonthlyUsd * 12,
      acquisitionCostUsd: 20000,
      downPaymentPct: 1,
      interestRate: 0.05,
      termYears: 25,
      fxChange: 0,
      localTax: pt.localTax,
      us: { params: usTax, filing: "mfj", baseIncomeUsd: 200000, state: "NY" },
    });
    return { country: pt, result };
  }, [countries, usTax, exampleId]);
  const heroCtaText = useRef<HTMLParagraphElement>(null);
  const slides = useMemo<Slide[]>(() => {
    const picks: Array<[string, string]> = [
      ["pt", "pt-lisbon"],
      ["es", "es-malaga"],
      ["it", "it-rome"],
      ["gr", "gr-athens"],
      ["mx", "mx-playa"],
      ["cr", "cr-tamarindo"],
      ["ae", "ae-marina"],
    ];
    const profile = {
      ...emptyProfile,
      residence: "us" as const,
      usState: "NY",
      income: "150to250" as const,
      filingStatus: "mfj" as const,
      financing: "cash" as const,
      strategy: "long" as const,
    };
    return picks.flatMap(([countryId, cityId]) => {
      const country = countries.find((c) => c.id === countryId && c.published);
      const city = cities.find((c) => c.id === cityId);
      if (!country || !city) return [];
      const { result } = runScenario({ country, city, profile, settings, usTax });
      const bundled = bundledPhoto(country.id);
      return [
        {
          country,
          place: city.name,
          photo: country.imageUrl || bundled?.src || "",
          alt: country.imageAlt || bundled?.shows || `${city.name}, ${country.name}`,
          photoCaption: country.imageUrl
            ? (country.imageAlt ?? "")
            : bundled
              ? `Photo: ${bundled.shows} (Unsplash)`
              : "",
          gross: result.grossYield,
          afterTax: result.afterTaxYield,
        },
      ];
    });
  }, [countries, cities, settings, usTax]);

  const previewSentence = useMemo(() => {
    const pt = countries.find((c) => c.id === "pt");
    const porto = cities.find((c) => c.id === "pt-porto");
    if (!pt || !porto) return "";
    const profile = {
      ...emptyProfile,
      residence: "us" as const,
      usState: "NY",
      income: "150to250" as const,
      filingStatus: "mfj" as const,
      financing: "cash" as const,
      strategy: "long" as const,
    };
    const { result } = runScenario({ country: pt, city: porto, profile, settings, usTax });
    return headlineSentence({ country: pt, city: porto, result, strategy: "long" });
  }, [countries, cities, settings, usTax]);

  const faq = FAQ(settings);
  const published = countries.filter((c) => c.published);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Cinematic hero */}
      <CinematicHero slides={slides} onStart={() => track("questionnaire_start", { from: "hero" })}>
        <p className="ay-rise text-sm font-semibold tracking-[0.16em] text-ay-sand-2 uppercase">
          For US citizens and green card holders
        </p>
        <h1 className="mt-4 text-[2.7rem] font-medium text-white sm:text-6xl lg:text-[4.4rem]">
          <span className="ay-rise block" style={{ "--ay-delay": "60ms" } as React.CSSProperties}>
            Where should you invest abroad?
          </span>
          <span
            className="ay-rise ay-italic-accent mt-1 block"
            style={{ "--ay-delay": "160ms" } as React.CSSProperties}
          >
            Find out what you'll really earn.
          </span>
        </h1>
        <p
          ref={heroCtaText}
          className="ay-rise mt-6 max-w-xl text-xl text-white/80"
          style={{ "--ay-delay": "260ms" } as React.CSSProperties}
        >
          Free country ranking in 3 minutes. After-tax returns, financing options and risks — built
          for US taxpayers.
        </p>
      </CinematicHero>

      {/* Live example */}
      <section
        id="example"
        aria-labelledby="example-title"
        className="scroll-mt-24 bg-ay-ivory py-20 sm:py-28"
      >
        <Container className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>The real number</Eyebrow>
            <h2 id="example-title" className="mt-3 text-4xl sm:text-5xl">
              A 7% listing rarely pays 7%.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-ay-slate">
              Pick a country. We run the same $250,000 apartment through running costs, the local
              tax on rent and your US federal and state tax — the way your accountant would.
            </p>
            <ul className="mt-8 grid gap-2 text-ay-slate sm:grid-cols-2">
              {[
                "No credit card for the ranking",
                `${published.length} countries compared`,
                "Foreign + US federal + state tax",
                "Sources and dates on every number",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check aria-hidden className="size-5 text-ay-gold" /> {item}
                </li>
              ))}
            </ul>
          </div>
          {example ? (
            <div className="relative">
              {exampleChoices.length > 1 ? (
                <div className="mb-4 flex justify-center lg:justify-start">
                  <div
                    role="group"
                    aria-label="Show the example for"
                    className="ay-segmented ay-segmented-light"
                  >
                    {exampleChoices.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={c.id === example.country.id}
                        onClick={() => setExampleId(c.id)}
                      >
                        {c.name.replace(/\s*\(.*\)$/, "").replace("United Arab Emirates", "Dubai")}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <Card className="ay-materialize relative text-ay-ink shadow-2xl shadow-black/40">
                <p className="text-sm font-semibold uppercase tracking-wider text-ay-gold">
                  Example · {example.country.name}
                </p>
                <p className="mt-2 text-lg text-ay-ink">
                  A $250,000 apartment advertised at a 7% yield
                </p>
                <dl className="mt-5 space-y-3">
                  <YieldBar
                    label="Advertised (gross) yield"
                    value={example.result.grossYield}
                    max={0.08}
                    tone="sand"
                    delay={300}
                  />
                  <YieldBar
                    label="After running costs"
                    value={example.result.netYieldBeforeTax}
                    max={0.08}
                    tone="sky"
                    delay={550}
                  />
                  <YieldBar
                    label="After local + US taxes"
                    value={example.result.afterTaxYield}
                    max={0.08}
                    tone="navy"
                    delay={800}
                  />
                </dl>
                <p className="mt-5 rounded-lg bg-ay-sand p-3 text-ay-ink">
                  You'd keep about <strong>{formatPct(example.result.afterTaxYield)}</strong> per
                  year, or roughly{" "}
                  <strong>{formatUsd(roughly(example.result.afterTaxIncomeUsd))}</strong> — not the{" "}
                  {formatUsd(17500)} the listing implies.
                </p>
                <p className="mt-3 text-sm text-ay-slate">
                  Married couple in New York earning $200k, all-cash purchase. Sample data – to be
                  verified.
                </p>
              </Card>
            </div>
          ) : null}
        </Container>
      </section>

      {/* Route band: flight arcs (wide screens) and a drifting strip of destination photos */}
      <section aria-hidden className="ay-aurora overflow-hidden py-10" data-nav-tone="dark">
        <HeroDecor />
        <Container>
          <RouteMap className="hidden h-auto w-full opacity-85 sm:block" />
        </Container>
        <div className="ay-marquee mt-2 sm:mt-6">
          <div className="ay-marquee-track">
            {[...slides, ...slides].map((slide, i) => (
              <figure key={`${slide.country.id}-${i}`} className="ay-marquee-card">
                <CountryVisual country={slide.country} className="ay-marquee-media" />
                <figcaption>
                  <span className="block text-lg font-semibold tracking-tight text-white">
                    {slide.place}
                  </span>
                  <span className="text-sm text-white/75">
                    {(slide.gross * 100).toFixed(1)}% →{" "}
                    <strong className="text-ay-sand-2">{(slide.afterTax * 100).toFixed(1)}%</strong>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Key figures */}
      <section aria-label="AbroadYield in numbers" className="border-b border-ay-line bg-white">
        <Container>
          <dl className="grid grid-cols-2 divide-ay-line py-8 md:grid-cols-4 md:divide-x">
            {[
              {
                value: published.length,
                label: "countries compared",
                format: (v: number) => String(Math.round(v)),
              },
              {
                value: cities.length,
                label: "cities with rents and prices",
                format: (v: number) => String(Math.round(v)),
              },
              {
                value: 3,
                label: "tax layers: local, federal, state",
                format: (v: number) => String(Math.round(v)),
              },
              {
                value: 3,
                label: "minutes to your free ranking",
                format: (v: number) => String(Math.round(v)),
              },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80} className="px-4 py-3 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-[family-name:var(--font-ay-head)] text-4xl font-semibold text-ay-navy">
                  <CountUp value={stat.value} format={stat.format} />
                </dd>
                <dd aria-hidden className="mt-1 text-ay-slate">
                  {stat.label}
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* Hidden costs */}
      <section aria-labelledby="hidden-costs" className="relative overflow-hidden py-24">
        <Compass className="absolute -top-10 -right-16 hidden md:block" size={360} />
        <Container>
          <SectionHeading
            id="hidden-costs"
            eyebrow="Why returns disappoint"
            title="The hidden costs nobody shows you"
            intro="Listings quote gross yield. Here is what quietly comes off before the money reaches your US bank account."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Landmark,
                title: "US worldwide taxation",
                text: "The US taxes citizens on income from anywhere. Foreign tax credits help, but rarely make the US bill disappear — and most states give no credit at all.",
              },
              {
                icon: Building2,
                title: "Closing costs",
                text: "Transfer taxes, notaries, lawyers and agents add 3% to 13% to the price, depending on the country. That money never earns rent.",
              },
              {
                icon: Banknote,
                title: "Currency risk",
                text: "Your rent arrives in euros, pesos or dirhams. A 10% move in the exchange rate can wipe out a year of gains in dollar terms.",
              },
              {
                icon: BadgeDollarSign,
                title: "Running costs & vacancy",
                text: "Management fees, repairs, insurance, property tax, condo fees and empty months typically cost 30–45% of gross rent.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 90}>
                <Card className="ay-lift group h-full">
                  <span className="inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-ay-sand to-ay-sand-2 text-ay-navy transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ay-ink">{title}</h3>
                  <p className="mt-2 text-ay-slate">{text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-title"
        className="ay-band-sand scroll-mt-20 border-y border-ay-line py-24"
      >
        <Container>
          <SectionHeading id="how-title" eyebrow="How it works" title="Three steps, no jargon" />
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ClipboardList,
                title: "Tell us about you",
                text: "Twelve quick questions: your tax situation, budget, financing, goals and lifestyle. About 3 minutes.",
              },
              {
                icon: FileBarChart2,
                title: "Get your free ranking",
                text: "Every country scored 0–100 for you, with yield ranges, closing costs, ownership rules and the key risk.",
              },
              {
                icon: Users,
                title: "Unlock your full report and talk to vetted experts",
                text: "After-tax returns step by step, US tax impact, best cities, financing and a buying checklist — then meet a vetted expert if you want one.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <Reveal
                as="li"
                key={title}
                delay={index * 120}
                className="ay-lift relative rounded-2xl bg-white p-6 ring-1 ring-ay-line"
              >
                {index < 2 ? (
                  <span
                    aria-hidden
                    className="absolute top-1/2 -right-6 hidden h-px w-6 bg-gradient-to-r from-ay-sand-2 to-ay-navy/40 md:block"
                  />
                ) : null}
                <span className="font-[family-name:var(--font-ay-head)] text-sm font-semibold text-ay-gold">
                  Step {index + 1}
                </span>
                <Icon aria-hidden className="mt-3 size-7 text-ay-navy" />
                <h3 className="mt-3 text-xl font-semibold text-ay-ink">{title}</h3>
                <p className="mt-2 text-ay-slate">{text}</p>
              </Reveal>
            ))}
          </ol>
          <div className="mt-10">
            <Link to="/abroadyield/start" className={buttonClass("primary", "px-7")}>
              Start the 3-minute questionnaire <ArrowRight aria-hidden className="size-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Sample report */}
      <section id="sample-report" aria-labelledby="sample-title" className="scroll-mt-20 py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              id="sample-title"
              eyebrow="Sample report"
              title="Every number explained in one plain sentence"
              intro="The full report walks from gross rent to the money you actually keep, with sources and the date each figure was last verified."
            />
            <ul className="mt-6 space-y-2 text-ay-ink">
              {[
                "Executive summary written for your profile",
                "Can you buy? Ownership rules, documents and timeline",
                "Total acquisition cost, line by line",
                "Financing options and indicative borrowing capacity",
                "Returns waterfall: local tax, US federal, state",
                "US tax module: Schedule E, Form 1116, FBAR, FATCA",
                "3–5 best cities with yields and rental rules",
                "Risks with mitigation tips and a buying checklist",
                "Sensitivity simulator and branded PDF",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check aria-hidden className="mt-1 size-5 shrink-0 text-ay-good" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <Card className="relative overflow-hidden">
            <p className="text-sm font-semibold uppercase tracking-wider text-ay-gold">
              Full report · Portugal
            </p>
            <h3 className="mt-2 text-xl font-semibold">Executive summary</h3>
            <p className="mt-2 text-ay-slate">{previewSentence}</p>
            {[
              "After-tax returns waterfall",
              "US tax impact",
              "Best cities",
              "Financing options",
              "Buying checklist",
            ].map((section) => (
              <div key={section} className="mt-5">
                <p className="flex items-center gap-2 font-semibold text-ay-ink">
                  <Lock aria-hidden className="size-4 text-ay-gold" /> {section}
                </p>
                <div className="ay-blur mt-2 space-y-2" aria-hidden>
                  <div className="h-3 w-11/12 rounded bg-ay-line" />
                  <div className="h-3 w-9/12 rounded bg-ay-line" />
                  <div className="h-3 w-10/12 rounded bg-ay-sand-2" />
                </div>
              </div>
            ))}
          </Card>
        </Container>
      </section>

      {/* Countries */}
      <section
        aria-labelledby="countries-title"
        className="ay-band-sand border-y border-ay-line py-24"
      >
        <Container>
          <SectionHeading
            id="countries-title"
            eyebrow="Destinations"
            title={`${published.length} countries compared side by side`}
            intro="Guides are free. Your ranking shows which ones fit you."
          />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {published.map((country, i) => (
              <Reveal as="li" key={country.id} delay={(i % 4) * 80}>
                <Link
                  to="/abroadyield/guides/$slug"
                  params={{ slug: country.slug }}
                  className="ay-lift group block h-full overflow-hidden rounded-2xl border border-ay-line bg-white"
                >
                  <div className="h-28 overflow-hidden">
                    <CountryVisual
                      country={country}
                      className="transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-ay-ink group-hover:underline">
                      {country.name}
                    </h3>
                    <p className="mt-1 text-sm text-ay-slate">
                      Gross yield {formatPctRange(country.rental.grossYieldRange)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Pill tone={country.ownership.status === "allowed" ? "good" : "warn"}>
                        {country.ownership.status === "allowed"
                          ? "Ownership allowed"
                          : "Restricted"}
                      </Pill>
                      {country.dataStatus === "sample" ? (
                        <Pill tone="warn">Sample data</Pill>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <Pricing settings={settings} />

      {/* Trust */}
      <section aria-labelledby="trust-title" className="py-20">
        <Container>
          <SectionHeading id="trust-title" eyebrow="Trust" title="Transparent by design" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Card className="ay-lift">
              <ShieldCheck aria-hidden className="size-7 text-ay-navy" />
              <h3 className="mt-3 text-lg font-semibold">Open methodology</h3>
              <p className="mt-2 text-ay-slate">
                Every formula — from vacancy to the Foreign Tax Credit limitation — is documented in
                plain English.
              </p>
              <Link
                to="/abroadyield/methodology"
                className="mt-3 inline-flex min-h-11 items-center gap-1 font-semibold text-ay-navy-2 underline underline-offset-4"
              >
                Read the methodology <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Card>
            <Card className="ay-lift">
              <FileBarChart2 aria-hidden className="size-7 text-ay-navy" />
              <h3 className="mt-3 text-lg font-semibold">Dated, sourced numbers</h3>
              <p className="mt-2 text-ay-slate">
                Data last updated {formatDate(settings.siteLastUpdated)}. Sources include the IRS,
                national tax authorities, land registries and established market data providers.
              </p>
            </Card>
            <Card className="ay-lift">
              <Users aria-hidden className="size-7 text-ay-navy" />
              <h3 className="mt-3 text-lg font-semibold">Independent experts</h3>
              <p className="mt-2 text-ay-slate">
                We only introduce you to a partner when you ask, with your explicit consent. We may
                receive a referral fee, and we say so.
              </p>
              <Link
                to="/abroadyield/legal/$page"
                params={{ page: "partner-disclosure" }}
                className="mt-3 inline-flex min-h-11 items-center gap-1 font-semibold text-ay-navy-2 underline underline-offset-4"
              >
                Partner disclosure <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Card>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-ay-line p-6 text-ay-slate">
              <p className="font-semibold text-ay-ink">What early users say</p>
              <p className="mt-2">
                Testimonials will appear here once verified customers agree to share them. We never
                publish invented reviews.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-ay-line p-6 text-ay-slate">
              <p className="font-semibold text-ay-ink">Partner network</p>
              <p className="mt-2">
                Logos of vetted US expat tax firms, mortgage brokers, agents and attorneys will be
                shown here once agreements are signed.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Final call to action */}
      <section aria-labelledby="final-cta" className="py-10 sm:py-16">
        <Container>
          <Reveal className="ay-cta-band px-6 py-14 sm:px-14 sm:py-20" data-nav-tone="dark">
            <HeroDecor />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <p className="text-sm font-semibold tracking-[0.14em] text-ay-sand-2 uppercase">
                  Three minutes. No credit card.
                </p>
                <h2 id="final-cta" className="mt-4 text-4xl text-white sm:text-5xl">
                  Know your real return{" "}
                  <span className="ay-italic-accent">before you sign anything.</span>
                </h2>
                <p className="mt-5 max-w-xl text-lg text-white/75">
                  Rank {published.length} destinations for your taxes, budget and lifestyle, then
                  unlock the full report only if it helps.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <Link
                  to="/abroadyield/start"
                  className={buttonClass("sand", "ay-shine px-8 text-lg")}
                  onClick={() => track("questionnaire_start", { from: "final-cta" })}
                >
                  Get my free ranking <ArrowRight aria-hidden className="size-5" />
                </Link>
                <p className="text-sm text-white/60">
                  {settings.refundDays}-day money-back guarantee on paid reports
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        aria-labelledby="faq-title"
        className="scroll-mt-20 border-t border-ay-line bg-ay-sand/40 py-20"
      >
        <Container className="max-w-3xl">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title="Questions people ask before they start"
          />
          <div className="mt-8 divide-y divide-ay-line rounded-2xl border border-ay-line bg-white">
            {faq.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex min-h-11 list-none items-center justify-between gap-4 text-lg font-semibold text-ay-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="text-2xl text-ay-gold transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-ay-slate">{item.a}</p>
              </details>
            ))}
          </div>
          <Disclaimer className="mt-8" />
        </Container>
      </section>
      <MobileDock watch={heroCtaText} />
    </>
  );
}

function YieldBar({
  label,
  value,
  max,
  tone,
  delay = 0,
}: {
  label: string;
  value: number;
  max: number;
  tone: "sand" | "sky" | "navy";
  delay?: number;
}) {
  const colors = { sand: "bg-ay-sand-2", sky: "bg-[#9fb6d6]", navy: "bg-ay-navy" };
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <dt className="text-ay-slate">{label}</dt>
        <dd className="font-[family-name:var(--font-ay-head)] text-xl font-semibold tabular-nums text-ay-ink">
          <CountUp value={value} format={(v) => formatPct(v)} />
        </dd>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-ay-mist" aria-hidden>
        <div
          className={`ay-bar-grow h-3 w-full origin-left rounded-full ${colors[tone]}`}
          style={
            {
              transform: `scaleX(${Math.max(0.02, Math.min(1, value / max))})`,
              transition: "transform 520ms cubic-bezier(0.23, 1, 0.32, 1)",
              "--ay-delay": `${delay}ms`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}

export function Pricing({ settings }: { settings: Settings }) {
  const plans = [
    {
      name: "Free ranking",
      price: "$0",
      note: "No card needed",
      features: [
        "All countries ranked 0–100 for you",
        "Gross yield and closing-cost ranges",
        "Ownership status and the key risk",
      ],
      cta: "Get my free ranking",
      featured: false,
    },
    {
      name: "Full Report",
      price: `$${settings.pricing.fullReportUsd}`,
      note: "One-time",
      features: [
        `One country, or compare up to ${settings.pricing.maxCountriesPerReport}`,
        "After-tax returns waterfall and simulator",
        "US tax module, best cities, financing, risks",
        "Branded PDF, saved in your account",
        "Ask-your-report assistant",
      ],
      cta: "Start with the free ranking",
      featured: true,
    },
    {
      name: "Explorer Pass",
      price: `$${settings.pricing.explorerPassUsd}`,
      note: `One-time · ${settings.pricing.explorerPassDays} days`,
      features: [
        `Unlimited reports for ${settings.pricing.explorerPassDays} days`,
        "Every country and comparison",
        "Re-run reports as your plans change",
        "Everything in the Full Report",
      ],
      cta: "Start with the free ranking",
      featured: false,
    },
  ];
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 py-20">
      <Container>
        <SectionHeading
          id="pricing-title"
          eyebrow="Pricing"
          title="Simple, one-time prices"
          intro={`No subscription. ${settings.refundDays}-day money-back guarantee on paid reports.`}
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100}>
              <Card
                className={
                  plan.featured
                    ? "ay-glow-border ay-lift relative h-full lg:-translate-y-2"
                    : "ay-lift h-full"
                }
              >
                {plan.featured ? <Pill tone="sand">Most popular</Pill> : null}
                <h3 className="mt-2 text-xl font-semibold">{plan.name}</h3>
                <p className="mt-3 font-[family-name:var(--font-ay-head)] text-4xl font-semibold text-ay-ink">
                  {plan.price}{" "}
                  <span className="text-base font-normal text-ay-slate">{plan.note}</span>
                </p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-ay-ink">
                      <Check aria-hidden className="mt-1 size-5 shrink-0 text-ay-good" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/abroadyield/start"
                  className={buttonClass(
                    plan.featured ? "primary" : "secondary",
                    "ay-shine mt-6 w-full",
                  )}
                >
                  {plan.cta}
                </Link>
              </Card>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-ay-slate">
          Secure payment by Stripe. Promo codes accepted at checkout. See our{" "}
          <Link
            to="/abroadyield/legal/$page"
            params={{ page: "refunds" }}
            className="underline underline-offset-4"
          >
            refund policy
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
