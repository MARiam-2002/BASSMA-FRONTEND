import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLanguage } from "./i18n/LanguageProvider";
import { LanguageSwitcher } from "./i18n/LanguageSwitcher";
import {
  filterKeys,
  projects as fallbackProjects,
  services as fallbackServices,
  type FilterKey,
  type ProjectCategory,
} from "./i18n/translations";
import {
  getProjects,
  getServices,
  submitContact,
  type Project as ApiProject,
  type ServiceItem,
} from "./api/client";

// ─── API helpers ──────────────────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, string> = {
  social: "◎",
  apps: "○",
  websites: "◇",
  branding: "◆",
};

const SERVICE_ORDER = ["social", "apps", "websites", "branding"];

function mapApiCategory(category: string): ProjectCategory {
  if (category === "websites" || category === "branding") return "sites";
  if (category === "apps") return "apps";
  return "social";
}

type DisplayProject = {
  id: string;
  title: { ar: string; en: string };
  category: ProjectCategory;
  image: string;
  linkLabel: { ar: string; en: string };
  linkUrl?: string;
};

function toDisplayProject(project: ApiProject): DisplayProject {
  const category = mapApiCategory(project.category);
  const link =
    project.websiteUrl != null
      ? { url: project.websiteUrl, linkLabel: { ar: "الموقع", en: "Website" } }
      : project.appUrl != null
        ? { url: project.appUrl, linkLabel: { ar: "التطبيق", en: "App" } }
        : project.socialUrl != null
          ? { url: project.socialUrl, linkLabel: { ar: "سوشيال", en: "Social" } }
          : { linkLabel: { ar: "الموقع", en: "Website" } };

  return {
    id: project.id,
    title: project.title,
    category,
    image: project.image ?? "",
    ...link,
  };
}

function sortServices<T extends { category: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => SERVICE_ORDER.indexOf(a.category) - SERVICE_ORDER.indexOf(b.category),
  );
}

type DisplayService = {
  icon: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  category: string;
};

function toDisplayService(service: ServiceItem): DisplayService {
  return {
    icon: SERVICE_ICONS[service.category] ?? "◆",
    title: service.title,
    description: service.description,
    category: service.category,
  };
}

// ─── Hooks & helpers ──────────────────────────────────────────────────────────

function useHeaderScroll(threshold = 16) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

function Reveal({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m5 7 7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.5 4.5h2.2c.6 0 1.1.4 1.2 1l.4 2.2a1.2 1.2 0 0 1-.3 1.1l-1.3 1.3a11.5 11.5 0 0 0 5.1 5.1l1.3-1.3c.3-.3.7-.4 1.1-.3l2.2.4c.6.1 1 .6 1 1.2v2.2c0 .7-.5 1.2-1.2 1.3C10.8 18.8 5.2 13.2 4.2 7.7c-.1-.7.4-1.3 1.1-1.3h3.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="m7 10 5-5 5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
      <path
        d="M10.5002 11.0833H3.50016C3.34545 11.0833 3.19708 11.0219 3.08768 10.9125C2.97829 10.8031 2.91683 10.6547 2.91683 10.5V3.5C2.91683 3.34529 2.97829 3.19692 3.08768 3.08752C3.19708 2.97812 3.34545 2.91667 3.50016 2.91667H6.41683V2.33333H3.50016C3.19074 2.33333 2.894 2.45625 2.6752 2.67504C2.45641 2.89383 2.3335 3.19058 2.3335 3.5V10.5C2.3335 10.8094 2.45641 11.1062 2.6752 11.325C2.894 11.5437 3.19074 11.6667 3.50016 11.6667H10.5002C10.8096 11.6667 11.1063 11.5437 11.3251 11.325C11.5439 11.1062 11.6668 10.8094 11.6668 10.5V7.58333H10.5002V10.5V11.0833ZM8.75016 1.75H12.2502V5.25H11.3752V3.24333L6.16016 8.45833L5.54183 7.84L10.7568 2.625H8.75016V1.75Z"
        fill="#0C1220"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <g clipPath="url(#clip0)">
        <path
          d="M21.112 17.3782C20.7531 17.1982 18.9877 16.3306 18.6591 16.2098C18.3292 16.0902 18.0899 16.0309 17.8495 16.391C17.6114 16.7499 16.9227 17.5583 16.7136 17.7975C16.5046 18.038 16.2943 18.067 15.9355 17.8882C15.5766 17.7069 14.419 17.3287 13.0476 16.1059C11.9806 15.1537 11.2592 13.978 11.0502 13.6179C10.8411 13.259 11.0284 13.0645 11.2073 12.8857C11.3692 12.7249 11.5673 12.4664 11.7462 12.2573C11.9262 12.0471 11.9854 11.8972 12.1063 11.6568C12.2259 11.4175 12.1667 11.2085 12.0761 11.0284C11.9854 10.8484 11.2677 9.08061 10.9692 8.36166C10.6768 7.66203 10.3808 7.75749 10.1608 7.74541C9.95181 7.73574 9.71256 7.73332 9.4721 7.73332C9.23285 7.73332 8.84376 7.82274 8.5151 8.18282C8.18643 8.5417 7.25843 9.41049 7.25843 11.1783C7.25843 12.9449 8.54531 14.6522 8.72414 14.8927C8.90418 15.1319 11.2568 18.7594 14.8588 20.3145C15.7156 20.6842 16.3838 20.9054 16.9058 21.0697C17.7661 21.344 18.5491 21.3053 19.1666 21.2123C19.8565 21.1096 21.2908 20.3435 21.5905 19.5049C21.8901 18.6663 21.8901 17.9474 21.7995 17.7975C21.7101 17.6477 21.4721 17.5583 21.112 17.3782ZM14.5604 26.3235H14.5556C12.4165 26.3237 10.3168 25.7486 8.47643 24.6584L8.04022 24.3999L3.51985 25.5864L4.72576 21.1784L4.44181 20.7265C3.24609 18.8225 2.61353 16.619 2.61722 14.3707C2.61843 7.78528 7.97739 2.42753 14.5652 2.42753C17.7552 2.42753 20.7543 3.67211 23.0091 5.92928C24.1215 7.03686 25.0033 8.35408 25.6034 9.8047C26.2034 11.2553 26.5098 12.8105 26.5048 14.3804C26.5011 20.9658 21.1458 26.3235 14.5604 26.3235ZM24.7261 4.21466C23.3947 2.87452 21.8107 1.81193 20.0657 1.08846C18.3207 0.364982 16.4494 -0.0049865 14.5604 -1.15206e-05C6.63976 -1.15206e-05 0.193306 6.44645 0.189681 14.3695C0.189681 16.9022 0.850639 19.3744 2.10851 21.553L0.0688477 29L7.68739 27.0014C9.79423 28.1492 12.1551 28.7508 14.5543 28.7511H14.5604C22.4798 28.7511 28.9275 22.3046 28.9311 14.3804C28.9369 12.4921 28.5683 10.6214 27.8465 8.87645C27.1248 7.13153 26.0642 5.54705 24.7261 4.21466Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="29" height="29" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  linkLabel: string;
  linkUrl?: string;
  viewDetails: string;
  linkHint: string;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="section-heading">{title}</h2>
      <p className="section-lead">{subtitle}</p>
    </div>
  );
}

function ProjectCard({ title, category, image, linkLabel, linkUrl, viewDetails, linkHint }: ProjectCardProps) {
  return (
    <article className="project-card card-interactive group">
      <div className="project-card-media">
        <img src={image} alt={title} loading="lazy" decoding="async" />
        <div className="project-card-media-overlay" aria-hidden="true" />
      </div>

      <div className="project-card-body">
        <span className="project-card-category">{category}</span>
        <h3 className="project-card-title">{title}</h3>
        <p className="project-card-meta">{viewDetails}</p>
      </div>

      <div className="project-card-footer">
        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card-cta btn-gold"
          >
            {linkLabel}
            <ExternalLinkIcon />
          </a>
        ) : (
          <span className="project-card-cta btn-gold opacity-60 cursor-default">
            {linkLabel}
            <ExternalLinkIcon />
          </span>
        )}
        <span className="project-card-link-hint">{linkHint}</span>
      </div>
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function App() {
  const { lang, t, dir } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [projects, setProjects] = useState<DisplayProject[]>(() =>
    fallbackProjects.map((p) => ({
      id: String(p.id),
      title: p.title,
      category: p.category,
      image: p.image,
      linkLabel: p.linkLabel,
    })),
  );
  const [services, setServices] = useState<DisplayService[]>(() =>
    sortServices(
      fallbackServices.map((s, i) => ({
        icon: s.icon,
        title: s.title,
        description: s.description,
        category: SERVICE_ORDER[i] ?? "branding",
      })),
    ),
  );
  const headerScrolled = useHeaderScroll();

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        const [projectsRes, servicesRes] = await Promise.all([getProjects(), getServices()]);
        if (cancelled) return;

        if (projectsRes.projects.length > 0) {
          setProjects(projectsRes.projects.map(toDisplayProject));
        }

        if (servicesRes.services.length > 0) {
          setServices(sortServices(servicesRes.services.map(toDisplayService)));
        }
      } catch {
        /* keep static fallback data */
      }
    }

    loadContent();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
        lang,
      });
      alert(t.contact.success);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch {
      alert(t.contact.error);
    } finally {
      setContactSubmitting(false);
    }
  };

  const navLinks = [
    { href: "#home", label: t.nav.home },
    { href: "#about", label: t.nav.about },
    { href: "#services", label: t.nav.services },
    { href: "#portfolio", label: t.nav.portfolio },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <div className="font-cairo min-h-screen" dir={dir}>
      {/* ── Skip Link ── */}
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:z-[100] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:rounded-bl-xl focus:rounded-br-xl"
        style={{
          background: "linear-gradient(104deg, #F9E076 0%, #D4AF37 100%)",
          color: "#0A0F18",
          ...(dir === "rtl" ? { right: 0 } : { left: 0 }),
        }}
      >
        {t.skipLink}
      </a>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 h-[73px] transition-all duration-300 ease-snappy ${headerScrolled ? "header-scrolled" : ""}`}
        style={{
          borderBottom: "1px solid rgba(212, 175, 55, 0.22)",
          background: "linear-gradient(180deg, rgba(3, 10, 20, 0.92) 0%, rgba(3, 10, 20, 0.65) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="relative flex items-center justify-between h-full px-6 lg:px-16 xl:px-24 max-w-[1400px] mx-auto">
          {/* Logo — يمين في RTL */}
          <a
            href="#home"
            className="flex items-center gap-2.5 shrink-0 transition-transform duration-200 hover:scale-[1.03] z-10"
          >
            <img
              src="/logo-only.png"
              alt=""
              className="w-11 h-11 shrink-0 object-contain"
            />
            <span className="text-base font-bold gold-gradient-text">{t.brand}</span>
          </a>

          {/* Desktop Nav — وسط الشاشة */}
          <nav className="hidden md:flex items-center gap-7 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link text-sm font-medium py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Language Switcher + Mobile Menu */}
          <div className="flex items-center gap-3 z-10">
            <LanguageSwitcher className="hidden sm:flex" />

            <button
              className="md:hidden flex flex-col justify-center gap-1.5 p-2 rounded-lg transition-colors hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t.menu}
              aria-expanded={mobileMenuOpen}
            >
              <span
                className="block w-6 h-0.5 transition-all duration-300 ease-snappy origin-center"
                style={{ background: "rgba(248,250,252,0.8)", transform: mobileMenuOpen ? "rotate(45deg) translateY(7px)" : "none" }}
              />
              <span
                className="block w-6 h-0.5 transition-all duration-300 ease-snappy"
                style={{ background: "rgba(248,250,252,0.8)", opacity: mobileMenuOpen ? 0 : 1, transform: mobileMenuOpen ? "scaleX(0)" : "scaleX(1)" }}
              />
              <span
                className="block w-6 h-0.5 transition-all duration-300 ease-snappy origin-center"
                style={{ background: "rgba(248,250,252,0.8)", transform: mobileMenuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed top-[73px] inset-x-0 z-40 flex flex-col py-2 md:hidden overflow-hidden transition-all duration-300 ease-snappy ${
          mobileMenuOpen ? "max-h-80 opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(3,10,20,0.97)",
          borderBottom: mobileMenuOpen ? "1px solid rgba(212,175,55,0.22)" : "1px solid transparent",
          backdropFilter: "blur(12px)",
        }}
      >
        {navLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link px-6 py-3.5 text-base font-medium text-start mx-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {link.label}
          </a>
        ))}
        <div className="px-6 py-4 sm:hidden">
          <LanguageSwitcher className="w-full justify-center" />
        </div>
      </div>

      <main id="home">
        {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-[73px]">
          {/* Glow gradients */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 28% 55%, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.00) 72%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 40% 35% at 78% 42%, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.00) 70%)",
            }}
          />

          <div className="container mx-auto px-6 lg:px-12 xl:px-20 w-full max-w-[1400px]">
            <div className="grid lg:grid-cols-2 items-center gap-10 lg:gap-8 py-10 lg:py-0 min-h-[calc(100vh-73px)]">
              {/* Right: Content */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-start order-1">
                <img
                  src="/logo-slogan.png"
                  alt="بصمة BASMA"
                  className="w-40 sm:w-48 lg:w-[220px] mb-6 lg:mb-8 object-contain animate-fade-up"
                  style={{ animationDelay: "0.05s" }}
                  loading="eager"
                  decoding="async"
                />

                <h1
                  className="text-4xl sm:text-5xl lg:text-[58px] font-semibold leading-[1.12] mb-8 lg:mb-10 white-gradient-text max-w-xl animate-fade-up"
                  style={{ letterSpacing: lang === "en" ? "0.02em" : "0.88px", animationDelay: "0.12s" }}
                >
                  {t.hero.title}
                </h1>

                <div
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 animate-fade-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <a
                    href="#contact"
                    className="btn-gold inline-flex items-center justify-center px-8 sm:px-10 py-3.5 rounded-2xl text-base font-semibold"
                    style={{
                      background: "linear-gradient(117deg, #F9E076 0%, #C9A227 45%, #D4AF37 100%)",
                      boxShadow: "0 12px 40px 0 rgba(212,175,55,0.30)",
                      color: "#0A0F18",
                    }}
                  >
                    {t.hero.ctaContact}
                  </a>
                  <a
                    href="#portfolio"
                    className="btn-outline inline-flex items-center justify-center px-8 sm:px-10 py-3.5 rounded-2xl text-base font-semibold"
                    style={{
                      border: "1px solid rgba(248,250,252,0.22)",
                      background: "rgba(10,25,47,0.35)",
                      color: "#F8FAFC",
                    }}
                  >
                    {t.hero.ctaPortfolio}
                  </a>
                </div>
              </div>

              {/* Left: Mockup */}
              <div className="flex items-center justify-center order-2 animate-scale-in" style={{ animationDelay: "0.25s" }}>
                <img
                  src="/hero-mockup.png"
                  alt={t.hero.mockupAlt}
                  className="w-full max-w-[560px] lg:max-w-[720px] object-contain animate-float"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══ ABOUT ══════════════════════════════════════════════════════════ */}
        <section id="about" className="section-block">
          <div className="container mx-auto px-6 lg:px-12 xl:px-20 max-w-[1400px]">
            <Reveal>
              <SectionHeader title={t.about.title} subtitle={t.about.subtitle} />
            </Reveal>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {t.about.stats.map((stat, i) => (
                <Reveal
                  key={stat.value}
                  delay={i * 80}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl backdrop-blur-sm text-center card-interactive surface-card"
                  style={{
                    minWidth: "170px",
                    flex: "1 1 160px",
                    maxWidth: "220px",
                  }}
                >
                  <span className="text-2xl font-bold mb-1" style={{ color: "#F9E076" }}>
                    {stat.value}
                  </span>
                  <span className="text-sm whitespace-pre-line" style={{ color: "rgba(248,250,252,0.68)" }}>
                    {stat.label}
                  </span>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-base leading-loose mb-4" style={{ color: "rgba(248,250,252,0.68)", lineHeight: "1.75" }}>
                  {t.about.p1}
                </p>
                <p className="text-base" style={{ color: "rgba(248,250,252,0.68)" }}>
                  {t.about.p2}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ SERVICES ═══════════════════════════════════════════════════════ */}
        <section id="services" className="section-block section-block-alt">
          <div className="container mx-auto px-6 lg:px-12 xl:px-20 max-w-[1400px]">
            <Reveal>
              <SectionHeader title={t.servicesSection.title} subtitle={t.servicesSection.subtitle} />
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {services.map((service, i) => (
                <Reveal
                  key={service.title.ar}
                  delay={i * 70}
                  className="card-interactive group rounded-2xl p-6 flex flex-col gap-4 text-start h-full surface-card-elevated"
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:border-[rgba(212,175,55,0.45)] ${
                      dir === "rtl" ? "self-end" : "self-start"
                    }`}
                    style={{
                      border: "1px solid rgba(212,175,55,0.20)",
                      background: "rgba(212,175,55,0.10)",
                      color: "#D4AF37",
                      fontSize: "18px",
                    }}
                  >
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.title[lang]}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.68)" }}>
                      {service.description[lang]}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PORTFOLIO ══════════════════════════════════════════════════════ */}
        <section id="portfolio" className="section-block">
          <div className="container mx-auto px-6 lg:px-12 xl:px-20 max-w-[1400px]">
            <Reveal>
              <SectionHeader title={t.portfolio.title} subtitle={t.portfolio.subtitle} />
            </Reveal>

            <Reveal delay={60}>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-12" role="tablist" aria-label={t.portfolio.filterLabel}>
                {filterKeys.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    role="tab"
                    aria-selected={activeFilter === filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`filter-pill hover:scale-105 active:scale-95 ${activeFilter === filter ? "filter-pill-active" : ""}`}
                  >
                    {t.portfolio.filters[filter]}
                  </button>
                ))}
              </div>
            </Reveal>

            <div className="portfolio-grid">
              {filteredProjects.map((project, i) => (
                <Reveal key={project.id} delay={(i % 3) * 60} className="h-full">
                  <ProjectCard
                    title={project.title[lang]}
                    category={t.portfolio.categories[project.category]}
                    image={project.image}
                    linkLabel={project.linkLabel[lang]}
                    linkUrl={project.linkUrl}
                    viewDetails={t.portfolio.viewDetails}
                    linkHint={t.portfolio.linkHint}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CONTACT ════════════════════════════════════════════════════════ */}
        <section id="contact" className="section-block section-block-alt">
          <div className="container mx-auto px-6 lg:px-12 xl:px-20 max-w-[1400px]">
            <Reveal>
              <SectionHeader title={t.contact.title} subtitle={t.contact.subtitle} />
            </Reveal>

            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-20 items-center"
            >
              <Reveal className="w-full max-w-[503px] justify-self-center lg:justify-self-start mx-auto lg:mx-0" delay={80}>
                <form onSubmit={handleSubmit} className="contact-form-card">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-start" style={{ color: "rgba(248,250,252,0.68)" }}>
                      {t.contact.name}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="contact-field contact-field-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-start" style={{ color: "rgba(248,250,252,0.68)" }}>
                      {t.contact.email}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="contact-field contact-field-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-start" style={{ color: "rgba(248,250,252,0.68)" }}>
                      {t.contact.phone}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="contact-field contact-field-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-start" style={{ color: "rgba(248,250,252,0.68)" }}>
                      {t.contact.message}
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="contact-field contact-field-textarea"
                    />
                  </div>

                  <button type="submit" className="contact-submit" disabled={contactSubmitting}>
                    {contactSubmitting ? t.contact.submitting : t.contact.submit}
                  </button>
                </form>
              </Reveal>

              <Reveal className="relative w-full flex items-center justify-center min-h-[280px] lg:min-h-[420px]" delay={140}>
                <div className="contact-visual-glow pointer-events-none absolute inset-0 animate-glow-pulse" />
                <img
                  src="/contact-us.png"
                  alt={t.contact.imageAlt}
                  className="relative w-full max-w-[680px] object-contain animate-float"
                  loading="lazy"
                  decoding="async"
                />
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* ══ FOOTER ═════════════════════════════════════════════════════════ */}
      <footer
        className="relative mt-4 overflow-hidden"
        style={{
          borderTop: "1px solid rgba(212,175,55,0.22)",
          background: "linear-gradient(180deg, rgba(3,10,20,0.40) 0%, rgba(3,10,20,0.95) 45%, #02060d 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.55), transparent)" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[min(720px,90vw)] h-[280px] animate-glow-pulse"
          style={{
            background: "radial-gradient(70.71% 70.71% at 50% 0%, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.00) 72%)",
          }}
        />

        <div className="container mx-auto px-6 lg:px-12 xl:px-20 max-w-[1400px] relative pt-14 pb-8">
          <Reveal>
            <div
              className="rounded-2xl px-6 py-8 sm:px-8 sm:py-10 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-start surface-card-elevated backdrop-blur-sm"
            >
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: "#D4AF37" }}>
                  {t.footer.ctaEyebrow}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {t.footer.ctaTitle}
                </h3>
                <p className="text-sm max-w-md" style={{ color: "rgba(248,250,252,0.68)" }}>
                  {t.footer.ctaDesc}
                </p>
              </div>
              <a
                href="#contact"
                className="footer-cta btn-gold shrink-0 inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-semibold"
                style={{
                  background: "linear-gradient(117deg, #F9E076 0%, #C9A227 45%, #D4AF37 100%)",
                  color: "#0A0F18",
                  boxShadow: "0 10px 32px rgba(212,175,55,0.25)",
                }}
              >
                {t.footer.ctaButton}
              </a>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-10 xl:gap-8 mb-12">
            <Reveal className="xl:col-span-4" delay={60}>
              <a href="#home" className="inline-flex items-center gap-3 mb-5 transition-transform duration-200 hover:scale-[1.02]">
                <img src="/logo-only.png" alt="" className="w-12 h-12 object-contain" />
                <span className="text-xl font-bold gold-gradient-text">{t.brand}</span>
              </a>
              <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: "rgba(248,250,252,0.68)" }}>
                {t.footer.desc}
              </p>
              <a
                href="https://wa.me/201021288238"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-card w-full max-w-sm"
              >
                <span className="footer-contact-icon [&_svg]:w-[18px] [&_svg]:h-[18px] text-white">
                  <WhatsAppIcon />
                </span>
                <span className="text-start">
                  <span className="block text-xs mb-0.5" style={{ color: "rgba(248,250,252,0.55)" }}>
                    {t.footer.whatsapp}
                  </span>
                  <span className="block text-sm font-semibold text-white">{t.footer.whatsappAction}</span>
                </span>
              </a>
            </Reveal>

            <Reveal className="xl:col-span-2" delay={100}>
              <h4 className="text-sm font-bold text-white mb-4">{t.footer.quickLinks}</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="footer-link inline-block text-sm font-medium">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="xl:col-span-3" delay={140}>
              <h4 className="text-sm font-bold text-white mb-4">{t.footer.servicesTitle}</h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.title.ar}>
                    <a href="#services" className="footer-link inline-block text-sm font-medium">
                      {service.title[lang]}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="xl:col-span-3" delay={180}>
              <h4 className="text-sm font-bold text-white mb-4">{t.footer.contactTitle}</h4>
              <div className="space-y-3">
                <a href="mailto:bassma1company@gmail.com" className="footer-contact-card">
                  <span className="footer-contact-icon">
                    <MailIcon />
                  </span>
                  <span className="text-start min-w-0">
                    <span className="block text-xs mb-0.5" style={{ color: "rgba(248,250,252,0.55)" }}>
                      {t.footer.email}
                    </span>
                    <span className="block text-sm font-medium text-white truncate">
                      bassma1company@gmail.com
                    </span>
                  </span>
                </a>
                <a href="tel:+201021288238" className="footer-contact-card">
                  <span className="footer-contact-icon">
                    <PhoneIcon />
                  </span>
                  <span className="text-start">
                    <span className="block text-xs mb-0.5" style={{ color: "rgba(248,250,252,0.55)" }}>
                      {t.footer.phone}
                    </span>
                    <span className="block text-sm font-medium text-white" dir="ltr">
                      +20 10 21288238
                    </span>
                  </span>
                </a>
              </div>
            </Reveal>
          </div>

          <div
            className="pt-6 pb-24 sm:pb-10 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}
          >
            <p
              className="order-2 sm:order-1 text-sm text-center sm:text-start"
              style={{ color: "rgba(248,250,252,0.55)" }}
            >
              {t.footer.copyright}
            </p>
            <a
              href="#home"
              className="back-to-top order-1 sm:order-2 self-end sm:self-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              style={{
                color: "rgba(248,250,252,0.68)",
                border: "1px solid rgba(212,175,55,0.22)",
                background: "rgba(10,25,47,0.45)",
              }}
            >
              <ArrowUpIcon />
              {t.footer.backToTop}
            </a>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp Floating Button ── */}
      <a
        href="https://wa.me/201021288238"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-gold whatsapp-fab fixed bottom-8 z-50 flex items-center gap-2.5 rounded-full px-5 py-3 sm:px-6 sm:py-3.5 text-sm lg:text-base font-semibold"
        style={dir === "rtl" ? { left: "1.25rem" } : { right: "1.25rem" }}
        aria-label={t.footer.whatsappFabLabel}
      >
        <WhatsAppIcon className="w-6 h-6 shrink-0" />
        <span>{t.footer.whatsappFab}</span>
      </a>
    </div>
  );
}
