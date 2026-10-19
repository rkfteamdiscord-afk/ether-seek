import { Link, useRouterState } from "@tanstack/react-router";
import { AlertTriangle, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "../engine/format";
import { getBackend } from "../store";
import { useAuth, useSiteData } from "../store/hooks";
import { Container, buttonClass } from "./ui";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-[family-name:var(--font-ay-head)] text-lg font-semibold text-ay-ink",
        className,
      )}
    >
      <svg aria-hidden viewBox="0 0 32 32" className="size-8">
        <circle cx="16" cy="16" r="15" fill="#0f1f3a" />
        <path
          d="M4.5 18.5c4-1 7-4.5 11.5-4.5s7.5 3 11.5 2"
          stroke="#eadfcb"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M9 22l5-5 4 3 6-8"
          stroke="#ffffff"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="12" r="1.8" fill="#eadfcb" />
      </svg>
      AbroadYield
    </span>
  );
}

const NAV = [
  { to: "/abroadyield", hash: "how-it-works", label: "How it works" },
  { to: "/abroadyield/guides", label: "Country guides" },
  { to: "/abroadyield/methodology", label: "Methodology" },
  { to: "/abroadyield", hash: "pricing", label: "Pricing" },
  { to: "/abroadyield/blog", label: "Blog" },
] as const;

function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [pathname]);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Liquid-glass rule: small floating chrome flips light/dark with the content scrolling under it.
  const [tone, setTone] = useState<"light" | "dark">("light");
  useEffect(() => {
    const update = () => {
      // Sample just under the capsule's vertical centre.
      const header = document.querySelector<HTMLElement>(".ay-header .ay-glass-nav");
      const box = header?.getBoundingClientRect();
      const probe = box ? box.top + box.height / 2 : 44;
      const dark = Array.from(
        document.querySelectorAll<HTMLElement>("[data-nav-tone='dark']"),
      ).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probe && r.bottom >= probe;
      });
      setTone(dark ? "dark" : "light");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);
  return (
    <header
      data-scrolled={scrolled}
      data-tone={tone}
      className="ay-header ay-no-print pointer-events-none sticky top-0 z-40 -mb-[88px] px-3 pt-3 sm:px-4"
    >
      <div className="ay-glass-nav pointer-events-auto mx-auto w-full max-w-6xl rounded-[1.75rem]">
        <div className="flex h-16 items-center justify-between gap-4 pr-2 pl-4 sm:pl-5">
          <Link to="/abroadyield" aria-label="AbroadYield home" className="rounded-full">
            <Logo className="ay-nav-ink" />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                {...("hash" in item ? { hash: item.hash } : {})}
                className="ay-nav-link rounded-full px-3.5 py-2 text-[0.96rem] font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <Link
              to="/abroadyield/account"
              className="ay-nav-link hidden min-h-11 items-center gap-2 rounded-full px-3.5 font-medium sm:inline-flex"
            >
              <UserRound aria-hidden className="size-5" />
              {user ? "My account" : "Log in"}
            </Link>
            <Link
              to="/abroadyield/start"
              className={buttonClass(
                tone === "dark" ? "sand" : "primary",
                "hidden min-h-11 sm:inline-flex",
              )}
            >
              Get my free ranking
            </Link>
            <button
              type="button"
              className="ay-nav-link inline-flex size-11 items-center justify-center rounded-full lg:hidden"
              aria-expanded={open}
              aria-controls="ay-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X aria-hidden className="size-6" />
              ) : (
                <Menu aria-hidden className="size-6" />
              )}
            </button>
          </div>
        </div>
        {open ? (
          <nav id="ay-mobile-nav" aria-label="Mobile" className="ay-nav-panel px-3 pb-4 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                {...("hash" in item ? { hash: item.hash } : {})}
                className="ay-nav-link block rounded-2xl px-3 py-3 text-lg font-medium"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/abroadyield/account"
              className="ay-nav-link block rounded-2xl px-3 py-3 text-lg font-medium"
            >
              {user ? "My account" : "Log in / Sign up"}
            </Link>
            <Link to="/abroadyield/start" className={buttonClass("sand", "mt-2 w-full")}>
              Get my free ranking
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

function Footer() {
  const { settings } = useSiteData();
  const legal = [
    ["terms", "Terms of Service"],
    ["privacy", "Privacy Policy"],
    ["cookies", "Cookie Policy"],
    ["refunds", "Refund Policy"],
    ["partner-disclosure", "Partner Disclosure"],
  ] as const;
  return (
    <footer className="ay-footer ay-no-print mt-24">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-ay-slate">
            See what you'll actually earn abroad — after every tax, fee and currency risk. Built for
            US taxpayers.
          </p>
          <p className="mt-4 text-sm text-ay-slate">
            Site data last updated {formatDate(settings.siteLastUpdated)}.
          </p>
        </div>
        <nav aria-label="Product">
          <h2 className="font-semibold text-ay-ink">Product</h2>
          <ul className="mt-3 space-y-2 text-ay-slate">
            <li>
              <Link to="/abroadyield/start" className="hover:text-ay-ink hover:underline">
                Free country ranking
              </Link>
            </li>
            <li>
              <Link to="/abroadyield/guides" className="hover:text-ay-ink hover:underline">
                Country guides
              </Link>
            </li>
            <li>
              <Link to="/abroadyield/methodology" className="hover:text-ay-ink hover:underline">
                Methodology & data sources
              </Link>
            </li>
            <li>
              <Link to="/abroadyield/experts" className="hover:text-ay-ink hover:underline">
                Talk to an expert
              </Link>
            </li>
            <li>
              <Link to="/abroadyield/blog" className="hover:text-ay-ink hover:underline">
                Blog
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <h2 className="font-semibold text-ay-ink">Legal</h2>
          <ul className="mt-3 space-y-2 text-ay-slate">
            {legal.map(([page, label]) => (
              <li key={page}>
                <Link
                  to="/abroadyield/legal/$page"
                  params={{ page }}
                  className="hover:text-ay-ink hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="border-t border-ay-sand-2 py-6 text-sm text-ay-slate">
        <p>
          AbroadYield provides educational estimates only. It is not tax, legal, financial or
          investment advice. We never sell your data.
        </p>
      </Container>
    </footer>
  );
}

function GlobalNotices() {
  const { countries, cities } = useSiteData();
  const [demo, setDemo] = useState(false);
  useEffect(() => setDemo(getBackend().mode === "local"), []);
  const published = new Set(countries.filter((c) => c.published).map((c) => c.id));
  const hasSample =
    countries.some((c) => c.published && c.dataStatus === "sample") ||
    cities.some((c) => published.has(c.countryId) && c.dataStatus === "sample");
  if (!hasSample && !demo) return null;
  return (
    <div className="ay-no-print border-b border-ay-warn/20 bg-ay-warn-bg text-ay-warn">
      <Container className="flex items-start gap-2 py-2 text-sm">
        <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
        <p>
          {hasSample ? (
            <>
              <strong>Sample data – to be verified.</strong> Figures marked as sample are indicative
              and have not yet been verified.{" "}
            </>
          ) : null}
          {demo ? (
            <>
              Demo mode: accounts, purchases and edits are stored only in this browser and no card
              is ever charged.
            </>
          ) : null}
        </p>
      </Container>
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ay-root flex min-h-screen flex-col" lang="en">
      <a
        href="#ay-main"
        className="sr-only z-50 rounded-md bg-ay-navy px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <GlobalNotices />
      <Header />
      <main id="ay-main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
