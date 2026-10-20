import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { track } from "../lib/analytics";
import { getBackend, newId } from "../store";
import { loadProfile, useAuth, useCollection, useSiteData } from "../store/hooks";
import type { ExpertCategory, Lead, Partner } from "../types";
import { Button, CheckboxRow, Field, SelectInput, TextArea, TextInput } from "./ui";

export const EXPERT_CATEGORIES: Array<{ key: ExpertCategory; label: string; text: string }> = [
  {
    key: "tax",
    label: "US expat tax firm",
    text: "Schedule E, Foreign Tax Credit, FBAR and FATCA filings.",
  },
  {
    key: "mortgage",
    label: "International mortgage broker",
    text: "Non-resident mortgages and cross-border lending.",
  },
  {
    key: "agent",
    label: "Local real estate agent",
    text: "Finding and negotiating the right property.",
  },
  { key: "attorney", label: "Local attorney", text: "Title checks, contracts and closing." },
];

/** Picks the partner a new lead is routed to: an active partner for the category covering the country. */
export function routeLead(
  partners: Partner[],
  category: ExpertCategory,
  countryId: string,
): string {
  return (
    partners.find((p) => p.active && p.category === category && p.countries.includes(countryId))
      ?.id ?? ""
  );
}

export function ExpertForm({
  defaultCountry,
  defaultCategory = "tax",
}: {
  defaultCountry?: string;
  defaultCategory?: ExpertCategory;
}) {
  const { countries } = useSiteData();
  const { user } = useAuth();
  const partners = useCollection<Partner>("partners");
  const [category, setCategory] = useState<ExpertCategory>(defaultCategory);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryId: defaultCountry ?? "",
    budget: "",
    timeline: "",
    message: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const profile = loadProfile();
    setForm((f) => ({
      ...f,
      email: f.email || user?.email || profile?.email || "",
      budget:
        f.budget ||
        (profile?.budgetUsd ? `Up to $${profile.budgetUsd.toLocaleString("en-US")}` : ""),
    }));
  }, [user]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next["name"] = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next["email"] = "Enter a valid email address.";
    if (!form.countryId) next["country"] = "Choose a country.";
    if (!form.budget) next["budget"] = "Choose a budget range.";
    if (!form.timeline) next["timeline"] = "Choose a timeline.";
    if (!consent)
      next["consent"] = "Please tick the box to agree to share your details with the partner.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const lead: Lead = {
      id: newId("lead"),
      createdAt: new Date().toISOString(),
      category,
      partnerId: routeLead(partners.data ?? [], category, form.countryId),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      countryId: form.countryId,
      budget: form.budget,
      timeline: form.timeline,
      message: form.message.trim().slice(0, 2000),
      consent: true,
      status: "new",
      userId: user?.id ?? "",
    };
    try {
      await getBackend().insert("leads", lead);
      track("expert_request", { category, country: form.countryId });
      setDone(true);
    } catch {
      setErrors({ form: "We couldn't send your request. Please try again in a moment." });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-ay-good/30 bg-ay-good-bg p-6 text-ay-ink"
      >
        <CheckCircle2 aria-hidden className="size-8 text-ay-good" />
        <p className="mt-2 text-lg font-semibold">Request received.</p>
        <p className="mt-1">
          We're building our partner network country by country. We'll get back to you by email as
          soon as we can introduce you to a suitable expert, and we only share your details with
          that partner. You can follow your requests in your account.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-5"
    >
      <fieldset>
        <legend className="font-semibold text-ay-ink">What kind of expert?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {EXPERT_CATEGORIES.map((c) => (
            <label
              key={c.key}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border-2 p-4",
                category === c.key
                  ? "border-ay-navy bg-ay-sky"
                  : "border-ay-line hover:border-ay-navy/40",
              )}
            >
              <input
                type="radio"
                name="category"
                className="mt-1 size-5 accent-ay-navy"
                checked={category === c.key}
                onChange={() => setCategory(c.key)}
              />
              <span>
                <span className="block font-semibold">{c.label}</span>
                <span className="block text-sm text-ay-slate">{c.text}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="lead-name" label="Name" error={errors["name"]}>
          <TextInput
            id="lead-name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            aria-invalid={!!errors["name"]}
          />
        </Field>
        <Field id="lead-email" label="Email" error={errors["email"]}>
          <TextInput
            id="lead-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            aria-invalid={!!errors["email"]}
          />
        </Field>
        <Field id="lead-phone" label="Phone" optional>
          <TextInput
            id="lead-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone")(e.target.value)}
          />
        </Field>
        <Field id="lead-country" label="Country of interest" error={errors["country"]}>
          <SelectInput
            id="lead-country"
            value={form.countryId}
            onChange={(e) => set("countryId")(e.target.value)}
            aria-invalid={!!errors["country"]}
          >
            <option value="">Choose a country</option>
            {countries
              .filter((c) => c.published)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </SelectInput>
        </Field>
        <Field id="lead-budget" label="Budget range" error={errors["budget"]}>
          <SelectInput
            id="lead-budget"
            value={form.budget}
            onChange={(e) => set("budget")(e.target.value)}
            aria-invalid={!!errors["budget"]}
          >
            <option value="">Choose a range</option>
            {[
              "Under $150,000",
              "$150,000 – $300,000",
              "$300,000 – $500,000",
              "$500,000 – $1,000,000",
              "Over $1,000,000",
              form.budget,
            ]
              .filter((v, i, a) => v && a.indexOf(v) === i)
              .map((v) => (
                <option key={v}>{v}</option>
              ))}
          </SelectInput>
        </Field>
        <Field id="lead-timeline" label="Timeline" error={errors["timeline"]}>
          <SelectInput
            id="lead-timeline"
            value={form.timeline}
            onChange={(e) => set("timeline")(e.target.value)}
            aria-invalid={!!errors["timeline"]}
          >
            <option value="">Choose a timeline</option>
            {[
              "Within 3 months",
              "3–6 months",
              "6–12 months",
              "More than a year",
              "Just researching",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <Field id="lead-message" label="Message" optional>
        <TextArea
          id="lead-message"
          maxLength={2000}
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
        />
      </Field>
      <div>
        <CheckboxRow id="lead-consent" checked={consent} onChange={setConsent}>
          I agree to share this information with the selected partner.
        </CheckboxRow>
        {errors["consent"] ? (
          <p role="alert" className="mt-1 pl-8 text-sm font-medium text-ay-bad">
            {errors["consent"]}
          </p>
        ) : null}
        <p className="mt-2 pl-8 text-sm text-ay-slate">
          AbroadYield may receive a referral fee from partners. It never changes your price.{" "}
          <Link
            to="/abroadyield/legal/$page"
            params={{ page: "partner-disclosure" }}
            className="underline underline-offset-2"
          >
            Partner disclosure
          </Link>
        </p>
      </div>
      {errors["form"] ? (
        <p role="alert" className="font-medium text-ay-bad">
          {errors["form"]}
        </p>
      ) : null}
      <Button type="submit" disabled={busy} aria-busy={busy}>
        {busy ? "Sending…" : "Send my request"}
      </Button>
    </form>
  );
}
