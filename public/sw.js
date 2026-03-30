self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Vantage', body: event.data.text() }
  }

  const options = {
    body: data.body ?? '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: data.data ?? {},
    requireInteraction: data.data?.type !== 'digest',
    tag: data.data?.articleId ?? data.data?.type ?? 'vantage',
  }

  event.waitUntil(self.registration.showNotification(data.title ?? 'Vantage', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const articleId = event.notification.data?.articleId
  const url = articleId ? `/dashboard?article=${articleId}` : '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
