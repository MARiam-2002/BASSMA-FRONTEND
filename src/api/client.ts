const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json() as Promise<T>
}

/** Whether the API has Cloudinary + upload secret configured (for optional admin UIs). */
export async function getUploadStatus(): Promise<{ enabled: boolean; secretRequired: boolean }> {
  return fetchJson('/api/upload/status')
}

export type UploadImageResponse = {
  url: string
  publicId: string
  width?: number
  height?: number
}

/**
 * Upload a portfolio image to Cloudinary via the API.
 * If the server has `UPLOAD_SECRET` set, pass the same value; otherwise pass an empty string (omit header).
 */
export async function uploadPortfolioImage(
  file: File,
  uploadSecret: string,
): Promise<UploadImageResponse> {
  const form = new FormData()
  form.append('file', file)
  const headers: Record<string, string> = {}
  if (uploadSecret.trim()) headers['X-Upload-Secret'] = uploadSecret.trim()
  const res = await fetch(`${API_BASE}/api/upload/image`, {
    method: 'POST',
    headers,
    body: form,
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = text || res.statusText
    try {
      const j = JSON.parse(text) as { error?: string; message?: string }
      if (j.message || j.error) msg = j.message ?? j.error ?? msg
    } catch {
      /* plain text body */
    }
    throw new Error(msg)
  }
  return JSON.parse(text) as UploadImageResponse
}

export type ContactPayload = {
  name: string
  email: string
  phone?: string
  message: string
  lang?: 'ar' | 'en'
}

export type ProjectCategory = 'websites' | 'apps' | 'social'

export type ServiceCategory = 'branding' | 'websites' | 'apps' | 'social'

export type Project = {
  id: string
  category: ProjectCategory
  title: { ar: string; en: string }
  description: { ar: string; en: string }
  /** Main cover image URL */
  image?: string
  /** Additional image URLs (shown in project details) */
  gallery?: string[]
  tags?: string[]
  websiteUrl?: string
  appUrl?: string
  socialUrl?: string
}

export type CreateProjectPayload = {
  category: ProjectCategory
  title: { ar: string; en: string }
  description: { ar: string; en: string }
  image?: string
  gallery?: string[]
  tags?: string[]
  websiteUrl?: string
  appUrl?: string
  socialUrl?: string
}

export async function createProjectJson(payload: CreateProjectPayload): Promise<{ project: Project }> {
  return fetchJson<{ project: Project }>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Create a project with optional `cover` + `gallery` files (multipart).
 * Requires Cloudinary on the server. Field `data` is JSON matching CreateProjectPayload (URLs optional; files fill image/gallery).
 */
export async function createProjectMultipart(
  payload: CreateProjectPayload,
  files?: { cover?: File | null; gallery?: File[] },
): Promise<{ project: Project }> {
  const form = new FormData()
  form.append('data', JSON.stringify(payload))
  if (files?.cover) form.append('cover', files.cover)
  for (const f of files?.gallery ?? []) {
    form.append('gallery', f)
  }
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    body: form,
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = text || res.statusText
    try {
      const j = JSON.parse(text) as { error?: string; message?: string }
      if (j.message || j.error) msg = j.message ?? j.error ?? msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  return JSON.parse(text) as { project: Project }
}

export type ServiceItem = {
  id: string
  category: ServiceCategory
  title: { ar: string; en: string }
  description: { ar: string; en: string }
}
