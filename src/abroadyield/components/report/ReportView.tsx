import { AlertTriangle, CheckCircle2, CircleDashed, ListChecks, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  acquisitionCosts,
  baseIncome,
  borrowingCapacity,
  buildScenarioInput,
  cityMetrics,
  computeScenario,
  executiveSummary,
  formatLocal,
  formatPct,
  formatUsd,
  fromUsd,
  reportingFlags,
  shortName,
  strategyOf,
  type ScenarioOverrides,
} from "../../engine";
import { track } from "../../lib/analytics";
import { buildKnowledge } from "../../lib/assistant";
import type { City, Country, Profile, RiskKey, Settings, UsTaxParams } from "../../types";
import { ExpertForm } from "../ExpertForm";
import { Card, Disclaimer, Pill, SampleDataBanner, SourceNote, Stat } from "../ui";
import { AssistantPanel } from "./AssistantPanel";
import { Waterfall } from "./Waterfall";

const RISK_LABELS: Record<RiskKey, string> = {
  currency: "Currency",
  legal: "Legal & title",
  liquidity: "Liquidity",
  political: "Political & regulatory",
  str: "Short-term rental restrictions",
  natural: "Natural hazards",
};

const DTI = 0.3;

export function ReportView({
  country,
  cities,
  profile,
  settings,
  usTax,
}: {
  country: Country;
  cities: City[];
  profile: Profile;
  settings: Settings;
  usTax: UsTaxParams;
}) {
  const metrics = useMemo(
    () => cities.map((city) => cityMetrics(city, country, settings)),
    [cities, country, settings],
  );
  const defaultStrategy = strategyOf(profile);
  const bestCity = useMemo(() => {
    const affordable = metrics.filter(
      (m) => !profile.budgetUsd || m.unitPriceUsd <= profile.budgetUsd,
    );
    const pool = affordable.length ? affordable : metrics;
    return [...pool].sort((a, b) =>
      defaultStrategy === "short"
        ? b.netYieldShort - a.netYieldShort
        : b.netYieldLong - a.netYieldLong,
    )[0]?.city;
  }, [metrics, profile.budgetUsd, defaultStrategy]);

  const [cityId, setCityId] = useState(bestCity?.id ?? "");
  const [strategy, setStrategy] = useState<"long" | "short">(defaultStrategy);
  const [overrides, setOverrides] = useState<ScenarioOverrides>({});
  const city = cities.find((c) => c.id === cityId);

  const baseInput = useMemo(
    () => buildScenarioInput({ country, city, profile, settings, usTax, overrides: { strategy } }),
    [country, city, profile, settings, usTax, strategy],
  );
  const input = useMemo(
    () =>
      buildScenarioInput({
        country,
        city,
        profile,
        settings,
        usTax,
        overrides: { ...overrides, strategy },
      }),
    [country, city, profile, settings, usTax, overrides, strategy],
  );
  const result = useMemo(() => computeScenario(input), [input]);
  const summary = useMemo(
    () => executiveSummary({ country, city, profile, result, usTax, strategy }),
    [country, city, profile, result, usTax, strategy],
  );
  const acquisition = acquisitionCosts(input.priceUsd, country.acquisition.items, "mid");
  const acquisitionLow = acquisitionCosts(input.priceUsd, country.acquisition.items, "low");
  const acquisitionHigh = acquisitionCosts(input.priceUsd, country.acquisition.items, "high");
  const borrowing = borrowingCapacity({
    annualIncomeUsd: baseIncome(profile),
    debtToIncome: DTI,
    annualRate: input.interestRate,
    termYears: input.termYears,
    maxLtv: country.financing.maxLtvNonResident,
    priceUsd: input.priceUsd,
    cashUsd: profile.cashUsd,
  });
  const flags = reportingFlags(usTax, {
    filing: input.us.filing,
    residence: profile.residence === "abroad" ? "abroad" : "us",
    foreignAccountPeakUsd: result.downPaymentUsd + acquisition.totalUsd,
  });
  const knowledge = useMemo(
    () => buildKnowledge({ country, cities, result, usTax }),
    [country, cities, result, usTax],
  );
  const fxRate = settings.fx.usdPerUnit[country.currency] ?? 1;
  const local = (usd: number) =>
    country.currency === "USD"
      ? ""
      : ` (${formatLocal(fromUsd(usd, country.currency, settings.fx.usdPerUnit), country.currency)})`;
  const name = shortName(country);
  const sample = country.dataStatus === "sample";

  const change = (patch: ScenarioOverrides) => {
    setOverrides((o) => ({ ...o, ...patch }));
    track("simulator_change", { country: country.id, field: Object.keys(patch)[0] ?? "" });
  };

  return (
    <div className="space-y-8">
      {sample ? <SampleDataBanner what={`The ${name} figures in this report`} /> : null}

      {/* a) Executive summary */}
      <Card as="section">
        <SectionTitle letter="a" id={`${country.id}-summary`} title="Executive summary" />
        <div className="mt-3 space-y-3 text-lg text-ay-ink">
          {summary.map((sentence, i) => (
            <p key={i}>{sentence}</p>
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Gross yield"
            value={formatPct(result.grossYield)}
            hint={`${formatUsd(result.potentialRentUsd)} rent / yr`}
          />
          <Stat
            label="Net yield before tax"
            value={formatPct(result.netYieldBeforeTax)}
            hint={`${formatUsd(result.noiUsd)} / yr`}
          />
          <Stat
            label="After-tax net yield"
            value={formatPct(result.afterTaxYield)}
            hint={`${formatUsd(result.afterTaxIncomeUsd)} / yr`}
            emphasis
          />
          <Stat
            label={result.debtServiceUsd > 0 ? "Annual cash flow" : "Total taxes"}
            value={
              result.debtServiceUsd > 0
                ? formatUsd(result.annualCashFlowUsd)
                : formatUsd(result.totalTaxUsd)
            }
            hint={
              result.debtServiceUsd > 0
                ? `${formatPct(result.cashOnCash)} cash-on-cash`
                : "local + US federal + state"
            }
          />
        </div>
        <SourceNote meta={country.rental.meta} />
      </Card>

      {/* j) Simulator (placed near the top so every number below follows it) */}
      <Card as="section" className="ay-no-print">
        <SectionTitle letter="j" id={`${country.id}-simulator`} title="Sensitivity simulator" />
        <p className="mt-2 text-ay-slate">
          Move a slider and every number and chart in this report updates instantly.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-semibold">City</span>
            <select
              className="mt-1.5 block min-h-11 w-full rounded-lg border border-[#c9d0db] bg-white px-3"
              value={cityId}
              onChange={(e) => (
                setCityId(e.target.value),
                setOverrides((o) => ({ ...o, priceUsd: undefined, potentialRentUsd: undefined }))
              )}
            >
              <option value="">Country average</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="font-semibold">Rental strategy</legend>
            <div className="mt-1.5 flex gap-2">
              {(["long", "short"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={strategy === s}
                  onClick={() => (
                    setStrategy(s),
                    setOverrides((o) => ({ ...o, potentialRentUsd: undefined, vacancy: undefined }))
                  )}
                  className={cn(
                    "min-h-11 flex-1 rounded-lg border px-3 font-medium",
                    strategy === s
                      ? "border-ay-navy bg-ay-navy text-white"
                      : "border-ay-line bg-white hover:bg-ay-mist",
                  )}
                >
                  {s === "long" ? "Long-term" : "Short-term"}
                </button>
              ))}
            </div>
          </fieldset>
          <Slider
            label="Purchase price"
            value={input.priceUsd}
            min={Math.round(baseInput.priceUsd * 0.4)}
            max={Math.round(baseInput.priceUsd * 2)}
            step={5000}
            format={(v) => formatUsd(v)}
            onChange={(v) => change({ priceUsd: v, potentialRentUsd: undefined })}
          />
          <Slider
            label={
              strategy === "short"
                ? "Rental revenue at full occupancy (per year)"
                : "Rent (per year, fully let)"
            }
            value={input.potentialRentUsd}
            min={Math.round(baseInput.potentialRentUsd * 0.4)}
            max={Math.round(baseInput.potentialRentUsd * 1.8)}
            step={250}
            format={(v) => `${formatUsd(v)} · ${formatUsd(v / 12)}/mo`}
            onChange={(v) => change({ potentialRentUsd: v })}
          />
          <Slider
            label={strategy === "short" ? "Unbooked nights" : "Vacancy"}
            value={input.vacancy}
            min={0}
            max={0.7}
            step={0.01}
            format={(v) => formatPct(v, 0)}
            onChange={(v) => change({ vacancy: v })}
          />
          <Slider
            label="Interest rate"
            value={input.interestRate}
            min={0}
            max={0.15}
            step={0.0025}
            format={(v) => formatPct(v, 2)}
            onChange={(v) => change({ interestRate: v })}
          />
          <Slider
            label="Down payment"
            value={input.downPaymentPct}
            min={Math.max(0.1, 1 - country.financing.maxLtvNonResident)}
            max={1}
            step={0.05}
            format={(v) => (v >= 1 ? "100% (cash)" : formatPct(v, 0))}
            onChange={(v) => change({ downPaymentPct: v })}
          />
          <Slider
            label={`Exchange rate: ${country.currency} vs USD after purchase`}
            value={input.fxChange}
            min={-0.3}
            max={0.3}
            step={0.01}
            format={(v) =>
              `${v > 0 ? "+" : ""}${formatPct(v, 0)} (1 ${country.currency} = ${formatUsd(fxRate * (1 + v), { cents: true })})`
            }
            onChange={(v) => change({ fxChange: v })}
            disabled={country.currency === "USD"}
          />
        </div>
        <button
          type="button"
          className="mt-5 min-h-11 font-semibold text-ay-navy-2 underline underline-offset-4"
          onClick={() => setOverrides({})}
        >
          Reset to the report's assumptions
        </button>
      </Card>

      {/* e) Returns waterfall */}
      <Card as="section">
        <SectionTitle letter="e" id={`${country.id}-returns`} title="Returns, step by step" />
        <p className="mt-2 text-ay-slate">
          {city ? `${city.name}, ` : ""}
          {strategy === "short" ? "short-term rental" : "long-term rental"},{" "}
          {formatUsd(input.priceUsd)}
          {local(input.priceUsd)},{" "}
          {input.downPaymentPct >= 1
            ? "all cash"
            : `${formatPct(input.downPaymentPct, 0)} down at ${formatPct(input.interestRate, 2)}`}
          . Year one.
        </p>
        <div className="mt-6">
          <Waterfall steps={result.waterfall} title={`Annual returns waterfall for ${name}`} />
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Net operating income"
            value={formatUsd(result.noiUsd)}
            hint={`Net yield before tax ${formatPct(result.netYieldBeforeTax)}`}
          />
          <Stat
            label="After-tax income"
            value={formatUsd(result.afterTaxIncomeUsd)}
            hint={`After-tax net yield ${formatPct(result.afterTaxYield)}`}
            emphasis
          />
          <Stat
            label="Annual cash flow"
            value={formatUsd(result.annualCashFlowUsd)}
            hint={
              result.debtServiceUsd > 0
                ? `After ${formatUsd(result.debtServiceUsd)} of mortgage payments`
                : "No mortgage"
            }
          />
        </dl>
        {result.annualCashFlowUsd < 0 ? (
          <p className="mt-4 flex gap-2 rounded-lg bg-ay-bad-bg p-3 text-ay-bad">
            <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" /> With these assumptions
            the property costs you {formatUsd(-result.annualCashFlowUsd)} a year out of pocket.
          </p>
        ) : null}
        {strategy === "short" && city?.strAllowed === "no" ? (
          <p className="mt-4 flex gap-2 rounded-lg bg-ay-warn-bg p-3 text-ay-warn">
            <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" /> Short-term rentals are
            not allowed for new owners in {city.name}: {city.strRules}
          </p>
        ) : null}
        <SourceNote meta={country.localTax.meta} />
      </Card>

      {/* b) Can you buy? */}
      <Card as="section">
        <SectionTitle letter="b" id={`${country.id}-ownership`} title="Can you buy?" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Pill tone={country.ownership.status === "allowed" ? "good" : "warn"}>
            {country.ownership.status === "allowed"
              ? "Foreign ownership allowed"
              : "Restricted in some areas"}
          </Pill>
          <Pill>
            {country.ownership.timelineWeeks[0]}–{country.ownership.timelineWeeks[1]} weeks to close
          </Pill>
        </div>
        <p className="mt-4 text-ay-ink">{country.ownership.summary}</p>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-semibold">Restrictions</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ay-slate">
              {country.ownership.restrictions.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <h4 className="mt-4 font-semibold">Local tax ID</h4>
            <p className="mt-1 text-ay-slate">{country.ownership.taxIdName}</p>
          </div>
          <div>
            <h4 className="font-semibold">Documents you'll need</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ay-slate">
              {country.ownership.documents.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <h4 className="mt-4 font-semibold">Residency implications</h4>
            <p className="mt-1 text-ay-slate">{country.residencyNotes}</p>
          </div>
        </div>
        <SourceNote meta={country.ownership.meta} />
      </Card>

      {/* c) Total acquisition cost */}
      <Card as="section">
        <SectionTitle letter="c" id={`${country.id}-acquisition`} title="Total acquisition cost" />
        <p className="mt-2 text-ay-slate">
          On a {formatUsd(input.priceUsd)} purchase you should budget about{" "}
          {formatUsd(acquisition.totalUsd)} ({formatPct(acquisition.pctOfPrice)}) in one-time costs,
          between {formatUsd(acquisitionLow.totalUsd)} and {formatUsd(acquisitionHigh.totalUsd)}.
        </p>
        <table className="mt-4 w-full text-left">
          <caption className="sr-only">One-time acquisition costs</caption>
          <thead>
            <tr className="border-b border-ay-line text-sm text-ay-slate">
              <th scope="col" className="py-2 font-semibold">
                Item
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Estimate
              </th>
            </tr>
          </thead>
          <tbody>
            {acquisition.lines.map((line, i) => (
              <tr key={line.label} className="border-b border-ay-line/60 align-top">
                <th scope="row" className="py-2 pr-3 font-normal">
                  {line.label}
                  {line.notes ? (
                    <span className="block text-sm text-ay-slate">{line.notes}</span>
                  ) : null}
                </th>
                <td className="py-2 text-right tabular-nums">
                  {formatUsd(line.amountUsd)}
                  <span className="block text-sm text-ay-slate">
                    {formatUsd(acquisitionLow.lines[i]!.amountUsd)}–
                    {formatUsd(acquisitionHigh.lines[i]!.amountUsd)}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bg-ay-mist font-semibold">
              <th scope="row" className="py-2">
                Total
              </th>
              <td className="py-2 text-right tabular-nums">
                {formatUsd(acquisition.totalUsd)}
                <span className="block text-sm font-normal text-ay-slate">
                  {local(acquisition.totalUsd)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <SourceNote meta={country.acquisition.meta} />
      </Card>

      {/* d) Financing */}
      <Card as="section">
        <SectionTitle letter="d" id={`${country.id}-financing`} title="Financing" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Typical down payment"
            value={`${formatPct(country.financing.downPaymentRange[0], 0)}–${formatPct(country.financing.downPaymentRange[1], 0)}`}
          />
          <Stat
            label="Typical rates"
            value={`${formatPct(country.financing.rateRange[0])}–${formatPct(country.financing.rateRange[1])}`}
            hint={`Terms up to ${country.financing.termYears} years`}
          />
          <Stat
            label="Indicative borrowing capacity"
            value={formatUsd(borrowing.maxLoan)}
            hint={
              borrowing.limitedBy === "income"
                ? "Limited by your income"
                : `Limited by the ${formatPct(country.financing.maxLtvNonResident, 0)} loan-to-value cap`
            }
          />
        </div>
        <p className="mt-3 text-sm text-ay-slate">
          Indicative only: assumes lenders accept a new payment up to {formatPct(DTI, 0)} of your
          gross income (estimated from your income bracket), at {formatPct(input.interestRate, 2)}{" "}
          over {input.termYears} years. Lenders will assess your full situation.
        </p>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {country.financing.options.map((o) => (
            <li key={o.name} className="flex gap-3 rounded-xl border border-ay-line p-4">
              {o.available === "yes" ? (
                <CheckCircle2 aria-hidden className="size-5 shrink-0 text-ay-good" />
              ) : o.available === "limited" ? (
                <CircleDashed aria-hidden className="size-5 shrink-0 text-ay-warn" />
              ) : (
                <XCircle aria-hidden className="size-5 shrink-0 text-ay-bad" />
              )}
              <div>
                <p className="font-semibold">
                  {o.name}{" "}
                  <span className="font-normal text-ay-slate">
                    —{" "}
                    {o.available === "yes"
                      ? "available"
                      : o.available === "limited"
                        ? "limited"
                        : "not available"}
                  </span>
                </p>
                <p className="text-ay-slate">{o.notes}</p>
              </div>
            </li>
          ))}
        </ul>
        <SourceNote meta={country.financing.meta} />
      </Card>

      {/* f) US tax module */}
      <Card as="section">
        <SectionTitle
          letter="f"
          id={`${country.id}-us-tax`}
          title="US tax module (educational estimates)"
        />
        <p className="mt-2 text-ay-slate">
          Tax year {usTax.taxYear},{" "}
          {input.us.filing === "mfj" ? "married filing jointly" : "single"}, estimated household
          income {formatUsd(input.us.baseIncomeUsd)}
          {input.us.state
            ? `, ${usTax.stateRates[input.us.state]?.name ?? input.us.state}`
            : ", no state tax assumed"}
          .
        </p>
        <table className="mt-4 w-full text-left">
          <caption className="sr-only">US tax estimate</caption>
          <tbody className="[&_td]:py-2 [&_td]:text-right [&_td]:tabular-nums [&_th]:py-2 [&_th]:pr-3 [&_th]:font-normal [&_tr]:border-b [&_tr]:border-ay-line/60">
            <tr>
              <th scope="row">Net operating income (Schedule E rents less expenses)</th>
              <td>{formatUsd(result.noiUsd)}</td>
            </tr>
            <tr>
              <th scope="row">− Mortgage interest (year one)</th>
              <td>{formatUsd(result.interestUsd)}</td>
            </tr>
            <tr>
              <th scope="row">
                − Depreciation ({usTax.depreciation.foreignResidentialYears}-year straight line on{" "}
                {formatPct(usTax.depreciation.buildingShare, 0)} of the basis)
              </th>
              <td>{formatUsd(result.us.depreciationUsd)}</td>
            </tr>
            <tr className="bg-ay-mist font-semibold">
              <th scope="row">= Schedule E net income</th>
              <td>{formatUsd(result.us.scheduleENetUsd)}</td>
            </tr>
            <tr>
              <th scope="row">
                US federal tax on this income, before credit (marginal rate{" "}
                {formatPct(result.us.marginalFederalRate, 0)})
              </th>
              <td>{formatUsd(result.us.federalBeforeCreditUsd)}</td>
            </tr>
            <tr>
              <th scope="row">
                − Foreign Tax Credit (Form 1116), capped by the Form 1116 limitation
              </th>
              <td>{formatUsd(result.us.foreignTaxCreditUsd)}</td>
            </tr>
            <tr>
              <th scope="row">
                + Net Investment Income Tax ({formatPct(usTax.niit.rate)}) if above the threshold
              </th>
              <td>{formatUsd(result.us.niitUsd)}</td>
            </tr>
            <tr className="bg-ay-mist font-semibold">
              <th scope="row">= Additional US federal tax</th>
              <td>{formatUsd(result.federalTaxUsd)}</td>
            </tr>
            <tr>
              <th scope="row">State tax (no foreign credit in most states)</th>
              <td>{formatUsd(result.stateTaxUsd)}</td>
            </tr>
          </tbody>
        </table>
        {result.us.excessForeignTaxUsd > 1 ? (
          <p className="mt-3 text-ay-slate">
            About {formatUsd(result.us.excessForeignTaxUsd)} of {name} tax exceeds the credit
            limitation this year. It can usually be carried back 1 year or forward 10 years.
          </p>
        ) : null}
        {result.us.passiveLossUsd > 0 ? (
          <p className="mt-3 text-ay-slate">
            This scenario shows a passive loss of {formatUsd(result.us.passiveLossUsd)} on paper.
            Passive losses generally cannot offset wages and are carried forward; with active
            participation and modified AGI under $150,000, up to $25,000 may be deductible (phased
            out from $100,000).
          </p>
        ) : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Schedule E", usTax.notes.scheduleE],
            ["Foreign Tax Credit and its limitation", usTax.notes.foreignTaxCredit],
            ["Depreciation of foreign rentals", usTax.notes.depreciation],
            ["Foreign Earned Income Exclusion", usTax.notes.feie],
            ["When you sell", usTax.notes.capitalGains],
            [`Treaty notes for ${name}`, country.localTax.treatyNotes],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl bg-ay-mist p-4">
              <h4 className="font-semibold">{title}</h4>
              <p className="mt-1 text-ay-slate">{text}</p>
            </div>
          ))}
        </div>
        <h4 className="mt-6 font-semibold">Reporting obligations to check</h4>
        <ul className="mt-2 space-y-2">
          {flags.map((f) => (
            <li
              key={f.form}
              className="flex items-start gap-3 rounded-xl border border-ay-line p-3"
            >
              <Pill
                tone={
                  f.required === "likely" ? "warn" : f.required === "possible" ? "neutral" : "good"
                }
              >
                {f.required === "likely"
                  ? "Likely"
                  : f.required === "possible"
                    ? "Possible"
                    : "Not expected"}
              </Pill>
              <div>
                <p className="font-semibold">{f.form}</p>
                <p className="text-ay-slate">{f.explanation}</p>
              </div>
            </li>
          ))}
        </ul>
        <SourceNote meta={usTax.meta} />
      </Card>

      {/* g) Best cities */}
      <Card as="section">
        <SectionTitle letter="g" id={`${country.id}-cities`} title="Best cities" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <caption className="sr-only">City comparison</caption>
            <thead>
              <tr className="border-b border-ay-line text-sm text-ay-slate">
                <th scope="col" className="py-2 font-semibold">
                  City
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Price / m² (ft²)
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Typical rent
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Gross yield
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Net yield*
                </th>
                <th scope="col" className="py-2 pl-4 font-semibold">
                  Short-term rentals
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.city.id} className="border-b border-ay-line/60 align-top">
                  <th scope="row" className="py-3 pr-3 font-semibold">
                    {m.city.name}
                    <span className="block text-sm font-normal text-ay-slate">
                      {m.city.highlight}
                    </span>
                  </th>
                  <td className="py-3 text-right tabular-nums">
                    {formatUsd(m.pricePerSqmUsd)}{" "}
                    <span className="text-ay-slate">({formatUsd(m.pricePerSqftUsd)})</span>
                    <span className="block text-sm text-ay-slate">
                      {formatLocal(m.city.pricePerSqmLocal, country.currency)}/m²
                    </span>
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {formatUsd(m.longRentAnnualUsd / 12)}/mo
                    <span className="block text-sm text-ay-slate">
                      {m.city.typicalUnitSqm} m² unit
                    </span>
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {formatPct(m.grossYieldLong)}{" "}
                    <span className="block text-sm text-ay-slate">
                      STR {formatPct(m.grossYieldShort)}
                    </span>
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {formatPct(m.netYieldLong)}{" "}
                    <span className="block text-sm text-ay-slate">
                      STR {formatPct(m.netYieldShort)}
                    </span>
                  </td>
                  <td className="py-3 pl-4">
                    <Pill
                      tone={
                        m.city.strAllowed === "yes"
                          ? "good"
                          : m.city.strAllowed === "restricted"
                            ? "warn"
                            : "bad"
                      }
                    >
                      {m.city.strAllowed === "yes"
                        ? "Allowed"
                        : m.city.strAllowed === "restricted"
                          ? "Restricted"
                          : "Not allowed"}
                    </Pill>
                    <span className="mt-1 block text-sm text-ay-slate">{m.city.strRules}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ay-slate">
          *Net yield before income taxes, after vacancy, management and running costs. STR =
          short-term rental.
        </p>
        {cities[0] ? <SourceNote meta={cities[0].meta} /> : null}
      </Card>

      {/* h) Risks */}
      <Card as="section">
        <SectionTitle letter="h" id={`${country.id}-risks`} title="Risks and how to reduce them" />
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {country.risks.items.map((r) => (
            <li key={r.key} className="rounded-xl border border-ay-line p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold">{RISK_LABELS[r.key]}</h4>
                <span
                  className="flex items-center gap-1"
                  aria-label={`Risk level ${r.level} out of 5`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      aria-hidden
                      className={cn(
                        "h-2 w-4 rounded-sm",
                        n <= r.level
                          ? r.level >= 4
                            ? "bg-ay-bad"
                            : r.level === 3
                              ? "bg-ay-warn"
                              : "bg-ay-good"
                          : "bg-ay-line",
                      )}
                    />
                  ))}
                  <span className="ml-1 text-sm text-ay-slate">{r.level}/5</span>
                </span>
              </div>
              <p className="mt-2 text-ay-ink">{r.summary}</p>
              <p className="mt-2 text-ay-slate">
                <span className="font-semibold text-ay-ink">Mitigation:</span> {r.mitigation}
              </p>
            </li>
          ))}
        </ul>
        <SourceNote meta={country.risks.meta} />
      </Card>

      {/* i) Checklist */}
      <Card as="section">
        <SectionTitle
          letter="i"
          id={`${country.id}-checklist`}
          title="Step-by-step buying checklist"
        />
        <ol className="mt-4 space-y-3">
          {country.checklist.steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ay-sand font-semibold text-ay-navy">
                {i + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-center gap-2 text-ay-slate">
          <ListChecks aria-hidden className="size-5" /> Use this list with your attorney; it is not
          exhaustive.
        </p>
        <SourceNote meta={country.checklist.meta} />
      </Card>

      {/* Assistant */}
      <Card as="section" className="ay-no-print">
        <AssistantPanel
          chunks={knowledge}
          limitPerHour={settings.ai.messagesPerHour}
          countryName={country.id}
        />
      </Card>

      {/* k) Talk to an expert */}
      <Card as="section" className="ay-no-print">
        <SectionTitle letter="k" id={`${country.id}-experts`} title="Talk to an expert" />
        <p className="mt-2 text-ay-slate">
          Get an introduction to a vetted US expat tax firm, international mortgage broker, local
          agent or attorney for {name}. Free for you.
        </p>
        <div className="mt-5">
          <ExpertForm defaultCountry={country.id} />
        </div>
      </Card>

      {/* l) Sources */}
      <Card as="section">
        <SectionTitle letter="l" id={`${country.id}-sources`} title="Sources and verification" />
        <p className="mt-2 text-ay-slate">
          {sample
            ? "This country's data is SAMPLE DATA – TO BE VERIFIED."
            : `Country data verified by ${country.verifiedBy}.`}{" "}
          Exchange rates: {settings.fx.sourceLabel}, updated {settings.fx.updatedAt}. 1{" "}
          {country.currency} = {formatUsd(fxRate, { cents: true })}.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ay-slate">
          {uniqueSources(country, usTax).map((s) => (
            <li key={s.label}>
              {s.url ? (
                <a
                  href={s.url}
                  className="underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ) : (
                s.label
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Disclaimer />
    </div>
  );
}

function uniqueSources(country: Country, usTax: UsTaxParams) {
  const all = [
    country.ownership.meta,
    country.acquisition.meta,
    country.financing.meta,
    country.rental.meta,
    country.localTax.meta,
    country.risks.meta,
    country.checklist.meta,
    usTax.meta,
  ].flatMap((m) => m.sources);
  return all.filter((s, i) => all.findIndex((x) => x.label === s.label) === i);
}

function SectionTitle({ letter, title, id }: { letter: string; title: string; id: string }) {
  return (
    <h3
      id={id}
      className="flex scroll-mt-24 items-baseline gap-3 text-2xl font-semibold text-ay-ink"
    >
      <span
        aria-hidden
        className="font-[family-name:var(--font-ay-head)] text-base font-semibold uppercase text-ay-gold"
      >
        {letter}
      </span>
      {title}
    </h3>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const id = `slider-${label.replace(/\W+/g, "-").toLowerCase()}`;
  const clamped = Math.min(max, Math.max(min, value));
  return (
    <div className={disabled ? "opacity-50" : ""}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <output htmlFor={id} className="tabular-nums text-ay-ink">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format(value)}
        className="mt-2 h-11 w-full cursor-pointer accent-ay-navy"
      />
    </div>
  );
}
