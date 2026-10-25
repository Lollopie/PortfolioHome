// Builds the English and German home pages from one template and two text files, so the two
// languages can't drift apart. Render runs this as the static site's build command.
// Usage: node build.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const template = readFileSync('src/template.html', 'utf8')

const pages = [
  { lang: 'en', path: '/', out: 'public/index.html', alt: 'de', altPath: '/de/' },
  { lang: 'de', path: '/de/', out: 'public/de/index.html', alt: 'en', altPath: '/' },
]

const texts = Object.fromEntries(pages.map(({ lang }) => [lang, JSON.parse(readFileSync(`i18n/${lang}.json`, 'utf8'))]))

// Flattens {"a": {"b": "x"}} into {"a.b": "x"}. Arrays are leaves and become list items.
function flatten(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]],
  )
}

const keysOf = (lang) => flatten(texts[lang]).map(([key]) => key).sort()
const [first, ...others] = pages.map(({ lang }) => lang)
for (const lang of others) {
  const missing = keysOf(first).filter((key) => !keysOf(lang).includes(key))
  const extra = keysOf(lang).filter((key) => !keysOf(first).includes(key))
  if (missing.length || extra.length) {
    throw new Error(`i18n/${lang}.json differs from i18n/${first}.json: missing [${missing}], extra [${extra}]`)
  }
}

for (const page of pages) {
  const t = Object.fromEntries(flatten(texts[page.lang]))
  const cvFile = `cv/cv-${page.lang}-public.pdf`
  // The CV button only appears once the PDF is in public/cv/, so the page never links to a missing file.
  const cvButton = existsSync(`public/${cvFile}`)
    ? `<a class="button" href="/${cvFile}" download>${t['hero.downloadCv']}</a>`
    : ''

  const values = { ...t, lang: page.lang, path: page.path, altLang: page.alt, altPath: page.altPath, cvButton }

  // Text values are written by hand in i18n/*.json and may contain inline HTML on purpose.
  const html = template.replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`src/template.html uses {{${key}}}, which i18n/${page.lang}.json lacks`)
    const value = values[key]
    return Array.isArray(value) ? value.map((item) => `<li>${item}</li>`).join('') : value
  })

  mkdirSync(page.out.slice(0, page.out.lastIndexOf('/')), { recursive: true })
  writeFileSync(page.out, html)
  console.log(`Wrote ${page.out}`)
}
