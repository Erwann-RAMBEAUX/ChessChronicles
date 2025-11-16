import React, { useMemo } from 'react'

interface Props {
  eval_data?: any | null
  mate_info?: any | null
  orientation?: 'white' | 'black'
  finalResult?: string | null
  className?: string
  style?: React.CSSProperties
}

const styles = {
  evaluationBar: 'relative w-full h-full flex flex-col overflow-hidden rounded',
  overBar: 'w-full transition-[height] duration-250',
  evaluationText: 'absolute left-1/2 -translate-x-1/2 text-xs font-semibold pointer-events-none'
}

export function EvaluationBar({ eval_data, mate_info, orientation = 'white', finalResult, className = '', style = {} }: Props) {
  if (!eval_data && !mate_info) return null

  // Build a small evaluation object compatible with the root logic
  const evaluation = useMemo(() => {
    // mate takes precedence
    if (mate_info?.is_mate_sequence) {
      const mateIn = mate_info.mate_in ?? 0
      const winning = mate_info.winning_side
      const signed = winning === 'white' ? Math.abs(mateIn) : -Math.abs(mateIn)
      return { type: 'mate', value: signed }
    }

    // centipawn: convert raw_score (pawns) to centipawns
    const raw = (eval_data?.raw_score ?? 0)
    const cp = Math.round(raw * 100)
    return { type: 'centipawn', value: cp }
  }, [eval_data, mate_info])

  // Format evaluation text
  const evaluationText = useMemo(() => {
    if (evaluation.type === 'mate') {
      return `M${Math.abs(evaluation.value)}`
    }
    const v = (evaluation.value ?? 0) / 100
    return v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)
  }, [evaluation])

  // Determine the bar height (overBarHeight) using same formula as root
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

  const overBarHeight = useMemo(() => {
    if (evaluation.type === 'centipawn') {
      // evaluation.value is in centipawns
      return clamp(50 - (evaluation.value / 20), 5, 95)
    } else {
      // mate
      const moveColour = orientation === 'white' ? 'white' : 'black'
      return evaluation.value === 0 ? (moveColour === 'white' ? 0 : 100) : (evaluation.value > 0 ? 0 : 100)
    }
  }, [evaluation, orientation])

  const flipped = orientation === 'black'

  const textBottom = overBarHeight > 50 === flipped

  // If finalResult, show final result similar to previous behaviour — keep full height
  if (finalResult && (finalResult === '1-0' || finalResult === '0-1' || finalResult === '1/2-1/2')) {
    return (
      <div className={`${styles.evaluationBar} ${className}`} style={{ backgroundColor: flipped ? '#0c0c0c' : '#fff', ...style }}>
        <div
          className={styles.overBar}
          style={{
            backgroundColor: flipped ? '#fff' : '#0c0c0c',
            height: flipped ? `calc(100% - ${overBarHeight}%)` : `${overBarHeight}%`
          }}
        />

        <span
          className={styles.evaluationText}
          style={textBottom ? { bottom: '7px', color: overBarHeight > 50 ? '#fff' : '#000' } : { top: '7px', color: overBarHeight > 50 ? '#fff' : '#000' }}
        >
          {finalResult === '1-0' ? '1-0' : finalResult === '0-1' ? '0-1' : '½'}
        </span>
      </div>
    )
  }

  return (
    <div className={`${styles.evaluationBar} ${className}`} style={{ backgroundColor: flipped ? '#0c0c0c' : '#fff', ...style }}>
      <div
        className={styles.overBar}
        style={{
          backgroundColor: flipped ? '#fff' : '#0c0c0c',
          height: flipped ? `calc(100% - ${overBarHeight}%)` : `${overBarHeight}%`
        }}
      />

      <span
        className={styles.evaluationText}
        style={textBottom ? { bottom: '7px', color: overBarHeight > 50 ? '#fff' : '#000' } : { top: '7px', color: overBarHeight > 50 ? '#fff' : '#000' }}
      >
        {evaluationText}
      </span>
    </div>
  )
}

export default EvaluationBar
