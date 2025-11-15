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

  // Synchronize URL parameter with store and load games
  useEffect(() => {
    if (paramUsername) {
      const decodedUsername = decodeURIComponent(paramUsername)
      if (storeUsername !== decodedUsername) {
        setUsername(decodedUsername)
      }
    }
    setHasInitialized(true)
  }, [paramUsername, storeUsername, setUsername])

  // Load games automatically when username changes
  useEffect(() => {
    if (storeUsername && storeUsername.trim() && hasInitialized) {
      loadGames()
    }
  }, [storeUsername, hasInitialized, loadGames])

  // Cleanup: stop requests when leaving page
  useEffect(() => {
    return () => {
      abort()
    }
  }, [abort])

  // Stop requests if navigating outside profile page
  useEffect(() => {
    if (!location.pathname.startsWith('/player')) {
      abort()
    }
  }, [location.pathname, abort])

  // Handle SearchBar submission
  const handleSearchSubmit = (newUsername: string) => {
    if (newUsername.trim()) {
      // Update URL without full reload
      navigate(`/player/${encodeURIComponent(newUsername.trim())}`, { replace: false })
      // The useEffect above will detect URL change and synchronize store
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
