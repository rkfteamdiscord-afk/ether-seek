import { Link, createFileRoute } from "@tanstack/react-router";
import { CountryVisual } from "@/abroadyield/components/CountryVisual";
import { Container, Pill, SectionHeading } from "@/abroadyield/components/ui";
import { formatPctRange, formatUsd } from "@/abroadyield/engine";
import { useSiteData } from "@/abroadyield/store/hooks";

export const Route = createFileRoute("/abroadyield/guides/")({
  head: () => ({
    meta: [
      { title: "Buying property abroad as an American — country guides | AbroadYield" },
      {
        name: "description",
        content:
          "Free guides for US buyers: ownership rules, closing costs, rental yields, taxes and risks in 17 destinations, from Portugal, Mexico and Costa Rica to France, Japan and Thailand.",
      },
    ],
  }),
  component: GuidesIndex,
});

function GuidesIndex() {
  const { countries } = useSiteData();
  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading
        level={1}
        eyebrow="Country guides"
        title="Buying property abroad as an American"
        intro="Key numbers, ownership rules and the main risk for each destination. Free to read."
      />
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {countries
          .filter((c) => c.published)
          .map((c) => (
            <li key={c.id}>
              <Link
                to="/abroadyield/guides/$slug"
                params={{ slug: c.slug }}
                className="group block h-full overflow-hidden rounded-2xl border border-ay-line bg-white transition-shadow hover:shadow-lg"
              >
                <div className="h-32">
                  <CountryVisual country={c} />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-semibold group-hover:underline">
                    Buying property in {c.name}
                  </h2>
                  <p className="mt-2 text-ay-slate">{c.tagline}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Pill>Gross {formatPctRange(c.rental.grossYieldRange)}</Pill>
                    <Pill>From {formatUsd(c.minEntryPriceUsd)}</Pill>
                    {c.dataStatus === "sample" ? <Pill tone="warn">Sample data</Pill> : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </Container>
  );
}
