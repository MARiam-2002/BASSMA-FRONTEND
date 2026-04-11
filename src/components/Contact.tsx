import { motion, useInView } from 'framer-motion'
import { FormEvent, useRef, useState } from 'react'
import { fetchJson, type ContactPayload } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './Contact.module.css'

export function Contact() {
  const { t, dir, lang } = useLanguage()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [hint, setHint] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('idle')
    setHint(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload: ContactPayload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
      lang,
    }
    if (!payload.name || !payload.email || !payload.message) {
      setHint(t.contact.fillRequired)
      return
    }
    setStatus('sending')
    try {
      await fetchJson<{ ok: boolean }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setStatus('ok')
      form.reset()
    } catch {
      setStatus('err')
    }
  }

  return (
    <section id="contact" className={styles.section} dir={dir} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.title}>{t.contact.title}</h2>
          <p className={styles.subtitle}>{t.contact.subtitle}</p>
        </motion.div>
        <motion.form
          className={styles.form}
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.55 }}
        >
          <label className={styles.field}>
            <span>{t.contact.name}</span>
            <input name="name" type="text" required autoComplete="name" />
          </label>
          <label className={styles.field}>
            <span>{t.contact.email}</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className={styles.field}>
            <span>{t.contact.phone}</span>
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label className={styles.field}>
            <span>{t.contact.message}</span>
            <textarea name="message" rows={4} required />
          </label>
          <button type="submit" className={styles.submit} disabled={status === 'sending'}>
            {status === 'sending' ? t.contact.sending : t.contact.send}
          </button>
          {hint && (
            <p className={styles.feedbackHint} role="alert">
              {hint}
            </p>
          )}
          {status === 'ok' && (
            <p className={styles.feedbackOk} role="status" aria-live="polite">
              {t.contact.success}
            </p>
          )}
          {status === 'err' && (
            <p className={styles.feedbackErr} role="status" aria-live="polite">
              {t.contact.error}
            </p>
          )}
        </motion.form>
      </div>
    </section>
  )
}
