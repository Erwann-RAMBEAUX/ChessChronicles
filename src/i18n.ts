import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// --- Constantes ---
export const SUPPORTED_LANGS = ['fr', 'en', 'es', 'it', 'hi', 'ru', 'pt'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = 'en';

export const LANG_PREFIX_REGEX = new RegExp(`^/(${SUPPORTED_LANGS.join('|')})(?:/|$)`);

// --- Fonctions Utilitaires (Restaurées) ---

export function isSupported(lng: string | undefined | null): lng is SupportedLang {
  if (!lng) return false;
  return (SUPPORTED_LANGS as readonly string[]).includes(lng);
}

/**
 * Détecte la langue présente dans le chemin URL (ex: /fr/about -> 'fr')
 */
export function detectLangFromPath(pathname: string): SupportedLang | null {
  const m = pathname.match(LANG_PREFIX_REGEX);
  return m && isSupported(m[1]) ? (m[1] as SupportedLang) : null;
}

/**
 * Retire le préfixe de langue de l'URL (ex: /fr/about -> /about)
 */
export function stripLangPrefix(pathname: string): string {
  if (!LANG_PREFIX_REGEX.test(pathname)) return pathname;

  const m = pathname.match(LANG_PREFIX_REGEX);
  if (!m) return pathname;

  const prefixLength = m[0].length;
  const cleanPath = pathname.slice(prefixLength);

  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
}

/**
 * Remplace ou ajoute une langue dans le chemin URL
 */
export function replaceLangInPath(pathname: string, lng: string): string {
  const cleanPath = stripLangPrefix(pathname);
  const normalized = cleanPath === '/' ? '' : cleanPath;
  return `/${lng}${normalized}`;
}

/**
 * S'assure qu'un chemin a un préfixe de langue (par défaut ou celui spécifié)
 */
export function ensureLangPrefix(pathname: string, lng?: string): string {
  const lang = isSupported(lng) ? lng : DEFAULT_LANG;
  const p = pathname || '/';
  if (LANG_PREFIX_REGEX.test(p)) return p;
  const normalized = p.startsWith('/') ? p : `/${p}`;
  if (normalized === '/') return `/${lang}`;
  return `/${lang}${normalized}`;
}

/**
 * Génère un lien avec la langue courante (utilisé dans vos composants UI)
 */
export function withLang(path: string, lng?: string): string {
  // On utilise la langue fournie, ou la langue actuelle de i18next, ou la langue par défaut
  const lang = isSupported(lng) ? lng : isSupported(i18n.language) ? i18n.language : DEFAULT_LANG;

  const p = path.startsWith('/') ? path : `/${path}`;

  // Si le chemin a déjà un préfixe valide, on ne touche à rien pour éviter /fr/fr/
  if (LANG_PREFIX_REGEX.test(p)) return p;

  if (p === '/') return `/${lang}`;
  return `/${lang}${p}`;
}

// --- Initialisation i18n ---

const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(HttpBackend)
  .init({
    // Pas de 'lng' ici pour laisser le détecteur travailler
    fallbackLng: DEFAULT_LANG,
    supportedLngs: [...SUPPORTED_LANGS],
    nonExplicitSupportedLngs: true,

    load: 'languageOnly',

    interpolation: { escapeValue: false },
    backend: !isTest ? { loadPath: '/locales/{{lng}}/{{ns}}.json' } : undefined,
    debug: process.env.NODE_ENV === 'development',

    detection: {
      order: ['path', 'localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupFromPathIndex: 0,
    }
  });

export default i18n;