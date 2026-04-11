import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { LoadingScreen } from './components/LoadingScreen'
import { Navbar } from './components/Navbar'
import { Portfolio } from './components/Portfolio'
import { Services } from './components/Services'
import { WhatsAppFloat } from './components/WhatsAppFloat'
import { useLanguage } from './i18n/LanguageContext'

export default function App() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ms = reduced ? 450 : 2000
    const id = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(id)
  }, [])

  const onSkipNav = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById('main-content')
    if (!main) return
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    main.focus()
    main.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    if (window.location.hash !== '#main-content') {
      window.history.pushState(null, '', '#main-content')
    }
  }, [])

  return (
    <>
      <a href="#main-content" className="skip-link" onClick={onSkipNav}>
        {t.skipLink}
      </a>
      <AnimatePresence>{loading && <LoadingScreen key="load" />}</AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.45 }}
      >
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <About />
          <Services />
          <Portfolio />
          <Contact />
        </main>
        <Footer />
        <WhatsAppFloat />
      </motion.div>
    </>
  )
}
