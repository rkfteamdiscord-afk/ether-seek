import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Download, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/abroadyield/components/Layout";
import { ReportView } from "@/abroadyield/components/report/ReportView";
import { UnlockPanel, recordUnlockClick } from "@/abroadyield/components/Unlock";
import {
  Button,
  Card,
  Container,
  Disclaimer,
  SectionHeading,
  buttonClass,
} from "@/abroadyield/components/ui";
import {
  computeScenario,
  buildScenarioInput,
  cityMetrics,
  formatDate,
  formatPct,
  formatUsd,
  shortName,
} from "@/abroadyield/engine";
import { track } from "@/abroadyield/lib/analytics";
import { DISCLAIMER } from "@/abroadyield/profile";
import { getBackend } from "@/abroadyield/store";
import {
  orderCovers,
  useAuth,
  useMyOrders,
  useProfile,
  useSiteData,
} from "@/abroadyield/store/hooks";
import type { SavedReport } from "@/abroadyield/types";

export const Route = createFileRoute("/abroadyield/report")({
  head: () => ({
    meta: [{ title: "Your full report — AbroadYield" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: (search: Record<string, unknown>): { countries: string } => ({
    countries: typeof search["countries"] === "string" ? search["countries"] : "",
  }),
  component: ReportPage,
});

function ReportPage() {
  const { countries: countryParam } = Route.useSearch();
  const { profile, ready } = useProfile();
  const { user } = useAuth();
  const { countries, cities, settings, usTax } = useSiteData();
  const orders = useMyOrders();
  const [active, setActive] = useState(0);
  const [unlockOpen, setUnlockOpen] = useState(false);

  const selected = useMemo(() => {
    const ids = countryParam.split(",").filter(Boolean);
    return ids
      .map((id) => countries.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .slice(0, settings.pricing.maxCountriesPerReport);
  }, [countryParam, countries, settings.pricing.maxCountriesPerReport]);
  const ids = selected.map((c) => c.id);
  const order = (orders.data ?? []).find((o) => orderCovers(o, ids));
  const hasAccess = ids.length > 0 && (user?.role === "admin" || !!order);

  useEffect(() => {
    if (!hasAccess || !profile || !order) return;
    track("report_view", { countries: ids.join(",") });
    const report: SavedReport = {
      id: `rpt_${order.id}_${ids.join("-")}`,
      createdAt: new Date().toISOString(),
      userId: user?.id ?? "",
      countryIds: ids,
      orderId: order.id,
      profile,
    };
    const backend = getBackend();
    void backend
      .get<SavedReport>("reports", report.id)
      .then((existing) => (existing ? undefined : backend.put("reports", report)))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess, !!profile, order?.id, countryParam]);

  if (!ready || orders.isLoading)
    return <Container className="py-20 text-ay-slate">Loading your report…</Container>;

  if (!profile) {
    return (
      <Container className="max-w-2xl py-20">
        <SectionHeading
          level={1}
          title="We need your answers to build the report"
          intro="Your report is personalised to your tax situation, budget and goals. Complete the questionnaire on this device, or log in to see your saved reports."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/abroadyield/start" className={buttonClass("primary")}>
            Start the questionnaire
          </Link>
          <Link to="/abroadyield/account" className={buttonClass("secondary")}>
            Log in
          </Link>
        </div>
      </Container>
    );
  }

  if (!selected.length) {
    return (
      <Container className="max-w-2xl py-20">
        <SectionHeading
          level={1}
          title="Choose countries for your report"
          intro="Pick up to three countries from your ranking."
        />
        <Link to="/abroadyield/results" className={buttonClass("primary", "mt-8")}>
          Back to my ranking
        </Link>
      </Container>
    );
  }

  if (!hasAccess) {
    return (
      <Container className="max-w-2xl py-20">
        <Lock aria-hidden className="size-10 text-ay-gold" />
        <SectionHeading
          level={1}
          title={`Full report: ${selected.map((c) => shortName(c)).join(", ")}`}
          intro="This report is not unlocked on this account yet. If you already paid, log in with the email you used at checkout."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              recordUnlockClick(ids);
              setUnlockOpen(true);
            }}
          >
            Unlock my full report
          </Button>
          <Link to="/abroadyield/account" className={buttonClass("secondary")}>
            Log in
          </Link>
        </div>
        {unlockOpen ? (
          <UnlockPanel
            countries={countries.filter((c) => c.published)}
            preselected={ids}
            onClose={() => setUnlockOpen(false)}
          />
        ) : null}
      </Container>
    );
  }

  const current = selected[Math.min(active, selected.length - 1)]!;
  const generated = formatDate(new Date().toISOString().slice(0, 10));

  return (
    <Container className="py-10 sm:py-14">
      {/* Branded header that only appears in print / PDF */}
      <div className="ay-print-only mb-6 border-b-2 border-ay-navy pb-4">
        <Logo />
        <p className="mt-2 text-sm">
          Full report prepared for {profile.email} · Generated {generated}
        </p>
        <p className="mt-2 text-xs">{DISCLAIMER}</p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          level={1}
          eyebrow="Full report"
          title={
            selected.length > 1
              ? `Comparing ${selected.map((c) => shortName(c)).join(", ")}`
              : `Buying property in ${current.name}`
          }
          intro={`Prepared for ${profile.email} on ${generated}.`}
        />
        <Button
          variant="secondary"
          className="ay-no-print"
          onClick={() => {
            track("pdf_download", { countries: ids.join(",") });
            window.print();
          }}
        >
          <Download aria-hidden className="size-5" /> Download PDF
        </Button>
      </div>
      <p className="ay-no-print mt-2 text-sm text-ay-slate">
        Choose “Save as PDF” in the print dialog. The PDF includes every section with sources and
        the disclaimer.
      </p>

      <Disclaimer className="mt-6" />

      {selected.length > 1 ? (
        <Card as="section" className="mt-8">
          <h2 className="text-2xl font-semibold">Side-by-side comparison</h2>
          <p className="mt-1 text-ay-slate">
            Each country at its best-fitting city for your budget, with the report's default
            assumptions.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <caption className="sr-only">Country comparison</caption>
              <thead>
                <tr className="border-b border-ay-line text-sm text-ay-slate">
                  <th scope="col" className="py-2">
                    Metric
                  </th>
                  {selected.map((c) => (
                    <th
                      key={c.id}
                      scope="col"
                      className="py-2 text-right font-semibold text-ay-ink"
                    >
                      {shortName(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRows countries={selected} />
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {selected.length > 1 ? (
        <div
          role="tablist"
          aria-label="Countries in this report"
          className="ay-no-print sticky top-16 z-30 -mx-4 mt-8 flex gap-2 overflow-x-auto border-b border-ay-line bg-white/95 px-4 py-3 backdrop-blur"
        >
          {selected.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`panel-${c.id}`}
              id={`tab-${c.id}`}
              onClick={() => setActive(i)}
              className={cn(
                "min-h-11 whitespace-nowrap rounded-lg px-4 font-semibold",
                i === active ? "bg-ay-navy text-white" : "bg-ay-mist text-ay-ink hover:bg-ay-sky",
              )}
            >
              {shortName(c)}
            </button>
          ))}
        </div>
      ) : null}

      <nav aria-label="Report sections" className="ay-no-print mt-6 flex flex-wrap gap-2 text-sm">
        {[
          ["summary", "Summary"],
          ["simulator", "Simulator"],
          ["returns", "Returns"],
          ["ownership", "Can you buy?"],
          ["acquisition", "Costs"],
          ["financing", "Financing"],
          ["us-tax", "US tax"],
          ["cities", "Cities"],
          ["risks", "Risks"],
          ["checklist", "Checklist"],
          ["experts", "Experts"],
        ].map(([anchor, label]) => (
          <a
            key={anchor}
            href={`#${current.id}-${anchor}`}
            className="inline-flex min-h-11 items-center rounded-full border border-ay-line bg-white px-4 font-semibold text-ay-navy-2 transition-colors duration-200 hover:border-ay-navy/40 hover:bg-ay-sky"
          >
            {label}
          </a>
        ))}
      </nav>

      <div
        role={selected.length > 1 ? "tabpanel" : undefined}
        id={`panel-${current.id}`}
        aria-labelledby={selected.length > 1 ? `tab-${current.id}` : undefined}
        className="mt-6"
      >
        <ReportView
          key={current.id}
          country={current}
          cities={cities.filter((c) => c.countryId === current.id)}
          profile={profile}
          settings={settings}
          usTax={usTax}
        />
      </div>

      {/* In print, include the other countries too. */}
      {selected.length > 1
        ? selected
            .filter((c) => c.id !== current.id)
            .map((c) => (
              <div key={c.id} className="ay-print-only ay-print-break">
                <h2 className="mb-4 text-3xl font-semibold">{c.name}</h2>
                <ReportView
                  country={c}
                  cities={cities.filter((x) => x.countryId === c.id)}
                  profile={profile}
                  settings={settings}
                  usTax={usTax}
                />
              </div>
            ))
        : null}

      <div className="ay-no-print mt-10 flex flex-wrap gap-3">
        <Link to="/abroadyield/results" className={buttonClass("ghost")}>
          Back to my ranking
        </Link>
        <Link to="/abroadyield/account" className={buttonClass("ghost")}>
          My saved reports <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </Container>
  );

  function ComparisonRows({ countries: list }: { countries: typeof selected }) {
    const rows = list.map((country) => {
      const countryCities = cities.filter((c) => c.countryId === country.id);
      const metrics = countryCities.map((city) => cityMetrics(city, country, settings));
      const affordable = metrics.filter(
        (m) => !profile!.budgetUsd || m.unitPriceUsd <= profile!.budgetUsd,
      );
      const best = [...(affordable.length ? affordable : metrics)].sort(
        (a, b) => b.netYieldLong - a.netYieldLong,
      )[0];
      const result = computeScenario(
        buildScenarioInput({ country, city: best?.city, profile: profile!, settings, usTax }),
      );
      return { country, best, result };
    });
    const line = (label: string, render: (r: (typeof rows)[number]) => string) => (
      <tr className="border-b border-ay-line/60">
        <th scope="row" className="py-2 pr-3 font-normal text-ay-slate">
          {label}
        </th>
        {rows.map((r) => (
          <td key={r.country.id} className="py-2 text-right tabular-nums">
            {render(r)}
          </td>
        ))}
      </tr>
    );
    return (
      <>
        {line("City modelled", (r) =>
          r.best
            ? `${r.best.city.name}${r.best.city.dataStatus === "sample" ? " (to be verified)" : ""}`
            : "Country average",
        )}
        {line("Purchase price", (r) =>
          formatUsd(r.result.potentialRentUsd / Math.max(0.0001, r.result.grossYield)),
        )}
        {line("Gross yield", (r) => formatPct(r.result.grossYield))}
        {line("Net yield before tax", (r) => formatPct(r.result.netYieldBeforeTax))}
        {line("Local tax / yr", (r) => formatUsd(r.result.localTaxUsd))}
        {line("Extra US federal tax / yr", (r) => formatUsd(r.result.federalTaxUsd))}
        {line("State tax / yr", (r) => formatUsd(r.result.stateTaxUsd))}
        {line("After-tax net yield", (r) => formatPct(r.result.afterTaxYield))}
        {line("After-tax income / yr", (r) => formatUsd(r.result.afterTaxIncomeUsd))}
        {line("Foreign ownership", (r) =>
          r.country.ownership.status === "allowed" ? "Allowed" : "Restricted",
        )}
      </>
    );
  }
}
