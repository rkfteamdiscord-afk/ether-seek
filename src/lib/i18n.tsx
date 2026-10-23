import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * The site's two languages. English is the default; the big "Français" button in the
 * header switches the whole page (ghost included) to French. The choice lives only in
 * memory for this visit: nothing is stored.
 */
export type Lang = "en" | "fr";

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({ lang: "en", setLang: () => undefined });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
