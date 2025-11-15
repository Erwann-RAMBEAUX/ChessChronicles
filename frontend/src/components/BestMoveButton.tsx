import React from 'react'
import { useTranslation } from 'react-i18next'
import { GiLightBulb } from 'react-icons/gi'

interface BestMoveButtonProps {
  bestMove: string | null
  isVisible: boolean
  onClick?: () => void
}

/**
 * Displays a button showing the best move suggestion
 * Appears next to the player who just moved
 */
export function BestMoveButton({ bestMove, isVisible, onClick }: BestMoveButtonProps) {
  const { t } = useTranslation()

  if (!isVisible || !bestMove) {
    return null
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/50 hover:border-amber-600 rounded transition-all text-sm font-semibold text-amber-300 hover:text-amber-200"
      title={t('game.bestMove', 'Best Move')}
    >
      <GiLightBulb className="w-4 h-4" />
      <span>{bestMove}</span>
    </button>
  )
}
