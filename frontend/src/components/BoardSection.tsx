import React, { useEffect, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { PlayerBar } from './PlayerBar'
import type { PlayerMeta } from '../hooks/usePlayerAvatars'

interface BoardSectionProps {
  orientation: 'white' | 'black'
  chessFen: string
  lastMoveSquares: Record<string, any>
  topPlayer: PlayerMeta
  bottomPlayer: PlayerMeta
}

export const BoardSection: React.FC<BoardSectionProps> = ({ orientation, chessFen, lastMoveSquares, topPlayer, bottomPlayer }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const boardRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState(0)

  useEffect(() => {
    function compute() {
      if (!boardRef.current) return
      const rect = boardRef.current.getBoundingClientRect()
      // Calcule la taille maximale disponible
      const maxWidth = window.innerWidth * 0.95
      const maxHeight = window.innerHeight * 0.85 - 200 // Pour les barres de joueurs
      const availableSize = Math.min(maxWidth, maxHeight, 700) // Max 700px
      setSize(Math.floor(availableSize))
    }
    compute()
    const ro = new ResizeObserver(compute)
    if (boardRef.current) ro.observe(boardRef.current)
    window.addEventListener('resize', compute)
    return () => { ro.disconnect(); window.removeEventListener('resize', compute) }
  }, [])

  return (
    <div ref={ref} className="card p-4 space-y-3 w-fit">
      <div className="flex flex-col items-start gap-3">
        <PlayerBar
          player={topPlayer}
        />
        {/* Plateau sans bouton flip */}
        <div ref={boardRef} className="flex justify-start">
          <Chessboard
            position={chessFen}
            arePiecesDraggable={false}
            boardWidth={size || 300}
            boardOrientation={orientation}
            customSquareStyles={lastMoveSquares as any}
          />
        </div>
        <PlayerBar
          player={bottomPlayer}
        />
      </div>
    </div>
  )
}
