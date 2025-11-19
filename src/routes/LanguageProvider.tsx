import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import i18n from '../i18n';
import { isSupported, DEFAULT_LANG, stripLangPrefix } from '../i18n';
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

    const targetLang = isSupported(i18n.language) ? i18n.language : DEFAULT_LANG;

    const pathAfterPrefix = (() => {
      const p = location.pathname || '/';
      const detected = stripLangPrefix(p) !== p ? stripLangPrefix(p) : null;
      if (detected !== null) return detected || '/';

      const withoutFirst = p.replace(/^\/[^/]+/, '');
      return withoutFirst === '' ? '/' : withoutFirst;
    })();

    const search = location.search || '';
    const target = `${'/'}${targetLang}${pathAfterPrefix}${search}`;
    navigate(target, { replace: true });
  }, [lng, location.pathname, location.search, navigate]);

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}