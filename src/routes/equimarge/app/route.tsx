import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calculator,
  Coins,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

import { HorseSilhouette, Logo } from "@/components/equimarge/Illustrations";
import { Onboarding } from "@/components/equimarge/Onboarding";
import { useWorkspace, WorkspaceProvider } from "@/components/equimarge/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { offer } from "@/lib/equimarge/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equimarge/app")({
  // Everything below depends on the signed-in account kept in the browser.
  ssr: false,
  head: () => ({ meta: [{ title: "Mon centre — EquiMarge" }] }),
  component: AppLayout,
  pendingComponent: FullPageLoader,
});

function HorseNavIcon({ className }: { className?: string | undefined }) {
  return <HorseSilhouette className={className} />;
}

const nav = [
  {
    to: "/equimarge/app",
    label: "Tableau de bord",
    short: "Accueil",
    icon: LayoutDashboard,
    exact: true,
  },
  { to: "/equimarge/app/chevaux", label: "Chevaux", short: "Chevaux", icon: HorseNavIcon },
  { to: "/equimarge/app/depenses", label: "Dépenses", short: "Dépenses", icon: Receipt },
  { to: "/equimarge/app/revenus", label: "Revenus", short: "Revenus", icon: Coins },
  { to: "/equimarge/app/simulateur", label: "Simulateur", short: "Simulateur", icon: Calculator },
  { to: "/equimarge/app/rapport", label: "Rapport mensuel", short: "Rapport", icon: FileText },
  { to: "/equimarge/app/parametres", label: "Paramètres", short: "Paramètres", icon: Settings },
] as const;

function FullPageLoader() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center gap-3 text-muted-foreground"
      role="status"
    >
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      Chargement de votre centre…
    </div>
  );
}

function AppLayout() {
  return (
    <WorkspaceProvider>
      <Gate />
    </WorkspaceProvider>
  );
}

function Gate() {
  const { status } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "signed-out")
      void navigate({ to: "/equimarge/connexion", search: { mode: "connexion" } });
  }, [status, navigate]);

  if (status === "loading" || status === "signed-out") return <FullPageLoader />;
  if (status === "onboarding") return <Onboarding />;
  return <Shell />;
}

function Shell() {
  const { workspace, signOut, account, clearData, mode } = useWorkspace();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => setMoreOpen(false), [pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to || pathname === `${to}/` : pathname.startsWith(to);

  const structure = workspace!.structure;
  const trialDaysLeft = Math.max(
    0,
    Math.ceil((new Date(structure.trialEndsAt).getTime() - Date.now()) / (24 * 3600 * 1000)),
  );

  async function logout() {
    await signOut();
    await navigate({ to: "/equimarge" });
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-card/70 px-4 py-5 lg:flex">
        <Link to="/equimarge/app" aria-label="Tableau de bord">
          <Logo />
        </Link>
        <p
          className="mt-4 truncate rounded-xl bg-secondary px-3 py-2 text-sm font-semibold"
          title={structure.name}
        >
          {structure.name}
        </p>
        <nav className="mt-4 flex flex-1 flex-col gap-1" aria-label="Menu de l'application">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium transition-colors",
                isActive(item.to, "exact" in item && item.exact)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border pt-3 text-sm text-muted-foreground">
          <p className="truncate px-1">{account?.email}</p>
          <Button
            variant="ghost"
            className="mt-1 h-11 w-full justify-start gap-3"
            onClick={() => void logout()}
          >
            <LogOut className="h-5 w-5" /> Se déconnecter
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Link to="/equimarge/app" aria-label="Tableau de bord">
            <Logo compact />
          </Link>
          <p className="min-w-0 flex-1 truncate font-serif-em text-lg font-semibold">
            {structure.name}
          </p>
        </header>

        {structure.isDemo && (
          <div className="border-b border-[var(--em-warn)]/30 bg-[var(--em-warn-soft)]">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex gap-2 text-[0.95rem] text-[oklch(0.38_0.08_60)]">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                Vous découvrez un centre fictif de 15 chevaux. Explorez librement, puis effacez-le
                pour saisir vos propres chiffres.
              </p>
              <Button
                variant="outline"
                className="h-11 shrink-0 rounded-full border-[var(--em-warn)]/50 bg-card"
                onClick={() => void clearData()}
              >
                Effacer l'exemple et commencer
              </Button>
            </div>
          </div>
        )}
        {structure.plan === "essai" && !structure.isDemo && (
          <div className="border-b border-border bg-accent/60">
            <p className="mx-auto max-w-6xl px-4 py-2 text-sm text-accent-foreground">
              Essai gratuit : encore {trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""} sur{" "}
              {offer.trialDays}.{" "}
              <Link
                to="/equimarge/app/parametres"
                hash="abonnement"
                className="font-semibold underline underline-offset-4"
              >
                Choisir mon offre
              </Link>
            </p>
          </div>
        )}
        {mode === "local" && (
          <p className="mx-auto max-w-6xl px-4 pt-3 text-xs text-muted-foreground">
            Mode démonstration : vos données sont enregistrées dans ce navigateur uniquement.
          </p>
        )}

        <main className="em-safe-bottom mx-auto max-w-6xl px-4 pt-6 sm:pt-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Menu de l'application"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-5">
          {nav.slice(0, 4).map((item) => {
            const active = isActive(item.to, "exact" in item && item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-6 w-6" />
                {item.short}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            aria-controls="em-more"
            className={cn(
              "flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold",
              moreOpen || nav.slice(4).some((i) => isActive(i.to))
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            {moreOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            Plus
          </button>
        </div>
      </nav>
      {moreOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-20 bg-black/25 lg:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div
            id="em-more"
            className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 rounded-2xl border border-border bg-card p-2 shadow-xl lg:hidden"
          >
            {nav.slice(4).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-12 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-secondary"
              >
                <item.icon className="h-5 w-5 text-primary" />
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void logout()}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 font-semibold text-muted-foreground hover:bg-secondary"
            >
              <LogOut className="h-5 w-5" /> Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  );
}
