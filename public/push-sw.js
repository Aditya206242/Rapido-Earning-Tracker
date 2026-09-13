// Custom push-notification handling, imported into the Workbox-generated
// service worker via `workbox.importScripts` in vite.config.ts. Kept as a
// separate plain file so it survives every `vite-plugin-pwa` rebuild of
// sw.js untouched — the generated file's precaching/update logic is not
// modified by this.

self.addEventListener('push', (event) => {
  let payload = { title: 'ProfitGo Reminder 💰', body: "Add today's earnings & expenses", url: '/dashboard' }
  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() }
    } catch {
      payload.body = event.data.text() || payload.body
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url || '/dashboard' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.navigate(targetUrl).then(() => client.focus())
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    }),
  )
})
