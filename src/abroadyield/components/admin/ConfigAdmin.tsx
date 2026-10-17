import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FACTOR_LABELS, formatPct, rankCountries, type FactorKey } from "../../engine";
import { emptyProfile } from "../../profile";
import type { Profile, Settings, TaxBracket, UsTaxParams } from "../../types";
import { useAuth, useSiteData } from "../../store/hooks";
import { Button, FitBadge, Pill } from "../ui";
import {
  AField,
  AdminSection,
  JsonEditor,
  NumInput,
  SaveStatus,
  TextBox,
  TextIn,
  today,
  useSaver,
} from "./shared";

function BracketsEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TaxBracket[];
  onChange: (v: TaxBracket[]) => void;
}) {
  return (
    <div>
      <h4 className="font-semibold">{label}</h4>
      <table className="mt-2 w-full text-left text-sm">
        <thead>
          <tr className="text-ay-slate">
            <th scope="col" className="py-1">
              Up to (USD)
            </th>
            <th scope="col" className="py-1">
              Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {value.map((b, i) => (
            <tr key={i}>
              <td className="py-1 pr-2">
                {b.upTo === null ? (
                  <span className="text-ay-slate">and above</span>
                ) : (
                  <NumInput
                    value={b.upTo}
                    onChange={(v) =>
                      onChange(value.map((x, j) => (j === i ? { ...x, upTo: v } : x)))
                    }
                  />
                )}
              </td>
              <td className="py-1">
                <NumInput
                  percent
                  value={b.rate}
                  onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, rate: v } : x)))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TaxAdmin() {
  const { usTax } = useSiteData();
  const { user } = useAuth();
  const [draft, setDraft] = useState<UsTaxParams>(usTax);
  const { save, status } = useSaver();
  useEffect(() => setDraft(usTax), [usTax]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(usTax);
  const set = <K extends keyof UsTaxParams>(key: K, value: UsTaxParams[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="space-y-6">
      <AdminSection
        title="US tax parameters"
        description={
          <span className="flex flex-wrap items-center gap-2">
            {draft.dataStatus === "sample" ? (
              <Pill tone="warn">SAMPLE DATA – TO BE VERIFIED by a US CPA or enrolled agent</Pill>
            ) : (
              <Pill tone="good">
                Verified {draft.meta.lastVerified} by {draft.meta.verifiedBy}
              </Pill>
            )}
            <span>
              Every rate and threshold used by the engine is editable here. Local (country) tax
              rules are edited in each country.
            </span>
          </span>
        }
        actions={
          <>
            <SaveStatus status={status} />
            <Button
              variant="secondary"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  dataStatus: "verified",
                  meta: { ...d.meta, verifiedBy: user?.email ?? "admin", lastVerified: today() },
                }))
              }
            >
              Mark verified
            </Button>
            <Button disabled={!dirty} onClick={() => void save("config", draft)}>
              Save tax parameters
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <AField label="Tax year">
            <NumInput value={draft.taxYear} onChange={(v) => set("taxYear", v)} />
          </AField>
          <AField label="Std. deduction single">
            <NumInput
              value={draft.standardDeduction.single}
              onChange={(v) => set("standardDeduction", { ...draft.standardDeduction, single: v })}
            />
          </AField>
          <AField label="Std. deduction joint">
            <NumInput
              value={draft.standardDeduction.mfj}
              onChange={(v) => set("standardDeduction", { ...draft.standardDeduction, mfj: v })}
            />
          </AField>
          <AField label="NIIT rate">
            <NumInput
              percent
              value={draft.niit.rate}
              onChange={(v) => set("niit", { ...draft.niit, rate: v })}
            />
          </AField>
          <AField label="NIIT threshold single">
            <NumInput
              value={draft.niit.thresholdSingle}
              onChange={(v) => set("niit", { ...draft.niit, thresholdSingle: v })}
            />
          </AField>
          <AField label="NIIT threshold joint">
            <NumInput
              value={draft.niit.thresholdMfj}
              onChange={(v) => set("niit", { ...draft.niit, thresholdMfj: v })}
            />
          </AField>
          <AField label="Depreciation period (years)">
            <NumInput
              value={draft.depreciation.foreignResidentialYears}
              onChange={(v) =>
                set("depreciation", { ...draft.depreciation, foreignResidentialYears: v })
              }
            />
          </AField>
          <AField label="Building share of basis">
            <NumInput
              percent
              value={draft.depreciation.buildingShare}
              onChange={(v) => set("depreciation", { ...draft.depreciation, buildingShare: v })}
            />
          </AField>
          <AField label="FBAR threshold (USD)">
            <NumInput value={draft.fbarThresholdUsd} onChange={(v) => set("fbarThresholdUsd", v)} />
          </AField>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <BracketsEditor
            label="Federal brackets — single"
            value={draft.federalBrackets.single}
            onChange={(v) => set("federalBrackets", { ...draft.federalBrackets, single: v })}
          />
          <BracketsEditor
            label="Federal brackets — married filing jointly"
            value={draft.federalBrackets.mfj}
            onChange={(v) => set("federalBrackets", { ...draft.federalBrackets, mfj: v })}
          />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <JsonEditor
            label="Form 8938 (FATCA) thresholds [year end, any time]"
            rows={8}
            value={draft.fatca8938}
            onApply={(v) => set("fatca8938", v)}
          />
          <JsonEditor
            label="Capital gains"
            rows={8}
            value={draft.capitalGains}
            onApply={(v) => set("capitalGains", v)}
          />
        </div>
      </AdminSection>

      <AdminSection
        title="State tax rates"
        description="Representative rate applied to net foreign rental income for residents of each state."
      >
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(draft.stateRates)
            .sort((a, b) => a[1].name.localeCompare(b[1].name))
            .map(([code, s]) => (
              <AField key={code} label={`${s.name} (${code})`}>
                <NumInput
                  percent
                  value={s.rate}
                  onChange={(v) =>
                    set("stateRates", { ...draft.stateRates, [code]: { ...s, rate: v } })
                  }
                />
              </AField>
            ))}
        </div>
      </AdminSection>

      <AdminSection title="Explanations shown in reports">
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(draft.notes) as Array<keyof UsTaxParams["notes"]>).map((key) => (
            <AField key={key} label={key}>
              <TextBox
                rows={4}
                value={draft.notes[key]}
                onChange={(v) => set("notes", { ...draft.notes, [key]: v })}
              />
            </AField>
          ))}
        </div>
        <div className="mt-4">
          <JsonEditor
            label="Sources and verification"
            rows={8}
            value={draft.meta}
            onApply={(v) => set("meta", v)}
          />
        </div>
      </AdminSection>
    </div>
  );
}

const PREVIEW_PROFILE: Profile = {
  ...emptyProfile,
  citizenship: "us_citizen",
  residence: "us",
  usState: "NY",
  income: "150to250",
  filingStatus: "mfj",
  cashUsd: 150000,
  budgetUsd: 350000,
  financing: "cash",
  goal: "income",
  strategy: "long",
  risk: "medium",
  lifestyle: ["beach", "warm"],
};

export function ScoringAdmin() {
  const { settings, countries, usTax } = useSiteData();
  const [draft, setDraft] = useState(settings.scoring);
  const { save, status } = useSaver();
  useEffect(() => setDraft(settings.scoring), [settings.scoring]);
  const preview = useMemo(
    () => rankCountries(countries, PREVIEW_PROFILE, { ...settings, scoring: draft }, usTax),
    [countries, settings, draft, usTax],
  );
  const total = Object.values(draft.weights).reduce((a, b) => a + b, 0);

  return (
    <AdminSection
      title="Scoring weights"
      description="Base weights for the 0–100 country score. The user's goal and risk tolerance tilt them (see Methodology)."
      actions={
        <>
          <SaveStatus status={status} />
          <Button onClick={() => void save("config", { ...settings, scoring: draft })}>
            Save weights
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(draft.weights) as FactorKey[]).map((key) => (
              <AField
                key={key}
                label={FACTOR_LABELS[key]}
                hint={`${total ? Math.round((draft.weights[key] / total) * 100) : 0}% of total`}
              >
                <NumInput
                  value={draft.weights[key]}
                  onChange={(v) =>
                    setDraft({ ...draft, weights: { ...draft.weights, [key]: Math.max(0, v) } })
                  }
                />
              </AField>
            ))}
            <AField label="“Strong fit” from">
              <NumInput
                value={draft.strongFitMin}
                onChange={(v) => setDraft({ ...draft, strongFitMin: v })}
              />
            </AField>
            <AField label="“Possible” from">
              <NumInput
                value={draft.possibleMin}
                onChange={(v) => setDraft({ ...draft, possibleMin: v })}
              />
            </AField>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Live preview</h3>
          <p className="text-sm text-ay-slate">
            Married couple in New York, $150–250k income, $350k budget, cash, rental income, medium
            risk, beach + warm.
          </p>
          <ol className="mt-3 space-y-2">
            {preview.map((p, i) => (
              <li
                key={p.country.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-ay-line px-3 py-2"
              >
                <span>
                  {i + 1}. {p.country.name}{" "}
                  <span className="text-sm text-ay-slate">
                    · after-tax {formatPct(p.afterTaxYield)}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{p.score}</span>
                  <FitBadge badge={p.badge} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AdminSection>
  );
}

export function SettingsAdmin() {
  const { settings } = useSiteData();
  const [draft, setDraft] = useState<Settings>(settings);
  const { save, status } = useSaver();
  const [fxMessage, setFxMessage] = useState("");
  useEffect(() => setDraft(settings), [settings]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  async function refreshFx() {
    setFxMessage("Fetching…");
    try {
      const response = await fetch(draft.fx.sourceUrl);
      const payload = (await response.json()) as {
        rates?: Record<string, number>;
        base_code?: string;
      };
      if (!payload.rates) throw new Error("No rates in response");
      // The source quotes units of each currency per 1 USD; we store USD per unit.
      const next = { ...draft.fx.usdPerUnit };
      for (const code of Object.keys(next)) {
        const perUsd = payload.rates[code];
        if (perUsd && perUsd > 0) next[code] = Number((1 / perUsd).toPrecision(6));
      }
      setDraft({
        ...draft,
        fx: {
          ...draft.fx,
          usdPerUnit: next,
          updatedAt: today(),
          sourceLabel: new URL(draft.fx.sourceUrl).hostname,
        },
      });
      setFxMessage("Rates updated — review and save.");
    } catch (error) {
      setFxMessage(`Could not refresh: ${error instanceof Error ? error.message : "error"}`);
    }
  }

  return (
    <div className="space-y-6">
      <AdminSection
        title="Validation mode"
        description="When ON, “Unlock my full report” records the click and shows a waitlist form instead of charging."
        actions={<SaveStatus status={status} />}
      >
        <label className="flex items-center gap-3 text-lg">
          <input
            type="checkbox"
            className="size-6 accent-ay-navy"
            checked={draft.validationMode}
            onChange={(e) => setDraft({ ...draft, validationMode: e.target.checked })}
          />
          Validation mode is{" "}
          <strong>{draft.validationMode ? "ON — no payments" : "OFF — payments enabled"}</strong>
        </label>
      </AdminSection>

      <AdminSection title="Prices and refunds">
        <div className="grid gap-4 md:grid-cols-5">
          <AField label="Full Report (USD)">
            <NumInput
              value={draft.pricing.fullReportUsd}
              onChange={(v) =>
                setDraft({ ...draft, pricing: { ...draft.pricing, fullReportUsd: v } })
              }
            />
          </AField>
          <AField label="Explorer Pass (USD)">
            <NumInput
              value={draft.pricing.explorerPassUsd}
              onChange={(v) =>
                setDraft({ ...draft, pricing: { ...draft.pricing, explorerPassUsd: v } })
              }
            />
          </AField>
          <AField label="Pass length (days)">
            <NumInput
              value={draft.pricing.explorerPassDays}
              onChange={(v) =>
                setDraft({ ...draft, pricing: { ...draft.pricing, explorerPassDays: v } })
              }
            />
          </AField>
          <AField label="Max countries / report">
            <NumInput
              value={draft.pricing.maxCountriesPerReport}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  pricing: { ...draft.pricing, maxCountriesPerReport: Math.max(1, Math.round(v)) },
                })
              }
            />
          </AField>
          <AField label="Refund window (days)">
            <NumInput
              value={draft.refundDays}
              onChange={(v) => setDraft({ ...draft, refundDays: v })}
            />
          </AField>
        </div>
        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            className="size-5 accent-ay-navy"
            checked={draft.allowPromotionCodes}
            onChange={(e) => setDraft({ ...draft, allowPromotionCodes: e.target.checked })}
          />
          Accept Stripe promotion codes at checkout (codes are created in the Stripe dashboard)
        </label>
      </AdminSection>

      <AdminSection
        title="Exchange rates"
        description={`USD value of one unit of each currency. Last updated ${draft.fx.updatedAt} (${draft.fx.sourceLabel}).`}
        actions={
          <Button variant="secondary" onClick={() => void refreshFx()}>
            <RefreshCw aria-hidden className="size-4" /> Refresh from source
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-6">
          {Object.entries(draft.fx.usdPerUnit).map(([code, rate]) => (
            <AField key={code} label={code}>
              <NumInput
                value={rate}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    fx: { ...draft.fx, usdPerUnit: { ...draft.fx.usdPerUnit, [code]: v } },
                  })
                }
              />
            </AField>
          ))}
          <AddCurrency
            onAdd={(code) =>
              setDraft({
                ...draft,
                fx: { ...draft.fx, usdPerUnit: { ...draft.fx.usdPerUnit, [code]: 1 } },
              })
            }
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <AField
            label="Exchange-rate source URL"
            hint="Must return JSON with a `rates` object quoted per 1 USD (e.g. open.er-api.com)."
          >
            <TextIn
              value={draft.fx.sourceUrl}
              onChange={(v) => setDraft({ ...draft, fx: { ...draft.fx, sourceUrl: v } })}
            />
          </AField>
          <AField label="Source label">
            <TextIn
              value={draft.fx.sourceLabel}
              onChange={(v) => setDraft({ ...draft, fx: { ...draft.fx, sourceLabel: v } })}
            />
          </AField>
        </div>
        {fxMessage ? (
          <p role="status" className="mt-2 text-sm">
            {fxMessage}
          </p>
        ) : null}
      </AdminSection>

      <AdminSection title="AI assistant and site">
        <div className="grid gap-4 md:grid-cols-3">
          <AField label="Assistant messages per user per hour">
            <NumInput
              value={draft.ai.messagesPerHour}
              onChange={(v) =>
                setDraft({ ...draft, ai: { messagesPerHour: Math.max(1, Math.round(v)) } })
              }
            />
          </AField>
          <AField label="Site “last updated” date">
            <TextIn
              type="date"
              value={draft.siteLastUpdated}
              onChange={(v) => setDraft({ ...draft, siteLastUpdated: v })}
            />
          </AField>
        </div>
      </AdminSection>

      <AdminSection title="Landing page figures">
        <p className="mb-4 text-sm text-ay-slate">
          The four numbers under the hero. Only publish figures you can prove (customers served,
          reports sold, savings found): invented statistics are misleading advertising under FTC
          rules. Numbers count up on screen; text such as “Free” is shown as is.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {draft.homeStats.map((stat, i) => (
            <div key={i} className="grid grid-cols-[7rem_1fr] gap-3">
              <AField label={`Figure ${i + 1}`}>
                <TextIn
                  value={stat.value}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      homeStats: draft.homeStats.map((s, j) => (j === i ? { ...s, value: v } : s)),
                    })
                  }
                />
              </AField>
              <AField label="Label">
                <TextIn
                  value={stat.label}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      homeStats: draft.homeStats.map((s, j) => (j === i ? { ...s, label: v } : s)),
                    })
                  }
                />
              </AField>
            </div>
          ))}
        </div>
      </AdminSection>

      <div className="flex items-center gap-3">
        <Button disabled={!dirty} onClick={() => void save("config", draft)}>
          Save settings
        </Button>
        <SaveStatus status={status} />
      </div>
    </div>
  );
}

function AddCurrency({ onAdd }: { onAdd: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <div>
      <AField label="Add currency (ISO code)">
        <TextIn
          value={code}
          onChange={(v) =>
            setCode(
              v
                .toUpperCase()
                .replace(/[^A-Z]/g, "")
                .slice(0, 3),
            )
          }
        />
      </AField>
      <Button
        variant="secondary"
        className="mt-1 min-h-9 px-3 py-1 text-sm"
        disabled={code.length !== 3}
        onClick={() => (onAdd(code), setCode(""))}
      >
        Add
      </Button>
    </div>
  );
}
