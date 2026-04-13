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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      aria-hidden={true}
      focusable={false}
    >
      <path
        fill="currentColor"
        d="M18 19H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5V4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-2v5zM15 3h6v6h-1.5V5.56l-8.94 8.94-1.06-1.06L18.44 4.5H15V3z"
      />
    </svg>
  )
}

function ProjectExternalLinks({
  p,
  linkWebsite,
  linkApp,
  linkSocial,
  externalAria,
  className,
  variant = 'modal',
  liveLinksHeading,
}: {
  p: Project
  linkWebsite: string
  linkApp: string
  linkSocial: string
  externalAria: string
  className?: string
  variant?: 'card' | 'modal'
  liveLinksHeading?: string
}) {
  if (!projectHasExternalLinks(p)) return null
  const chipClass = variant === 'card' ? styles.linkChipCard : styles.linkChip
  const links = (
    <>
      {p.websiteUrl ? (
        <a
          href={p.websiteUrl}
          className={chipClass}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${linkWebsite} — ${externalAria}`}
        >
          <ExternalLinkIcon className={styles.linkChipIcon} />
          {linkWebsite}
        </a>
      ) : null}
      {p.appUrl ? (
        <a
          href={p.appUrl}
          className={chipClass}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${linkApp} — ${externalAria}`}
        >
          <ExternalLinkIcon className={styles.linkChipIcon} />
          {linkApp}
        </a>
      ) : null}
      {p.socialUrl ? (
        <a
          href={p.socialUrl}
          className={chipClass}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${linkSocial} — ${externalAria}`}
        >
          <ExternalLinkIcon className={styles.linkChipIcon} />
          {linkSocial}
        </a>
      ) : null}
    </>
  )
  return (
    <div className={className ?? styles.cardLinks}>
      {variant === 'card' && liveLinksHeading ? (
        <p className={styles.cardLinksHeading}>{liveLinksHeading}</p>
      ) : null}
      <div className={variant === 'card' ? styles.cardLinksRow : styles.modalLinksRow}>{links}</div>
    </div>
  )
}

export function Portfolio() {
  const { t, dir, lang } = useLanguage()
  const [filter, setFilter] = useState<ProjectCategory | 'all'>('all')
  const [projects, setProjects] = useState<Project[]>(fallbackProjects)
  const [active, setActive] = useState<Project | null>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
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
    if (!active) {
      setLightboxSrc(null)
      return
    }
    const focusTimer = window.setTimeout(() => modalCloseRef.current?.focus(), 80)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = prevOverflow
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (lightboxSrc) setLightboxSrc(null)
      else setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, lightboxSrc])

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
                    variant="card"
                    liveLinksHeading={t.portfolio.liveLinksHeading}
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
                  <button
                    type="button"
                    className={styles.modalThumbBtn}
                    onClick={() => setLightboxSrc(projectHeroImage(active)!)}
                    aria-label={t.portfolio.viewImageFull}
                  >
                    <span className={styles.modalThumb}>
                      <img
                        src={projectHeroImage(active)}
                        alt={active.title[lang]}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </span>
                  </button>
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
                          <button
                            type="button"
                            className={styles.modalGalleryBtn}
                            onClick={() => setLightboxSrc(url)}
                            aria-label={t.portfolio.viewImageFull}
                          >
                            <img
                              src={url}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                            />
                          </button>
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
      <AnimatePresence>
        {lightboxSrc ? (
          <motion.div
            className={styles.lightboxBackdrop}
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
          >
            <motion.div
              className={styles.lightboxInner}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setLightboxSrc(null)}
                aria-label={t.portfolio.lightboxClose}
              >
                ×
              </button>
              <img
                className={styles.lightboxImg}
                src={lightboxSrc}
                alt=""
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        ) : null}
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
