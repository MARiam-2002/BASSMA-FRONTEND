import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './About.module.css'

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function About() {
  const { t, dir } = useLanguage()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const stats = [
    { value: '2+', label: t.about.statYears },
    { value: 'EG · KSA', label: t.about.statClients },
    { value: '40+', label: t.about.statProjects },
  ]

  return (
    <section id="about" className={styles.section} dir={dir} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <h2 className={styles.title}>{t.about.title}</h2>
          <p className={styles.subtitle}>{t.about.subtitle}</p>
        </motion.div>
        <div className={styles.grid}>
          <motion.div
            className={styles.copy}
            initial={{ opacity: 0, x: dir === 'rtl' ? 24 : -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p>{t.about.p1}</p>
            <p>{t.about.p2}</p>
          </motion.div>
          <div className={styles.cards}>
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className={styles.card}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'show' : 'hidden'}
              >
                <span className={styles.cardValue}>{s.value}</span>
                <span className={styles.cardLabel}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
