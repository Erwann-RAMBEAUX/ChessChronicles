import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { withLang } from '../../i18n';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout';
import { SEO } from '../../components/SEO';
import { GameList } from '../../components/GameList';
import { FiltersPanel } from '../../components/FiltersPanel';
import { AdSense } from '../../components/AdSense';
const ProfileSummary = lazy(() =>
  import('../../components/ProfileSummary').then((m) => ({ default: m.ProfileSummary }))
);
import { SearchBar } from '../../components/SearchBar';
import { useChessStore } from '../../store';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { username: paramUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { username: storeUsername, setUsername, error, loadGames, abort } = useChessStore();
  const [hasInitialized, setHasInitialized] = useState(false);
  const decodedParamUsername = paramUsername ? decodeURIComponent(paramUsername) : undefined;

  useEffect(() => {
    if (paramUsername) {
      if (storeUsername !== decodedParamUsername) {
        setUsername(decodedParamUsername!);
      }
    }
    setHasInitialized(true);
  }, [paramUsername, storeUsername, setUsername]);
  useEffect(() => {
    if (storeUsername && storeUsername.trim() && hasInitialized) {
      loadGames();
    }
  }, [storeUsername, hasInitialized, loadGames]);

  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  useEffect(() => {
    if (!location.pathname.startsWith('/player')) {
      abort();
    }
  }, [location.pathname, abort]);

  const handleSearchSubmit = (newUsername: string) => {
    if (newUsername.trim()) {
      navigate(withLang(`/player/${encodeURIComponent(newUsername.trim())}`), { replace: false });
    }
  };

  return (
    <Layout>
      <SEO
        title={decodedParamUsername ? `${decodedParamUsername}` : t('search.profile')}
        description={decodedParamUsername ? t('seo.profile.description', { username: decodedParamUsername }) : t('home.subtitle')}
        type="profile"
      />
      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-9 space-y-6">
          <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-lg">
            <SearchBar compact value={storeUsername} onChange={handleSearchSubmit} />
          </div>

          <Suspense
            fallback={
              <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">{t('loading', 'Chargement...')}</div>
            }
          >
            <ProfileSummary />
          </Suspense>
          <div className="w-full flex justify-center">
            <div className="hidden sm:flex justify-center w-full">
              <div className="w-full max-w-[728px]">
                <AdSense
                  key={`desktop-${decodedParamUsername}`}
                  client="ca-pub-3159144477736312"
                  slot="6313839516"
                  style={{ width: 728, height: 90 }}
                  format={null}
                />
              </div>
            </div>
            <div className="flex sm:hidden justify-center w-full">
              <div className="w-full max-w-[320px]">
                <AdSense
                  key={`mobile-${decodedParamUsername}`}
                  client="ca-pub-3159144477736312"
                  slot="9006741021"
                  style={{ width: 320, height: 50 }}
                  format={null}
                />
              </div>
            </div>
          </div>
          <div className="block lg:hidden">
            <div className="mt-3 px-0">
              <FiltersPanel initiallyCollapsed={true} className="mx-4" />
            </div>
          </div>
          {error && storeUsername && decodedParamUsername && storeUsername === decodedParamUsername && (
            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 text-red-200 rounded-xl p-4">
              <div className="text-sm">{t(error)}</div>
            </div>
          )}
          <GameList />
        </section>
        <aside className="hidden lg:block lg:col-span-3">
          <FiltersPanel />
        </aside>
      </main>
    </Layout >
  );
}
