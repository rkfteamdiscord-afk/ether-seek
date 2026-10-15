import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Button,
  CheckboxRow,
  Container,
  Field,
  SelectInput,
  TextInput,
} from "@/abroadyield/components/ui";
import { formatUsd } from "@/abroadyield/engine";
import { track } from "@/abroadyield/lib/analytics";
import { emptyProfile } from "@/abroadyield/profile";
import { getBackend, newId } from "@/abroadyield/store";
import { loadProfile, saveProfile, useSiteData } from "@/abroadyield/store/hooks";
import type { LifestyleKey, Profile } from "@/abroadyield/types";

export const Route = createFileRoute("/abroadyield/start")({
  head: () => ({
    meta: [
      { title: "Your free country ranking — AbroadYield" },
      {
        name: "description",
        content: "Answer 12 quick questions to rank countries by your real after-tax return.",
      },
    ],
  }),
  component: Questionnaire,
});

type StepKey =
  | "citizenship"
  | "residence"
  | "income"
  | "filing"
  | "cash"
  | "budget"
  | "financing"
  | "goal"
  | "strategy"
  | "risk"
  | "lifestyle"
  | "email";

const STEPS: Array<{ key: StepKey; optional?: boolean }> = [
  { key: "citizenship" },
  { key: "residence" },
  { key: "income", optional: true },
  { key: "filing", optional: true },
  { key: "cash" },
  { key: "budget" },
  { key: "financing" },
  { key: "goal" },
  { key: "strategy" },
  { key: "risk" },
  { key: "lifestyle", optional: true },
  { key: "email" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Questionnaire() {
  const navigate = useNavigate();
  const { usTax } = useSiteData();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const saved = loadProfile();
    if (saved) setProfile(saved);
    track("questionnaire_start");
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    track("questionnaire_step", { step: step + 1, key: STEPS[step]!.key });
  }, [step]);

  const update = (patch: Partial<Profile>) => {
    setError("");
    setProfile((p) => ({ ...p, ...patch }));
  };

  const current = STEPS[step]!;

  function validate(): string {
    switch (current.key) {
      case "citizenship":
        return profile.citizenship ? "" : "Please choose one option.";
      case "residence":
        if (!profile.residence) return "Please choose where you live.";
        if (profile.residence === "us" && !profile.usState)
          return "Please choose your state (it affects your tax estimate).";
        return "";
      case "cash":
        return profile.cashUsd !== null && profile.cashUsd > 0
          ? ""
          : "Enter the cash you could put in, even roughly.";
      case "budget":
        return profile.budgetHelp || (profile.budgetUsd !== null && profile.budgetUsd >= 20000)
          ? ""
          : "Enter a budget of at least $20,000, or choose “Help me figure it out”.";
      case "financing":
        return profile.financing ? "" : "Please choose one option.";
      case "goal":
        return profile.goal ? "" : "Please choose your main goal.";
      case "strategy":
        return profile.strategy ? "" : "Please choose one option.";
      case "risk":
        return profile.risk ? "" : "Please choose one option.";
      case "email":
        return EMAIL_RE.test(profile.email.trim())
          ? ""
          : "Enter a valid email address, e.g. name@example.com.";
      default:
        return "";
    }
  }

  async function finish() {
    const finalProfile: Profile = { ...profile, email: profile.email.trim().toLowerCase() };
    if (finalProfile.budgetHelp && finalProfile.cashUsd) {
      // Suggest a budget the cash can carry: price + ~8% closing costs, or a ~40% deposit with a mortgage.
      finalProfile.budgetUsd =
        Math.round(
          (finalProfile.financing === "mortgage"
            ? finalProfile.cashUsd / 0.48
            : finalProfile.cashUsd / 1.08) / 5000,
        ) * 5000;
    }
    saveProfile(finalProfile);
    track("questionnaire_complete", {
      goal: finalProfile.goal,
      strategy: finalProfile.strategy,
      risk: finalProfile.risk,
    });
    await getBackend()
      .insert("subscribers", {
        id: newId("sub"),
        email: finalProfile.email,
        marketingConsent: finalProfile.marketingConsent,
        createdAt: new Date().toISOString(),
      })
      .catch(() => undefined);
    await navigate({ to: "/abroadyield/results" });
  }

  function next() {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    if (step === STEPS.length - 1) void finish();
    else setStep(step + 1);
  }

  function skip() {
    setError("");
    if (current.key === "income") update({ income: "skip" });
    setStep(step + 1);
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const states = Object.entries(usTax.stateRates).sort((a, b) =>
    a[1].name.localeCompare(b[1].name),
  );

  return (
    <Container className="max-w-2xl py-10 sm:py-14">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-ay-slate">
          <span>
            Question {step + 1} of {STEPS.length}
          </span>
          <span>About {Math.max(1, Math.round(((STEPS.length - step) * 15) / 60))} min left</span>
        </div>
        <div
          className="mt-2 h-2 rounded-full bg-ay-mist"
          role="progressbar"
          aria-label="Questionnaire progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-2 rounded-full bg-ay-navy transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        className="ay-fade-in"
        key={current.key}
      >
        {current.key === "citizenship" ? (
          <Step
            heading="What is your citizenship status?"
            headingRef={headingRef}
            hint="US citizens and green card holders are taxed by the US on worldwide income, including rent from abroad."
          >
            <Choices
              name="citizenship"
              value={profile.citizenship}
              onChange={(v) => update({ citizenship: v as Profile["citizenship"] })}
              options={[
                ["us_citizen", "US citizen"],
                ["green_card", "Green card holder"],
                ["other", "Other"],
              ]}
            />
            {profile.citizenship === "other" ? (
              <div
                role="status"
                className="mt-4 flex gap-3 rounded-xl border border-ay-warn/30 bg-ay-warn-bg p-4 text-ay-warn"
              >
                <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
                <p>
                  AbroadYield is designed for US taxpayers. You can continue, but the US tax
                  estimates will not apply to you and your results may be misleading.
                </p>
              </div>
            ) : null}
          </Step>
        ) : null}

        {current.key === "residence" ? (
          <Step
            heading="Where do you live today?"
            headingRef={headingRef}
            hint="Most US states tax your foreign rental income too, usually without a credit for foreign taxes."
          >
            <Choices
              name="residence"
              value={profile.residence}
              onChange={(v) =>
                update({
                  residence: v as Profile["residence"],
                  usState: v === "abroad" ? "" : profile.usState,
                })
              }
              options={[
                ["us", "In the United States"],
                ["abroad", "Abroad"],
              ]}
            />
            {profile.residence === "us" ? (
              <div className="mt-5">
                <Field id="usState" label="Which state?">
                  <SelectInput
                    id="usState"
                    value={profile.usState}
                    onChange={(e) => update({ usState: e.target.value })}
                    aria-invalid={!!error && !profile.usState}
                  >
                    <option value="">Choose your state</option>
                    {states.map(([code, s]) => (
                      <option key={code} value={code}>
                        {s.name}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
              </div>
            ) : null}
            {profile.residence === "abroad" ? (
              <p className="mt-4 text-ay-slate">
                If you still file a state return (for example, you kept a domicile), your state tax
                may still apply. Ask your tax advisor.
              </p>
            ) : null}
          </Step>
        ) : null}

        {current.key === "income" ? (
          <Step
            heading="What is your annual household income?"
            headingRef={headingRef}
            hint="Used only to estimate the US tax rate on your rent. Optional — we'll assume a middle bracket if you skip."
          >
            <Choices
              name="income"
              value={profile.income}
              onChange={(v) => update({ income: v as Profile["income"] })}
              options={[
                ["lt75", "Under $75,000"],
                ["75to150", "$75,000 – $150,000"],
                ["150to250", "$150,000 – $250,000"],
                ["250to500", "$250,000 – $500,000"],
                ["gt500", "Over $500,000"],
              ]}
            />
          </Step>
        ) : null}

        {current.key === "filing" ? (
          <Step
            heading="How do you file your US taxes?"
            headingRef={headingRef}
            hint="Optional. Married couples filing jointly have wider tax brackets."
          >
            <Choices
              name="filing"
              value={profile.filingStatus}
              onChange={(v) => update({ filingStatus: v as Profile["filingStatus"] })}
              options={[
                ["single", "Single"],
                ["mfj", "Married filing jointly"],
                ["other", "Other"],
              ]}
            />
          </Step>
        ) : null}

        {current.key === "cash" ? (
          <Step
            heading="How much cash could you put in?"
            headingRef={headingRef}
            hint="Down payment plus closing costs. A rough figure is fine."
          >
            <MoneyInput
              id="cash"
              label="Available cash (USD)"
              value={profile.cashUsd}
              onChange={(v) => update({ cashUsd: v })}
              invalid={!!error}
            />
            <QuickPicks
              values={[50000, 100000, 200000, 400000]}
              onPick={(v) => update({ cashUsd: v })}
            />
          </Step>
        ) : null}

        {current.key === "budget" ? (
          <Step
            heading="What is your maximum property budget?"
            headingRef={headingRef}
            hint="The highest purchase price you would consider."
          >
            {!profile.budgetHelp ? (
              <>
                <MoneyInput
                  id="budget"
                  label="Maximum budget (USD)"
                  value={profile.budgetUsd}
                  onChange={(v) => update({ budgetUsd: v, budgetHelp: false })}
                  invalid={!!error}
                />
                <QuickPicks
                  values={[150000, 250000, 400000, 750000]}
                  onPick={(v) => update({ budgetUsd: v, budgetHelp: false })}
                />
              </>
            ) : null}
            <div className="mt-5">
              <CheckboxRow
                id="budgetHelp"
                checked={profile.budgetHelp}
                onChange={(checked) =>
                  update({ budgetHelp: checked, budgetUsd: checked ? null : profile.budgetUsd })
                }
              >
                Help me figure it out — suggest a budget from my cash and financing choice
              </CheckboxRow>
            </div>
          </Step>
        ) : null}

        {current.key === "financing" ? (
          <Step heading="How would you pay for it?" headingRef={headingRef}>
            <Choices
              name="financing"
              value={profile.financing}
              onChange={(v) => update({ financing: v as Profile["financing"] })}
              options={[
                ["cash", "Cash"],
                ["mortgage", "With a mortgage"],
                ["unsure", "Not sure yet"],
              ]}
            />
          </Step>
        ) : null}

        {current.key === "goal" ? (
          <Step heading="What is your main goal?" headingRef={headingRef}>
            <Choices
              name="goal"
              value={profile.goal}
              onChange={(v) => update({ goal: v as Profile["goal"] })}
              options={[
                ["income", "Rental income"],
                ["retirement", "Retirement abroad"],
                ["second_home", "A second home that pays for itself"],
                ["diversification", "Diversification"],
              ]}
            />
          </Step>
        ) : null}

        {current.key === "strategy" ? (
          <Step
            heading="How would you rent it out?"
            headingRef={headingRef}
            hint="Short-term rentals earn more per night but cost more to run, and many cities restrict them."
          >
            <Choices
              name="strategy"
              value={profile.strategy}
              onChange={(v) => update({ strategy: v as Profile["strategy"] })}
              options={[
                ["long", "Long-term tenants"],
                ["short", "Short-term (vacation rental)"],
                ["unsure", "Not sure yet"],
              ]}
            />
          </Step>
        ) : null}

        {current.key === "risk" ? (
          <Step heading="How much risk are you comfortable with?" headingRef={headingRef}>
            <Choices
              name="risk"
              value={profile.risk}
              onChange={(v) => update({ risk: v as Profile["risk"] })}
              options={[
                ["low", "Low — stability first"],
                ["medium", "Medium — a balance"],
                ["high", "High — higher yield, more uncertainty"],
              ]}
            />
          </Step>
        ) : null}

        {current.key === "lifestyle" ? (
          <Step
            heading="What matters to you in a place?"
            headingRef={headingRef}
            hint="Optional. Choose as many as you like."
          >
            <fieldset>
              <legend className="sr-only">Lifestyle preferences</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["beach", "Beach"],
                    ["city", "City life"],
                    ["lowCost", "Low cost of living"],
                    ["english", "English widely spoken"],
                    ["shortFlight", "Short flight from the US"],
                    ["warm", "Warm climate"],
                  ] as Array<[LifestyleKey, string]>
                ).map(([key, label]) => {
                  const checked = profile.lifestyle.includes(key);
                  return (
                    <label
                      key={key}
                      className={cn(
                        "flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-lg transition-colors",
                        checked
                          ? "border-ay-navy bg-ay-sky"
                          : "border-ay-line bg-white hover:border-ay-navy/40",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="size-5 accent-ay-navy"
                        checked={checked}
                        onChange={() =>
                          update({
                            lifestyle: checked
                              ? profile.lifestyle.filter((k) => k !== key)
                              : [...profile.lifestyle, key],
                          })
                        }
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </Step>
        ) : null}

        {current.key === "email" ? (
          <Step
            heading="Where should we send your results?"
            headingRef={headingRef}
            hint="We need your email to save your ranking so you can come back to it and unlock the full report later. We never sell your data."
          >
            <Field id="email" label="Email address" error={error || undefined}>
              <TextInput
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={profile.email}
                onChange={(e) => update({ email: e.target.value })}
                aria-invalid={!!error}
                aria-describedby={error ? "email-error" : undefined}
                placeholder="name@example.com"
              />
            </Field>
            <div className="mt-5">
              <CheckboxRow
                id="marketing"
                checked={profile.marketingConsent}
                onChange={(checked) => update({ marketingConsent: checked })}
              >
                Send me occasional updates about new countries and data changes. (Optional — you can
                unsubscribe anytime.)
              </CheckboxRow>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-ay-slate">
              <Lock aria-hidden className="size-4" /> Your answers stay private. See our privacy
              policy.
            </p>
          </Step>
        ) : null}

        {error && current.key !== "email" ? (
          <p role="alert" className="mt-4 font-medium text-ay-bad">
            {error}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? void navigate({ to: "/abroadyield" }) : setStep(step - 1))}
          >
            <ArrowLeft aria-hidden className="size-5" /> Back
          </Button>
          <div className="flex gap-3">
            {current.optional ? (
              <Button variant="secondary" onClick={skip}>
                Skip
              </Button>
            ) : null}
            <Button type="submit">
              {step === STEPS.length - 1 ? (
                <>
                  See my ranking <Check aria-hidden className="size-5" />
                </>
              ) : (
                <>
                  Continue <ArrowRight aria-hidden className="size-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Container>
  );
}

function Step({
  heading,
  hint,
  headingRef,
  children,
}: {
  heading: string;
  hint?: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) {
  return (
    <div>
      <h1
        id="ay-step-heading"
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-semibold text-ay-ink outline-none sm:text-3xl"
      >
        {heading}
      </h1>
      {hint ? <p className="mt-2 text-lg text-ay-slate">{hint}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choices({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset aria-labelledby="ay-step-heading">
      <div className="grid gap-3">
        {options.map(([optionValue, label]) => {
          const checked = value === optionValue;
          return (
            <label
              key={optionValue}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-lg transition-colors",
                checked
                  ? "border-ay-navy bg-ay-sky"
                  : "border-ay-line bg-white hover:border-ay-navy/40",
              )}
            >
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={checked}
                onChange={() => onChange(optionValue)}
                className="size-5 accent-ay-navy"
              />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function MoneyInput({
  id,
  label,
  value,
  onChange,
  invalid,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  invalid: boolean;
}) {
  return (
    <Field id={id} label={label}>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ay-slate"
        >
          $
        </span>
        <TextInput
          id={id}
          inputMode="numeric"
          autoComplete="off"
          className="pl-7 text-lg tabular-nums"
          aria-invalid={invalid}
          value={value === null ? "" : value.toLocaleString("en-US")}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, "");
            onChange(digits ? Math.min(100_000_000, Number(digits)) : null);
          }}
        />
      </div>
    </Field>
  );
}

function QuickPicks({ values, onPick }: { values: number[]; onPick: (value: number) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label="Quick amounts">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className="min-h-11 rounded-full border border-ay-line bg-white px-4 text-ay-ink hover:border-ay-navy/40 hover:bg-ay-mist"
        >
          {formatUsd(v)}
        </button>
      ))}
    </div>
  );
}
