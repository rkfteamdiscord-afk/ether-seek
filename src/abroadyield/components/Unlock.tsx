import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Lock, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { track } from "../lib/analytics";
import { getBackend, newId } from "../store";
import { loadProfile, orderCovers, useAuth, useMyOrders, useSiteData } from "../store/hooks";
import type { Country, ProductKey } from "../types";
import { Button, CheckboxRow, Field, TextInput, buttonClass } from "./ui";

/**
 * "Unlock my full report" panel. In validation mode (admin toggle) it records the click and shows
 * a waitlist form instead of charging; otherwise it starts Stripe Checkout (or the demo checkout).
 */
export function UnlockPanel({
  countries,
  preselected,
  onClose,
}: {
  countries: Country[];
  preselected: string[];
  onClose: () => void;
}) {
  const { settings } = useSiteData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const orders = useMyOrders();
  const max = settings.pricing.maxCountriesPerReport;
  const [selected, setSelected] = useState<string[]>(preselected.slice(0, max));
  const [product, setProduct] = useState<ProductKey>("report");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEmail(user?.email ?? loadProfile()?.email ?? "");
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [user, onClose]);

  const covered = selected.length > 0 && (orders.data ?? []).some((o) => orderCovers(o, selected));

  function toggle(id: string) {
    setError("");
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length >= max ? s : [...s, id],
    );
  }

  async function submit() {
    if (product === "report" && selected.length === 0)
      return setError("Choose at least one country.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      return setError("Enter a valid email address for your receipt.");
    setBusy(true);
    setError("");
    const backend = getBackend();
    try {
      if (settings.validationMode) {
        await backend.insert("waitlist", {
          id: newId("wl"),
          createdAt: new Date().toISOString(),
          email: email.trim().toLowerCase(),
          product,
          countryIds: selected,
          userId: user?.id ?? "",
        });
        track("waitlist_join", { product, countries: selected.join(",") });
        setJoined(true);
        return;
      }
      if (backend.mode === "supabase" && !user) {
        setError("Please log in or create a free account first, so your report is saved to it.");
        return;
      }
      track("checkout_start", { product, countries: selected.join(",") });
      const { url } = await backend.startCheckout({
        product,
        countryIds: selected,
        email: email.trim().toLowerCase(),
        successPath: `/abroadyield/checkout?status=success&countries=${selected.join(",")}`,
        cancelPath: "/abroadyield/results?checkout=cancelled",
      });
      if (url.startsWith("/")) await navigate({ href: url });
      else window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="ay-scrim fixed inset-0 z-50 flex items-end justify-center bg-ay-ink/45 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="ay-sheet max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[1.5rem] bg-white p-6 shadow-2xl outline-none sm:rounded-[1.5rem] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-semibold text-ay-ink">
            {settings.validationMode ? "Full reports are almost ready" : "Unlock your full report"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-ay-mist"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        {joined ? (
          <div className="mt-6 space-y-3" role="status">
            <CheckCircle2 aria-hidden className="size-10 text-ay-good" />
            <p className="text-lg text-ay-ink">
              You're on the list. We'll email {email} as soon as full reports open — with an
              early-access discount.
            </p>
            <Button onClick={onClose}>Back to my ranking</Button>
          </div>
        ) : covered ? (
          <div className="mt-6 space-y-4">
            <p className="text-lg text-ay-ink">You already have access to these countries.</p>
            <Link
              to="/abroadyield/report"
              search={{ countries: selected.join(",") }}
              className={buttonClass("primary")}
            >
              Open my full report
            </Link>
          </div>
        ) : (
          <>
            {settings.validationMode ? (
              <p className="mt-3 text-ay-slate">
                We are finishing the verified data for full reports. Join the waitlist and we'll
                tell you the moment they open. Nothing is charged.
              </p>
            ) : (
              <p className="mt-3 text-ay-slate">
                One-time payment. {settings.refundDays}-day money-back guarantee.
              </p>
            )}

            <fieldset className="mt-6">
              <legend className="font-semibold text-ay-ink">Choose your plan</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    [
                      "report",
                      "Full Report",
                      `$${settings.pricing.fullReportUsd}`,
                      `1 country or compare up to ${max}`,
                    ],
                    [
                      "pass",
                      "Explorer Pass",
                      `$${settings.pricing.explorerPassUsd}`,
                      `Unlimited reports for ${settings.pricing.explorerPassDays} days`,
                    ],
                  ] as Array<[ProductKey, string, string, string]>
                ).map(([key, name, price, note]) => (
                  <label
                    key={key}
                    className={cn(
                      "flex cursor-pointer flex-col rounded-xl border-2 p-4",
                      product === key
                        ? "border-ay-navy bg-ay-sky"
                        : "border-ay-line hover:border-ay-navy/40",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="product"
                        checked={product === key}
                        onChange={() => setProduct(key)}
                        className="size-5 accent-ay-navy"
                      />
                      <span className="font-semibold">{name}</span>
                      <span className="ml-auto font-[family-name:var(--font-ay-head)] text-lg font-semibold">
                        {price}
                      </span>
                    </span>
                    <span className="mt-1 pl-7 text-sm text-ay-slate">{note}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="font-semibold text-ay-ink">
                {product === "pass"
                  ? "Start with these countries"
                  : `Countries in this report (up to ${max})`}
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {countries.map((country) => (
                  <CheckboxRow
                    key={country.id}
                    id={`unlock-${country.id}`}
                    checked={selected.includes(country.id)}
                    onChange={() => toggle(country.id)}
                  >
                    {country.name}
                  </CheckboxRow>
                ))}
              </div>
              {selected.length >= max && product === "report" ? (
                <p className="mt-2 text-sm text-ay-slate">
                  Maximum of {max} countries per comparison report.
                </p>
              ) : null}
            </fieldset>

            <div className="mt-6">
              <Field
                id="unlock-email"
                label={
                  settings.validationMode ? "Email for the waitlist" : "Email for your receipt"
                }
                error={error || undefined}
              >
                <TextInput
                  id="unlock-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error}
                />
              </Field>
              {error.startsWith("Please log in") ? (
                <Link to="/abroadyield/account" className={buttonClass("secondary", "mt-3")}>
                  Log in or create an account
                </Link>
              ) : null}
            </div>

            <Button
              className="mt-6 w-full"
              onClick={() => void submit()}
              disabled={busy}
              aria-busy={busy}
            >
              <Lock aria-hidden className="size-5" />
              {busy
                ? "Please wait…"
                : settings.validationMode
                  ? "Join the waitlist"
                  : `Continue to secure payment · $${product === "pass" ? settings.pricing.explorerPassUsd : settings.pricing.fullReportUsd}`}
            </Button>
            {!settings.validationMode ? (
              <p className="mt-3 text-center text-sm text-ay-slate">
                Payments are processed by Stripe. Promo codes can be entered at checkout.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/** Records the click on "Unlock my full report" (counted even in validation mode). */
export function recordUnlockClick(countryIds: string[]) {
  track("unlock_click", { countries: countryIds.join(",") });
  void getBackend()
    .insert("unlock_clicks", { id: newId("uc"), at: new Date().toISOString(), countryIds })
    .catch(() => undefined);
}
