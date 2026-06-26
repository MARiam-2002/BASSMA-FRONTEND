import type { Project as ApiProject, ServiceItem } from "../api/client";
import type { ProjectCategory } from "../i18n/translations";

const SERVICE_ICONS: Record<string, string> = {
  social: "◎",
  apps: "○",
  websites: "◇",
  branding: "◆",
};

const SERVICE_ORDER = ["social", "apps", "websites", "branding"];

export type DisplayProject = {
  id: string;
  title: { ar: string; en: string };
  description?: { ar: string; en: string };
  category: ProjectCategory;
  image: string;
  gallery?: string[];
  tags?: string[];
  linkLabel: { ar: string; en: string };
  linkUrl?: string;
};

export type DisplayService = {
  icon: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  category: string;
};

export function mapApiCategory(category: string): ProjectCategory {
  if (category === "websites" || category === "branding") return "sites";
  if (category === "apps") return "apps";
  return "social";
}

function resolveProjectImage(project: ApiProject): string {
  if (project.image?.trim()) return project.image.trim();
  const firstGallery = project.gallery?.find((url) => url.trim());
  return firstGallery?.trim() ?? "";
}

function resolveAppLinkLabel(url: string): { ar: string; en: string } {
  const lower = url.toLowerCase();
  if (lower.includes("play.google.com")) {
    return { ar: "Google Play", en: "Google Play" };
  }
  if (lower.includes("apps.apple.com") || lower.includes("itunes.apple.com")) {
    return { ar: "App Store", en: "App Store" };
  }
  return { ar: "التطبيق", en: "App" };
}

function resolveSocialLinkLabel(url: string): { ar: string; en: string } {
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) {
    return { ar: "Instagram", en: "Instagram" };
  }
  if (lower.includes("facebook.com")) {
    return { ar: "Facebook", en: "Facebook" };
  }
  return { ar: "سوشيال", en: "Social" };
}

export function toDisplayProject(project: ApiProject): DisplayProject {
  const category = mapApiCategory(project.category);
  const websiteUrl = project.websiteUrl?.trim() || undefined;
  const appUrl = project.appUrl?.trim() || undefined;
  const socialUrl = project.socialUrl?.trim() || undefined;

  let linkUrl: string | undefined;
  let linkLabel = { ar: "الموقع", en: "Website" };

  if (project.category === "apps") {
    linkLabel = { ar: "التطبيق", en: "App" };
    linkUrl = appUrl ?? websiteUrl;
    if (linkUrl === appUrl && appUrl) {
      linkLabel = resolveAppLinkLabel(appUrl);
    } else if (linkUrl === websiteUrl && websiteUrl) {
      linkLabel = { ar: "الموقع", en: "Website" };
    }
  } else if (project.category === "social") {
    linkLabel = { ar: "سوشيال", en: "Social" };
    linkUrl = socialUrl ?? websiteUrl;
    if (linkUrl === socialUrl && socialUrl) {
      linkLabel = resolveSocialLinkLabel(socialUrl);
    }
  } else {
    linkUrl = websiteUrl ?? appUrl;
    if (linkUrl === appUrl && appUrl) {
      linkLabel = resolveAppLinkLabel(appUrl);
    }
  }

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    category,
    image: resolveProjectImage(project),
    gallery: project.gallery,
    tags: project.tags,
    linkLabel,
    linkUrl,
  };
}

export function toDisplayService(service: ServiceItem): DisplayService {
  return {
    icon: SERVICE_ICONS[service.category] ?? "◆",
    title: service.title,
    description: service.description,
    category: service.category,
  };
}

export function sortServices<T extends { category: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => SERVICE_ORDER.indexOf(a.category) - SERVICE_ORDER.indexOf(b.category),
  );
}
