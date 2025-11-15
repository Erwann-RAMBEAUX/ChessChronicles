import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      navigate(`/player/${encodeURIComponent(username.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-20">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            {t('app.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            {t('home.subtitle', 'Analysez vos parties d\'échecs de Chess.com')}
          </p>

          {/* Formulaire de recherche */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input w-full sm:max-w-xs"
              autoFocus
            />
            <button
              type="submit"
              disabled={!username.trim()}
              className="btn-primary px-6 font-semibold disabled:opacity-40"
            >
              {t('home.button', 'Analyser')}
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Feature 1: Personal Analysis */}
          <div className="card p-8 space-y-4">
            <div className="text-4xl">🔍</div>
            <h2 className="text-2xl font-bold">{t('home.feature1.title', 'Analysez vos parties')}</h2>
            <p className="text-gray-400">
              {t('home.feature1.desc', 'Entrez votre nom d\'utilisateur Chess.com pour visualiser toutes vos parties. Naviguez à travers chaque coup, consultez vos statistiques et identifiez les moments clés.')}
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ {t('home.feature1.item1', 'Tous vos archives de parties')}</li>
              <li>✓ {t('home.feature1.item2', 'Filtrage par mode, couleur, résultat')}</li>
              <li>✓ {t('home.feature1.item3', 'Visualisation interactive du plateau')}</li>
              <li>✓ {t('home.feature1.item4', 'Navigation coups par coups')}</li>
            </ul>
          </div>

          {/* Feature 2: Master Games Gallery */}
          <div className="card p-8 space-y-4">
            <div className="text-4xl">👑</div>
            <h2 className="text-2xl font-bold">{t('home.feature2.title', 'Parties des Maîtres')}</h2>
            <p className="text-gray-400">
              {t('home.feature2.desc', 'Explorez une galerie des plus grandes parties d\'échecs de tous les temps. Analysez les stratégies des meilleurs joueurs du monde.')}
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ {t('home.feature2.item1', 'Parties historiques célèbres')}</li>
              <li>✓ {t('home.feature2.item2', 'Parties récentes de top joueurs')}</li>
              <li>✓ {t('home.feature2.item3', 'Catégorisées par type et niveau')}</li>
              <li>✓ {t('home.feature2.item4', 'Découvrez les plus belles combinaisons')}</li>
            </ul>
          </div>
        </div>

        {/* Engine Analysis Teaser */}
        <div className="card bg-gradient-to-r from-primary/10 to-blue-500/10 p-8 mb-20 border border-primary/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t('home.engine.title', 'Analyse Stockfish')}</h2>
              <p className="text-gray-300">
                {t('home.engine.desc', 'Bientôt disponible - Analysez vos erreurs avec Stockfish et obtenez des recommandations pour améliorer votre jeu.')}
              </p>
              <div className="inline-block px-4 py-1 bg-primary/20 text-primary text-sm rounded">
                {t('home.engine.badge', 'En développement')}
              </div>
            </div>
            <div className="text-center text-5xl">⚙️</div>
          </div>
        </div>

        {/* How it Works */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.howItWorks', 'Comment ça marche')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center space-y-4">
              <div className="inline-block w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">1</div>
              <h3 className="font-semibold">{t('home.step1.title', 'Entrez un username')}</h3>
              <p className="text-sm text-gray-400">
                {t('home.step1.desc', 'Tapez votre nom d\'utilisateur Chess.com')}
              </p>
            </div>
            <div className="card p-6 text-center space-y-4">
              <div className="inline-block w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">2</div>
              <h3 className="font-semibold">{t('home.step2.title', 'Explorez vos parties')}</h3>
              <p className="text-sm text-gray-400">
                {t('home.step2.desc', 'Filtrez et parcourez votre historique complet')}
              </p>
            </div>
            <div className="card p-6 text-center space-y-4">
              <div className="inline-block w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">3</div>
              <h3 className="font-semibold">{t('home.step3.title', 'Analysez en détail')}</h3>
              <p className="text-sm text-gray-400">
                {t('home.step3.desc', 'Visualisez chaque coup et progressez')}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-400">
          <p>{t('home.footer', '© 2025 ChessChronicles - Analysez votre jeu d\'échecs')}</p>
        </div>
      </footer>
    </div>
  )
}
