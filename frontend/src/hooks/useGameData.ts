import { useEffect, useMemo, useState, useRef } from 'react'
import { Chess } from 'chess.js'

// i18next TFunction (loosely typed here to avoid signature conflicts)
export function useGameData(t: (...args: any[]) => string, pgnOverride?: string | null) {
  const [pgn, setPgn] = useState<string | undefined>(pgnOverride ?? undefined)
  const [pgnHeadersRaw, setPgnHeadersRaw] = useState<Record<string, any> | undefined>(undefined)
  const [moveListEncoded, setMoveListEncoded] = useState<string | undefined>(undefined)
  const [decodedMoves, setDecodedMoves] = useState<string[] | undefined>(undefined)
  const [resultMessage, setResultMessage] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [index, setIndex] = useState(0)
  const [manualPgn, setManualPgnFlag] = useState(!!pgnOverride)
  const pendingRef = useRef<AbortController | null>(null)
  const tRef = useRef(t)
  useEffect(() => { tRef.current = t }, [t])

  // Synchronous parsing and error detection
  const { moves, headers, error, gameResult } = useMemo(() => {
    const currentPgn = pgnOverride || pgn
    if (!currentPgn) {
      return { moves: [], headers: {}, error: null, gameResult: null }
    }

    try {
      const chess = new Chess()
      chess.loadPgn(currentPgn)
      const hist = chess.history({ verbose: true }) as Array<{ san: string }>
      const movesArray = hist.map(h => h.san)
      const headersObj = chess.header() as Record<string, string>

      if (movesArray.length === 0 && currentPgn.trim().length > 0) {
        const movePattern = /\d+\./
        let errorMsg: string
        if (!movePattern.test(currentPgn)) {
          errorMsg = tRef.current('game.error.noMovesFound', 'Aucun coup trouvé dans le PGN. Vérifiez le format.')
        } else {
          errorMsg = tRef.current('game.error.illegalMove', 'Le PGN contient des coups invalides.')
        }
        return { moves: [], headers: {}, error: errorMsg, gameResult: null }
      }

      // Extract game result from PGN header
      const result = headersObj['Result'] || null
      const termination = headersObj['Termination'] || null
      
      return { moves: movesArray, headers: headersObj, error: null, gameResult: { result, termination } }
    } catch (err: unknown) {
      const rawError = err instanceof Error ? err.message : 'Format invalide'
      
      // Si c'est une erreur de parsing technique (Expected NAG, brace comment, etc.)
      if (rawError.includes('Expected') && rawError.includes('found')) {
        const errorMsg = tRef.current('game.error.invalidPgnFormat', 'Format PGN invalide.')
        return { moves: [], headers: {}, error: errorMsg, gameResult: null }
      }
      
      // Pour les erreurs de coups invalides, on garde le détail
      if (rawError.includes('Invalid move') || rawError.includes('invalid move')) {
        // Extraire le coup invalide si possible (ex: "Invalid move in PGN: Qg8#")
        const moveMatch = rawError.match(/:\s*(.+)$/)
        const moveDetail = moveMatch ? moveMatch[1].trim() : ''
        const errorMsg = moveDetail 
          ? `${tRef.current('game.error.invalidMove', 'Coup invalide dans le PGN')} : ${moveDetail}`
          : tRef.current('game.error.invalidMove', 'Coup invalide dans le PGN.')
        return { moves: [], headers: {}, error: errorMsg, gameResult: null }
      }
      
      if (rawError.includes('Illegal move') || rawError.includes('illegal move')) {
        return { moves: [], headers: {}, error: tRef.current('game.error.illegalMove', 'Le PGN contient des coups invalides.'), gameResult: null }
      }
      
      // Pour toute autre erreur, message générique
      return { moves: [], headers: {}, error: tRef.current('game.error.invalidPgnFormat', 'Format PGN invalide.'), gameResult: null }
    }
  }, [pgn, pgnOverride])

  useEffect(() => {
    if (pgnOverride) {
      setPgn(pgnOverride)
      setManualPgnFlag(true)
      setLoading(false)
      return
    } else {
      // When manual PGN is cancelled, reset pgn state
      if (manualPgn) {
        setPgn(undefined)
      }
    }
  }, [manualPgn, pgnOverride])

  /** Manual PGN injection (or reconstruction from user input). */
  const setManualPgn = (rawPgn: string) => {
    setManualPgnFlag(true)
    setLoading(false)
    setPgn(rawPgn)
    setPgnHeadersRaw(undefined)
    setMoveListEncoded(undefined)
    setDecodedMoves(undefined)
    setIndex(0)
  }

  /** Return to auto mode (and restart fetch if id is defined). */
  const clearManualPgn = () => {
    setManualPgnFlag(false)
    setPgn(undefined)
    setIndex(0)
  }

  /** Explicitly restart fetching (reset on error). */
  const retryFetch = () => {
    if (pendingRef.current) {
      pendingRef.current.abort()
      pendingRef.current = null
    }
  }

  const chessAt = useMemo(() => {
    const game = new Chess()
    const currentPgn = pgnOverride || pgn
    if (currentPgn) { try { game.loadPgn(currentPgn) } catch {} }
    const history = game.history()
    const target = Math.max(0, Math.min(index, history.length))
    const replay = new Chess()
    for (let i = 0; i < target; i++) replay.move(history[i] as string)
    return replay
  }, [pgn, pgnOverride, index])

  const lastMoveSquares = useMemo(() => {
    const currentPgn = pgnOverride || pgn
    if (!currentPgn || index === 0) return {}
    try {
      const game = new Chess(); game.loadPgn(currentPgn)
      const hist = game.history({ verbose: true }) as any[]
      const applied = hist.slice(0, index)
      const last = applied[applied.length - 1]
      if (!last?.from || !last?.to) return {}
      // Light yellow for destination square
      const styleFrom = { background: 'rgba(184, 200, 81, 0.8)' }
      // Darker green for origin square (piece that moved)
      const styleTo = { background: 'rgba(121, 154, 70, 0.8)' }
      return { [last.from]: styleFrom, [last.to]: styleTo }
    } catch { return {} }
  }, [pgn, pgnOverride, index])

  // Generate result message from game result
  useEffect(() => {
    if (!gameResult) {
      setResultMessage(undefined)
      return
    }

    const { result, termination } = gameResult
    
    if (!result || result === '*') {
      setResultMessage(undefined)
      return
    }

    // Get player names from headers
    const headersRecord = headers as Record<string, string>
    const whitePlayer = headersRecord['White'] || tRef.current('game.result.white', 'Les blancs')
    const blackPlayer = headersRecord['Black'] || tRef.current('game.result.black', 'Les noirs')

    let message = ''
    let winner = ''
    
    // Determine winner/draw
    if (result === '1-0') {
      winner = whitePlayer
      message = tRef.current('game.result.playerWins', { player: winner })
    } else if (result === '0-1') {
      winner = blackPlayer
      message = tRef.current('game.result.playerWins', { player: winner })
    } else if (result === '1/2-1/2') {
      message = tRef.current('game.result.draw')
    }

    // Add termination reason if available
    if (termination) {
      const terminationLower = termination.toLowerCase()
      
      if (terminationLower.includes('checkmate')) {
        message += ` ${tRef.current('game.termination.by', 'par')} ${tRef.current('game.termination.checkmate', 'échec et mat')}`
      } else if (terminationLower.includes('time')) {
        message += ` ${tRef.current('game.termination.by', 'par')} ${tRef.current('game.termination.time', 'au temps')}`
      } else if (terminationLower.includes('resignation')) {
        message += ` ${tRef.current('game.termination.by', 'par')} ${tRef.current('game.termination.resignation', 'abandon')}`
      } else if (terminationLower.includes('stalemate')) {
        message += ` ${tRef.current('game.termination.by', 'par')} ${tRef.current('game.termination.stalemate', 'pat')}`
      } else if (terminationLower.includes('insufficient')) {
        message += ` ${tRef.current('game.termination.by', 'par')} ${tRef.current('game.termination.insufficient', 'matériel insuffisant')}`
      } else if (terminationLower.includes('repetition')) {
        message += ` ${tRef.current('game.termination.by', 'par')} ${tRef.current('game.termination.repetition', 'répétition')}`
      } else if (terminationLower.includes('50')) {
        message += ` ${tRef.current('game.termination.by', 'par')} ${tRef.current('game.termination.fiftyMoves', 'règle des 50 coups')}`
      } else if (terminationLower.includes('agreement')) {
        message += ` ${tRef.current('game.termination.by', 'par')} ${tRef.current('game.termination.agreement', 'accord mutuel')}`
      }
    }

    setResultMessage(message || undefined)
  }, [gameResult, headers])

  return { pgn: pgnOverride || pgn, pgnHeadersRaw, moveListEncoded, decodedMoves, loading, error, moves, headers, chessAt, lastMoveSquares, index, setIndex, manualPgn, setManualPgn, clearManualPgn, retryFetch, resultMessage }
}
