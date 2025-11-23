import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { withLang } from '../../i18n';
import { Layout } from '../../components/Layout';
import { SEO } from '../../components/SEO';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <SEO
        title={t('notFound.title', 'Page non trouvée')}
        description={t('notFound.desc', "Désolé, la page que vous recherchez n'existe pas.")}
      />
      <main className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center space-y-6 py-20">
          <div className="text-6xl font-bold text-primary">404</div>
          <h1 className="text-4xl font-bold">{t('notFound.title', 'Page non trouvée')}</h1>
          <p className="text-gray-400 text-lg">
            {t(
              'notFound.desc',
              "Désolé, la page que vous recherchez n'existe pas ou a été déplacée."
            )}
          </p>
          <Link
            to={withLang('/')}
            className="inline-block btn-primary px-8 py-3 font-semibold transition-all hover:scale-105"
          >
            {t('notFound.backHome', "Retour à l'accueil")}
          </Link>
        </div>
      </main>
    </Layout>
  );
}
