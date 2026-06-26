import { createContext, useContext, useEffect, type ReactNode } from "react";
import { ui, type Lang } from "./translations";

type LanguageContextValue = {
  lang: Lang;
  t: (typeof ui)["ar"];
  dir: "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = "ar" as const;
  const dir = "rtl" as const;
  const t = ui.ar;

  useEffect(() => {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    document.body.className = "lang-ar";
    document.title = "بصمة | وكالة رقمية متخصصة";
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
