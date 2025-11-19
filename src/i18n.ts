import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

export const SUPPORTED_LANGS = ['fr', 'en', 'es', 'it', 'hi', 'ru', 'pt'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = 'en';

export const LANG_PREFIX_REGEX = new RegExp(`^/(${SUPPORTED_LANGS.join('|')})(?:/|$)`);

export function isSupported(lng: string | undefined | null): lng is SupportedLang {
  if (!lng) return false;
  return (SUPPORTED_LANGS as readonly string[]).includes(lng);
}

export function detectLangFromPath(pathname: string): SupportedLang | null {
  const m = pathname.match(LANG_PREFIX_REGEX);
  return m && isSupported(m[1]) ? (m[1] as SupportedLang) : null;
}


export function stripLangPrefix(pathname: string): string {
  if (!LANG_PREFIX_REGEX.test(pathname)) return pathname;

  const m = pathname.match(LANG_PREFIX_REGEX);
  if (!m) return pathname;

  const prefixLength = m[0].length;
  const cleanPath = pathname.slice(prefixLength);

  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
}

export function replaceLangInPath(pathname: string, lng: string): string {
  const cleanPath = stripLangPrefix(pathname);
  const normalized = cleanPath === '/' ? '' : cleanPath;
  return `/${lng}${normalized}`;
}


export function ensureLangPrefix(pathname: string, lng?: string): string {
  const lang = isSupported(lng) ? lng : DEFAULT_LANG;
  const p = pathname || '/';
  if (LANG_PREFIX_REGEX.test(p)) return p;
  const normalized = p.startsWith('/') ? p : `/${p}`;
  if (normalized === '/') return `/${lang}`;
  return `/${lang}${normalized}`;
}

export function withLang(path: string, lng?: string): string {
  const lang = isSupported(lng) ? lng : isSupported(i18n.language) ? i18n.language : DEFAULT_LANG;
  const p = path.startsWith('/') ? path : `/${path}`;
  if (LANG_PREFIX_REGEX.test(p)) return p;
  if (p === '/') return `/${lang}`;
  return `/${lang}${p}`;
}

function detectLanguage(): string {
  if (typeof window === 'undefined') return DEFAULT_LANG;

  try {
    const pathLang = detectLangFromPath(window.location.pathname);
    if (pathLang) return pathLang;

    const sp = new URLSearchParams(window.location.search);
    const urlLang = sp.get('lang') || sp.get('lng');
    if (urlLang && isSupported(urlLang)) {
      return urlLang;
    }

    const browserLang = navigator.language?.toLowerCase() || '';
    const langCode = browserLang.split('-')[0];

    if (isSupported(langCode)) {
      return langCode;
    }

    return DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

const chain = i18n.use(initReactI18next);

if (!isTest) {
  chain.use(HttpBackend);
}

chain.init({
  lng: isTest ? 'en' : detectLanguage(),
  fallbackLng: DEFAULT_LANG,
  supportedLngs: [...SUPPORTED_LANGS],
  interpolation: { escapeValue: false },
  backend: !isTest ? { loadPath: '/locales/{{lng}}/{{ns}}.json' } : undefined,
  debug: process.env.NODE_ENV === 'development',
  detection: {
    order: [],
    caches: []
  }
});

export default i18n;