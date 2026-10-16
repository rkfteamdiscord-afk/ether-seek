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
        <circle cx="16" cy="16" r="15" fill="#12284b" />
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
  return (
    <header
      data-scrolled={scrolled}
      className="ay-header ay-no-print sticky top-0 transition-shadow duration-300 z-40 border-b border-ay-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/abroadyield" aria-label="AbroadYield home" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              {...("hash" in item ? { hash: item.hash } : {})}
              className="rounded-md px-3 py-2 text-[0.98rem] font-medium text-ay-slate transition-colors hover:bg-ay-mist hover:text-ay-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/abroadyield/account"
            className="hidden min-h-11 items-center gap-2 rounded-lg px-3 font-medium text-ay-navy hover:bg-ay-sky sm:inline-flex"
          >
            <UserRound aria-hidden className="size-5" />
            {user ? "My account" : "Log in"}
          </Link>
          <Link to="/abroadyield/start" className={buttonClass("primary", "hidden sm:inline-flex")}>
            Get my free ranking
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg text-ay-ink hover:bg-ay-mist lg:hidden"
            aria-expanded={open}
            aria-controls="ay-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
          </button>
        </div>
      </Container>
      {open ? (
        <nav
          id="ay-mobile-nav"
          aria-label="Mobile"
          className="border-t border-ay-line bg-white lg:hidden"
        >
          <Container className="flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                {...("hash" in item ? { hash: item.hash } : {})}
                className="rounded-md px-2 py-3 text-lg font-medium text-ay-ink hover:bg-ay-mist"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/abroadyield/account"
              className="rounded-md px-2 py-3 text-lg font-medium text-ay-ink hover:bg-ay-mist"
            >
              {user ? "My account" : "Log in / Sign up"}
            </Link>
            <Link to="/abroadyield/start" className={buttonClass("primary", "mt-2")}>
              Get my free ranking
            </Link>
          </Container>
        </nav>
      ) : null}
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
    <footer className="ay-no-print mt-24 border-t border-ay-line bg-ay-sand/60">
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
  const { countries } = useSiteData();
  const [demo, setDemo] = useState(false);
  useEffect(() => setDemo(getBackend().mode === "local"), []);
  const hasSample = countries.some((c) => c.published && c.dataStatus === "sample");
  if (!hasSample && !demo) return null;
  return (
    <div className="ay-no-print border-b border-ay-warn/20 bg-ay-warn-bg text-ay-warn">
      <Container className="flex items-start gap-2 py-2 text-sm">
        <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
        <p>
          {hasSample ? (
            <>
              <strong>Sample data – to be verified.</strong> Country figures are indicative and have
              not yet been verified.{" "}
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
