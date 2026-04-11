import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { STORAGE_KEY, translations, type Lang } from './translations'

type TranslationTree = (typeof translations)['ar'] | (typeof translations)['en']

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: TranslationTree
  dir: 'rtl' | 'ltr'
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'ar'
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === 'ar' || raw === 'en') return raw
  return 'ar'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readStoredLang())

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.body.classList.remove('lang-ar', 'lang-en')
    document.body.classList.add(lang === 'ar' ? 'lang-ar' : 'lang-en')
  }, [lang])

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: translations[lang],
      dir: lang === 'ar' ? 'rtl' : 'ltr',
    }),
    [lang, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
