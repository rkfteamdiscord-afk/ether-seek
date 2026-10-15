import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Field,
  Pill,
  TextInput,
  buttonClass,
} from "@/abroadyield/components/ui";
import { formatUsd } from "@/abroadyield/engine";
import { track } from "@/abroadyield/lib/analytics";
import { getBackend, newId } from "@/abroadyield/store";
import { orderCovers, useAuth, useMyOrders, useSiteData } from "@/abroadyield/store/hooks";
import type { Order, ProductKey } from "@/abroadyield/types";

interface CheckoutSearch {
  demo?: string;
  status?: string;
  product?: string;
  countries?: string;
  email?: string;
}

export const Route = createFileRoute("/abroadyield/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — AbroadYield" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => {
    const out: CheckoutSearch = {};
    for (const key of ["demo", "status", "product", "countries", "email"] as const)
      if (typeof search[key] === "string") out[key] = search[key] as string;
    return out;
  },
  component: Checkout,
});

function Checkout() {
  const search = Route.useSearch();
  // The demo checkout only exists when no real backend is configured; RLS also forbids client-created orders.
  const demo = !!search.demo && getBackend().mode === "local";
  return (
    <Container className="max-w-xl py-14">
      {demo ? <DemoCheckout search={search} /> : <StripeReturn search={search} />}
    </Container>
  );
}

/** Stands in for Stripe Checkout when no payment provider is configured (demo mode). */
function DemoCheckout({ search }: { search: CheckoutSearch }) {
  const { settings, countries } = useSiteData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promo, setPromo] = useState("");
  const [busy, setBusy] = useState(false);
  const product: ProductKey = search.product === "pass" ? "pass" : "report";
  const ids = (search.countries ?? "").split(",").filter(Boolean);
  const price =
    product === "pass" ? settings.pricing.explorerPassUsd : settings.pricing.fullReportUsd;
  const names = ids.map((id) => countries.find((c) => c.id === id)?.name ?? id);

  async function pay() {
    setBusy(true);
    const now = new Date();
    const order: Order = {
      id: newId("ord"),
      createdAt: now.toISOString(),
      userId: user?.id ?? "",
      email: (search.email ?? user?.email ?? "").toLowerCase(),
      product,
      amountUsd: price,
      status: "demo",
      countryIds: ids,
      promoCode: promo.trim().toUpperCase(),
      stripeSessionId: "",
      expiresAt:
        product === "pass"
          ? new Date(now.getTime() + settings.pricing.explorerPassDays * 86_400_000).toISOString()
          : "",
    };
    await getBackend().insert("orders", order);
    track("purchase", { product, amount: price, demo: true });
    await navigate({ to: "/abroadyield/report", search: { countries: ids.join(",") } });
  }

  return (
    <Card>
      <Pill tone="warn">Demo checkout — no card is charged</Pill>
      <h1 className="mt-3 text-2xl font-semibold">
        {product === "pass" ? "Explorer Pass" : "Full Report"}
      </h1>
      <p className="mt-1 text-ay-slate">
        {product === "pass"
          ? `Unlimited reports for ${settings.pricing.explorerPassDays} days, starting with ${names.join(", ")}.`
          : names.join(", ")}
      </p>
      <p className="mt-4 font-[family-name:var(--font-ay-head)] text-4xl font-semibold">
        {formatUsd(price)}
      </p>
      <p className="text-sm text-ay-slate">One-time payment · Receipt sent to {search.email}</p>
      <div className="mt-6">
        <Field
          id="promo"
          label="Promo code"
          optional
          hint="In production, promo codes are validated by Stripe at checkout."
        >
          <TextInput
            id="promo"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            autoComplete="off"
          />
        </Field>
      </div>
      <p className="mt-6 rounded-lg bg-ay-mist p-3 text-sm text-ay-slate">
        This site is running without a payment provider. Connect Stripe (see the setup guide) to
        take real payments.
      </p>
      <Button className="mt-6 w-full" onClick={() => void pay()} disabled={busy} aria-busy={busy}>
        <CreditCard aria-hidden className="size-5" />{" "}
        {busy ? "Processing…" : `Complete demo purchase · ${formatUsd(price)}`}
      </Button>
      <Link
        to="/abroadyield/results"
        search={{ checkout: "cancelled" }}
        className={buttonClass("ghost", "mt-3 w-full")}
      >
        Cancel
      </Link>
    </Card>
  );
}

/** Return page after Stripe Checkout. The webhook records the order; we wait for it to appear. */
function StripeReturn({ search }: { search: CheckoutSearch }) {
  const orders = useMyOrders();
  const ids = (search.countries ?? "").split(",").filter(Boolean);
  const paid = (orders.data ?? []).find((o) => orderCovers(o, ids));
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (search.status !== "success" || paid || tries > 15) return;
    const timer = window.setTimeout(() => {
      void orders.refetch();
      setTries((t) => t + 1);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [search.status, paid, tries, orders]);

  useEffect(() => {
    if (paid) track("purchase", { product: paid.product, amount: paid.amountUsd });
  }, [paid]);

  if (search.status !== "success") {
    return (
      <Card>
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-2 text-ay-slate">
          Nothing to show here. Start from your ranking to unlock a report.
        </p>
        <Link to="/abroadyield/results" className={buttonClass("primary", "mt-6")}>
          Go to my ranking
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      {paid ? (
        <div role="status">
          <CheckCircle2 aria-hidden className="size-10 text-ay-good" />
          <h1 className="mt-3 text-2xl font-semibold">Payment received — thank you</h1>
          <p className="mt-2 text-ay-slate">
            A receipt has been emailed to {paid.email}. Your report is ready and saved to your
            account.
          </p>
          <Link
            to="/abroadyield/report"
            search={{ countries: ids.join(",") }}
            className={buttonClass("primary", "mt-6")}
          >
            Open my full report
          </Link>
        </div>
      ) : tries > 15 ? (
        <div role="status">
          <h1 className="text-2xl font-semibold">We're still confirming your payment</h1>
          <p className="mt-2 text-ay-slate">
            This can take a minute. Log in with the email you used at checkout to see your report,
            or contact support if it doesn't appear.
          </p>
          <Link to="/abroadyield/account" className={buttonClass("primary", "mt-6")}>
            Log in
          </Link>
        </div>
      ) : (
        <div role="status" className="flex items-center gap-3">
          <Loader2
            aria-hidden
            className="size-6 animate-spin text-ay-navy motion-reduce:animate-none"
          />
          <p className="text-lg">Confirming your payment…</p>
        </div>
      )}
    </Card>
  );
}
