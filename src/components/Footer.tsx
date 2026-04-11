import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './Footer.module.css'

const EMAIL = 'bassma1company@gmail.com'
const PHONE_DISPLAY = '+20 10 21288238'
const PHONE_TEL = '+201021288238'

export function Footer() {
  const { t, dir } = useLanguage()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <footer className={styles.footer} dir={dir} ref={ref}>
      <div className={styles.inner}>
        <motion.div
          className={styles.brandBlock}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <img
            src="/logo-slogan.png"
            alt="بصمة — للهوية الرقمية، تصميم المواقع، والتسويق الرقمي"
            className={styles.footerLogo}
            width={360}
            height={220}
          />
        </motion.div>
        <div className={styles.meta}>
          <a href={`mailto:${EMAIL}`} className={styles.link}>
            <span className={styles.label}>{t.footer.emailLabel}</span>
            {EMAIL}
          </a>
          <a href={`tel:${PHONE_TEL}`} className={styles.link}>
            <span className={styles.label}>{t.footer.phoneLabel}</span>
            {PHONE_DISPLAY}
          </a>
        </div>
        <p className={styles.copy}>© {new Date().getFullYear()} بصمة Basma. {t.footer.rights}</p>
      </div>
    </footer>
  )
}
