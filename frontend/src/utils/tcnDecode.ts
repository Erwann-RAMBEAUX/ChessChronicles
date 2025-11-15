import { Chess } from 'chess.js'

export interface UCI {
  from: string
  to: string
  drop?: string
  promotion?: string
}

// Proprietary alphabet (TCN) used by Chess.com to encode moves
const TCN_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?{~}(^)[_]@#$,./&-*++='

/**
 * Decodes a TCN string (moveList) into an array of UCI moves.
 */
export function decodeTcnToUciArray(tcnString: string): UCI[] {
  const result: UCI[] = []
  const len = tcnString.length
  for (let i = 0; i < len; i += 2) {
    if (i + 1 >= len) break
    const move: UCI = { from: '', to: '' }
    const fromIndex = TCN_ALPHABET.indexOf(tcnString[i])
    const toIndexRaw = TCN_ALPHABET.indexOf(tcnString[i + 1])
    if (fromIndex < 0 || toIndexRaw < 0) continue
    let toIndex = toIndexRaw
    if (toIndexRaw > 63) {
      move.promotion = 'qnrbkp'[Math.floor((toIndexRaw - 64) / 3)]
      toIndex = fromIndex + (fromIndex < 16 ? -8 : 8) + ((toIndexRaw - 1) % 3) - 1
    }
    if (fromIndex > 75) {
      move.drop = 'qnrbkp'[fromIndex - 79]
    } else {
      move.from = TCN_ALPHABET[fromIndex % 8] + (Math.floor(fromIndex / 8) + 1)
    }
    move.to = TCN_ALPHABET[toIndex % 8] + (Math.floor(toIndex / 8) + 1)
    result.push(move)
  }
  return result
}

/**
 * Returns only the move section (without headers) in PGN format from an encoded moveList TCN.
 */
export function getPgnMoveText(moveList: string): string {
  const uciMoves = decodeTcnToUciArray(moveList)
  const chess = new Chess()
  for (const mv of uciMoves) {
    try { chess.move(mv) } catch { /* ignore invalid */ }
  }
  const full = chess.pgn()
  const parts = full.split('\n\n')
  return parts.length > 1 ? parts[1] : parts[0].trim()
}

/**
 * Builds a complete PGN (headers + moves) from existing headers (object) and an encoded moveList.
 * If headers are not provided, they are ignored.
 */
export function buildSyntheticPgn(headers: Record<string, any> | undefined, moveListEncoded: string): string {
  const moveText = getPgnMoveText(moveListEncoded)
  const headerLines = headers
    ? Object.entries(headers)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `[${k} "${String(v).replace(/"/g, '\"')}"]`)
    : []
  return headerLines.join('\n') + (headerLines.length ? '\n\n' : '') + moveText
}
