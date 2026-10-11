import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
  type CSSProperties,
} from "react";
import { submitContact } from "./api/client";
import { useSiteContent } from "./hooks/useSiteContent";
import { useLanguage } from "./i18n/LanguageProvider";
import { filterKeys, type FilterKey } from "./i18n/translations";
import type { DisplayProject } from "./lib/siteContent";
import Wordmark from "./components/Wordmark";
import { faqs } from "./seo";

function Mark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 66V50C20 10 100 10 100 50V68C100 92 82 104 60 104" />
      <path d="M38 70V50C38 26 82 26 82 50V68C82 82 72 90 60 90H49" />
      <path d="M56 71V51C56 47 64 47 64 51V67" />
    </g>
    <rect className="mark-dot" x="15" y="86" width="13" height="13" rx="3" fill="currentColor" />
  </svg>;
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

// Pointer work is limited to one frame and never updates React state.
function usePointerDepth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let x = 0, y = 0;
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      el.style.setProperty("--pointer-x", "0");
      el.style.setProperty("--pointer-y", "0");
    };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType !== "mouse" || el.closest(".motion-paused")) return;
      const bounds = el.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      if (!frame) frame = requestAnimationFrame(() => {
        el.style.setProperty("--pointer-x", String(x));
        el.style.setProperty("--pointer-y", String(y));
        frame = 0;
      });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    media.addEventListener("change", reset);
    return () => {
      reset();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      media.removeEventListener("change", reset);
    };
  }, []);
  return ref;
}

function SignatureArtwork() {
  const ref = usePointerDepth<HTMLDivElement>();
  return <div ref={ref} className="hero-art signature-artwork" aria-hidden="true">
    <div className="trace-panel">
      <div className="trace-meta"><span>من الفكرة إلى الأثر</span><span dir="ltr">BASMA / DIGITAL</span></div>
      <div className="trace-canvas">
        <span className="trace-cross cross-one"/><span className="trace-cross cross-two"/>
        <svg className="trace-art" viewBox="0 0 480 480" fill="none">
          <g className="trace-lines" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {Array.from({length: 8}, (_, i) => {
              const l=65+i*19, r=415-i*19, top=34+i*24, bottom=431-i*17;
              return <path key={i} pathLength="1" style={{"--trace-order": i} as CSSProperties}
                d={`M${l} ${260-i*7}V190C${l} ${top} ${r} ${top} ${r} 190V275C${r} ${bottom} ${150+i*12} ${bottom} ${145+i*12} ${325-i*9}`}/>;
            })}
          </g>
          <path className="trace-accent" pathLength="1" d="M65 260V190C65 34 415 34 415 190V275C415 431 150 431 145 325" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path className="trace-signal" pathLength="1" d="M65 260V190C65 34 415 34 415 190V275C415 431 150 431 145 325" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <rect className="trace-point" x="56" y="251" width="18" height="18" rx="4" />
        </svg>
        <div className="trace-coordinate" dir="ltr"><span>01 / EXPLORE</span><span>02 / CREATE</span><span>03 / LEAVE A MARK</span></div>
      </div>
      <div className="trace-bottom"><Wordmark/><span>تصميم له شخصية.<br/>هندسة تصنع الفرق.</span></div>
    </div>
  </div>;
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
  const mediaRef = usePointerDepth<HTMLButtonElement>();
  useEffect(() => setFailed(false), [project.image]);
  return (
    <article className="project-card">
      <button
        ref={mediaRef}
        className="project-media"
        onClick={onOpen}
        aria-label={`${t.portfolio.viewDetails}: ${project.title[lang]}`}
      >
        <div className="project-visual">
          {project.image && !failed ? (
            <img src={project.image} alt={project.title[lang]} loading="lazy" decoding="async" onError={() => setFailed(true)} />
          ) : (
            <div className="project-placeholder"><Mark /><span>{t.portfolio.noImage}</span></div>
          )}
        </div>
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
      {project.description?.[lang] && <p className="project-summary">{project.description[lang]}</p>}
      {project.tags?.length ? <div className="project-tags">{project.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div> : null}
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
                شريكك في التصميم والتطوير
              </span>
              <h1 className="hero-enter">
                <span className="headline-line"><span>نحوّل الأفكار.</span></span>
                <span className="headline-line"><span>إلى{" "}
                <span className="signature">
                  أثر.
                  <svg viewBox="0 0 300 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 17C80 0 210 0 293 12"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span></span></span>
              </h1>
              <p className="hero-description hero-enter">
                من أول فكرة إلى تجربة رقمية متكاملة.
                <br />
                نصمّم هويتك، ونبني مواقع وتطبيقات واضحة، سريعة، وقابلة للنمو.
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
            <SignatureArtwork />
          </div>
          <div className="hero-bottom container">
            <span dir="ltr">INDEPENDENT DIGITAL STUDIO</span>
            <a href="#about">
              تعرّف على بصمة<span>↓</span>
            </a>
            <span dir="ltr">01 — 05</span>
          </div>
        </section>
        <div className="discipline-strip container"><span>فكر واضح. تنفيذ متقن.</span><div><span>الهوية البصرية</span><i/><span>تجربة المستخدم</span><i/><span>المواقع والتطبيقات</span></div><span dir="ltr">DESIGN × ENGINEERING</span></div>
        <section id="portfolio" className="section portfolio-section">
          <div className="container">
            <Reveal>
              <SectionTitle
                number="01"
                label="أعمال مختارة"
                title="شغلنا يتكلم."
                subtitle="مواقع وتطبيقات نفخر بصناعتها. اكتشف الفكرة، والتفاصيل، والتجربة."
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
        <section id="about" className="section about-section">
          <div className="container">
            <Reveal>
              <SectionTitle
                number="02"
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
                number="03"
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
        <section className="section faq-section" aria-labelledby="faq-title">
          <div className="container faq-layout">
            <div><span className="eyebrow"><span className="tiny-dot"/>قبل ما نبدأ</span><h2 id="faq-title">إجابات واضحة.<br/>لبداية أوضح.</h2></div>
            <div className="faq-list">{faqs.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
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
        <span className="whatsapp-label">خلّينا نتكلم</span><span className="whatsapp-arrow" aria-hidden="true"><Arrow /></span>
      </a>
      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
