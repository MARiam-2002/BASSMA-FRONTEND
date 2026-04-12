import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchJson, type Project, type ProjectCategory } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './Portfolio.module.css'

type PortfolioFilterKey = 'filterAll' | 'filterWebsites' | 'filterApps' | 'filterSocial'

const FILTERS: { id: ProjectCategory | 'all'; labelKey: PortfolioFilterKey }[] = [
  { id: 'all', labelKey: 'filterAll' },
  { id: 'websites', labelKey: 'filterWebsites' },
  { id: 'apps', labelKey: 'filterApps' },
  { id: 'social', labelKey: 'filterSocial' },
]

const fallbackProjects: Project[] = [
  {
    id: 'p1',
    category: 'websites',
    title: { ar: 'هوية فاخرة لمتجر إلكتروني', en: 'Luxury e‑commerce identity' },
    description: {
      ar: 'نظام ألوان، شعار، وتطبيقات للهوية على الموقع والتغليف.',
      en: 'Color system, logomark, and brand applications across web and packaging.',
    },
    tags: ['Logo', 'Guidelines'],
  },
  {
    id: 'p2',
    category: 'websites',
    title: { ar: 'موقع شركة تقنية', en: 'Tech company website' },
    description: {
      ar: 'هيكل محتوى واضح، أداء عالٍ، وتجربة مستخدم عصرية.',
      en: 'Clear content architecture, high performance, and a modern UX.',
    },
    tags: ['Next.js', 'CMS'],
  },
  {
    id: 'p3',
    category: 'apps',
    title: { ar: 'تطبيق خدمات', en: 'Services mobile app' },
    description: {
      ar: 'تدفقات حجز، إشعارات، ولوحة تحكم للعملاء.',
      en: 'Booking flows, notifications, and a client dashboard.',
    },
    tags: ['React Native'],
  },
  {
    id: 'p4',
    category: 'social',
    title: { ar: 'حملة إطلاق منتج', en: 'Product launch campaign' },
    description: {
      ar: 'محتوى مرئي ونسخ إعلانية متسقة عبر المنصات.',
      en: 'Visual content and ad copy aligned across platforms.',
    },
    tags: ['Meta', 'Content'],
  },
]

function projectHeroImage(p: Project): string | undefined {
  return p.image ?? p.gallery?.[0]
}

function projectGalleryExtras(p: Project): string[] {
  const g = p.gallery ?? []
  if (p.image) return g
  return g.slice(1)
}

function projectHasExternalLinks(p: Project) {
  return !!(p.websiteUrl || p.appUrl || p.socialUrl)
}

function ProjectExternalLinks({
  p,
  linkWebsite,
  linkApp,
  linkSocial,
  externalAria,
  className,
}: {
  p: Project
  linkWebsite: string
  linkApp: string
  linkSocial: string
  externalAria: string
  className?: string
}) {
  if (!projectHasExternalLinks(p)) return null
  return (
    <div className={className ?? styles.cardLinks}>
      {p.websiteUrl ? (
        <a
          href={p.websiteUrl}
          className={styles.linkChip}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${linkWebsite} — ${externalAria}`}
        >
          {linkWebsite}
        </a>
      ) : null}
      {p.appUrl ? (
        <a
          href={p.appUrl}
          className={styles.linkChip}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${linkApp} — ${externalAria}`}
        >
          {linkApp}
        </a>
      ) : null}
      {p.socialUrl ? (
        <a
          href={p.socialUrl}
          className={styles.linkChip}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${linkSocial} — ${externalAria}`}
        >
          {linkSocial}
        </a>
      ) : null}
    </div>
  )
}

export function Portfolio() {
  const { t, dir, lang } = useLanguage()
  const [filter, setFilter] = useState<ProjectCategory | 'all'>('all')
  const [projects, setProjects] = useState<Project[]>(fallbackProjects)
  const [active, setActive] = useState<Project | null>(null)
  const ref = useRef(null)
  const modalCloseRef = useRef<HTMLButtonElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const load = useCallback(async () => {
    try {
      const data = await fetchJson<{ projects: Project[] }>('/api/projects')
      if (Array.isArray(data.projects) && data.projects.length > 0) setProjects(data.projects)
    } catch {
      /* keep fallback */
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!active) return
    const focusTimer = window.setTimeout(() => modalCloseRef.current?.focus(), 80)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [active])

  const filtered = useMemo(() => {
    if (filter === 'all') return projects
    return projects.filter((p) => p.category === filter)
  }, [projects, filter])

  return (
    <section id="portfolio" className={styles.section} dir={dir} ref={ref}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.title}>{t.portfolio.title}</h2>
          <p className={styles.subtitle}>{t.portfolio.subtitle}</p>
        </motion.div>
        <motion.div
          className={styles.filters}
          role="tablist"
          aria-label={t.portfolio.filtersAria}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={filter === f.id ? styles.filterActive : styles.filter}
              onClick={() => setFilter(f.id)}
            >
              {t.portfolio[f.labelKey]}
            </button>
          ))}
        </motion.div>
        {filtered.length === 0 ? (
          <p className={styles.empty}>{t.portfolio.empty}</p>
        ) : (
          <ul className={styles.grid}>
            {filtered.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
              >
                <div className={styles.card}>
                  <button type="button" className={styles.cardOpen} onClick={() => setActive(p)}>
                    <div className={styles.cardThumb} aria-hidden>
                      {projectHeroImage(p) ? (
                        <img
                          src={projectHeroImage(p)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className={styles.placeholder}>{t.portfolio[filtersLabel(p.category)]}</span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <span className={styles.badge}>{t.portfolio[filtersLabel(p.category)]}</span>
                      <h3 className={styles.cardTitle}>{p.title[lang]}</h3>
                      <span className={styles.cardCta}>{t.portfolio.viewProject}</span>
                    </div>
                  </button>
                  <ProjectExternalLinks
                    p={p}
                    linkWebsite={t.portfolio.linkWebsite}
                    linkApp={t.portfolio.linkApp}
                    linkSocial={t.portfolio.linkSocial}
                    externalAria={t.portfolio.externalLinkAria}
                  />
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      <AnimatePresence>
        {active && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="presentation"
          >
            <motion.div
              className={styles.modal}
              dir={dir}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-dialog-title"
            >
              <div className={styles.modalHeader}>
                <button
                  ref={modalCloseRef}
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setActive(null)}
                  aria-label={t.portfolio.close}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalScroll}>
                {projectHeroImage(active) ? (
                  <div className={styles.modalThumb}>
                    <img
                      src={projectHeroImage(active)}
                      alt={active.title[lang]}
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : null}
                <h2 id="project-dialog-title" className={styles.modalTitle}>
                  {active.title[lang]}
                </h2>
                <p className={styles.modalDesc}>{active.description[lang]}</p>
                {projectGalleryExtras(active).length > 0 ? (
                  <>
                    <p className={styles.modalGalleryLabel}>{t.portfolio.gallerySection}</p>
                    <ul className={styles.modalGallery}>
                      {projectGalleryExtras(active).map((url, i) => (
                        <li key={`${url}-${i}`}>
                          <img
                            src={url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {active.tags && active.tags.length > 0 && (
                  <ul className={styles.tags}>
                    {active.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                )}
                <ProjectExternalLinks
                  p={active}
                  linkWebsite={t.portfolio.linkWebsite}
                  linkApp={t.portfolio.linkApp}
                  linkSocial={t.portfolio.linkSocial}
                  externalAria={t.portfolio.externalLinkAria}
                  className={styles.modalLinks}
                />
                <button type="button" className={styles.modalBtn} onClick={() => setActive(null)}>
                  {t.portfolio.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function filtersLabel(cat: ProjectCategory): PortfolioFilterKey {
  switch (cat) {
    case 'websites':
      return 'filterWebsites'
    case 'apps':
      return 'filterApps'
    default:
      return 'filterSocial'
  }
}
