import React from 'react'
import { useNavigate } from 'react-router-dom'
import pawnSvg from '../assets/pawn.svg'
import type { PlayerMeta } from '../hooks/usePlayerAvatars'

interface PlayerBarProps {
  player: PlayerMeta
}

export const PlayerBar: React.FC<PlayerBarProps> = ({ player}) => {
  const navigate = useNavigate()
  const rating = player.rating
  
  const handleClick = () => {
    if (player.username) {
      navigate(`/player/${encodeURIComponent(player.username)}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`font-semibold flex items-center gap-3 text-gray-100 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 px-3 py-2 rounded-lg transition-colors`}
    >
      <img
        src={player.avatar || pawnSvg}
        alt={player.username}
        className="w-8 h-8 rounded-full object-cover bg-black/30 flex-shrink-0"
        loading="lazy"
      />
      <div className="min-w-0">
        <p className="text-sm text-white truncate">
          {player.username || 'Player'}
        </p>
        {typeof rating === 'number' && (
          <p className="text-xs text-primary/80">
            {rating}
          </p>
        )}
      </div>
    </button>
  )
}
