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

export function toDisplayProject(project: ApiProject): DisplayProject {
  const category = mapApiCategory(project.category);
  let linkUrl: string | undefined;
  let linkLabel = { ar: "الموقع", en: "Website" };

  if (project.websiteUrl?.trim()) {
    linkUrl = project.websiteUrl.trim();
  } else if (project.appUrl?.trim()) {
    linkUrl = project.appUrl.trim();
    linkLabel = { ar: "التطبيق", en: "App" };
  } else if (project.socialUrl?.trim()) {
    linkUrl = project.socialUrl.trim();
    linkLabel = { ar: "سوشيال", en: "Social" };
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
