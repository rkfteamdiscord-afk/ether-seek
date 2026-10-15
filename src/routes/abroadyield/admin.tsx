import { Link, createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CountriesAdmin } from "@/abroadyield/components/admin/CountriesAdmin";
import { ScoringAdmin, SettingsAdmin, TaxAdmin } from "@/abroadyield/components/admin/ConfigAdmin";
import {
  AnalyticsAdmin,
  AuditAdmin,
  BlogAdmin,
  OrdersAdmin,
  PartnersAdmin,
} from "@/abroadyield/components/admin/OpsAdmin";
import { Button, Container, buttonClass } from "@/abroadyield/components/ui";
import { LocalBackend, getBackend } from "@/abroadyield/store";
import { useAuth, useSiteData } from "@/abroadyield/store/hooks";

const TABS = [
  ["countries", "Countries & cities"],
  ["tax", "Tax parameters"],
  ["scoring", "Scoring weights"],
  ["settings", "Pricing & settings"],
  ["partners", "Partners & leads"],
  ["orders", "Orders & revenue"],
  ["analytics", "Analytics"],
  ["blog", "Blog"],
  ["audit", "Audit log"],
] as const;
type Tab = (typeof TABS)[number][0];

export const Route = createFileRoute("/abroadyield/admin")({
  head: () => ({
    meta: [{ title: "Admin — AbroadYield" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } =>
    TABS.some(([key]) => key === search["tab"]) ? { tab: search["tab"] as Tab } : {},
  component: AdminPage,
});

function AdminPage() {
  const { user, ready, refresh } = useAuth();
  const { tab = "countries" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { countries, settings } = useSiteData();
  const [local, setLocal] = useState(false);
  useEffect(() => setLocal(getBackend().mode === "local"), []);

  if (!ready) return <Container className="py-20 text-ay-slate">Loading…</Container>;

  if (user?.role !== "admin") {
    return (
      <Container className="max-w-xl py-20">
        <ShieldAlert aria-hidden className="size-10 text-ay-gold" />
        <h1 className="mt-3 text-3xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-ay-slate">
          Log in with an account that has the admin role. Roles are granted in the database by an
          existing administrator.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/abroadyield/account" className={buttonClass("primary")}>
            Log in
          </Link>
          {local ? (
            <Button
              variant="secondary"
              onClick={async () => {
                const backend = getBackend();
                if (backend instanceof LocalBackend) await backend.becomeDemoAdmin();
                await refresh();
              }}
            >
              Open the demo admin
            </Button>
          ) : null}
        </div>
        {local ? (
          <p className="mt-4 text-sm text-ay-slate">
            Demo mode: the admin panel edits only the copy of the data stored in this browser.
          </p>
        ) : null}
      </Container>
    );
  }

  const sampleCount = countries.filter((c) => c.dataStatus === "sample").length;

  return (
    <div className="bg-ay-mist">
      <Container className="max-w-7xl py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold">Admin</h1>
          <div className="flex flex-wrap gap-2 text-sm">
            {settings.validationMode ? (
              <span className="rounded-full bg-ay-warn-bg px-3 py-1 font-semibold text-ay-warn">
                Validation mode ON
              </span>
            ) : null}
            {sampleCount ? (
              <span className="rounded-full bg-ay-warn-bg px-3 py-1 font-semibold text-ay-warn">
                {sampleCount} countries with SAMPLE DATA – TO BE VERIFIED
              </span>
            ) : null}
            {local ? (
              <span className="rounded-full bg-ay-sky px-3 py-1">
                Demo backend (this browser only)
              </span>
            ) : null}
          </div>
        </div>
        <nav
          aria-label="Admin sections"
          className="mt-6 flex gap-1 overflow-x-auto border-b border-ay-line"
        >
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-current={tab === key ? "page" : undefined}
              onClick={() => void navigate({ search: { tab: key } })}
              className={cn(
                "min-h-11 whitespace-nowrap rounded-t-lg px-4 font-medium",
                tab === key
                  ? "border-b-2 border-ay-navy bg-white text-ay-ink"
                  : "text-ay-slate hover:text-ay-ink",
              )}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-6">
          {tab === "countries" ? <CountriesAdmin /> : null}
          {tab === "tax" ? <TaxAdmin /> : null}
          {tab === "scoring" ? <ScoringAdmin /> : null}
          {tab === "settings" ? <SettingsAdmin /> : null}
          {tab === "partners" ? <PartnersAdmin /> : null}
          {tab === "orders" ? <OrdersAdmin /> : null}
          {tab === "analytics" ? <AnalyticsAdmin /> : null}
          {tab === "blog" ? <BlogAdmin /> : null}
          {tab === "audit" ? <AuditAdmin /> : null}
        </div>
      </Container>
    </div>
  );
}
