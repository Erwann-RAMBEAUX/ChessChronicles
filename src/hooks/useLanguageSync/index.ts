import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import i18n from '../../i18n';
import { detectLangFromPath, isSupported, DEFAULT_LANG, replaceLangInPath } from '../../i18n';

/**
 * Hook to keep the language parameter in sync with the URL
 * Supports URL-based language switching via lang parameter
 */
export function useLanguageSync() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlLang = detectLangFromPath(location.pathname);

    if (urlLang && urlLang !== i18n.language) {
      i18n.changeLanguage(urlLang);
    }

    if (!urlLang) {
      const target = isSupported(i18n.language) ? i18n.language : DEFAULT_LANG;
      navigate(`/${target}${location.pathname}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  const changeLanguage = (lng: string) => {
    if (!lng) return;
    i18n.changeLanguage(lng);
    const newPath = replaceLangInPath(location.pathname, lng);
    navigate(newPath, { replace: true });
  };

  return { changeLanguage };
}
