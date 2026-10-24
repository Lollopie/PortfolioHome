// Pings each app's health endpoint as soon as the page loads. On the free tier this starts waking
// sleeping services while the visitor reads, and the status badge shows when each one is ready.
const WAKE_UP_TIMEOUT_MS = 90_000
const RETRY_DELAY_MS = 5_000

const labels = { checking: 'Checking…', waking: 'Waking up…', online: 'Online', offline: 'Unavailable' }

function setState(badge, state) {
  badge.dataset.state = state
  badge.querySelector('.label').textContent = labels[state]
}

async function isUp(url) {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    // While a service starts, the host can answer with an HTML placeholder page instead of the app.
    return response.ok && (response.headers.get('Content-Type') ?? '').includes('json')
  } catch {
    return false
  }
}

async function watch(badge) {
  const deadline = Date.now() + WAKE_UP_TIMEOUT_MS
  if (await isUp(badge.dataset.health)) return setState(badge, 'online')
  setState(badge, 'waking')
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    if (await isUp(badge.dataset.health)) return setState(badge, 'online')
  }
  setState(badge, 'offline')
}

document.querySelectorAll('[data-health]').forEach(watch)
