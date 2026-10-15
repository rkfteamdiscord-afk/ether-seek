import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { seedCountries } from "../../data/countries";
import type { City, Country, LifestyleKey, SectionMeta } from "../../types";
import { useAuth, useSiteData } from "../../store/hooks";
import { Button, Pill } from "../ui";
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

const SECTION_KEYS = [
  "ownership",
  "acquisition",
  "financing",
  "rental",
  "localTax",
  "risks",
  "checklist",
] as const;

function withMeta(country: Country, update: (meta: SectionMeta) => SectionMeta): Country {
  const next = structuredClone(country);
  for (const key of SECTION_KEYS) next[key].meta = update(next[key].meta);
  return next;
}

export function CountriesAdmin() {
  const { countries, cities } = useSiteData();
  const [selectedId, setSelectedId] = useState(countries[0]?.id ?? "");
  const selected = countries.find((c) => c.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <nav aria-label="Countries" className="space-y-1">
        {countries.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            aria-current={c.id === selectedId}
            className={cn(
              "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 text-left",
              c.id === selectedId ? "bg-ay-navy text-white" : "hover:bg-ay-mist",
            )}
          >
            <span className="truncate">{c.name}</span>
            <span className="text-xs">{c.dataStatus === "sample" ? "SAMPLE" : "✓"}</span>
          </button>
        ))}
        <NewCountry onCreated={setSelectedId} />
      </nav>
      {selected ? (
        <CountryEditor
          key={selected.id}
          country={selected}
          cities={cities.filter((c) => c.countryId === selected.id)}
          onDeleted={() => setSelectedId(countries[0]?.id ?? "")}
        />
      ) : (
        <p>Select a country.</p>
      )}
    </div>
  );
}

function NewCountry({ onCreated }: { onCreated: (id: string) => void }) {
  const { save } = useSaver();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <Button variant="secondary" className="mt-3 w-full" onClick={() => setOpen(true)}>
        <Plus aria-hidden className="size-4" /> Add country
      </Button>
    );
  return (
    <div className="mt-3 space-y-2 rounded-lg border border-ay-line p-3">
      <AField label="Name">
        <TextIn value={name} onChange={setName} />
      </AField>
      <AField label="Currency (ISO code)" hint="Add its exchange rate in Pricing & settings.">
        <TextIn value={currency} onChange={(v) => setCurrency(v.toUpperCase().slice(0, 3))} />
      </AField>
      <Button
        className="w-full"
        disabled={!name.trim() || currency.length !== 3}
        onClick={async () => {
          const slug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          const template = structuredClone(seedCountries[0]!);
          const country: Country = withMeta(
            {
              ...template,
              id: slug.slice(0, 12),
              slug,
              name: name.trim(),
              currency,
              published: false,
              dataStatus: "sample",
              tagline: "",
              summary: "",
              keyRisk: "",
              imageUrl: "",
              imageAlt: "",
            },
            (m) => ({
              ...m,
              sources: [],
              verifiedBy: "Not yet verified (sample)",
              lastVerified: today(),
            }),
          );
          if (await save("countries", country, "Created")) {
            onCreated(country.id);
            setOpen(false);
          }
        }}
      >
        Create (unpublished)
      </Button>
    </div>
  );
}

function CountryEditor({
  country,
  cities,
  onDeleted,
}: {
  country: Country;
  cities: City[];
  onDeleted: () => void;
}) {
  const [draft, setDraft] = useState(country);
  const { save, remove, status } = useSaver();
  const { user } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => setDraft(country), [country]);
  const set = <K extends keyof Country>(key: K, value: Country[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(country);

  return (
    <div className="space-y-6">
      <AdminSection
        title={draft.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {draft.dataStatus === "sample" ? (
              <Pill tone="warn">SAMPLE DATA – TO BE VERIFIED</Pill>
            ) : (
              <Pill tone="good">
                Verified {draft.lastVerified} by {draft.verifiedBy}
              </Pill>
            )}
            {draft.published ? <Pill tone="good">Published</Pill> : <Pill>Hidden</Pill>}
          </span>
        }
        actions={
          <>
            <SaveStatus status={status} />
            <Button
              variant="secondary"
              onClick={() => {
                const by = user?.email ?? "admin";
                setDraft((d) => ({
                  ...withMeta(d, (m) => ({ ...m, verifiedBy: by, lastVerified: today() })),
                  dataStatus: "verified",
                  verifiedBy: by,
                  lastVerified: today(),
                }));
              }}
            >
              <CheckCircle2 aria-hidden className="size-4" /> Mark verified
            </Button>
            <Button onClick={() => void save("countries", draft)} disabled={!dirty}>
              Save country
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <AField label="Name">
            <TextIn value={draft.name} onChange={(v) => set("name", v)} />
          </AField>
          <AField label="URL slug">
            <TextIn value={draft.slug} onChange={(v) => set("slug", v)} />
          </AField>
          <AField label="Currency">
            <TextIn value={draft.currency} onChange={(v) => set("currency", v.toUpperCase())} />
          </AField>
          <AField label="Region">
            <TextIn value={draft.region} onChange={(v) => set("region", v)} />
          </AField>
          <AField label="Data status">
            <select
              className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
              value={draft.dataStatus}
              onChange={(e) => set("dataStatus", e.target.value as Country["dataStatus"])}
            >
              <option value="sample">Sample – to be verified</option>
              <option value="verified">Verified</option>
            </select>
          </AField>
          <AField label="Published">
            <select
              className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
              value={draft.published ? "yes" : "no"}
              onChange={(e) => set("published", e.target.value === "yes")}
            >
              <option value="yes">Published</option>
              <option value="no">Hidden</option>
            </select>
          </AField>
          <AField label="Verified by">
            <TextIn value={draft.verifiedBy} onChange={(v) => set("verifiedBy", v)} />
          </AField>
          <AField label="Last verified">
            <TextIn
              type="date"
              value={draft.lastVerified}
              onChange={(v) => set("lastVerified", v)}
            />
          </AField>
          <AField label="Min. entry price (USD)">
            <NumInput value={draft.minEntryPriceUsd} onChange={(v) => set("minEntryPriceUsd", v)} />
          </AField>
          <AField label="Stability (0–10)">
            <NumInput value={draft.stability} onChange={(v) => set("stability", v)} />
          </AField>
          <AField label="Flight hours from NYC">
            <NumInput
              value={draft.flightHoursFromNyc}
              onChange={(v) => set("flightHoursFromNyc", v)}
            />
          </AField>
          <AField label="Photo URL (optional, licensed)">
            <TextIn value={draft.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
          </AField>
          <AField label="Tagline" className="md:col-span-3">
            <TextIn value={draft.tagline} onChange={(v) => set("tagline", v)} />
          </AField>
          <AField label="Summary" className="md:col-span-3">
            <TextBox value={draft.summary} onChange={(v) => set("summary", v)} />
          </AField>
          <AField label="Key risk (shown in free results)" className="md:col-span-2">
            <TextIn value={draft.keyRisk} onChange={(v) => set("keyRisk", v)} />
          </AField>
          <AField label="Photo description (alt text)">
            <TextIn value={draft.imageAlt ?? ""} onChange={(v) => set("imageAlt", v)} />
          </AField>
          <AField label="Residency notes" className="md:col-span-3">
            <TextBox
              value={draft.residencyNotes}
              onChange={(v) => set("residencyNotes", v)}
              rows={2}
            />
          </AField>
        </div>
        <h3 className="mt-6 font-semibold">Lifestyle scores (0–10)</h3>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-6">
          {(Object.keys(draft.lifestyle) as LifestyleKey[]).map((key) => (
            <AField key={key} label={key}>
              <NumInput
                value={draft.lifestyle[key]}
                onChange={(v) => set("lifestyle", { ...draft.lifestyle, [key]: v })}
              />
            </AField>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="Ownership rules">
        <div className="grid gap-4 md:grid-cols-3">
          <AField label="Status">
            <select
              className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
              value={draft.ownership.status}
              onChange={(e) =>
                set("ownership", {
                  ...draft.ownership,
                  status: e.target.value as "allowed" | "restricted",
                })
              }
            >
              <option value="allowed">Allowed</option>
              <option value="restricted">Restricted</option>
            </select>
          </AField>
          <AField label="Timeline min (weeks)">
            <NumInput
              value={draft.ownership.timelineWeeks[0]}
              onChange={(v) =>
                set("ownership", {
                  ...draft.ownership,
                  timelineWeeks: [v, draft.ownership.timelineWeeks[1]],
                })
              }
            />
          </AField>
          <AField label="Timeline max (weeks)">
            <NumInput
              value={draft.ownership.timelineWeeks[1]}
              onChange={(v) =>
                set("ownership", {
                  ...draft.ownership,
                  timelineWeeks: [draft.ownership.timelineWeeks[0], v],
                })
              }
            />
          </AField>
          <AField label="Local tax ID" className="md:col-span-3">
            <TextIn
              value={draft.ownership.taxIdName}
              onChange={(v) => set("ownership", { ...draft.ownership, taxIdName: v })}
            />
          </AField>
          <AField label="Summary" className="md:col-span-3">
            <TextBox
              value={draft.ownership.summary}
              onChange={(v) => set("ownership", { ...draft.ownership, summary: v })}
            />
          </AField>
          <AField label="Restrictions (one per line)" className="md:col-span-3">
            <TextBox
              value={draft.ownership.restrictions.join("\n")}
              onChange={(v) =>
                set("ownership", {
                  ...draft.ownership,
                  restrictions: v.split("\n").filter(Boolean),
                })
              }
            />
          </AField>
          <AField label="Documents (one per line)" className="md:col-span-3">
            <TextBox
              value={draft.ownership.documents.join("\n")}
              onChange={(v) =>
                set("ownership", { ...draft.ownership, documents: v.split("\n").filter(Boolean) })
              }
            />
          </AField>
        </div>
      </AdminSection>

      <AdminSection title="Rental data and running costs">
        <div className="grid gap-4 md:grid-cols-4">
          <AField label="Gross yield low">
            <NumInput
              percent
              value={draft.rental.grossYieldRange[0]}
              onChange={(v) =>
                set("rental", {
                  ...draft.rental,
                  grossYieldRange: [v, draft.rental.grossYieldRange[1]],
                })
              }
            />
          </AField>
          <AField label="Gross yield high">
            <NumInput
              percent
              value={draft.rental.grossYieldRange[1]}
              onChange={(v) =>
                set("rental", {
                  ...draft.rental,
                  grossYieldRange: [draft.rental.grossYieldRange[0], v],
                })
              }
            />
          </AField>
          <AField label="Vacancy (long-term)">
            <NumInput
              percent
              value={draft.rental.vacancyLong}
              onChange={(v) => set("rental", { ...draft.rental, vacancyLong: v })}
            />
          </AField>
          <AField label="Management long">
            <NumInput
              percent
              value={draft.rental.managementLong}
              onChange={(v) => set("rental", { ...draft.rental, managementLong: v })}
            />
          </AField>
          <AField label="Management short">
            <NumInput
              percent
              value={draft.rental.managementShort}
              onChange={(v) => set("rental", { ...draft.rental, managementShort: v })}
            />
          </AField>
          <AField label="Maintenance (% price)">
            <NumInput
              percent
              value={draft.rental.maintenancePctOfPrice}
              onChange={(v) => set("rental", { ...draft.rental, maintenancePctOfPrice: v })}
            />
          </AField>
          <AField label="Insurance (% price)">
            <NumInput
              percent
              value={draft.rental.insurancePctOfPrice}
              onChange={(v) => set("rental", { ...draft.rental, insurancePctOfPrice: v })}
            />
          </AField>
          <AField label="Property tax (% price)">
            <NumInput
              percent
              value={draft.rental.propertyTaxPctOfPrice}
              onChange={(v) => set("rental", { ...draft.rental, propertyTaxPctOfPrice: v })}
            />
          </AField>
          <AField label="HOA / condo (USD / month)">
            <NumInput
              value={draft.rental.hoaMonthlyUsd}
              onChange={(v) => set("rental", { ...draft.rental, hoaMonthlyUsd: v })}
            />
          </AField>
          <AField label="STR friendliness (0–10)">
            <NumInput
              value={draft.rental.strFriendliness}
              onChange={(v) => set("rental", { ...draft.rental, strFriendliness: v })}
            />
          </AField>
          <AField label="Short-term rental rules" className="md:col-span-4">
            <TextBox
              value={draft.rental.strRules}
              onChange={(v) => set("rental", { ...draft.rental, strRules: v })}
              rows={2}
            />
          </AField>
        </div>
      </AdminSection>

      <AdminSection
        title="Local tax on rental income"
        description="Applied by the calculation engine; brackets (USD) replace the flat rate when present."
      >
        <div className="grid gap-4 md:grid-cols-4">
          <AField label="Regime name" className="md:col-span-2">
            <TextIn
              value={draft.localTax.regimeName}
              onChange={(v) => set("localTax", { ...draft.localTax, regimeName: v })}
            />
          </AField>
          <AField label="Basis">
            <select
              className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
              value={draft.localTax.basis}
              onChange={(e) =>
                set("localTax", { ...draft.localTax, basis: e.target.value as "gross" | "net" })
              }
            >
              <option value="gross">Gross rent</option>
              <option value="net">Net income</option>
            </select>
          </AField>
          <AField label="Flat rate">
            <NumInput
              percent
              value={draft.localTax.rate}
              onChange={(v) => set("localTax", { ...draft.localTax, rate: v })}
            />
          </AField>
          <AField label="Taxable share of gross">
            <NumInput
              percent
              value={draft.localTax.taxableShareOfGross}
              onChange={(v) => set("localTax", { ...draft.localTax, taxableShareOfGross: v })}
            />
          </AField>
          <AField label="Short-term rate (optional)" hint="Leave empty to use the flat rate.">
            <input
              type="number"
              step="any"
              className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
              value={
                draft.localTax.shortTermRate === undefined
                  ? ""
                  : Number((draft.localTax.shortTermRate * 100).toFixed(4))
              }
              onChange={(e) => {
                const { shortTermRate: _drop, ...rest } = draft.localTax;
                set(
                  "localTax",
                  e.target.value === ""
                    ? rest
                    : { ...rest, shortTermRate: Number(e.target.value) / 100 },
                );
              }}
            />
          </AField>
          <div className="md:col-span-2">
            <JsonEditor
              label="Progressive brackets (USD, optional)"
              rows={4}
              value={draft.localTax.brackets ?? []}
              validate={(v) =>
                Array.isArray(v) &&
                v.every((b) => typeof b === "object" && b && "rate" in b && "upTo" in b)
                  ? null
                  : 'Expected [{ "upTo": 14000, "rate": 0.15 }, { "upTo": null, "rate": 0.35 }]'
              }
              onApply={(v) => {
                const { brackets: _drop, ...rest } = draft.localTax;
                set("localTax", v.length ? { ...rest, brackets: v } : rest);
              }}
            />
          </div>
          <AField label="Notes" className="md:col-span-4">
            <TextBox
              value={draft.localTax.notes}
              onChange={(v) => set("localTax", { ...draft.localTax, notes: v })}
              rows={2}
            />
          </AField>
          <AField label="US treaty notes" className="md:col-span-4">
            <TextBox
              value={draft.localTax.treatyNotes}
              onChange={(v) => set("localTax", { ...draft.localTax, treatyNotes: v })}
              rows={2}
            />
          </AField>
          <AField label="Capital gains notes" className="md:col-span-4">
            <TextBox
              value={draft.localTax.capitalGainsNotes}
              onChange={(v) => set("localTax", { ...draft.localTax, capitalGainsNotes: v })}
              rows={2}
            />
          </AField>
        </div>
      </AdminSection>

      <AdminSection title="Financing">
        <div className="grid gap-4 md:grid-cols-4">
          <AField label="Local bank for non-residents">
            <select
              className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
              value={draft.financing.localBankForNonResidents}
              onChange={(e) =>
                set("financing", {
                  ...draft.financing,
                  localBankForNonResidents: e.target.value as "yes" | "limited" | "no",
                })
              }
            >
              <option value="yes">Yes</option>
              <option value="limited">Limited</option>
              <option value="no">No</option>
            </select>
          </AField>
          <AField label="Max LTV">
            <NumInput
              percent
              value={draft.financing.maxLtvNonResident}
              onChange={(v) => set("financing", { ...draft.financing, maxLtvNonResident: v })}
            />
          </AField>
          <AField label="Rate low">
            <NumInput
              percent
              value={draft.financing.rateRange[0]}
              onChange={(v) =>
                set("financing", {
                  ...draft.financing,
                  rateRange: [v, draft.financing.rateRange[1]],
                })
              }
            />
          </AField>
          <AField label="Rate high">
            <NumInput
              percent
              value={draft.financing.rateRange[1]}
              onChange={(v) =>
                set("financing", {
                  ...draft.financing,
                  rateRange: [draft.financing.rateRange[0], v],
                })
              }
            />
          </AField>
          <AField label="Down payment low">
            <NumInput
              percent
              value={draft.financing.downPaymentRange[0]}
              onChange={(v) =>
                set("financing", {
                  ...draft.financing,
                  downPaymentRange: [v, draft.financing.downPaymentRange[1]],
                })
              }
            />
          </AField>
          <AField label="Down payment high">
            <NumInput
              percent
              value={draft.financing.downPaymentRange[1]}
              onChange={(v) =>
                set("financing", {
                  ...draft.financing,
                  downPaymentRange: [draft.financing.downPaymentRange[0], v],
                })
              }
            />
          </AField>
          <AField label="Term (years)">
            <NumInput
              value={draft.financing.termYears}
              onChange={(v) => set("financing", { ...draft.financing, termYears: v })}
            />
          </AField>
        </div>
        <div className="mt-4">
          <JsonEditor
            label="Financing options"
            value={draft.financing.options}
            onApply={(v) => set("financing", { ...draft.financing, options: v })}
            validate={(v) => (Array.isArray(v) ? null : "Expected a list")}
          />
        </div>
      </AdminSection>

      <AdminSection
        title="Acquisition costs, risks, checklist and sources"
        description='Cost items: kind "pct" uses fractions of price (0.05 = 5%); "fixed" uses USD.'
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <JsonEditor
            label="Acquisition cost items"
            value={draft.acquisition.items}
            onApply={(v) => set("acquisition", { ...draft.acquisition, items: v })}
            validate={(v) =>
              Array.isArray(v) &&
              v.every(
                (i) =>
                  i &&
                  typeof i === "object" &&
                  "label" in i &&
                  "kind" in i &&
                  "low" in i &&
                  "high" in i,
              )
                ? null
                : "Each item needs label, kind, low and high"
            }
          />
          <JsonEditor
            label="Risks (key, level 1–5, summary, mitigation)"
            value={draft.risks.items}
            onApply={(v) => set("risks", { ...draft.risks, items: v })}
            validate={(v) => (Array.isArray(v) ? null : "Expected a list")}
          />
          <JsonEditor
            label="Buying checklist steps"
            value={draft.checklist.steps}
            onApply={(v) => set("checklist", { ...draft.checklist, steps: v })}
            validate={(v) =>
              Array.isArray(v) && v.every((s) => typeof s === "string")
                ? null
                : "Expected a list of strings"
            }
          />
          <JsonEditor
            label="Section sources and verification"
            value={Object.fromEntries(SECTION_KEYS.map((k) => [k, draft[k].meta]))}
            onApply={(v) => {
              const metas = v as Record<(typeof SECTION_KEYS)[number], SectionMeta>;
              setDraft((d) => {
                const next = structuredClone(d);
                for (const key of SECTION_KEYS) if (metas[key]) next[key].meta = metas[key];
                return next;
              });
            }}
          />
        </div>
      </AdminSection>

      <CitiesEditor country={draft} cities={cities} />

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void save("countries", draft)} disabled={!dirty}>
          Save country
        </Button>
        <SaveStatus status={status} />
        {confirmDelete ? (
          <>
            <Button
              variant="danger"
              onClick={() => void remove("countries", country.id).then(onDeleted)}
            >
              Confirm delete {country.name}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden className="size-4" /> Delete country
          </Button>
        )}
      </div>
    </div>
  );
}

function CitiesEditor({ country, cities }: { country: Country; cities: City[] }) {
  const { save, remove, status } = useSaver();
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<City[]>(cities);
  useEffect(() => setDrafts(cities), [cities]);
  const update = (id: string, patch: Partial<City>) =>
    setDrafts((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <AdminSection
      title={`Cities in ${country.name}`}
      description={`Prices and rents in ${country.currency}. Short-term occupancy as a percentage.`}
      actions={
        <>
          <SaveStatus status={status} />
          <Button
            variant="secondary"
            onClick={() => {
              const city: City = {
                id: `${country.id}-${Date.now().toString(36)}`,
                countryId: country.id,
                name: "New city",
                dataStatus: "sample",
                pricePerSqmLocal: 0,
                typicalUnitSqm: 70,
                longTermRentMonthlyLocal: 0,
                shortTermNightlyLocal: 0,
                shortTermOccupancy: 0.6,
                strAllowed: "yes",
                strRules: "",
                highlight: "",
                meta: {
                  sources: [],
                  lastVerified: today(),
                  verifiedBy: "Not yet verified (sample)",
                },
              };
              void save("cities", city, "Added");
            }}
          >
            <Plus aria-hidden className="size-4" /> Add city
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {drafts.map((city) => (
          <div key={city.id} className="rounded-xl border border-ay-line p-4">
            <div className="grid gap-3 md:grid-cols-6">
              <AField label="Name" className="md:col-span-2">
                <TextIn value={city.name} onChange={(v) => update(city.id, { name: v })} />
              </AField>
              <AField label={`Price / m² (${country.currency})`}>
                <NumInput
                  value={city.pricePerSqmLocal}
                  onChange={(v) => update(city.id, { pricePerSqmLocal: v })}
                />
              </AField>
              <AField label="Unit size (m²)">
                <NumInput
                  value={city.typicalUnitSqm}
                  onChange={(v) => update(city.id, { typicalUnitSqm: v })}
                />
              </AField>
              <AField label="Rent / month">
                <NumInput
                  value={city.longTermRentMonthlyLocal}
                  onChange={(v) => update(city.id, { longTermRentMonthlyLocal: v })}
                />
              </AField>
              <AField label="Nightly rate">
                <NumInput
                  value={city.shortTermNightlyLocal}
                  onChange={(v) => update(city.id, { shortTermNightlyLocal: v })}
                />
              </AField>
              <AField label="STR occupancy">
                <NumInput
                  percent
                  value={city.shortTermOccupancy}
                  onChange={(v) => update(city.id, { shortTermOccupancy: v })}
                />
              </AField>
              <AField label="STR allowed">
                <select
                  className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
                  value={city.strAllowed}
                  onChange={(e) =>
                    update(city.id, { strAllowed: e.target.value as City["strAllowed"] })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="restricted">Restricted</option>
                  <option value="no">No</option>
                </select>
              </AField>
              <AField label="Data status">
                <select
                  className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
                  value={city.dataStatus}
                  onChange={(e) =>
                    update(city.id, { dataStatus: e.target.value as City["dataStatus"] })
                  }
                >
                  <option value="sample">Sample</option>
                  <option value="verified">Verified</option>
                </select>
              </AField>
              <AField label="Last verified">
                <TextIn
                  type="date"
                  value={city.meta.lastVerified}
                  onChange={(v) => update(city.id, { meta: { ...city.meta, lastVerified: v } })}
                />
              </AField>
              <AField label="Highlight" className="md:col-span-2">
                <TextIn
                  value={city.highlight}
                  onChange={(v) => update(city.id, { highlight: v })}
                />
              </AField>
              <AField label="STR rules" className="md:col-span-3">
                <TextIn value={city.strRules} onChange={(v) => update(city.id, { strRules: v })} />
              </AField>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button className="min-h-9 py-1 text-sm" onClick={() => void save("cities", city)}>
                Save city
              </Button>
              <Button
                variant="secondary"
                className="min-h-9 py-1 text-sm"
                onClick={() =>
                  void save(
                    "cities",
                    {
                      ...city,
                      dataStatus: "verified",
                      meta: {
                        ...city.meta,
                        verifiedBy: user?.email ?? "admin",
                        lastVerified: today(),
                      },
                    },
                    "Verified",
                  )
                }
              >
                Mark verified
              </Button>
              <Button
                variant="danger"
                className="min-h-9 py-1 text-sm"
                onClick={() => void remove("cities", city.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}
