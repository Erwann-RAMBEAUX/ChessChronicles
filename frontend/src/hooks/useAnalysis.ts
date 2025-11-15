import { useEffect, useRef, useState, useCallback } from 'react'

export interface AnalysisProgress {
  type: 'start' | 'progress' | 'complete' | 'error'
  totalMoves?: number
  white?: string
  black?: string
  gameId?: string
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
  gameId: string
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
  const [progress, setProgress] = useState<AnalysisProgress | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzingState] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const isAnalyzingRef = useRef(false)
  const hasStartedRef = useRef(false)

  const startAnalysis = useCallback((pgn: string, gameId: string, analyzedPlayer: string) => {
    // Prevent multiple simultaneous analyses
    if (isAnalyzingRef.current || hasStartedRef.current) {
      return
    }

    hasStartedRef.current = true
    setProgress(null)
    setResult(null)
    setError(null)
    setIsAnalyzingState(true)
    isAnalyzingRef.current = true

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'localhost:8000'
    // Remove http:// or https:// if present in VITE_BACKEND_URL
    const cleanBackendUrl = backendUrl.replace(/^https?:\/\//, '')
    const wsUrl = `${protocol}//${cleanBackendUrl}/ws/analyze`

    try {
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        wsRef.current?.send(
          JSON.stringify({
            pgn,
            game_id: gameId
          })
        )
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          switch (data.type) {
            case 'analysis_start':
              setProgress({
                type: 'start',
                totalMoves: data.total_moves,
                white: data.white,
                black: data.black,
                gameId: data.game_id
              })
              break

            case 'analysis_progress':
              setProgress({
                type: 'progress',
                moveIndex: data.move_index,
                progress: data.progress,
                movesAnalyzed: data.moves_analyzed
              })
              break

            case 'analysis_complete':
              setResult({
                gameId: data.game_id,
                white: {
                  player: data.white.player,
                  stats: data.white.stats,
                  moves: data.white.moves
                },
                black: {
                  player: data.black.player,
                  stats: data.black.stats,
                  moves: data.black.moves
                }
              })
              setProgress({
                type: 'complete'
              })
              setIsAnalyzingState(false)
              isAnalyzingRef.current = false
              hasStartedRef.current = false
              break

            case 'analysis_error':
              setError(data.error)
              setProgress({
                type: 'error',
                error: data.error
              })
              setIsAnalyzingState(false)
              isAnalyzingRef.current = false
              hasStartedRef.current = false
              break
          }
        } catch (e) {
          console.error('Error parsing analysis message:', e)
        }
      }

      wsRef.current.onerror = (event) => {
        const errorMsg = 'Erreur de connexion WebSocket'
        console.error('WebSocket error:', event)
        setError(errorMsg)
        setProgress({
          type: 'error',
          error: errorMsg
        })
        setIsAnalyzingState(false)
        isAnalyzingRef.current = false
        hasStartedRef.current = false
      }

      wsRef.current.onclose = () => {
        if (isAnalyzingRef.current && !result) {
          const errorMsg = 'Connection closed'
          setError(errorMsg)
          setProgress({
            type: 'error',
            error: errorMsg
          })
          setIsAnalyzingState(false)
          isAnalyzingRef.current = false
          hasStartedRef.current = false
        }
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Connection error'
      console.error('Analysis error:', errorMsg)
      setError(errorMsg)
      setProgress({
        type: 'error',
        error: errorMsg
      })
      setIsAnalyzingState(false)
      isAnalyzingRef.current = false
      hasStartedRef.current = false
    }
  }, [result])

  const stopAnalysis = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    setIsAnalyzingState(false)
    isAnalyzingRef.current = false
    hasStartedRef.current = false
  }, [])

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
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
