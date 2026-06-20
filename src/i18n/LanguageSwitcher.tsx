import { useLanguage } from "./LanguageProvider";
import type { Lang } from "./translations";

const activeBtnStyle = {
  background: "linear-gradient(129deg, #F9E076 0%, #D4AF37 100%)",
  color: "#030A14",
} as const;

const inactiveBtnStyle = {
  color: "rgba(248,250,252,0.68)",
} as const;

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  const btnClass = (target: Lang) =>
    `lang-btn flex items-center justify-center rounded-full h-9 px-3 text-xs font-semibold ${
      lang === target ? "lang-btn-active" : ""
    }`;

  return (
    <div
      className={`flex items-center rounded-full h-11 px-1 gap-1 ${className}`}
      dir="ltr"
      role="group"
      aria-label={lang === "ar" ? "اختيار اللغة" : "Language selection"}
      style={{ border: "1px solid rgba(212,175,55,0.22)", background: "rgba(10,25,47,0.50)" }}
    >
      <button
        type="button"
        className={btnClass("en")}
        style={lang === "en" ? activeBtnStyle : inactiveBtnStyle}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <div className="w-px h-3.5" style={{ background: "rgba(212,175,55,0.22)" }} />
      <button
        type="button"
        className={btnClass("ar")}
        style={lang === "ar" ? activeBtnStyle : inactiveBtnStyle}
        onClick={() => setLang("ar")}
        aria-pressed={lang === "ar"}
      >
        عربي
      </button>
    </div>
  );
}
