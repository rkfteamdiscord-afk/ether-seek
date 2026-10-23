import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { siteCopy } from "@/lib/site-copy";

/** French flag drawn inline so it shows on every system (emoji flags do not on Windows). */
const FrenchFlag = () => (
  <svg viewBox="0 0 3 2" className="h-4 w-6 shrink-0 rounded-[3px] shadow-sm" aria-hidden="true"><path fill="#002654" d="M0 0h1v2H0z" /><path fill="#fff" d="M1 0h1v2H1z" /><path fill="#ce1126" d="M2 0h1v2H2z" /></svg>
);
const BritishFlag = () => (
  <svg viewBox="0 0 60 30" className="h-4 w-6 shrink-0 rounded-[3px] shadow-sm" aria-hidden="true"><path fill="#012169" d="M0 0h60v30H0z" /><path stroke="#fff" strokeWidth="6" d="m0 0 60 30m0-30L0 30" /><path stroke="#c8102e" strokeWidth="2" d="m0 0 60 30m0-30L0 30" /><path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" /><path stroke="#c8102e" strokeWidth="6" d="M30 0v30M0 15h60" /></svg>
);

/**
 * The glass bar that follows you down every page: logo, section links, the big language
 * switch, the order button and a menu to move between pages (and sections on the home page).
 * `orderDecor` lets the home page hang its small Halloween decorations on the order button.
 */
export function SiteHeader({ page, orderDecor }: { page: "home" | "hosting"; orderDecor?: ReactNode }) {
  const { lang, setLang } = useLang();
  const t = siteCopy[lang];
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const home = page === "home";
  // From another page, section links lead back to the home page.
  const section = (id: string) => (home ? `#${id}` : `/#${id}`);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onClick);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onClick); };
  }, [open]);

  const sections: Array<[string, string]> = [["services", t.nav.services], ["apropos", t.nav.about], ["methode", t.nav.method], ["video", t.menu.video], ["contact", t.menu.contact]];

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="liquid-bar relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 rounded-full pl-6 pr-2.5">
        {home ? (
          <a href="#accueil" data-header-logo className="font-brand text-2xl font-extrabold text-foreground" aria-label={t.homeLabel}>
            Ȥrk<span className="text-seasonal">.</span>
          </a>
        ) : (
          <Link to="/" className="font-brand text-2xl font-extrabold text-foreground" aria-label={t.homeLabel}>
            Ȥrk<span className="text-seasonal">.</span>
          </Link>
        )}
        <nav className="liquid-nav hidden items-center gap-1 rounded-full p-1 text-sm font-medium md:flex" aria-label={t.navLabel}>
          <a className="nav-pill" href={section("services")}>{t.nav.services}</a>
          <a className="nav-pill" href={section("apropos")}>{t.nav.about}</a>
          <Link className="nav-pill" to="/hosting" activeProps={{ "aria-current": "page", className: "nav-pill-active" }}>{t.menu.hosting}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" data-guide="langue" lang={lang === "en" ? "fr" : "en"} aria-label={t.langButtonLabel} onClick={() => setLang(lang === "en" ? "fr" : "en")} className="lang-switch glass inline-flex h-11 items-center gap-2.5 rounded-full px-4 font-display text-base font-bold text-foreground sm:px-5">
            {lang === "en" ? <FrenchFlag /> : <BritishFlag />} {t.langButton}
          </button>
          <Button asChild className="halloween-button ember-button hidden h-11 rounded-full bg-seasonal px-5 font-semibold text-seasonal-foreground hover:bg-seasonal/90 lg:inline-flex">
            <a href={section("contact")}>{orderDecor} {t.order} <ArrowRight className="h-4 w-4" /></a>
          </Button>
          <button ref={button} type="button" className="menu-button glass inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground" aria-label={open ? t.menu.close : t.menu.openLabel} aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((value) => !value)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <div ref={panel} id="site-menu" className="site-menu" hidden={!open}>
          <p className="site-menu-title">{t.menu.pages}</p>
          <Link to="/" className="site-menu-link" activeOptions={{ exact: true, includeHash: false }} activeProps={{ "aria-current": "page" }} onClick={() => setOpen(false)}>{t.menu.home}</Link>
          <Link to="/hosting" className="site-menu-link" activeProps={{ "aria-current": "page" }} onClick={() => setOpen(false)}>
            {t.menu.hosting} <span className="site-menu-soon">{t.menu.soon}</span>
          </Link>
          {home && (
            <>
              <p className="site-menu-title">{t.menu.sections}</p>
              {sections.map(([id, label]) => <a key={id} href={`#${id}`} className="site-menu-link" onClick={() => setOpen(false)}>{label}</a>)}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
