import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './Navbar.module.css'

const links = [
  { key: 'home' as const, href: '#home' },
  { key: 'about' as const, href: '#about' },
  { key: 'services' as const, href: '#services' },
  { key: 'portfolio' as const, href: '#portfolio' },
  { key: 'contact' as const, href: '#contact' },
]

export function Navbar() {
  const { t, lang, setLang, dir } = useLanguage()
  const [open, setOpen] = useState(false)

  function closeMenu() {
    setOpen(false)
  }

  return (
    <motion.header
      className={styles.header}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.inner} dir={dir}>
        <a href="#home" className={styles.brand} onClick={closeMenu}>
          <img src="/logo-only.png" alt="بصمة Basma" className={styles.brandImg} width={48} height={48} />
          <span className={styles.brandText}>بصمة</span>
        </a>
        <nav className={styles.nav} aria-label="Primary">
          {links.map((l) => (
            <a key={l.key} href={l.href} className={styles.navLink}>
              {t.nav[l.key]}
            </a>
          ))}
        </nav>
        <div className={styles.actions}>
          <div className={styles.lang} role="group" aria-label="Language">
            <button
              type="button"
              className={lang === 'en' ? styles.langActive : ''}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <span className={styles.langSep} aria-hidden />
            <button
              type="button"
              className={lang === 'ar' ? styles.langActive : ''}
              onClick={() => setLang('ar')}
            >
              عربي
            </button>
          </div>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.srOnly}>{open ? 'Close menu' : 'Open menu'}</span>
            <span className={open ? styles.burgerOpen : styles.burger} aria-hidden />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            className={styles.mobileNav}
            dir={dir}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.mobileInner}>
              {links.map((l) => (
                <a key={l.key} href={l.href} className={styles.mobileLink} onClick={closeMenu}>
                  {t.nav[l.key]}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
