import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './LoadingScreen.module.css'

export function LoadingScreen() {
  const { t } = useLanguage()

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={styles.pulse}
        animate={{ scale: [1, 1.05, 1], opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src="/loading-logo.png" alt="" width={140} height={140} className={styles.logo} />
      </motion.div>
      <p className={styles.text}>{t.loading}</p>
    </motion.div>
  )
}
