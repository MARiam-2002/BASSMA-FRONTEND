import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './Hero.module.css'

const WHATSAPP = 'https://wa.me/201021288238'

export function Hero() {
  const { t, dir } = useLanguage()

  return (
    <section id="home" className={styles.section} dir={dir}>
      <div className={styles.glow} aria-hidden />
      <motion.div
        className={styles.logoWrap}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src="/logo-slogan.png"
          alt={t.hero.logoAlt}
          className={styles.heroLogo}
          width={420}
          height={320}
        />
      </motion.div>
      <motion.h1
        className={styles.headline}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.65 }}
      >
        {t.hero.headline}
      </motion.h1>
      <motion.div
        className={styles.ctas}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.55 }}
      >
        <a href="#contact" className={styles.btnPrimary}>
          {t.hero.ctaContact}
        </a>
        <a href="#portfolio" className={styles.btnGhost}>
          {t.hero.ctaWork}
        </a>
        <a href={WHATSAPP} target="_blank" rel="noreferrer" className={styles.btnWa}>
          {t.hero.ctaWhatsapp}
        </a>
      </motion.div>
    </section>
  )
}
