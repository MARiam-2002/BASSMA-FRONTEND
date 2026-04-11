import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './Navbar.module.css'

/** After mobile menu closes (Framer ~300ms), scroll so the tap isn’t lost on iOS / Chrome mobile. */
const MOBILE_NAV_SCROLL_DELAY_MS = 320

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
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setOpen(false)
  }, [])

  const scrollToSection = useCallback((href: string) => {
    const id = href.replace(/^#/, '')
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const next = href.startsWith('#') ? href : `#${id}`
    if (window.location.hash !== next) {
      window.history.pushState(null, '', next)
    }
  }, [])

  const handleMobileNavClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault()
      closeMenu()
      window.setTimeout(() => {
        scrollToSection(href)
        menuBtnRef.current?.focus()
      }, MOBILE_NAV_SCROLL_DELAY_MS)
    },
    [closeMenu, scrollToSection],
  )

  const handleBrandClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      if (open) {
        closeMenu()
        window.setTimeout(() => {
          scrollToSection('#home')
          menuBtnRef.current?.focus()
        }, MOBILE_NAV_SCROLL_DELAY_MS)
      } else {
        scrollToSection('#home')
      }
    },
    [open, closeMenu, scrollToSection],
  )

  useEffect(() => {
    if (!open) return
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, closeMenu])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const onChange = () => {
      if (mq.matches) setOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <motion.header
      className={styles.header}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.inner} dir={dir}>
        <a href="#home" className={styles.brand} onClick={handleBrandClick}>
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
            ref={menuBtnRef}
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
                <a
                  key={l.key}
                  href={l.href}
                  className={styles.mobileLink}
                  onClick={(e) => handleMobileNavClick(e, l.href)}
                >
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
