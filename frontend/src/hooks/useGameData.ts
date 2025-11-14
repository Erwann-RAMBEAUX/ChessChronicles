import { useEffect, useMemo, useState, useRef } from 'react'
import { Chess } from 'chess.js'
import { fetchGameById } from '../api/chessCom'
import { buildSyntheticPgn, decodeTcnToUciArray } from '../utils/tcnDecode'

// t: i18next TFunction (typé souple ici pour éviter conflit de signatures)
export function useGameData(id: string | undefined, t: (...args: any[]) => string, gameType: 'live' | 'daily' = 'live') {
  const [pgn, setPgn] = useState<string | undefined>()
  const [pgnHeadersRaw, setPgnHeadersRaw] = useState<Record<string, any> | undefined>(undefined)
  const [moveListEncoded, setMoveListEncoded] = useState<string | undefined>(undefined)
  const [decodedMoves, setDecodedMoves] = useState<string[] | undefined>(undefined)
  const [resultMessage, setResultMessage] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [manualPgn, setManualPgnFlag] = useState(false)
  const [attemptedId, setAttemptedId] = useState<string | null>(null)
  const pendingRef = useRef<AbortController | null>(null)
  const tRef = useRef(t)
  useEffect(() => { tRef.current = t }, [t])

  useEffect(() => {
    if (!id || manualPgn || attemptedId === id) return
    let alive = true
    const ctrl = new AbortController()
    pendingRef.current = ctrl
    queueMicrotask(() => setLoading(true))
    
    fetchGameById(id, ctrl.signal, gameType)
      .then(raw => {
        if (!alive) return
        if (!raw) {
          setError(tRef.current('game.notFound', 'Partie introuvable. Vérifiez l\'ID ou entrez un PGN manuellement.'))
        } else {
          setPgnHeadersRaw(raw.pgnHeadersRaw)
          setMoveListEncoded(raw.moveListEncoded)
          setResultMessage(raw.resultMessage)

          // Préférer le PGN brut si disponible, sinon le générer à partir de moveList
          if (raw.pgn) {
            setPgn(raw.pgn)
          } else if (raw.moveListEncoded) {
            try {
              const synthetic = buildSyntheticPgn(raw.pgnHeadersRaw, raw.moveListEncoded)
              setPgn(synthetic)
              
              // Décoder aussi en UCI pour preview
              const uci = decodeTcnToUciArray(raw.moveListEncoded)
              const chess = new Chess()
              for (const mv of uci) { 
                try { chess.move(mv) } catch { /* ignore */ }
              }
              const hist = chess.history()
              setDecodedMoves(hist)
            } catch {
              setError(tRef.current('error.parsing', 'Erreur lors du décodage des coups'))
            }
          } else {
            setError(tRef.current('game.noPGN', 'Aucune partie disponible'))
          }

          setError(null)
        }
      })
      .catch(e => {
        if (!alive) return
        if (e instanceof Error && e.name === 'AbortError') {
          return
        }
        setError(tRef.current('error.http', 'Erreur réseau ou HTTP'))
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
        setAttemptedId(id)
        if (pendingRef.current === ctrl) pendingRef.current = null
      })

    return () => { alive = false; ctrl.abort() }
  }, [id, manualPgn, attemptedId, gameType])

  /** Injection manuelle d'un PGN (ou reconstruction à partir d'une entrée utilisateur). */
  const setManualPgn = (rawPgn: string) => {
    setManualPgnFlag(true)
    setLoading(false)
    setError(null)
    setPgn(rawPgn)
    setPgnHeadersRaw(undefined)
    setMoveListEncoded(undefined)
    setDecodedMoves(undefined)
    setIndex(0)
  }

  /** Permet de revenir en mode auto (et donc relancer un fetch si id défini). */
  const clearManualPgn = () => {
    setManualPgnFlag(false)
    setPgn(undefined)
    setIndex(0)
    setError(null)
    setAttemptedId(null) // autorisera un nouveau fetch
  }

  /** Relancer explicitement la récupération (reset échec). */
  const retryFetch = () => {
    if (pendingRef.current) {
      pendingRef.current.abort()
      pendingRef.current = null
    }
    setAttemptedId(null)
    setError(null)
  }

  const { moves, headers } = useMemo(() => {
    if (!pgn) return { moves: [] as string[], headers: {} as Record<string, string> }
    try {
      const chess = new Chess()
      chess.loadPgn(pgn)
      const hist = chess.history({ verbose: true }) as Array<{ san: string }>
      const movesArray = hist.map(h => h.san)
      const headersObj = chess.header() as Record<string, string>
      
      return { moves: movesArray, headers: headersObj }
    } catch {
      return { moves: [], headers: {} }
    }
  }, [pgn])

  const chessAt = useMemo(() => {
    const game = new Chess()
    if (pgn) { try { game.loadPgn(pgn) } catch {} }
    const history = game.history()
    const target = Math.max(0, Math.min(index, history.length))
    const replay = new Chess()
    for (let i = 0; i < target; i++) replay.move(history[i] as string)
    return replay
  }, [pgn, index])

  const lastMoveSquares = useMemo(() => {
    if (!pgn || index === 0) return {}
    try {
      const game = new Chess(); game.loadPgn(pgn)
      const hist = game.history({ verbose: true }) as any[]
      const applied = hist.slice(0, index)
      const last = applied[applied.length - 1]
      if (!last?.from || !last?.to) return {}
      // Couleur jaune clair pour la case de destination
      const styleFrom = { background: 'rgba(184, 200, 81, 0.8)' }
      // Couleur vert plus foncé pour la case d'origine (pièce qui a bougé)
      const styleTo = { background: 'rgba(121, 154, 70, 0.8)' }
      return { [last.from]: styleFrom, [last.to]: styleTo }
    } catch { return {} }
  }, [pgn, index])

  return { pgn, pgnHeadersRaw, moveListEncoded, decodedMoves, loading, error, moves, headers, chessAt, lastMoveSquares, index, setIndex, manualPgn, setManualPgn, clearManualPgn, retryFetch, resultMessage }
}
