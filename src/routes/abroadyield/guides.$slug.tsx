import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { CountryVisual } from "@/abroadyield/components/CountryVisual";
import {
  Card,
  Container,
  Disclaimer,
  Pill,
  SampleDataBanner,
  SourceNote,
  Stat,
  buttonClass,
} from "@/abroadyield/components/ui";
import { seedCountries } from "@/abroadyield/data/countries";
import {
  acquisitionRangePct,
  cityMetrics,
  formatDate,
  formatPct,
  formatPctRange,
  formatUsd,
  shortName,
} from "@/abroadyield/engine";
import { track } from "@/abroadyield/lib/analytics";
import { useSiteData } from "@/abroadyield/store/hooks";

export const Route = createFileRoute("/abroadyield/guides/$slug")({
  head: ({ params }) => {
    const country = seedCountries.find((c) => c.slug === params.slug);
    const name = country ? shortName(country) : "this country";
    return {
      meta: [
        {
          title: `Buying property in ${name} as an American (${new Date().getFullYear()}) — AbroadYield`,
        },
        {
          name: "description",
          content: country
            ? `${country.summary} Key numbers, ownership rules, taxes and risks for US buyers.`
            : "Country guide for US buyers.",
        },
        { property: "og:title", content: `Buying property in ${name} as an American` },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const { slug } = Route.useParams();
  const { countries, cities, settings } = useSiteData();
  const country = countries.find((c) => c.slug === slug && c.published);
  useEffect(() => {
    if (country) track("guide_view", { country: country.id });
  }, [country?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!country) {
    return (
      <Container className="py-20">
        <h1 className="text-3xl font-semibold">Guide not found</h1>
        <Link to="/abroadyield/guides" className={buttonClass("primary", "mt-6")}>
          All country guides
        </Link>
      </Container>
    );
  }

  const name = shortName(country);
  const countryCities = cities
    .filter((c) => c.countryId === country.id)
    .map((c) => cityMetrics(c, country, settings));
  const closing = acquisitionRangePct(300000, country.acquisition.items);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Buying property in ${name} as an American`,
        description: country.summary,
        dateModified: country.lastVerified,
        author: { "@type": "Organization", name: "AbroadYield" },
        publisher: { "@type": "Organization", name: "AbroadYield" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "AbroadYield", item: "/abroadyield" },
          { "@type": "ListItem", position: 2, name: "Country guides", item: "/abroadyield/guides" },
          { "@type": "ListItem", position: 3, name },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Can Americans buy property in ${name}?`,
            acceptedAnswer: { "@type": "Answer", text: country.ownership.summary },
          },
          {
            "@type": "Question",
            name: `How is rental income taxed in ${name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${country.localTax.regimeName}: ${country.localTax.notes} ${country.localTax.treatyNotes}`,
            },
          },
          {
            "@type": "Question",
            name: `What are closing costs in ${name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Typically ${formatPctRange(closing)} of the price on a $300,000 purchase.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="h-40 sm:h-56">
        <CountryVisual country={country} sizes="100vw" />
      </div>
      <Container className="py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-ay-slate">
          <Link to="/abroadyield/guides" className="underline underline-offset-2">
            Country guides
          </Link>{" "}
          / {name}
        </nav>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Buying property in {name} as an American
        </h1>
        <p className="mt-3 max-w-3xl text-xl text-ay-slate">{country.summary}</p>
        <p className="mt-2 text-sm text-ay-slate">
          Data last verified on {formatDate(country.lastVerified)} · {country.verifiedBy}
        </p>
        {country.dataStatus === "sample" ? (
          <div className="mt-6">
            <SampleDataBanner what={`The ${name} figures on this page`} />
          </div>
        ) : null}

        <section aria-labelledby="key-numbers" className="mt-10">
          <h2 id="key-numbers" className="text-2xl font-semibold">
            Key numbers
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Gross rental yield"
              value={formatPctRange(country.rental.grossYieldRange)}
            />
            <Stat
              label="Closing costs"
              value={formatPctRange(closing)}
              hint="On a $300,000 purchase"
            />
            <Stat
              label={`Tax on rent (${country.localTax.basis} basis)`}
              value={
                country.localTax.brackets?.length
                  ? `${formatPct(Math.min(...country.localTax.brackets.map((b) => b.rate)), 0)}–${formatPct(Math.max(...country.localTax.brackets.map((b) => b.rate)), 0)}`
                  : formatPct(country.localTax.rate, 0)
              }
              hint={country.localTax.regimeName}
            />
            <Stat
              label="Entry prices from"
              value={formatUsd(country.minEntryPriceUsd)}
              hint={`${country.ownership.timelineWeeks[0]}–${country.ownership.timelineWeeks[1]} weeks to close`}
            />
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card as="section">
            <h2 className="text-xl font-semibold">Can Americans buy?</h2>
            <Pill tone={country.ownership.status === "allowed" ? "good" : "warn"}>
              {country.ownership.status === "allowed" ? "Allowed" : "Restricted in some areas"}
            </Pill>
            <p className="mt-3">{country.ownership.summary}</p>
            <p className="mt-2 text-ay-slate">{country.residencyNotes}</p>
            <SourceNote meta={country.ownership.meta} />
          </Card>
          <Card as="section">
            <h2 className="text-xl font-semibold">How rent is taxed</h2>
            <p className="mt-3">{country.localTax.notes}</p>
            <p className="mt-2 text-ay-slate">{country.localTax.treatyNotes}</p>
            <p className="mt-2 text-ay-slate">
              As a US taxpayer you also report the rent on Schedule E. Your free ranking estimates
              the combined effect for your state and income.
            </p>
            <SourceNote meta={country.localTax.meta} />
          </Card>
          <Card as="section">
            <h2 className="text-xl font-semibold">Main risk</h2>
            <p className="mt-3">{country.keyRisk}</p>
            <p className="mt-2 text-ay-slate">{country.rental.strRules}</p>
            <SourceNote meta={country.risks.meta} />
          </Card>
          <Card as="section">
            <h2 className="text-xl font-semibold">Cities we cover</h2>
            <ul className="mt-3 space-y-2">
              {countryCities.map((m) => (
                <li key={m.city.id} className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold">{m.city.name}</span>
                  <span className="text-ay-slate">
                    {formatUsd(m.pricePerSqmUsd)}/m² · gross {formatPct(m.grossYieldLong)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-10 bg-ay-navy text-white">
          <h2 className="text-2xl font-semibold">Is {name} right for you?</h2>
          <p className="mt-2 text-white/85">
            Get your free ranking of all destinations in 3 minutes, with after-tax estimates for
            your US state and income.
          </p>
          <Link to="/abroadyield/start" className={buttonClass("sand", "mt-5")}>
            Get my free ranking <ArrowRight aria-hidden className="size-5" />
          </Link>
        </Card>
        <Disclaimer className="mt-8" />
      </Container>
    </>
  );
}
