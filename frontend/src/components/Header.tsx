import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguageSync } from '../hooks/useLanguageSync'

export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  useLanguageSync()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const handleGameNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // If we're already viewing a game (live or daily), dispatch reset event to clear it
    if (location.pathname.match(/\/(live|daily)\/game\//)) {
      window.dispatchEvent(new CustomEvent('resetGameForm'))
    } else {
      // Otherwise just navigate normally to /game
      navigate('/game')
    }
  }

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/player', label: t('nav.player') },
    { path: '/game', label: t('nav.game', 'Analyser une partie'), onClick: handleGameNavClick },
    { path: '/legendary', label: t('nav.legendary') },
  ]

  return (
    <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold hover:text-primary transition-colors">
          <img src="/favicon.ico" alt="ChessChronicles logo" className="h-8 w-8" />
          {t('app.title')}
        </Link>
        <nav className="ml-auto hidden md:flex gap-6 text-sm text-gray-300">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={item.onClick}
              className={`transition-colors ${
                isActive(item.path)
                  ? 'text-white font-medium'
                  : 'hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
