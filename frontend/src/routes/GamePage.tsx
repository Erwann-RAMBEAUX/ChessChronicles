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

function GameView({ pgn, id, username, state, gameType, loading, error }: { pgn: string, id: string | undefined, username: string | undefined, state: NavState, gameType: 'live' | 'daily', loading: boolean, error: string | null }) {
  const { t, i18n } = useTranslation()
  const translate = (k: string, d?: string) => (t as any)(k, d) as string;
  const { moves, headers, chessAt, lastMoveSquares, index, setIndex, resultMessage } = useGameData(id, translate, gameType, pgn)
  const effectiveMoves = moves
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [isAnalyzing, setIsAnalyzing] = useState(state.analyze || false)
  
  const { whiteMeta, blackMeta } = usePlayerAvatars({
    stateWhite: state.white,
    stateBlack: state.black,
    headerWhite: headers.White,
    headerBlack: headers.Black,
    headerWhiteElo: headers.WhiteElo,
    headerBlackElo: headers.BlackElo,
  })

  // WebSocket analysis
  const { progress, result, isAnalyzing: wsIsAnalyzing, error: analysisError, startAnalysis } = useAnalysis()

  // Track if analysis has been started to prevent re-triggering
  const analysisStartedRef = useRef(false)

  // Start analysis automatically
  useEffect(() => {
    if (isAnalyzing && pgn && !wsIsAnalyzing && !analysisStartedRef.current) {
      analysisStartedRef.current = true
      // Use the provided id if available, otherwise use 'manual-game' for manually pasted PGNs
      const analysisId = id || 'manual-game'
      startAnalysis(pgn, analysisId, 'both')
    }
  }, [isAnalyzing, pgn, id, wsIsAnalyzing, startAnalysis])

  // Set board orientation based on username
  useEffect(() => {
    if (!username) return
    
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

  const currentMoveEvaluation = useMemo(() => {
    if (!result || index <= 0) return null
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2)
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

  const currentMoveMateInfo = useMemo(() => {
    if (!result || index <= 0) return null
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2)
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

  const currentMoveIsCheckmate = useMemo(() => {
    if (!result || index <= 0) return false
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2)
    const moveData = playerMoves[playerMoveIndex]
    return moveData?.san?.endsWith('#') || false
  }, [result, index])

  const checkmateResult = useMemo(() => {
    if (!currentMoveIsCheckmate || index <= 0) return null
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    return movingColor === 'white' ? '1-0' : '0-1'
  }, [currentMoveIsCheckmate, index])

  const moveQualityMap = useMemo(() => {
    if (!result) return new Map()
    const map = new Map()
    result.white.moves.forEach((moveData, playerMoveIndex) => {
      const moveIndex = playerMoveIndex * 2 + 1
      map.set(moveIndex, { quality: moveData.quality })
    })
    result.black.moves.forEach((moveData, playerMoveIndex) => {
      const moveIndex = playerMoveIndex * 2 + 2
      map.set(moveIndex, { quality: moveData.quality })
    })
    return map
  }, [result])

  const currentBestMove = useMemo(() => {
    if (!result || index <= 0) return null
    const moveIndexZeroBased = index - 1
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2)
    const moveData = playerMoves[playerMoveIndex]
    return moveData?.best_move || null
  }, [result, index])

  const lastMovingColor = useMemo(() => {
    if (index <= 0) return null
    const moveIndexZeroBased = index - 1
    return moveIndexZeroBased % 2 === 0 ? 'white' : 'black'
  }, [index])

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="flex gap-4 items-stretch">
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
            <BoardSection
              orientation={orientation}
              chessFen={chessAt.fen()}
              lastMoveSquares={lastMoveSquares}
              topPlayer={orientation === 'white' ? blackMeta : whiteMeta}
              bottomPlayer={orientation === 'white' ? whiteMeta : blackMeta}
              bestMove={currentBestMove}
              isBestMoveForTop={lastMovingColor === (orientation === 'white' ? 'black' : 'white')}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}
            className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-white/10 border border-white/20 hover:border-white/40 rounded transition-all"
            title="Retourner le plateau"
          >
            <SlLoop className="w-4 h-4 text-gray-300 hover:text-white rotate-90" />
          </button>
          
          {(id || pgn) && !isAnalyzing && (
            <button
              onClick={() => setIsAnalyzing(true)}
              className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-white/10 border border-white/20 hover:border-white/40 rounded transition-all"
              title="Analyser cette partie"
            >
              <BiSearch className="w-4 h-4 text-gray-300 hover:text-white" />
            </button>
          )}
        </div>

        <div className="flex flex-row gap-4 flex-1 min-w-0 h-full">
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

          {isAnalyzing && result && (
            <div className="card p-6 space-y-4 max-w-[280px] min-w-0 overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">
                  {t('analysis.title', 'Analyse')}
                </h3>
              </div>

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

              {analysisError && (
                <div className="p-2 bg-red-900/20 border border-red-500/50 rounded text-red-200 text-xs mt-2">
                  {t('analysis.error', 'Erreur')}: {analysisError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function GamePage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  
  const pathname = location.pathname
  const gameType = useMemo(() => (pathname.startsWith('/live/') ? 'live' : 'daily'), [pathname])
  
  const state = (location.state || {}) as NavState
  const username = state.username
  const translate = (k: string, d?: string) => (t as any)(k, d) as string
  
  // State for the fallback/form section
  const [fallbackId, setFallbackId] = useState(id || '');
  const [manualPgnInput, setManualPgnInput] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<'live' | 'daily'>(gameType);
  const [manualPgn, setManualPgn] = useState<string | null>(null);

  // Fetch data only if we have an ID and no manual PGN
  const { pgn: fetchedPgn, loading, error, retryFetch } = useGameData(id, translate, gameType, manualPgn)

  // Determine the effective PGN to use
  const pgn = manualPgn || fetchedPgn

  // Reset form when gameType changes
  useEffect(() => {
    setSelectedGameType(gameType)
  }, [gameType])

  // Reset form when navigating to /game without ID
  useEffect(() => {
    if (!id && pathname === '/game') {
      setFallbackId('')
      setManualPgnInput('')
      setManualPgn(null)
      setSelectedGameType('live')
    }
  }, [id, pathname])

  // Listen for form reset event
  useEffect(() => {
    const handleResetForm = () => {
      // Use window.location.replace to navigate to /game and reload completely
      // This removes the current entry from the history stack and loads a fresh /game page
      window.location.replace(window.location.origin + '/game')
    }

    window.addEventListener('resetGameForm', handleResetForm)
    return () => window.removeEventListener('resetGameForm', handleResetForm)
  }, [])

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="space-y-6">
          {/* Conditional Rendering: Show GameView or Fallback */}
          {pgn ? (
            <GameView pgn={pgn} id={id} username={username} state={state} gameType={gameType} loading={loading} error={error} />
          ) : id ? (
            // If we have an ID but no PGN yet, show a loading state (GameView will handle it)
            <GameView pgn={pgn || ''} id={id} username={username} state={state} gameType={gameType} loading={loading} error={error} />
          ) : (
            <GameFallback
              fallbackId={fallbackId}
              setFallbackId={setFallbackId}
              manualPgnInput={manualPgnInput}
              setManualPgnInput={setManualPgnInput}
              selectedGameType={selectedGameType}
              setSelectedGameType={setSelectedGameType}
              manualPgn={!!manualPgn}
              isError={!!error && !pgn}
              onRetry={() => {
                setManualPgn(null)
                if (fallbackId) {
                  navigate(`/${selectedGameType}/game/${encodeURIComponent(fallbackId)}`, { replace: true })
                } else {
                  retryFetch()
                }
              }}
              onCancelManual={() => {
                setManualPgn(null)
                // Optionally, you might want to retry fetching the original game if an ID was present
                if (id) retryFetch()
              }}
              onInjectPGN={() => {
                setManualPgn(manualPgnInput.trim())
                // Navigate to a clean /game URL to show the injected PGN
                if (location.pathname !== '/game') {
                  navigate('/game', { replace: true })
                }
              }}
            />
          )}
        </section>
      </main>
    </div>
  )
}
