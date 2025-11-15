import type { Game } from '../types'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

/**
 * Display a single game as a card with key information:
 * - date & time
 * - opponent username and rating
 * - user's color and result
 * - user's Elo at game time
 * - link to the full game on Chess.com
 */
export function GameCard({ game }: { game: Game }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const d = game.endDate
  const date = d.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fr-FR')
  const time = d.toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
  const myRating = game[game.userColor].rating
  // Validate external URL is a secure chess.com link
  // (Secure URL can be calculated later if needed)
  // Try to extract an id from the chess.com URL (live or daily)
  const gameId = (() => {
    try {
      const u = new URL(game.url)
      const parts = u.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex(p => p === 'game')
      if (idx >= 0 && parts[idx + 2]) return parts[idx + 2] // e.g., /game/live/123
      // fallback to uuid if provided
      if (game.uuid) return game.uuid
    } catch {}
    // fallback hash based id
    return encodeURIComponent(game.id)
  })()
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">{t('card.date')}: {date}</div>
        <div className="text-xs text-gray-400">{t('card.time')}: {time}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-5xl">{game.userColor === 'white' ? '♞': '♘' }</div>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/player/${game.opponent.username}`)}
            className="block w-full text-left font-medium truncate text-white hover:text-gray-300 hover:underline transition-colors"
          >
            {game.opponent.username} {game.opponent.rating ? `(${game.opponent.rating})` : ''}
          </button>
          <div className="text-sm text-gray-400">{t('card.type')}: {game.time_class}</div>
        </div>
        <div className={`ml-auto px-2 py-1 rounded text-xs ${game.resultForUser==='win'?'bg-green-500/20 text-green-300': game.resultForUser==='loss'?'bg-red-500/20 text-red-300':'bg-yellow-500/20 text-yellow-300'}`}>{game.resultForUser}</div>
      </div>
      <div className="text-sm text-gray-300">{t('card.myElo')}: {typeof myRating === 'number' ? myRating : '—'}</div>
      <div className="flex gap-2">
        <button
          className="btn-ghost"
          onClick={() => {
            navigate(`/${game.gameType}/game/${gameId}`, {
              state: {
                username: game.userColor === 'white' ? game.white.username : game.black.username,
                white: { username: game.white.username, rating: game.white.rating },
                black: { username: game.black.username, rating: game.black.rating }
              }
            })
          }}
        >
          {t('card.view')}
        </button>
        <button
          className="btn-ghost"
          onClick={() => {
            navigate(`/${game.gameType}/game/${gameId}`, {
              state: {
                username: game.userColor === 'white' ? game.white.username : game.black.username,
                analyze: true,
                white: { username: game.white.username, rating: game.white.rating },
                black: { username: game.black.username, rating: game.black.rating }
              }
            })
          }}
        >
          {t('card.analyze', 'Analyser')}
        </button>
      </div>
    </div>
  )
}
