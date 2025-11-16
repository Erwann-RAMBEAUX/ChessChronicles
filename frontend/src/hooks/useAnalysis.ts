import { useEffect, useRef, useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import { useChessStore } from '../store'

export interface AnalysisProgress {
  type: 'start' | 'progress' | 'complete' | 'error'
  totalMoves?: number
  white?: string
  black?: string
  moveIndex?: number
  progress?: number
  movesAnalyzed?: number
  error?: string
}

export interface MoveAnalysis {
  index: number
  san: string
  color: 'white' | 'black'
  quality: 'theoretical' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'unknown'
  best_move: string | null
  eval_after_move: {
    advantage_color: 'white' | 'black'
    bar_percentage: number
    raw_score: number
  } | null
  mate_info: {
    is_mate_sequence: boolean
    mate_in: number | null
    winning_side: 'white' | 'black' | null
  } | null
}

export interface PlayerStats {
  theoretical: number
  excellent: number
  good: number
  inaccuracy: number
  mistake: number
  blunder: number
  unknown: number
  total: number
}

export interface AnalysisResult {
  white: {
    player: string
    stats: PlayerStats
    moves: MoveAnalysis[]
  }
  black: {
    player: string
    stats: PlayerStats
    moves: MoveAnalysis[]
  }
}

export function useAnalysis() {
  const { stockfishVersion, stockfishDepth } = useChessStore()
  const [progress, setProgress] = useState<AnalysisProgress | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzingState] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const engineRef = useRef<any | null>(null)
  const isAnalyzingRef = useRef(false)
  const hasStartedRef = useRef(false)

  // simple helper to parse UCI "info" lines
  const parseUciScore = (line: string) => {
    // lines contain "score cp <n>" or "score mate <n>"
    const parts = line.split(' ')
    const idx = parts.indexOf('score')
    if (idx === -1) return null
    if (parts[idx + 1] === 'cp') {
      const cp = parseInt(parts[idx + 2], 10)
      return { cp }
    }
    if (parts[idx + 1] === 'mate') {
      const m = parseInt(parts[idx + 2], 10)
      return { mate: m }
    }
    return null
  }

  const startAnalysis = useCallback(async (pgn: string, analyzedPlayer: string) => {
    if (isAnalyzingRef.current || hasStartedRef.current) return

    hasStartedRef.current = true
    setProgress(null)
    setResult(null)
    setError(null)
    setIsAnalyzingState(true)
    isAnalyzingRef.current = true

    try {
      // Prepare moves and players
      const chess = new Chess()
      chess.loadPgn(pgn)
      const histVerbose = chess.history({ verbose: true }) as Array<any>
      const uciMoves = histVerbose.map(m => `${m.from}${m.to}${m.promotion ? m.promotion : ''}`)
      const whitePlayer = (chess.header().White as string) || 'White'
      const blackPlayer = (chess.header().Black as string) || 'Black'

      setProgress({ type: 'start', totalMoves: uciMoves.length, white: whitePlayer, black: blackPlayer })

      // spawn engine as a Web Worker served from public/stockfish/
      const enginePath = stockfishVersion === 'lite' 
        ? '/stockfish/stockfish-17.1-lite-single.js' 
        : '/stockfish/stockfish-17.1-single.js'
      const engine = new Worker(enginePath)
      engineRef.current = engine

      let pendingResolve: ((v: any) => void) | null = null
      let lastInfo: string | null = null

      engine.onmessage = (e: MessageEvent) => {
        const line = typeof e.data === 'string' ? e.data : (e.data && e.data.data) || ''
        // some builds send lines with trailing newlines; normalize
        try { console.debug('[stockfish] ->', line) } catch {}
        lastInfo = line
        // bestmove signals end of a query
        if (line.startsWith('bestmove') && pendingResolve) {
          pendingResolve(lastInfo)
          pendingResolve = null
        }
      }

      // init
      engine.postMessage('uci')
      engine.postMessage('isready')

      const evaluatePosition = (movesSlice: string[], depth = stockfishDepth, timeoutMs = 10000) => {
        return new Promise<{ cp: number | null; mate: number | null; bestmove?: string | null }>((resolve) => {
          let lastLines = ''
          const onMessage = (e: MessageEvent) => {
            const line = typeof e.data === 'string' ? e.data : (e.data && e.data.data) || ''
            if (!line) return
            // accumulate
            lastLines = (lastLines ? lastLines + '\n' : '') + line
            // if bestmove reached, parse and resolve
            if (line.startsWith('bestmove')) {
              // parse bestmove
              const parts = line.split(' ')
              const bestmove = parts[1] || null
              // try to find last score in accumulated lines
              const lines = lastLines.split('\n')
              let bestScore: { cp?: number; mate?: number } | null = null
              for (let i = lines.length - 1; i >= 0; i--) {
                const parsed = parseUciScore(lines[i])
                if (parsed && (parsed.cp !== undefined || parsed.mate !== undefined)) {
                  bestScore = parsed
                  break
                }
              }
              engine.removeEventListener('message', onMessage)
              if (!bestScore) return resolve({ cp: null, mate: null, bestmove })
              return resolve({ cp: bestScore.cp ?? null, mate: bestScore.mate ?? null, bestmove })
            }
          }

          // attach one-time listener
          engine.addEventListener('message', onMessage)

          // send position and go
          const posCmd = movesSlice.length ? `position startpos moves ${movesSlice.join(' ')}` : 'position startpos'
          try {
            engine.postMessage(posCmd)
            engine.postMessage(`go depth ${depth}`)
          } catch (err) {
            engine.removeEventListener('message', onMessage)
            return resolve({ cp: null, mate: null, bestmove: null })
          }

          // timeout fallback
          const to = setTimeout(() => {
            engine.removeEventListener('message', onMessage)
            // try to parse any gathered info
            const lines = lastLines.split('\n')
            let bestScore: { cp?: number; mate?: number } | null = null
            for (let i = lines.length - 1; i >= 0; i--) {
              const parsed = parseUciScore(lines[i])
              if (parsed && (parsed.cp !== undefined || parsed.mate !== undefined)) {
                bestScore = parsed
                break
              }
            }
            clearTimeout(to)
            resolve({ cp: bestScore?.cp ?? null, mate: bestScore?.mate ?? null, bestmove: null })
          }, timeoutMs)
        })
      }

      const whiteMoves: MoveAnalysis[] = []
      const blackMoves: MoveAnalysis[] = []

      for (let i = 0; i < uciMoves.length; i++) {
        if (!isAnalyzingRef.current) break

        // evaluate position BEFORE the move (and capture engine best move)
        const beforeSlice = uciMoves.slice(0, i)
        const beforeEval = await evaluatePosition(beforeSlice)

        // evaluate position AFTER the actual move
        const afterSlice = uciMoves.slice(0, i + 1)
        const afterEval = await evaluatePosition(afterSlice)

        // Build MoveAnalysis entry
        const san = histVerbose[i]?.san || ''
        const color = i % 2 === 0 ? 'white' : 'black'

  // compute raw score in pawns (cp/100) and a bar percentage (0-100) where 50 == equal
  const rawScore = afterEval.cp !== null ? afterEval.cp / 100 : (afterEval.mate !== null ? (afterEval.mate > 0 ? 9999 : -9999) : 0)
  const advantage_color = rawScore >= 0 ? 'white' : 'black'
  // Use centipawns for percentage mapping to keep direction consistent
  const cp = afterEval.cp !== null ? afterEval.cp : (afterEval.mate !== null ? (afterEval.mate > 0 ? 20000 : -20000) : 0)
  const MAX_CP = 2000 // cap at ±2000 centipawns (20 pawns) for scaling
  const cpClamped = Math.max(-MAX_CP, Math.min(MAX_CP, cp))
  const bar_percentage = Math.round(50 + (cpClamped / MAX_CP) * 50)

        const moveAnalysis: MoveAnalysis = {
          index: i + 1,
          san,
          color: color as 'white' | 'black',
          quality: 'unknown',
          best_move: beforeEval.bestmove ?? null,
          eval_after_move: {
            advantage_color: advantage_color as 'white' | 'black',
            bar_percentage: typeof bar_percentage === 'number' ? bar_percentage : 50,
            raw_score: rawScore
          },
          mate_info: afterEval.mate !== null ? { is_mate_sequence: true, mate_in: Math.abs(afterEval.mate), winning_side: afterEval.mate > 0 ? 'white' : 'black' } : { is_mate_sequence: false, mate_in: null, winning_side: null }
        }

        // set best_move if available from bestFromBefore evaluation (we didn't capture bestmove string, so leave null)
  // debug log per move
  try { console.debug('[analysis] move', i + 1, san, { cp: afterEval.cp, mate: afterEval.mate, rawScore, bestmove: beforeEval.bestmove ?? null, bar_percentage }) } catch {}

  // push into respective color
        if (color === 'white') whiteMoves.push(moveAnalysis)
        else blackMoves.push(moveAnalysis)

  // progress update
  const prog = Math.round(((i + 1) / uciMoves.length) * 100)
  try { console.debug('[analysis] progress', i + 1, '/', uciMoves.length, prog + '%') } catch {}
  setProgress({ type: 'progress', moveIndex: i + 1, progress: prog, movesAnalyzed: i + 1 })
      }

      const assembled: AnalysisResult = {
        white: { player: whitePlayer, stats: { theoretical: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unknown: 0, total: whiteMoves.length }, moves: whiteMoves },
        black: { player: blackPlayer, stats: { theoretical: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unknown: 0, total: blackMoves.length }, moves: blackMoves }
      }

  try { console.debug('[analysis] complete result', assembled) } catch {}
  setResult(assembled)
      setProgress({ type: 'complete' })
      setIsAnalyzingState(false)
      isAnalyzingRef.current = false
      hasStartedRef.current = false
      // terminate engine
      try { engine.terminate && engine.terminate(); engineRef.current = null } catch {}
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Analysis error'
      setError(errorMsg)
      setProgress({ type: 'error', error: errorMsg })
      setIsAnalyzingState(false)
      isAnalyzingRef.current = false
      hasStartedRef.current = false
    }
  }, [stockfishVersion, stockfishDepth])

  const stopAnalysis = useCallback(() => {
    try {
      if (engineRef.current) {
        engineRef.current.terminate && engineRef.current.terminate()
        engineRef.current = null
      }
    } catch {}
    setIsAnalyzingState(false)
    isAnalyzingRef.current = false
    hasStartedRef.current = false
  }, [])

  useEffect(() => {
    return () => {
      try {
        if (engineRef.current) {
          engineRef.current.terminate && engineRef.current.terminate()
          engineRef.current = null
        }
      } catch {}
    }
  }, [])

  return {
    progress,
    result,
    isAnalyzing,
    error,
    startAnalysis,
    stopAnalysis
  }
}
