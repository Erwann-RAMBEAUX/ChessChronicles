import { useEffect, useMemo, useState, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SlLoop } from 'react-icons/sl'
import { BiSearch } from 'react-icons/bi'
import { Header } from '../components/Header'
import { BoardSection } from '../components/BoardSection'
import { MovesPanel } from '../components/MovesPanel'
import { GameFallback } from '../components/GameFallback'
import { EvaluationBar } from '../components/EvaluationBar'
import { useGameData } from '../hooks/useGameData'
import { usePlayerAvatars } from '../hooks/usePlayerAvatars'
import { useAnalysis } from '../hooks/useAnalysis'

type NavState = {
  username?: string
  analyze?: boolean
  white?: { username: string; rating?: number }
  black?: { username: string; rating?: number }
}

export default function GamePage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  
  const pathname = location.pathname
  const gameType = pathname.startsWith('/live/') ? 'live' : 'daily'
  
  const state = (location.state || {}) as NavState
  const username = state.username
  const translate = (k: string, d?: string) => (t as any)(k, d) as string
  const { pgn, pgnHeadersRaw, moveListEncoded, decodedMoves, loading, error, moves, headers, chessAt, lastMoveSquares, index, setIndex, manualPgn, setManualPgn, clearManualPgn, retryFetch, resultMessage } = useGameData(id, translate, gameType)
  const effectiveMoves = moves.length ? moves : (decodedMoves || [])
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [fallbackId, setFallbackId] = useState(id || '')
  const [manualPgnInput, setManualPgnInput] = useState('')
  const [selectedGameType, setSelectedGameType] = useState<'live' | 'daily'>(gameType)
  const [isAnalyzing, setIsAnalyzing] = useState(state.analyze || false)
  const [analyzedPlayer, setAnalyzedPlayer] = useState(state.username || 'both')
  const { whiteMeta, blackMeta } = usePlayerAvatars({
    stateWhite: state.white,
    stateBlack: state.black,
    headerWhite: headers.White,
    headerBlack: headers.Black,
    headerWhiteElo: headers.WhiteElo,
    headerBlackElo: headers.BlackElo,
  })

  // WebSocket analysis
  const { progress, result, isAnalyzing: wsIsAnalyzing, error: analysisError, startAnalysis, stopAnalysis } = useAnalysis()

  // Track if analysis has been started to prevent re-triggering
  const analysisStartedRef = useRef(false)

  // Reset form when navigating to /game without ID
  useEffect(() => {
    if (!id && pathname === '/game') {
      clearManualPgn()
      setFallbackId('')
      setManualPgnInput('')
      setSelectedGameType(gameType)
    }
  }, [id, pathname, gameType, clearManualPgn])

  // Listen for form reset event
  useEffect(() => {
    const handleResetForm = () => {
      clearManualPgn()
      setFallbackId('')
      setManualPgnInput('')
      setSelectedGameType(gameType)
    }

    window.addEventListener('resetGameForm', handleResetForm)
    return () => window.removeEventListener('resetGameForm', handleResetForm)
  }, [gameType, clearManualPgn])

  // Start analysis automatically
  useEffect(() => {
    if (isAnalyzing && pgn && id && !wsIsAnalyzing && !analysisStartedRef.current) {
      analysisStartedRef.current = true
      startAnalysis(pgn, id, 'both')
    }
  }, [isAnalyzing, pgn, id, wsIsAnalyzing])

  // Set board orientation based on username
  useEffect(() => {
    if (!username) return
    
    // Try to match with headers first
    if (headers.White && headers.Black) {
      const u = username.toLowerCase()
      if (headers.White.toLowerCase() === u) {
        setOrientation('white')
        return
      }
      if (headers.Black.toLowerCase() === u) {
        setOrientation('black')
        return
      }
    }
    
    // Fallback: try to match with state
    if (state.white?.username?.toLowerCase() === username.toLowerCase()) {
      setOrientation('white')
    } else if (state.black?.username?.toLowerCase() === username.toLowerCase()) {
      setOrientation('black')
    }
  }, [username, headers.White, headers.Black, state.white, state.black])

  const date = useMemo(() => {
    const d = headers.Date
    if (!d) return undefined
    const parsed = new Date(d)
    if (!isNaN(parsed.getTime())) return parsed.toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')
    return d
  }, [headers.Date, i18n.language])

  // Get evaluation data for current move from analysis results
  const currentMoveEvaluation = useMemo(() => {
    if (!result || index <= 0) return null
    
    // index represents the move number AFTER it's played
    // index 1 = after white's move 0
    // index 2 = after black's move 0
    // index 3 = after white's move 1
    // index 4 = after black's move 1, etc.
    
    // Convert to 0-indexed
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves
    
    // Calculate which move number for this player (0-indexed within their moves)
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2)
    
    // Get the move data
    const moveData = playerMoves[playerMoveIndex]
    if (!moveData || !moveData.eval_after_move) return null
    
    const eval_data = moveData.eval_after_move
    const raw_score = eval_data.raw_score
    
    return {
      score: raw_score >= 0 ? `+${raw_score.toFixed(2)}` : raw_score.toFixed(2),
      centipions: Math.round(raw_score * 100),
      advantage_color: eval_data.advantage_color,
      bar_percentage: eval_data.bar_percentage,
      raw_score: raw_score
    }
  }, [result, index])

  // Get mate info for current move
  const currentMoveMateInfo = useMemo(() => {
    if (!result || index <= 0) return null
    
    // Same logic as evaluation data
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves
    
    // Calculate which move number for this player (0-indexed within their moves)
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2)
    
    // Get the move data
    const moveData = playerMoves[playerMoveIndex]
    if (!moveData || !moveData.mate_info) return null
    
    const mate_data = moveData.mate_info
    return {
      is_mate_sequence: mate_data.is_mate_sequence,
      mate_in: mate_data.mate_in,
      winning_side: mate_data.winning_side,
      display_text: mate_data.is_mate_sequence ? `M${mate_data.mate_in}` : ''
    }
  }, [result, index])

  // Detect if current move is checkmate (indicated by # in SAN)
  const currentMoveIsCheckmate = useMemo(() => {
    if (!result || index <= 0) return false
    
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2)
    
    const moveData = playerMoves[playerMoveIndex]
    if (!moveData) return false
    
    // Check if move notation ends with # (checkmate)
    return moveData.san?.endsWith('#') || false
  }, [result, index])

  // Determine checkmate result (1-0 for white win, 0-1 for black win)
  const checkmateResult = useMemo(() => {
    if (!currentMoveIsCheckmate || index <= 0) return null
    
    // If checkmate happened, the player who just moved won
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    
    return movingColor === 'white' ? '1-0' : '0-1'
  }, [currentMoveIsCheckmate, index])

  // Build move quality map (1-indexed) for MovesPanel coloring
  const moveQualityMap = useMemo(() => {
    if (!result) return new Map()
    
    const map = new Map()
    
    // Add white moves
    result.white.moves.forEach((moveData, playerMoveIndex) => {
      const moveIndex = playerMoveIndex * 2 + 1 // 1-indexed: after white's move
      map.set(moveIndex, { quality: moveData.quality })
    })
    
    // Add black moves
    result.black.moves.forEach((moveData, playerMoveIndex) => {
      const moveIndex = playerMoveIndex * 2 + 2 // 1-indexed: after black's move
      map.set(moveIndex, { quality: moveData.quality })
    })
    
    return map
  }, [result])

  // Get best move for current position (if available)
  const currentBestMove = useMemo(() => {
    if (!result || index <= 0) return null
    
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves
    
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2)
    const moveData = playerMoves[playerMoveIndex]
    
    return moveData?.best_move || null
  }, [result, index])

  // Determine which player made the last move
  const lastMovingColor = useMemo(() => {
    if (index <= 0) return null
    const moveIndexZeroBased = index - 1
    return moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
  }, [index])

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="space-y-6">
          {/* Fallback section if error - MOVED TO TOP */}
          {((!loading && error && !pgn) || (!id && !pgn)) && (
            <GameFallback
              fallbackId={fallbackId}
              setFallbackId={setFallbackId}
              manualPgnInput={manualPgnInput}
              setManualPgnInput={setManualPgnInput}
              selectedGameType={selectedGameType}
              setSelectedGameType={setSelectedGameType}
              manualPgn={manualPgn}
              isError={!!error && !pgn}
              onRetry={() => {
                clearManualPgn()
                setManualPgnInput('')
                if (fallbackId) {
                  navigate(`/${selectedGameType}/game/${encodeURIComponent(fallbackId)}`, { replace: true })
                } else {
                  retryFetch()
                }
              }}
              onCancelManual={() => {
                clearManualPgn()
                retryFetch()
              }}
              onInjectPGN={() => {
                setManualPgn(manualPgnInput.trim())
                navigate('/game', { replace: true })
              }}
            />
          )}

          {/* Layout: Board - FlipButton - Moves */}
          {pgn && (
            <>
              <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                <div className="flex gap-4 items-stretch">
                  {/* Evaluation Bar - on the left of the board */}
                  {result && (
                    <div className="w-12 rounded border border-gray-300 overflow-hidden">
                      <EvaluationBar
                        eval_data={currentMoveEvaluation}
                        mate_info={currentMoveMateInfo}
                        orientation={orientation}
                        finalResult={checkmateResult || resultMessage}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-4 h-full">
                    {/* Board Section */}
                    <BoardSection
                      orientation={orientation}
                      chessFen={chessAt.fen()}
                      lastMoveSquares={lastMoveSquares}
                      topPlayer={orientation === 'white' ? (blackMeta) : (whiteMeta)}
                      bottomPlayer={orientation === 'white' ? whiteMeta : blackMeta}
                      bestMove={currentBestMove}
                      isBestMoveForTop={lastMovingColor === (orientation === 'white' ? 'black' : 'white')}
                    />
                  </div>
                </div>
                
                {/* Control Buttons - Flip and Analyze */}
                <div className="flex flex-col items-center justify-center gap-2">
                  {/* Flip Button */}
                  <button
                    onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}
                    className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-white/10 border border-white/20 hover:border-white/40 rounded transition-all"
                    title="Retourner le plateau"
                  >
                    <SlLoop className="w-4 h-4 text-gray-300 hover:text-white rotate-90" />
                  </button>
                  
                  {/* Analyze Button */}
                  {id && !isAnalyzing && (
                    <button
                      onClick={() => {
                        setIsAnalyzing(true)
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-white/10 border border-white/20 hover:border-white/40 rounded transition-all"
                      title="Analyser cette partie"
                    >
                      <BiSearch className="w-4 h-4 text-gray-300 hover:text-white" />
                    </button>
                  )}
                </div>

                {/* Moves Panel + Analysis Table */}
                <div className="flex flex-row gap-4 flex-1 min-w-0 h-full">
                  {/* Moves Panel */}
                  <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    <MovesPanel
                      moves={effectiveMoves}
                      index={index}
                      setIndex={setIndex}
                      loading={loading}
                      error={error}
                      pgn={pgn}
                      date={date}
                      result={resultMessage}
                      moveQuality={isAnalyzing ? moveQualityMap : undefined}
                      labels={{
                        moves: t('game.moves', 'Coups'),
                        loading: t('loading', 'Chargement...'),
                        noMoves: t('game.noMoves', 'Aucun coup parsé'),
                        noPGN: t('game.noPGN', 'Aucune partie')
                      }}
                    />
                    
                    {/* Progress Bar - Under Moves Panel */}
                    {isAnalyzing && wsIsAnalyzing && (
                      <div className="w-full mt-2 space-y-1">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs text-gray-400">
                            {t('analysis.progress', 'Analyse')}: {Math.round(progress?.progress || 0)}%
                          </span>
                        </div>
                        <div className="w-full h-0.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress?.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analysis Stats Table - Beside Moves Panel */}
                  {isAnalyzing && result && (
                    <div className="card p-6 space-y-4 max-w-[280px] min-w-0 overflow-auto">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">
                          {t('analysis.title', 'Analyse')}
                        </h3>
                      </div>

                      {/* Analysis Stats Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-600">
                              <th className="text-center py-2 px-2 text-gray-400 text-sm font-semibold">{result.white.player.split(' ')[0]}</th>
                              <th className="text-center py-2 px-2 text-gray-400 text-xs"></th>
                              <th className="text-center py-2 px-2 text-gray-400 text-sm font-semibold">{result.black.player.split(' ')[0]}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                              <td className="text-center py-2 px-2 text-green-400 font-semibold text-lg">{result.white.stats.excellent}</td>
                              <td className="text-center py-2 px-2 text-2xl">⭐</td>
                              <td className="text-center py-2 px-2 text-green-400 font-semibold text-lg">{result.black.stats.excellent}</td>
                            </tr>
                            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                              <td className="text-center py-2 px-2 text-blue-400 font-semibold text-lg">{result.white.stats.good}</td>
                              <td className="text-center py-2 px-2 text-2xl">✓</td>
                              <td className="text-center py-2 px-2 text-blue-400 font-semibold text-lg">{result.black.stats.good}</td>
                            </tr>
                            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                              <td className="text-center py-2 px-2 text-purple-400 font-semibold text-lg">{result.white.stats.theoretical}</td>
                              <td className="text-center py-2 px-2 text-2xl">📖</td>
                              <td className="text-center py-2 px-2 text-purple-400 font-semibold text-lg">{result.black.stats.theoretical}</td>
                            </tr>
                            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                              <td className="text-center py-2 px-2 text-yellow-400 font-semibold text-lg">{result.white.stats.inaccuracy}</td>
                              <td className="text-center py-2 px-2 text-2xl">⚠️</td>
                              <td className="text-center py-2 px-2 text-yellow-400 font-semibold text-lg">{result.black.stats.inaccuracy}</td>
                            </tr>
                            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                              <td className="text-center py-2 px-2 text-orange-400 font-semibold text-lg">{result.white.stats.mistake}</td>
                              <td className="text-center py-2 px-2 text-2xl">❌</td>
                              <td className="text-center py-2 px-2 text-orange-400 font-semibold text-lg">{result.black.stats.mistake}</td>
                            </tr>
                            <tr className="hover:bg-gray-800/50">
                              <td className="text-center py-2 px-2 text-red-400 font-semibold text-lg">{result.white.stats.blunder}</td>
                              <td className="text-center py-2 px-2 text-2xl">💥</td>
                              <td className="text-center py-2 px-2 text-red-400 font-semibold text-lg">{result.black.stats.blunder}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Error Display */}
                      {analysisError && (
                        <div className="p-2 bg-red-900/20 border border-red-500/50 rounded text-red-200 text-xs mt-2">
                          {t('analysis.error', 'Erreur')}: {analysisError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Display & Moves Panel Side by Side */}
              {isAnalyzing && (
                <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                  {/* Empty - analysis is now integrated with moves panel above */}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
