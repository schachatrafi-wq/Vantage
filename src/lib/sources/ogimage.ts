/**
 * Fetches the og:image / twitter:image from an article URL.
 * Returns null on any error or timeout.
 */
export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Vantage-NewsBot/1.0; +https://vantage.news)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })
    if (!res.ok) return null

    // Only parse as much HTML as we need — images are always in <head>
    const reader = res.body?.getReader()
    if (!reader) return null

    let html = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
      // Stop once we've passed </head> — no point reading the full body
      if (html.includes('</head>') || html.length > 30_000) {
        reader.cancel()
        break
      }
    }

    return extractImageFromHtml(html)
  } catch {
    return null
  }
}

function extractImageFromHtml(html: string): string | null {
  // og:image (two attribute orderings)
  const og1 = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>\s]+)["']/i)
  if (og1?.[1]) return decodeHtmlEntities(og1[1])

  const og2 = html.match(/<meta[^>]+content=["']([^"'>\s]+)["'][^>]+property=["']og:image["']/i)
  if (og2?.[1]) return decodeHtmlEntities(og2[1])

  // twitter:image
  const tw1 = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"'>\s]+)["']/i)
  if (tw1?.[1]) return decodeHtmlEntities(tw1[1])

  const tw2 = html.match(/<meta[^>]+content=["']([^"'>\s]+)["'][^>]+name=["']twitter:image["']/i)
  if (tw2?.[1]) return decodeHtmlEntities(tw2[1])

  return null
}

function decodeHtmlEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

/**
 * Batch-fetches og:images for multiple URLs with bounded concurrency.
 */
export async function batchFetchOgImages(
  urls: string[],
  concurrency = 20
): Promise<(string | null)[]> {
  const results: (string | null)[] = new Array(urls.length).fill(null)

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency)
    const settled = await Promise.allSettled(batch.map((url) => fetchOgImage(url)))
    for (let j = 0; j < settled.length; j++) {
      const r = settled[j]
      results[i + j] = r.status === 'fulfilled' ? r.value : null
    }
  }

  return results
}
