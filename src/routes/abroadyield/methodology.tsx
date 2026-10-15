import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Card,
  Container,
  Disclaimer,
  SectionHeading,
  buttonClass,
} from "@/abroadyield/components/ui";
import {
  FACTOR_LABELS,
  formatDate,
  formatPct,
  formatUsd,
  type FactorKey,
} from "@/abroadyield/engine";
import { useSiteData } from "@/abroadyield/store/hooks";

export const Route = createFileRoute("/abroadyield/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology: how AbroadYield calculates scores and after-tax returns" },
      {
        name: "description",
        content:
          "Every formula behind AbroadYield: country scores, net yield, local tax, the US Foreign Tax Credit, NIIT, state tax, depreciation and currency.",
      },
    ],
  }),
  component: Methodology,
});

function Methodology() {
  const { settings, usTax, countries } = useSiteData();
  const weights = settings.scoring.weights;
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const sample = countries.filter((c) => c.dataStatus === "sample").length;

  return (
    <Container className="max-w-4xl py-10 sm:py-14">
      <SectionHeading
        level={1}
        eyebrow="Methodology"
        title="How we calculate your numbers"
        intro="Plain-English explanations of every formula. The calculation engine is a separate, unit-tested module, and every tax rate and threshold is an editable parameter reviewed by our tax advisers."
      />
      <p className="mt-4 text-ay-slate">
        Tax parameters: tax year {usTax.taxYear}, last verified{" "}
        {formatDate(usTax.meta.lastVerified)} ({usTax.meta.verifiedBy}).{" "}
        {sample
          ? `${sample} of ${countries.length} countries still use sample data awaiting verification.`
          : "All country data has been verified."}
      </p>

      <div className="mt-10 space-y-6">
        <Card as="section">
          <h2 className="text-2xl font-semibold">1. Returns, step by step</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            <li>
              <strong>Gross rent</strong> — a year of rent at full occupancy (long-term), or nightly
              rate × 365 (short-term).
            </li>
            <li>
              <strong>Minus vacancy</strong> (or unbooked nights) — a share of gross rent that is
              never collected.
            </li>
            <li>
              <strong>Minus running costs</strong> — management (% of collected rent), maintenance,
              insurance and property tax (% of price), and condo/HOA fees.
            </li>
            <li>
              <strong>= Net operating income (NOI)</strong>. NOI ÷ price is the{" "}
              <em>net yield before tax</em>.
            </li>
            <li>
              <strong>Minus local income tax</strong> on rent, using the country's regime: on gross
              rent (e.g. Spain for non-EU owners, Mexico) or on net income (e.g. Portugal), with
              progressive brackets where they apply (Greece).
            </li>
            <li>
              <strong>Minus additional US federal tax</strong> — see section 2.
            </li>
            <li>
              <strong>Minus state tax</strong> — your state's representative rate on net rental
              income. Most states give no credit for foreign tax. No state tax is assumed if you
              live abroad.
            </li>
            <li>
              <strong>= After-tax income</strong>. After-tax income ÷ price is the{" "}
              <em>after-tax net yield</em>. With a mortgage, subtracting a year of loan payments
              gives <em>annual cash flow</em>.
            </li>
          </ol>
          <p className="mt-4 text-ay-slate">
            All figures are year-one estimates in US dollars, converted at the configured exchange
            rate ({settings.fx.sourceLabel}, updated {settings.fx.updatedAt}). The simulator's
            exchange-rate slider changes the value of rent and local costs after purchase; the price
            and any loan stay in dollars.
          </p>
        </Card>

        <Card as="section">
          <h2 className="text-2xl font-semibold">2. US federal tax on foreign rent</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            <li>
              <strong>Schedule E net income</strong> = NOI − mortgage interest − depreciation.
              Depreciation = (price + closing costs) ×{" "}
              {formatPct(usTax.depreciation.buildingShare, 0)} building share ÷{" "}
              {usTax.depreciation.foreignResidentialYears} years.
            </li>
            <li>
              <strong>US tax on that income</strong> = tax on (your taxable income + rental income)
              − tax on your taxable income alone, using the {usTax.taxYear} brackets for your filing
              status and the standard deduction ({formatUsd(usTax.standardDeduction.single)} single,{" "}
              {formatUsd(usTax.standardDeduction.mfj)} joint). Your income is estimated from the
              bracket you chose.
            </li>
            <li>
              <strong>Foreign Tax Credit</strong> (Form 1116) = the lower of foreign tax paid and
              the US tax on that income. Any excess is shown as a carryforward, not as money back.
            </li>
            <li>
              <strong>Net Investment Income Tax</strong> of {formatPct(usTax.niit.rate)} on the
              lesser of net rental income and income above {formatUsd(usTax.niit.thresholdSingle)}{" "}
              (single) or {formatUsd(usTax.niit.thresholdMfj)} (joint). We do not offset NIIT with
              foreign tax credits.
            </li>
          </ol>
          <p className="mt-4 text-ay-slate">{usTax.notes.feie}</p>
          <p className="mt-2 text-ay-slate">
            Simplifications: we ignore passive-activity rules beyond flagging paper losses, the AMT,
            itemised deductions, and other foreign-source income that could change your credit
            limitation.
          </p>
        </Card>

        <Card as="section">
          <h2 className="text-2xl font-semibold">3. The country score (0–100)</h2>
          <p className="mt-3">
            Each country gets nine factor scores from 0 to 100, combined as a weighted average. Your
            answers tilt the weights: a low risk tolerance raises the weight of stability; a
            retirement goal raises lifestyle; factors that don't apply to you (for example,
            financing if you pay cash) drop out.
          </p>
          <table className="mt-4 w-full text-left">
            <caption className="sr-only">Base scoring weights</caption>
            <thead>
              <tr className="border-b border-ay-line text-sm text-ay-slate">
                <th scope="col" className="py-2">
                  Factor
                </th>
                <th scope="col" className="py-2 text-right">
                  Base weight
                </th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(weights) as FactorKey[]).map((key) => (
                <tr key={key} className="border-b border-ay-line/60">
                  <th scope="row" className="py-2 font-normal">
                    {FACTOR_LABELS[key]}
                  </th>
                  <td className="py-2 text-right tabular-nums">
                    {Math.round((weights[key] / total) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4">
            Badges: <strong>Strong fit</strong> from {settings.scoring.strongFitMin},{" "}
            <strong>Possible</strong> from {settings.scoring.possibleMin}, otherwise{" "}
            <strong>Not recommended for you</strong>. A country whose typical entry price is above
            your budget is never recommended.
          </p>
        </Card>

        <Card as="section">
          <h2 className="text-2xl font-semibold">4. Data sources and verification</h2>
          <p className="mt-3">
            We use official sources first (tax authorities, land registries, the IRS, FinCEN), then
            established market data providers for prices, rents and yields. Every report section
            shows its sources, the date it was last verified and who verified it. Data still
            labelled “Sample data – to be verified” has not been checked and should not be relied
            on.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-ay-slate">
            {usTax.meta.sources.map((s) => (
              <li key={s.label}>
                {s.url ? (
                  <a href={s.url} className="underline" target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                ) : (
                  s.label
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Disclaimer className="mt-8" />
      <Link to="/abroadyield/start" className={buttonClass("primary", "mt-8")}>
        Get my free ranking
      </Link>
    </Container>
  );
}
