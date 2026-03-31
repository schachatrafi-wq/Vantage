/**
 * Fetches the og:image / twitter:image from an article URL.
 * Returns null on any error or timeout.
 */
export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(2000), // 2s — we only need the <head>
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Vantage-NewsBot/1.0; +https://vantage.news)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })
    if (!res.ok) return null

    const reader = res.body?.getReader()
    if (!reader) return null

    let html = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
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
  const og1 = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>\s]+)["']/i)
  if (og1?.[1]) return decodeHtmlEntities(og1[1])

  const og2 = html.match(/<meta[^>]+content=["']([^"'>\s]+)["'][^>]+property=["']og:image["']/i)
  if (og2?.[1]) return decodeHtmlEntities(og2[1])

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
 * Fetches og:images for multiple URLs using a worker-pool pattern.
 * Unlike sequential batches, slots are filled immediately as work completes —
 * no waiting for the slowest URL in a batch before starting the next group.
 */
export async function batchFetchOgImages(
  urls: string[],
  concurrency = 40
): Promise<(string | null)[]> {
  const results: (string | null)[] = new Array(urls.length).fill(null)
  let cursor = 0

  async function worker() {
    while (cursor < urls.length) {
      const i = cursor++
      if (!urls[i]) continue // empty string = article already has an image, skip
      try {
        results[i] = await fetchOgImage(urls[i])
      } catch {
        results[i] = null
      }
    }
  }

  const poolSize = Math.min(concurrency, urls.filter(Boolean).length)
  if (poolSize > 0) {
    await Promise.all(Array.from({ length: poolSize }, worker))
  }

  return results
}
