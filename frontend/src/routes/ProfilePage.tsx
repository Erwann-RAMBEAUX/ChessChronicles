import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { GameList } from '../components/GameList'
import { FiltersPanel } from '../components/FiltersPanel'
import { ProfileSummary } from '../components/ProfileSummary'
import { SearchBar } from '../components/SearchBar'
import { useChessStore } from '../store'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { username: paramUsername } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { username: storeUsername, setUsername, error, loadGames, loading, abort } = useChessStore()
  const [hasInitialized, setHasInitialized] = useState(false)

  // Synchroniser le paramètre URL avec le store et charger les jeux
  useEffect(() => {
    if (paramUsername) {
      const decodedUsername = decodeURIComponent(paramUsername)
      if (storeUsername !== decodedUsername) {
        setUsername(decodedUsername)
      }
    }
    setHasInitialized(true)
  }, [paramUsername, storeUsername, setUsername])

  // Charger les jeux automatiquement quand l'username change
  useEffect(() => {
    if (storeUsername && storeUsername.trim() && hasInitialized) {
      loadGames()
    }
  }, [storeUsername, hasInitialized, loadGames])

  // Cleanup : arrêter les requêtes quand on quitte la page
  useEffect(() => {
    return () => {
      abort()
    }
  }, [abort])

  // Arrêter les requêtes si on navigue hors de la page profile
  useEffect(() => {
    if (!location.pathname.startsWith('/player')) {
      abort()
    }
  }, [location.pathname, abort])

  // Gérer la soumission de la SearchBar
  const handleSearchSubmit = (newUsername: string) => {
    if (newUsername.trim()) {
      // Mettre à jour l'URL sans rechargement complet
      navigate(`/player/${encodeURIComponent(newUsername.trim())}`, { replace: false })
      // Le useEffect ci-dessus détectera le changement d'URL et synchronisera le store
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-9 space-y-6">
          {/* SearchBar pour changer d'utilisateur */}
          <div className="card p-4">
            <SearchBar 
              compact 
              value={storeUsername} 
              onChange={handleSearchSubmit}
            />
          </div>

          <ProfileSummary />
          {error && (
            <div className="card border-red-500/40 text-red-200 bg-red-500/10 p-3">
              <div className="text-sm">{t(error)}</div>
            </div>
          )}
          <GameList />
        </section>
        <aside className="lg:col-span-3">
          <FiltersPanel />
        </aside>
      </main>
    </div>
  )
}
