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

export type ContactPayload = {
  name: string
  email: string
  phone?: string
  message: string
  lang?: 'ar' | 'en'
}

export type ProjectCategory = 'branding' | 'websites' | 'apps' | 'social'

export type Project = {
  id: string
  category: ProjectCategory
  title: { ar: string; en: string }
  description: { ar: string; en: string }
  image?: string
  tags?: string[]
}

export type ServiceItem = {
  id: string
  category: ProjectCategory
  title: { ar: string; en: string }
  description: { ar: string; en: string }
}
