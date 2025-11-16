import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { GameFallback } from '../components/GameFallback'
import { useChessStore } from '../store'
import { Chess } from 'chess.js'


type NavState = {
  username?: string
  analyze?: boolean
  pgn?: string
  error?: string
  white?: { username: string; rating?: number }
  black?: { username: string; rating?: number }
}

export default function GamePage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = (location.state || {}) as NavState
  const { clearCurrentGame } = useChessStore()
  
  // State for the fallback/form section
  const [manualPgnInput, setManualPgnInput] = useState(state.pgn || '');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(state.error);

  // Clear current game when arriving on this page
  useEffect(() => {
    // Only clear if we don't have an error state (coming back from /analyze with error)
    if (!state.error) {
      clearCurrentGame()
    }
  }, [])

  const handleInjectPGN = () => {
    const pgnToValidate = manualPgnInput.trim()
    
    if (!pgnToValidate) {
      setErrorMessage(t('game.error.emptyPgn', 'Veuillez saisir un PGN'))
      return
    }

    // Validate PGN
    try {
      const chess = new Chess()
      chess.loadPgn(pgnToValidate)
      const moves = chess.history()
      
      if (moves.length === 0) {
        setErrorMessage(t('game.error.noMovesFound', 'Aucun coup trouvé dans le PGN. Vérifiez le format.'))
        return
      }

      // PGN is valid, navigate to /analyze with the PGN
      navigate('/analyze', {
        state: {
          pgn: pgnToValidate,
          username: state.username,
          analyze: state.analyze || false,
          white: state.white,
          black: state.black
        }
      })
    } catch (err: unknown) {
      const rawError = err instanceof Error ? err.message : 'Format invalide'
      
      // Si c'est une erreur de parsing technique
      if (rawError.includes('Expected') && rawError.includes('found')) {
        setErrorMessage(t('game.error.invalidPgnFormat', 'Format PGN invalide.'))
        return
      }
      
      // Pour les erreurs de coups invalides
      if (rawError.includes('Invalid move') || rawError.includes('invalid move')) {
        const moveMatch = rawError.match(/:\s*(.+)$/)
        const moveDetail = moveMatch ? moveMatch[1].trim() : ''
        const errorMsg = moveDetail 
          ? `${t('game.error.invalidMove', 'Coup invalide dans le PGN')} : ${moveDetail}`
          : t('game.error.invalidMove', 'Coup invalide dans le PGN.')
        setErrorMessage(errorMsg)
        return
      }
      
      if (rawError.includes('Illegal move') || rawError.includes('illegal move')) {
        setErrorMessage(t('game.error.illegalMove', 'Le PGN contient des coups invalides.'))
        return
      }
      
      // Pour toute autre erreur
      setErrorMessage(t('game.error.invalidPgnFormat', 'Format PGN invalide.'))
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="space-y-6">
          <GameFallback
            manualPgnInput={manualPgnInput}
            setManualPgnInput={setManualPgnInput}
            manualPgn={false}
            isError={!!errorMessage}
            onCancelManual={() => {
              setManualPgnInput('')
              setErrorMessage(undefined)
            }}
            onInjectPGN={handleInjectPGN}
            errorMessage={errorMessage}
          />
        </section>
      </main>
    </div>
  )
}
