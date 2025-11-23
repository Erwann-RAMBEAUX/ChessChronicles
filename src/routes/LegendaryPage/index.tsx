import { Layout } from '../../components/Layout';
import { SEO } from '../../components/SEO';
import { useTranslation } from 'react-i18next';

export default function LegendaryPage() {
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      <SEO
        title={t('nav.legendary')}
        description={t('home.features.masterGames.desc')}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: t('nav.home'),
              item: `https://chesschronicles.com/${i18n.language}`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: t('nav.legendary'),
              item: `https://chesschronicles.com/${i18n.language}/legendary`,
            },
          ],
        }}
      />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="text-center space-y-4 py-20 bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-3xl p-12 shadow-lg max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white">{t('nav.legendary')}</h1>
          <p className="text-slate-400">
            {t('legendary.comingSoon', 'Cette section arrive très bientôt...')}
          </p>
        </div>
      </main>
    </Layout>
  );
}
