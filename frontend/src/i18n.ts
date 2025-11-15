import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

/**
 * Detects user's preferred language:
 * 1. First checks ?lang=fr parameter in URL
 * 2. Then detects browser language (navigator.language)
 * 3. If detected language is FR or EN, uses it
 * 4. Otherwise defaults to EN (for better internationalization)
 */
function detectLanguage(): string {
  try {
    // 1. Check URL first
    const sp = new URLSearchParams(window.location.search)
    const urlLang = sp.get('lang') || sp.get('lng')
    if (urlLang && ['fr', 'en'].includes(urlLang)) {
      return urlLang
    }

    // 2. Detect browser language
    const browserLang = navigator.language?.toLowerCase() || ''
    // navigator.language can be 'fr-FR', 'en-US', etc.
    const langCode = browserLang.split('-')[0]

    if (langCode === 'fr') return 'fr'
    if (langCode === 'en') return 'en'

    // 3. Default to EN (better internationalization)
    return 'en'
  } catch {
    return 'en'
  }
}

const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test'

const chain = i18n
  .use(initReactI18next)

if (!isTest) {
  // Only use network/backends and detection outside tests
  chain.use(HttpBackend).use(LanguageDetector)
}

chain.init({
  lng: isTest ? 'en' : detectLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['fr','en'],
  interpolation: { escapeValue: false },
  detection: !isTest ? {
    lookupQuerystring: 'lang',
    order: ['querystring', 'navigator'],
    caches: [],
  } : undefined,
  backend: !isTest ? { loadPath: '/locales/{{lng}}/{{ns}}.json' } : undefined
})

export default i18n
