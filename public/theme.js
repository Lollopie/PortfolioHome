// Runs in <head> before the first paint. Without a saved choice the page follows the system
// setting through prefers-color-scheme; the toggle saves an explicit light or dark choice.
const THEME_KEY = 'theme'

function savedTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}

function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme
}

applyTheme(savedTheme())

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme
    const isDark = current ? current === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
    const next = isDark ? 'light' : 'dark'
    applyTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Storage can be blocked (private mode); the choice then lasts for this page view only.
    }
  })
})
