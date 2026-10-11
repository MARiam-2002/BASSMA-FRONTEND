import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { submitContact } from "./api/client";
import { useSiteContent } from "./hooks/useSiteContent";
import { useLanguage } from "./i18n/LanguageProvider";
import { filterKeys, type FilterKey } from "./i18n/translations";
import type { DisplayProject } from "./lib/siteContent";
import Wordmark from "./components/Wordmark";

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M14 8h23v46c0 16 8 24 23 24s23-8 23-24V8h23v49c0 29-17 43-46 43S14 86 14 57V8Zm74 42L65 78h10l13-16V50Z"
      />
      <rect
        className="mark-dot"
        x="50"
        y="104"
        width="20"
        height="16"
        rx="4"
        fill="currentColor"
      />
    </svg>
  );
}
function Brand() {
  return (
    <span className="brand">
      <Mark />
      <Wordmark />
    </span>
  );
}
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6H6v12M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
function SectionTitle({
  number,
  label,
  title,
  subtitle,
}: {
  number: string;
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="section-title">
      <div>
        <span className="eyebrow">
          <span className="tiny-dot" />
          {number} / {label}
        </span>
        <h2>{title}</h2>
      </div>
      <p>{subtitle}</p>
    </div>
  );
}
function Status({
  message,
  retry,
  onRetry,
}: {
  message: string;
  retry?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="content-status" role="status">
      <span className="status-dot" />
      <p>{message}</p>
      {onRetry && (
        <button className="button secondary" onClick={onRetry}>
          {retry}
          <Arrow />
        </button>
      )}
    </div>
  );
}
function ProjectCard({
  project,
  onOpen,
}: {
  project: DisplayProject;
  onOpen: () => void;
}) {
  const { lang, t } = useLanguage();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [project.image]);
  return (
    <article className="project-card">
      <button
        className="project-media"
        onClick={onOpen}
        aria-label={`${t.portfolio.viewDetails}: ${project.title[lang]}`}
      >
        <span className="mockup-brand" aria-hidden="true">
          <Mark />
          <span dir="ltr">basma / work</span>
        </span>
        <div className="mockup-stage">
          <div className={`mockup-frame mockup-${project.category}`}>
            {project.category === "apps" ? (
              <span className="mockup-notch" aria-hidden="true" />
            ) : (
              <div className="mockup-toolbar" aria-hidden="true">
                <span className="mockup-controls"><i /><i /><i /></span>
                <span className="mockup-caption">{project.title[lang]}</span>
                <span className="mockup-toolbar-dot" />
              </div>
            )}
            <div className="mockup-screen">
              {project.image && !failed ? (
                <img
                  src={project.image}
                  alt={project.title[lang]}
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailed(true)}
                />
              ) : (
                <div className="project-placeholder">
                  <Mark />
                  <span>{t.portfolio.noImage}</span>
                </div>
              )}
            </div>
            {project.category === "apps" && <span className="mockup-home" aria-hidden="true" />}
          </div>
        </div>
        <span className="mockup-category" aria-hidden="true">
          <span className="tiny-dot" />{t.portfolio.categories[project.category]}
        </span>
        <span className="project-open">
          <Arrow />
        </span>
      </button>
      <div className="project-info">
        <div>
          <span className="project-category">
            {t.portfolio.categories[project.category]}
          </span>
          <h3>
            <button onClick={onOpen}>{project.title[lang]}</button>
          </h3>
        </div>
        {project.linkUrl && (
          <a
            className="project-link"
            href={project.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.linkLabel[lang]}: ${project.title[lang]}`}
          >
            <Arrow />
          </a>
        )}
      </div>
    </article>
  );
}
function ProjectModal({
  project,
  onClose,
}: {
  project: DisplayProject;
  onClose: () => void;
}) {
  const { lang, t, dir } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const previous = document.activeElement as HTMLElement | null;
    el.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="project-modal"
      dir={dir}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
      aria-labelledby="project-title"
    >
      <button
        className="modal-close"
        onClick={onClose}
        aria-label={t.portfolio.closeModal}
      >
        ×
      </button>
      {project.image && (
        <img className="modal-cover" src={project.image} alt="" />
      )}
      <div className="modal-body">
        <span className="eyebrow">
          {t.portfolio.categories[project.category]}
        </span>
        <h2 id="project-title">{project.title[lang]}</h2>
        <p>{project.description?.[lang]}</p>
        <div className="tags">
          {project.tags?.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {!!project.gallery?.length && (
          <div className="modal-gallery">
            {project.gallery.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt={`${project.title[lang]} — ${i + 1}`}
                loading="lazy"
              />
            ))}
          </div>
        )}
        {project.linkUrl && (
          <a
            className="button primary"
            href={project.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {project.linkLabel[lang]}
            <Arrow />
          </a>
        )}
      </div>
    </dialog>
  );
}

export default function App() {
  const { lang, t, dir } = useLanguage();
  const { projects, services, loading, error, retry } = useSiteContent();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [selected, setSelected] = useState<DisplayProject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [motionPaused, setMotionPaused] = useState(false);
  const progress = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.current?.style.setProperty(
        "--progress",
        `${max > 0 ? scrollY / max : 0}`,
      );
      setScrolled(scrollY > 24);
      frame = 0;
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((el) => observer.observe(el));
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormStatus(null);
    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
        lang,
      });
      setFormStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch {
      setFormStatus("error");
    } finally {
      setSubmitting(false);
    }
  };
  const nav = [
    { id: "home", label: t.nav.home },
    { id: "about", label: t.nav.about },
    { id: "services", label: t.nav.services },
    { id: "portfolio", label: t.nav.portfolio },
    { id: "contact", label: t.nav.contact },
  ];
  const visibleProjects = projects.filter((project) => project.category !== "social");
  const visibleServices = services.filter((service) => service.category !== "social");
  const filtered =
    activeFilter === "all"
      ? visibleProjects
      : visibleProjects.filter((p) => p.category === activeFilter);
  return (
    <div className={`site ${motionPaused ? "motion-paused" : ""}`} dir={dir}>
      <a className="skip-link" href="#home">
        {t.skipLink}
      </a>
      <div ref={progress} className="scroll-progress" aria-hidden="true" />
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-inner">
          <a href="#home" aria-label="بصمة — الرئيسية">
            <Brand />
          </a>
          <nav className="desktop-nav" aria-label="القائمة الرئيسية">
            {nav.map((link) => (
              <a
                href={`#${link.id}`}
                key={link.id}
                className={activeSection === link.id ? "active" : ""}
                aria-current={
                  activeSection === link.id ? "location" : undefined
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a className="header-cta" href="#contact">
            لنصنع شيئاً مميزاً
            <Arrow />
          </a>
          <button
            className={`menu-toggle ${mobileOpen ? "open" : ""}`}
            aria-label={mobileOpen ? "إغلاق القائمة" : t.menu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span />
            <span />
          </button>
        </div>
        <nav
          id="mobile-nav"
          className="mobile-nav"
          hidden={!mobileOpen}
          aria-label="القائمة الرئيسية للموبايل"
        >
          {nav.map((link) => (
            <a
              href={`#${link.id}`}
              key={link.id}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
              <Arrow />
            </a>
          ))}
        </nav>
      </header>
      <main>
        <section id="home" className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow hero-enter">
                <span className="tiny-dot" />
                تصميم يفكّر. تقنية تُنجز.
              </span>
              <h1 className="hero-enter">
                نصنع تجارب.
                <br />
                تترك{" "}
                <span className="signature">
                  بصمة
                  <svg viewBox="0 0 300 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 17C80 0 210 0 293 12"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="hero-description hero-enter">
                من أول فكرة إلى تجربة رقمية متكاملة.
                <br />
                هوية تعبّر عنك، ومواقع وتطبيقات تجمع جمال التصميم وقوة التنفيذ.
              </p>
              <div className="hero-actions hero-enter">
                <a className="button primary" href="#contact">
                  ابدأ مشروعك
                  <Arrow />
                </a>
                <a className="button secondary" href="#portfolio">
                  اكتشف أعمالنا
                  <span className="button-dot" />
                </a>
              </div>
              <div className="hero-note hero-enter">
                <span className="note-line" />
                <span>من مصر. بأثر يتجاوز الحدود.</span>
                <span dir="ltr">EG / KSA</span>
              </div>
            </div>
            <div
              ref={art}
              className="hero-art"
              aria-hidden="true"
              onPointerMove={(e) => {
                if (
                  e.pointerType !== "mouse" ||
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches
                )
                  return;
                const r = e.currentTarget.getBoundingClientRect();
                art.current?.style.setProperty(
                  "--rx",
                  `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`,
                );
                art.current?.style.setProperty(
                  "--ry",
                  `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`,
                );
              }}
              onPointerLeave={() => {
                art.current?.style.setProperty("--rx", "0deg");
                art.current?.style.setProperty("--ry", "0deg");
              }}
            >
              <div className="art-stage identity-specimen">
                <div className="specimen-heading"><span>لكل فكرة أثر.</span><span className="specimen-index" dir="ltr">B / 01</span></div>
                <div className="imprint-composition">
                  <Mark className="imprint-echo echo-one" />
                  <Mark className="imprint-echo echo-two" />
                  <Mark className="imprint-echo echo-three" />
                  <Mark className="imprint-primary" />
                </div>
                <div className="specimen-footer"><Wordmark/><p>هويتك.<br/>تجربتك.<br/>بصمتك.</p></div>
                <div className="specimen-dots">{Array.from({length:9},(_,i)=><span key={i}/>)}</div>
              </div>
            </div>
          </div>
          <div className="hero-bottom container">
            <span dir="ltr">INDEPENDENT DIGITAL STUDIO</span>
            <a href="#about">
              تعرّف على بصمة<span>↓</span>
            </a>
            <span dir="ltr">01 — 05</span>
          </div>
        </section>
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((i) => (
              <div key={i}>
                <span>هوية لها شخصية</span>
                <span className="ticker-symbol">✳</span>
                <span>مواقع تصنع الفرق</span>
                <span className="ticker-symbol">✳</span>
                <span>تطبيقات بفكر مختلف</span>
                <span className="ticker-symbol">✳</span>
                <span>أثر رقمي يستمر</span>
                <span className="ticker-symbol">✳</span>
              </div>
            ))}
          </div>
        </div>
        <section id="about" className="section about-section">
          <div className="container">
            <Reveal>
              <SectionTitle
                number="01"
                label="من نحن"
                title="التفاصيل الصغيرة. الأثر الكبير."
                subtitle="نحن بصمة. نجمع التفكير الإبداعي والهندسة لنصنع تجارب تستحق أن تُستخدم."
              />
            </Reveal>
            <div className="about-grid">
              <Reveal className="about-manifesto">
                <p>
                  لكل علامة قصة.
                  <br />
                  دورنا أن نعطيها
                  <br />
                  <span>حضوراً يليق بها.</span>
                </p>
                <Mark />
              </Reveal>
              <Reveal className="about-detail" delay={100}>
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
                <div className="stats">
                  {t.about.stats.map((s) => (
                    <div key={s.value}>
                      <strong dir="ltr">{s.value}</strong>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
                <a className="text-link" href="#contact">
                  لنتحدث عن فكرتك
                  <Arrow />
                </a>
              </Reveal>
            </div>
          </div>
        </section>
        <section id="services" className="section services-section">
          <div className="container">
            <Reveal>
              <SectionTitle
                number="02"
                label="ما نصنعه"
                title="من الفكرة. إلى كل نقطة اتصال."
                subtitle="تصميم وتطوير، بمنظور واحد: تجربة متكاملة تعكس علامتك."
              />
            </Reveal>
            <div className="services-grid">
              {loading ? (
                [0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="service-skeleton skeleton"
                    aria-label={t.servicesSection.loading}
                  />
                ))
              ) : error ? (
                <Status
                  message={t.servicesSection.error}
                  retry={t.servicesSection.retry}
                  onRetry={retry}
                />
              ) : visibleServices.length ? (
                visibleServices.map((s, i) => (
                  <Reveal key={`${s.category}-${s.title.en}`} delay={i * 70}>
                    <article className="service-card">
                      <div className="service-top">
                        <span dir="ltr">0{i + 1}</span>
                        <span
                          className={`service-glyph glyph-${s.category}`}
                          aria-hidden="true"
                        >
                          {s.category === "websites"
                            ? "↗"
                            : s.category === "apps"
                              ? "▯"
                              : s.category === "branding"
                                ? "✳"
                                : "◎"}
                        </span>
                      </div>
                      <h3>{s.title[lang]}</h3>
                      <p>{s.description[lang]}</p>
                      <a href="#contact" className="service-bottom">
                        لنتحدث عن مشروعك
                        <Arrow />
                      </a>
                    </article>
                  </Reveal>
                ))
              ) : (
                <Status message="الخدمات ستُضاف قريباً." />
              )}
            </div>
          </div>
        </section>
        <section id="portfolio" className="section portfolio-section">
          <div className="container">
            <Reveal>
              <SectionTitle
                number="03"
                label="أعمال مختارة"
                title="الفكرة تصبح واقعاً."
                subtitle={t.portfolio.subtitle}
              />
            </Reveal>
            {!loading && !error && visibleProjects.length > 0 && (
              <div className="filters" aria-label={t.portfolio.filterLabel}>
                {filterKeys.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    aria-pressed={activeFilter === filter}
                    className={activeFilter === filter ? "selected" : ""}
                  >
                    {t.portfolio.filters[filter]}
                    {filter === "all" && (
                      <span>{visibleProjects.length.toString().padStart(2, "0")}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="portfolio-grid">
              {loading ? (
                [0, 1, 2, 3].map((i) => (
                  <div
                    className="project-skeleton skeleton"
                    key={i}
                    aria-label={t.portfolio.loading}
                  />
                ))
              ) : error ? (
                <Status
                  message={t.portfolio.error}
                  retry={t.portfolio.retry}
                  onRetry={retry}
                />
              ) : filtered.length ? (
                filtered.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 2) * 90}>
                    <ProjectCard project={p} onOpen={() => setSelected(p)} />
                  </Reveal>
                ))
              ) : (
                <Status message={t.portfolio.empty} />
              )}
            </div>
          </div>
        </section>
        <section className="section process-section">
          <div className="container">
            <Reveal>
              <SectionTitle
                number="04"
                label="كيف نعمل"
                title="وضوح في كل خطوة."
                subtitle="رحلة منظمة من فهم احتياجك إلى إطلاق التجربة، بدون تعقيد."
              />
            </Reveal>
            <div className="process-grid">
              {[
                {
                  title: "نفهم",
                  body: "نستمع لفكرتك، نفهم جمهورك، ونحدد ما يحتاجه مشروعك.",
                },
                {
                  title: "نصمّم",
                  body: "نحوّل الرؤية إلى هوية وتجربة واضحة، ونراجعها معك.",
                },
                {
                  title: "نطوّر",
                  body: "نبني التفاصيل بعناية، ونختبر الأداء وتجربة الاستخدام.",
                },
                {
                  title: "نطلق",
                  body: "نجهّز مشروعك للنشر، ونضعه بين يديك بثقة.",
                },
              ].map((step, i) => (
                <Reveal delay={i * 80} key={step.title}>
                  <article className="process-step">
                    <span className="process-number" dir="ltr">
                      0{i + 1}
                    </span>
                    <h3>
                      {step.title}
                      <span className="tiny-dot" />
                    </h3>
                    <p>{step.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <section id="contact" className="section contact-section">
          <div className="container contact-grid">
            <Reveal className="contact-copy">
              <span className="eyebrow">
                <span className="tiny-dot" />
                05 / الخطوة القادمة
              </span>
              <h2>
                فكرتك القادمة.
                <br />
                <span>بصمتنا المشتركة.</span>
              </h2>
              <p>
                سواء عندك فكرة جديدة، أو مشروع محتاج خطوة للأمام، نحب نسمع منك.
              </p>
              <a
                className="contact-email"
                href="mailto:bassma1company@gmail.com"
                dir="ltr"
              >
                bassma1company@gmail.com
                <Arrow />
              </a>
              <a className="contact-phone" href="tel:+201021288238" dir="ltr">
                +20 10 21288238
              </a>
              <div className="contact-pattern" aria-hidden="true">
                {Array.from({ length: 15 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
            </Reveal>
            <Reveal delay={100}>
              <form
                onSubmit={handleSubmit}
                className="contact-form"
                aria-busy={submitting}
              >
                <span className="form-heading">
                  احكي لنا عن مشروعك
                  <Arrow />
                </span>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="name">
                      {t.contact.name} <span>*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      placeholder="اسمك الكريم"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="phone">
                      {t.contact.phone} <small>اختياري</small>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      dir="ltr"
                      placeholder="+20"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="email">
                    {t.contact.email} <span>*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    placeholder="you@company.com"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="message">
                    {t.contact.message} <span>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="ما الذي تريد أن نصنعه معاً؟"
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
                <button
                  className="button primary submit-button"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? t.contact.submitting : "لنبدأ الحديث"}
                  <Arrow />
                </button>
                <div
                  className={`form-feedback ${formStatus || ""}`}
                  role="status"
                  aria-live="polite"
                >
                  {formStatus === "success"
                    ? t.contact.success
                    : formStatus === "error"
                      ? t.contact.error
                      : ""}
                </div>
              </form>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <a href="#home" aria-label="بصمة — الرئيسية">
              <Brand />
            </a>
            <p>{t.footer.tagline}</p>
            <a className="back-top" href="#home">
              {t.footer.backToTop} ↑
            </a>
          </div>
          <div className="footer-bottom">
            <span>{t.footer.copyright}</span>
            <nav aria-label="روابط التذييل">
              {nav.slice(1).map((link) => (
                <a href={`#${link.id}`} key={link.id}>
                  {link.label}
                </a>
              ))}
            </nav>
            <button className="motion-control" onClick={() => setMotionPaused(!motionPaused)} aria-pressed={motionPaused} aria-label={motionPaused ? "تشغيل الحركة" : "إيقاف الحركة"}>
              {motionPaused ? "▷" : "Ⅱ"}<span>{motionPaused ? "تشغيل الحركة" : "إيقاف الحركة"}</span>
            </button>
          </div>
        </div>
      </footer>
      <a
        className="whatsapp"
        href="https://wa.me/201021288238"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.footer.whatsappFabLabel}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4.3A8 8 0 1 1 20 11.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M9 7.5c-2 1 .5 6 4 7l1.5-1.5-2-1-.8.7c-1.5-.8-2-1.5-2.3-2.4l.6-.8L9 7.5Z"
            fill="currentColor"
          />
        </svg>
        <span>نتحدث؟</span>
      </a>
      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
