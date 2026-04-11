import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './Services.module.css'

type ServiceDef = {
  id: string
  icon: string
  titleKey: 'branding' | 'websites' | 'apps' | 'social'
  descKey: 'brandingDesc' | 'websitesDesc' | 'appsDesc' | 'socialDesc'
}

const items: ServiceDef[] = [
  { id: '1', icon: '◆', titleKey: 'branding', descKey: 'brandingDesc' },
  { id: '2', icon: '◇', titleKey: 'websites', descKey: 'websitesDesc' },
  { id: '3', icon: '○', titleKey: 'apps', descKey: 'appsDesc' },
  { id: '4', icon: '◎', titleKey: 'social', descKey: 'socialDesc' },
]

export function Services() {
  const { t, dir } = useLanguage()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="services" className={styles.section} dir={dir} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.title}>{t.services.title}</h2>
          <p className={styles.subtitle}>{t.services.subtitle}</p>
        </motion.div>
        <ul className={styles.grid}>
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
            >
              <span className={styles.icon} aria-hidden>
                {item.icon}
              </span>
              <h3 className={styles.cardTitle}>{t.services[item.titleKey]}</h3>
              <p className={styles.cardDesc}>{t.services[item.descKey]}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
