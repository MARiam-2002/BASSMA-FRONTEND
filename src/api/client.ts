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
export async function getUploadStatus(): Promise<{ enabled: boolean }> {
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
 * Pass the same secret as server `UPLOAD_SECRET` — never hard-code this in public production builds.
 */
export async function uploadPortfolioImage(
  file: File,
  uploadSecret: string,
): Promise<UploadImageResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/api/upload/image`, {
    method: 'POST',
    headers: { 'X-Upload-Secret': uploadSecret },
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
  image?: string
  tags?: string[]
  websiteUrl?: string
  appUrl?: string
  socialUrl?: string
}

export type ServiceItem = {
  id: string
  category: ServiceCategory
  title: { ar: string; en: string }
  description: { ar: string; en: string }
}
