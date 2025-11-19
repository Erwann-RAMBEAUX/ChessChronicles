import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import i18n, { isSupported, replaceLangInPath, DEFAULT_LANG } from '../i18n';
import { ScrollToTop } from '../components/ScrollToTop';

export default function LanguageProvider() {
  const { lng } = useParams<{ lng: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (lng && isSupported(lng)) {
      if (i18n.language !== lng) {
        i18n.changeLanguage(lng);
      }
      return;
    }

    let targetLang = DEFAULT_LANG;

    const currentI18nLang = i18n.language;

    const cleanedLang = currentI18nLang?.split('-')[0];

    if (cleanedLang && isSupported(cleanedLang)) {
      targetLang = cleanedLang;
    } else {
      const browserLang = navigator.language?.split('-')[0];
      if (browserLang && isSupported(browserLang)) {
        targetLang = browserLang;
      }
    }

    const newPath = replaceLangInPath(location.pathname, targetLang);
    const fullPath = `${newPath}${location.search}`;

    navigate(fullPath, { replace: true });

  }, [lng, location.pathname, location.search, navigate]);

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}