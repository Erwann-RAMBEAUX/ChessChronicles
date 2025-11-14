import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

/**
 * Détecte la langue préférée de l'utilisateur:
 * 1. D'abord vérifie le paramètre ?lang=fr dans l'URL
 * 2. Puis détecte la langue du navigateur (navigator.language)
 * 3. Si la langue détectée est FR ou EN, l'utilise
 * 4. Sinon par défaut c'est EN (pour internationalisation)
 */
function detectLanguage(): string {
  try {
    // 1. Vérifier l'URL en premier
    const sp = new URLSearchParams(window.location.search)
    const urlLang = sp.get('lang') || sp.get('lng')
    if (urlLang && ['fr', 'en'].includes(urlLang)) {
      return urlLang
    }

    // 2. Détecter la langue du navigateur
    const browserLang = navigator.language?.toLowerCase() || ''
    // navigator.language peut être 'fr-FR', 'en-US', etc.
    const langCode = browserLang.split('-')[0]

    if (langCode === 'fr') return 'fr'
    if (langCode === 'en') return 'en'

    // 3. Par défaut EN (meilleure internationalisation)
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
    // //TODO: Remove caches once the app is finished - We only want URL param + browser detection
    caches: [],
  } : undefined,
  backend: !isTest ? { loadPath: '/locales/{{lng}}/{{ns}}.json' } : undefined
})

export default i18n
