import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Lock, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CountryVisual } from "@/abroadyield/components/CountryVisual";
import { CountUp, Reveal, useInView } from "@/abroadyield/components/motion";
import { UnlockPanel, recordUnlockClick } from "@/abroadyield/components/Unlock";
import {
  Button,
  Card,
  Container,
  Disclaimer,
  FitBadge,
  Pill,
  SampleDataBanner,
  SectionHeading,
  buttonClass,
} from "@/abroadyield/components/ui";
import { explainScore, formatPctRange, formatUsd, rankCountries } from "@/abroadyield/engine";
import { track } from "@/abroadyield/lib/analytics";
import { orderCovers, useMyOrders, useProfile, useSiteData } from "@/abroadyield/store/hooks";

export const Route = createFileRoute("/abroadyield/results")({
  head: () => ({
    meta: [
      { title: "Your free country ranking — AbroadYield" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { checkout?: string } =>
    typeof search["checkout"] === "string" ? { checkout: search["checkout"] } : {},
  component: Results,
});

function Results() {
  const { profile, ready } = useProfile();
  const { countries, cities, settings, usTax } = useSiteData();
  const { checkout } = Route.useSearch();
  const orders = useMyOrders();
  const [unlock, setUnlock] = useState<string[] | null>(null);

  const ranked = useMemo(
    () => (profile ? rankCountries(countries, profile, settings, usTax) : []),
    [profile, countries, settings, usTax],
  );

  useEffect(() => {
    if (profile) track("results_view", { top: ranked[0]?.country.id ?? "" });
    // Only once per visit of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!profile]);

  if (!ready) return <Container className="py-20 text-ay-slate">Loading your ranking…</Container>;

  if (!profile) {
    return (
      <Container className="max-w-2xl py-20">
        <SectionHeading
          level={1}
          title="Your ranking starts with 12 quick questions"
          intro="Answer a few questions about your taxes, budget and goals and we'll rank every country for you. It takes about 3 minutes."
        />
        <Link to="/abroadyield/start" className={buttonClass("primary", "mt-8")}>
          Get my free ranking <ArrowRight aria-hidden className="size-5" />
        </Link>
      </Container>
    );
  }

  const open = (ids: string[]) => {
    recordUnlockClick(ids);
    setUnlock(ids);
  };
  const hasSample = ranked.some(
    (r) =>
      r.country.dataStatus === "sample" ||
      cities.some((c) => c.countryId === r.country.id && c.dataStatus === "sample"),
  );
  const top = ranked
    .filter((r) => r.badge !== "not")
    .slice(0, settings.pricing.maxCountriesPerReport)
    .map((r) => r.country.id);

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          level={1}
          eyebrow="Your free ranking"
          title="Where your money could work hardest"
          intro={
            <>
              Ranked for{" "}
              {profile.citizenship === "green_card" ? "a green card holder" : "a US taxpayer"}
              {profile.residence === "us" && profile.usState
                ? ` in ${usTax.stateRates[profile.usState]?.name ?? profile.usState}`
                : profile.residence === "abroad"
                  ? " living abroad"
                  : ""}
              , budget {profile.budgetUsd ? `up to ${formatUsd(profile.budgetUsd)}` : "not set"}
              {profile.budgetHelp && profile.budgetUsd ? " (suggested from your cash)" : ""},{" "}
              {profile.strategy === "short" ? "vacation rental" : "long-term rental"}.
            </>
          }
        />
        <Link to="/abroadyield/start" className={buttonClass("ghost")}>
          <RotateCcw aria-hidden className="size-4" /> Change my answers
        </Link>
      </div>

      {checkout === "cancelled" ? (
        <p
          role="status"
          className="mt-6 rounded-xl border border-ay-line bg-ay-mist p-4 text-ay-ink"
        >
          Checkout was cancelled — you have not been charged.
        </p>
      ) : null}
      {profile.citizenship === "other" ? (
        <div className="mt-6 flex gap-3 rounded-xl border border-ay-warn/30 bg-ay-warn-bg p-4 text-ay-warn">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p>
            You told us you are not a US taxpayer. The US tax parts of these estimates do not apply
            to you.
          </p>
        </div>
      ) : null}
      {hasSample ? (
        <div className="mt-6">
          <SampleDataBanner what="Some country or city figures used in this ranking" />
        </div>
      ) : null}

      <ol className="mt-8 space-y-5">
        {ranked.map((item, index) => {
          const why = explainScore(item);
          const owned = (orders.data ?? []).some((o) => orderCovers(o, [item.country.id]));
          return (
            <Reveal as="li" key={item.country.id} delay={Math.min(index, 3) * 90}>
              <Card as="article" className="ay-lift overflow-hidden p-0 sm:p-0">
                <div className="grid md:grid-cols-[180px_1fr]">
                  <div className="h-24 md:h-full">
                    <CountryVisual country={item.country} />
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ay-slate">#{index + 1}</p>
                        <h2 className="text-2xl font-semibold text-ay-ink">{item.country.name}</h2>
                      </div>
                      <div className="flex items-center gap-4">
                        <ScoreMeter score={item.score} />
                        <FitBadge badge={item.badge} />
                      </div>
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Metric
                        label="Estimated gross yield"
                        value={formatPctRange(item.country.rental.grossYieldRange)}
                      />
                      <Metric
                        label="Indicative closing costs"
                        value={formatPctRange(item.closingCostPct)}
                        hint={`${formatUsd(item.representativePriceUsd * item.closingCostPct[0])}–${formatUsd(item.representativePriceUsd * item.closingCostPct[1])} on ${formatUsd(item.representativePriceUsd)}`}
                      />
                      <Metric
                        label="Foreign ownership"
                        value={
                          item.country.ownership.status === "allowed" ? "Allowed" : "Restricted"
                        }
                      />
                      <Metric label="Key risk" value={item.country.keyRisk} small />
                    </dl>

                    <p className="mt-4 text-ay-slate">
                      <span className="font-semibold text-ay-ink">Why:</span>{" "}
                      {why.strengths.map((f) => f.label.toLowerCase()).join(" and ")} work in your
                      favour
                      {why.weakness
                        ? `; ${why.weakness.label.toLowerCase()} is the weak point`
                        : ""}
                      .{" "}
                      {item.belowBudget
                        ? `Typical entry prices start around ${formatUsd(item.country.minEntryPriceUsd)}.`
                        : ""}
                    </p>

                    <div
                      className="mt-5 grid gap-3 rounded-xl border border-dashed border-ay-line bg-ay-mist p-4 sm:grid-cols-2 lg:grid-cols-5"
                      aria-label="Locked sections"
                    >
                      {[
                        ["After-tax net yield", "0.0% / yr"],
                        ["US tax impact", "$0,000 / yr"],
                        ["Best cities", "City, City"],
                        ["Financing options", "3 options"],
                        ["Buying guide", "9 steps"],
                      ].map(([label, fake]) => (
                        <div key={label}>
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-ay-ink">
                            <Lock aria-hidden className="size-3.5 text-ay-gold" /> {label}
                          </p>
                          <p className="ay-blur mt-1 font-semibold" aria-hidden>
                            {fake}
                          </p>
                          <span className="sr-only">Locked — included in the full report</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {owned ? (
                        <Link
                          to="/abroadyield/report"
                          search={{ countries: item.country.id }}
                          className={buttonClass("primary")}
                        >
                          Open full report
                        </Link>
                      ) : (
                        <Button onClick={() => open([item.country.id])}>
                          <Lock aria-hidden className="size-4" /> Unlock my full report
                        </Button>
                      )}
                      <Link
                        to="/abroadyield/guides/$slug"
                        params={{ slug: item.country.slug }}
                        className={buttonClass("ghost")}
                      >
                        Free guide
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </ol>

      <Card className="mt-10 bg-ay-navy text-white">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">
              Compare your top {top.length || settings.pricing.maxCountriesPerReport} side by side
            </h2>
            <p className="mt-2 text-white/85">
              One report, up to {settings.pricing.maxCountriesPerReport} countries: after-tax
              returns, US tax impact, best cities, financing and a buying checklist for each.
            </p>
          </div>
          <Button
            variant="sand"
            className="shrink-0"
            onClick={() => open(top.length ? top : ranked.slice(0, 3).map((r) => r.country.id))}
          >
            Unlock my full report
          </Button>
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Pill>Weights and methodology are public</Pill>
        <Link to="/abroadyield/methodology" className="text-ay-navy-2 underline underline-offset-4">
          How we calculate the score
        </Link>
      </div>
      <Disclaimer className="mt-6" />

      {unlock ? (
        <UnlockPanel
          countries={ranked.map((r) => r.country)}
          preselected={unlock}
          onClose={() => setUnlock(null)}
        />
      ) : null}
    </Container>
  );
}

function Metric({
  label,
  value,
  hint,
  small,
}: {
  label: string;
  value: string;
  hint?: string;
  small?: boolean;
}) {
  return (
    <div>
      <dt className="text-sm text-ay-slate">{label}</dt>
      <dd
        className={
          small
            ? "mt-0.5 text-[0.98rem] font-medium text-ay-ink"
            : "mt-0.5 font-[family-name:var(--font-ay-head)] text-lg font-semibold tabular-nums text-ay-ink"
        }
      >
        {value}
      </dd>
      {hint ? <dd className="text-sm text-ay-slate">{hint}</dd> : null}
    </div>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const { ref, inView } = useInView<HTMLDivElement>();
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (!inView) return;
    // Next frame, so the ring transitions from empty to its score.
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [inView]);
  return (
    <div
      ref={ref}
      className="relative size-14"
      role="img"
      aria-label={`Overall score ${score} out of 100`}
    >
      <svg viewBox="0 0 56 56" className="size-14 -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="#dfe3ea" strokeWidth="6" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="#0f1f3a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={drawn ? c * (1 - score / 100) : c}
          className="ay-ring-progress"
        />
      </svg>
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-ay-head)] text-lg font-semibold"
      >
        <CountUp value={score} format={(v) => String(Math.round(v))} />
      </span>
    </div>
  );
}
