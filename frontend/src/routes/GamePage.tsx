import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SlLoop } from 'react-icons/sl'
import { Header } from '../components/Header'
import { BoardSection } from '../components/BoardSection'
import { MovesPanel } from '../components/MovesPanel'
import { GameFallback } from '../components/GameFallback'
import { useGameData } from '../hooks/useGameData'
import { usePlayerAvatars } from '../hooks/usePlayerAvatars'

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
  
  // Récupérer le gameType depuis le chemin URL
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
  const [analyzedPlayer, setAnalyzedPlayer] = useState(state.username || '')
  const { whiteMeta, blackMeta } = usePlayerAvatars({
    stateWhite: state.white,
    stateBlack: state.black,
    headerWhite: headers.White,
    headerBlack: headers.Black,
    headerWhiteElo: headers.WhiteElo,
    headerBlackElo: headers.BlackElo,
  })

  // Réinitialiser le formulaire quand on arrive sur /game sans ID
  useEffect(() => {
    if (!id && pathname === '/game') {
      clearManualPgn()
      setFallbackId('')
      setManualPgnInput('')
      setSelectedGameType(gameType)
    }
  }, [id, pathname, gameType, clearManualPgn])

  // Écouter l'événement de réinitialisation du formulaire (quand on reclique sur "Analyser" depuis /game)
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

  // Gérer le mode analyse
  useEffect(() => {
    if (isAnalyzing && !analyzedPlayer && headers.White && headers.Black) {
      // Si on est en mode analyse mais qu'on n'a pas de joueur, il faut en choisir un
      // Si on vient du profil via state.username, on l'utilise
      if (state.username) {
        setAnalyzedPlayer(state.username)
      }
      // Sinon il faut attendre le choix de l'utilisateur
    }
  }, [isAnalyzing, analyzedPlayer, headers.White, headers.Black, state.username])

  // Déterminer orientation automatiquement après chargement PGN
  useEffect(() => {
    if (!username || !headers.White || !headers.Black) return
    const u = username.toLowerCase()
    if (headers.White.toLowerCase() === u) setOrientation('white')
    else if (headers.Black.toLowerCase() === u) setOrientation('black')
  }, [username, headers.White, headers.Black])

  const date = useMemo(() => {
    const d = headers.Date
    if (!d) return undefined
    const parsed = new Date(d)
    if (!isNaN(parsed.getTime())) return parsed.toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')
    return d
  }, [headers.Date, i18n.language])

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
                {/* Board Section */}
                <BoardSection
                  orientation={orientation}
                  chessFen={chessAt.fen()}
                  lastMoveSquares={lastMoveSquares}
                  topPlayer={orientation === 'white' ? (blackMeta) : (whiteMeta)}
                  bottomPlayer={orientation === 'white' ? whiteMeta : blackMeta}
                />
                
                {/* Flip Button - centered between board and moves */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}
                    className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-white/10 border border-white/20 hover:border-white/40 rounded transition-all"
                    title="Retourner le plateau"
                  >
                    <SlLoop className="w-4 h-4 text-gray-300 hover:text-white rotate-90" />
                  </button>
                </div>

                {/* Moves Panel */}
                <MovesPanel
                  moves={effectiveMoves}
                  index={index}
                  setIndex={setIndex}
                  loading={loading}
                  error={error}
                  pgn={pgn}
                  date={date}
                  result={resultMessage}
                  labels={{
                    moves: t('game.moves', 'Coups'),
                    loading: t('loading', 'Chargement...'),
                    noMoves: t('game.noMoves', 'Aucun coup parsé'),
                    noPGN: t('game.noPGN', 'Aucune partie')
                  }}
                />
              </div>

              {/* Analyze Button */}
              {id && !isAnalyzing && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      setIsAnalyzing(true)
                    }}
                    className="btn-primary"
                  >
                    {t('game.analyze', 'Analyser cette partie')}
                  </button>
                </div>
              )}

              {/* Player Selection for Analysis */}
              {isAnalyzing && !analyzedPlayer && (
                <div className="card p-6 space-y-4 flex justify-center">
                  <div className="space-y-4 w-full max-w-md">
                    <h2 className="font-semibold text-lg">
                      {t('analysis.selectPlayer', 'Sélectionner le joueur à analyser')}
                    </h2>
                    <div className="flex gap-2 flex-col">
                      {headers.White && (
                        <button
                          onClick={() => setAnalyzedPlayer(headers.White)}
                          className="btn-primary"
                        >
                          {headers.White} (Blanc)
                        </button>
                      )}
                      {headers.Black && (
                        <button
                          onClick={() => setAnalyzedPlayer(headers.Black)}
                          className="btn-primary"
                        >
                          {headers.Black} (Noir)
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setIsAnalyzing(false)
                        setAnalyzedPlayer('')
                      }}
                      className="btn-secondary w-full"
                    >
                      {t('common.cancel', 'Annuler')}
                    </button>
                  </div>
                </div>
              )}

              {/* Analysis Display */}
              {isAnalyzing && analyzedPlayer && (
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">
                      {t('analysis.title', 'Analyse de')} {analyzedPlayer}
                    </h2>
                    <button
                      onClick={() => {
                        setIsAnalyzing(false)
                        setAnalyzedPlayer('')
                      }}
                      className="btn-ghost text-sm"
                    >
                      ✕ {t('common.close', 'Fermer')}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{t('analysis.progress', 'Analyse en cours')}</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-primary transition-all duration-300"></div>
                    </div>
                  </div>

                  {/* Stats Placeholder */}
                  <div className="grid grid-cols-5 gap-2 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">0</div>
                      <div className="text-xs text-gray-400">{t('analysis.excellent', 'Excellents')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">0</div>
                      <div className="text-xs text-gray-400">{t('analysis.good', 'Bons')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">0</div>
                      <div className="text-xs text-gray-400">{t('analysis.inaccuracy', 'Imprécis')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">0</div>
                      <div className="text-xs text-gray-400">{t('analysis.mistake', 'Erreurs')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">0</div>
                      <div className="text-xs text-gray-400">{t('analysis.blunder', 'Blunders')}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
