import type { SupabaseClient } from '@supabase/supabase-js'

type WithUrl = { url: string }

export async function filterNewArticles<T extends WithUrl>(
  supabase: SupabaseClient,
  items: T[]
): Promise<T[]> {
  if (items.length === 0) return []

  const urls = items.map((i) => normalizeUrl(i.url))

  const { data: existing } = await supabase
    .from('articles')
    .select('url')
    .in('url', urls)

  const existingUrls = new Set((existing ?? []).map((r: { url: string }) => r.url))

  const seen = new Set<string>()
  return items.filter((item) => {
    const url = normalizeUrl(item.url)
    if (existingUrls.has(url) || seen.has(url)) return false
    seen.add(url)
    return true
  })
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hash = ''
    u.searchParams.delete('utm_source')
    u.searchParams.delete('utm_medium')
    u.searchParams.delete('utm_campaign')
    u.searchParams.delete('utm_content')
    u.searchParams.delete('utm_term')
    return u.toString().replace(/\/$/, '')
  } catch {
    return url
  }
}
