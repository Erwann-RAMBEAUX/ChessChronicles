import React, { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SlArrowLeft, SlArrowRight, SlControlStart, SlControlEnd, SlControlPlay, SlControlPause } from 'react-icons/sl'

interface MovesPanelProps {
  moves: string[]
  index: number
  setIndex: (n: number | ((i: number) => number)) => void
  loading: boolean
  error: string | null
  pgn?: string
  date?: string
  result?: string
  labels: {
    moves: string
    loading: string
    noMoves: string
    noPGN: string
  }
}

/**
 * Formate et traduit le résultat du jeu
 */
function formatGameResult(result?: string, t?: any): string | null | undefined {
  if (!result) return undefined
  
  const lower = result.toLowerCase()
  
  // Cas de victoires
  if (lower.includes('won')) {
    if (lower.includes('resignation')) {
      // Extraire le nom du gagnant
      const winner = result.split(' won')[0]
      return t ? `${winner} ${t('game.result.won_resignation')}` : result
    }
    if (lower.includes('checkmate')) {
      const winner = result.split(' won')[0]
      return t ? `${winner} ${t('game.result.won_checkmate')}` : result
    }
    if (lower.includes('timeout')) {
      const winner = result.split(' won')[0]
      return t ? `${winner} ${t('game.result.won_timeout')}` : result
    }
    // Autres victoires
    return result
  }
  
  // Cas de nullité
  if (lower.includes('draw')) {
    if (lower.includes('repetition')) {
      return t ? t('game.result.draw_repetition') : result
    }
    if (lower.includes('pat') || lower.includes('stalemate')) {
      return t ? t('game.result.draw_stalemate') : result
    }
    if (lower.includes('insufficient') || lower.includes('material')) {
      return t ? t('game.result.draw_material') : result
    }
    if (lower.includes('agreement')) {
      return t ? t('game.result.draw_agreement') : result
    }
    // Autres cas de draw
    return null
  }
  
  // En cours
  if (lower.includes('ongoing')) {
    return null
  }
  
  return result
}

/**
 * Extrait la pièce jouée d'un coup en notation algébrique
 * et retourne le symbole Unicode correspondant
 */
function getPieceSymbol(move: string, isWhite: boolean): string {
  if (!move) return ''
  
  // En notation algébrique standard:
  // - 0-0 ou 0-0-0 = roque (king)
  // - K = roi
  // - Q = dame
  // - R = tour
  // - B = fou
  // - N = cavalier
  // - Pas de préfixe = pion
  
  let piece = 'pawn' // Défaut
  const firstChar = move[0]
  
  // Détection du roque
  if (move.includes('0-0') || move.includes('O-O')) piece = 'king'
  else if (firstChar === 'K') piece = 'king'
  else if (firstChar === 'Q') piece = 'queen'
  else if (firstChar === 'R') piece = 'rook'
  else if (firstChar === 'B') piece = 'bishop'
  else if (firstChar === 'N') piece = 'knight'
  // Sinon c'est un pion (a-h suivi de numéro ou x ou =)
  
  // Symboles Unicode des pièces
  const symbols = {
    white: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
    black: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙',
    }
  }
  
  return symbols[isWhite ? 'white' : 'black'][piece as keyof typeof symbols.white]
}

export const MovesPanel: React.FC<MovesPanelProps> = ({ moves, index, setIndex, loading, error, pgn, date, result, labels }) => {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll vers le coup actif
  useEffect(() => {
    if (!scrollRef.current) return
    const activeElement = scrollRef.current.querySelector('[data-active="true"]')
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [index])

  // Gestion du play/pause avec auto-avancement toutes les 0.5s
  useEffect(() => {
    if (!isPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
      return
    }

    playIntervalRef.current = setInterval(() => {
      setIndex((i) => {
        if (i >= moves.length) {
          setIsPlaying(false)
          return moves.length
        }
        return i + 1
      })
    }, 1000)

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
    }
  }, [isPlaying, moves.length, setIndex])

  // Organiser les coups par paires (White, Black)
  const movePairs = []
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || null,
    })
  }

  return (
    <div className="card p-4 space-y-4 flex flex-col h-fit">
      {/* Info de la partie (résultat seulement) */}
      {result && formatGameResult(result, t) && (
        <div className="pb-3 border-b border-white/10">
          <p className="text-sm font-semibold text-white">{formatGameResult(result, t)}</p>
        </div>
      )}
      
      <div className="text-sm font-medium">{labels.moves}</div>
      
      {loading ? (
        <div className="text-sm text-gray-400">{labels.loading}</div>
      ) : moves.length === 0 ? (
        <div className="text-sm text-gray-400">{pgn ? labels.noMoves : labels.noPGN}</div>
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto max-h-[450px] scrollbar-thin"
        >
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead className="sticky top-0 bg-surface/80 backdrop-blur-sm border-b border-white/10">
              <tr>
                <th className="w-12 text-left px-2 py-2.5 text-gray-400 font-medium">#</th>
                <th className="flex-1 text-left px-2 py-2.5 text-gray-400 font-medium">White</th>
                <th className="flex-1 text-left px-2 py-2.5 text-gray-400 font-medium">Black</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {movePairs.map((pair) => {
                const whiteIndex = (pair.number - 1) * 2 + 1 // Indices des coups blancs (1-indexed)
                const blackIndex = pair.number * 2 // Indices des coups noirs (1-indexed)
                return (
                  <tr key={pair.number} className="hover:bg-white/5 transition-colors">
                    <td className="px-2 py-2 text-gray-500 font-mono">{pair.number}.</td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => setIndex(whiteIndex)}
                        data-active={index === whiteIndex}
                        className={`w-full text-left px-2 py-2 rounded font-mono transition-all flex items-center gap-2 ${
                          index === whiteIndex
                            ? 'bg-white/15 text-white border border-white/30 font-semibold'
                            : 'text-gray-300 hover:bg-white/10 hover:text-gray-100'
                        }`}
                      >
                        <span className="text-3xl leading-none">{getPieceSymbol(pair.white, true)}</span>
                        <span>{pair.white}</span>
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      {pair.black ? (
                        <button
                          onClick={() => setIndex(blackIndex)}
                          data-active={index === blackIndex}
                          className={`w-full text-left px-2 py-2 rounded font-mono transition-all flex items-center gap-2 ${
                            index === blackIndex
                              ? 'bg-white/15 text-white border border-white/30 font-semibold'
                              : 'text-gray-300 hover:bg-white/10 hover:text-gray-100'
                          }`}
                        >
                          <span className="text-3xl leading-none">{getPieceSymbol(pair.black, false)}</span>
                          <span>{pair.black}</span>
                        </button>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="pt-2 border-t border-white/5 space-y-3">
        {/* Boutons de navigation avec icônes modernes */}
        <div className="flex gap-3 justify-center items-center">
          {/* Premier coup */}
          <button
            onClick={() => setIndex(0)}
            disabled={index === 0 || moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
            title="Premier coup"
          >
            <SlControlStart className="w-5 h-5 text-white" />
          </button>

          {/* Coup précédent */}
          <button
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            disabled={index === 0 || moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
            title="Coup précédent"
          >
            <SlArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-primary/20 hover:bg-primary/30 disabled:opacity-40 disabled:hover:bg-primary/20 border border-primary/40 rounded transition-all"
            title={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? (
              <SlControlPause className="w-5 h-5 text-primary" />
            ) : (
              <SlControlPlay className="w-5 h-5 text-primary" />
            )}
          </button>

          {/* Coup suivant */}
          <button
            onClick={() => setIndex(i => Math.min(moves.length, i + 1))}
            disabled={index >= moves.length || moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
            title="Coup suivant"
          >
            <SlArrowRight className="w-5 h-5 text-white" />
          </button>

          {/* Dernier coup */}
          <button
            onClick={() => setIndex(moves.length)}
            disabled={index >= moves.length || moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
            title="Dernier coup"
          >
            <SlControlEnd className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {error && <div className="text-red-300 text-sm">{error}</div>}
    </div>
  )
}
