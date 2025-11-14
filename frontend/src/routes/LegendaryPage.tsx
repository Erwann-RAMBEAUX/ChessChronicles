import { Header } from '../components/Header'
import { useTranslation } from 'react-i18next'

export default function LegendaryPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="text-center space-y-4 py-20">
          <h1 className="text-3xl font-bold">{t('nav.legendary')}</h1>
          <p className="text-gray-400">{t('legendary.comingSoon', 'Cette section arrive très bientôt...')}</p>
        </div>
      </main>
    </div>
  )
}
