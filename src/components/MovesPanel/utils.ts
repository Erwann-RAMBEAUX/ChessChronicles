/**
 * Formats and translates game result
 */
export function formatGameResult(
  result?: string,
  t?: (key: string, opts?: Record<string, unknown>) => string
): string | null | undefined {
  if (!result) return undefined;

  const lower = result.toLowerCase();

  if (lower.includes('won')) {
    if (lower.includes('resignation')) {
      const winner = result.split(' won')[0];
      return t ? `${winner} ${t('analyze.result.won_resignation')}` : result;
    }
    if (lower.includes('checkmate')) {
      const winner = result.split(' won')[0];
      return t ? `${winner} ${t('analyze.result.won_checkmate')}` : result;
    }
    if (lower.includes('timeout')) {
      const winner = result.split(' won')[0];
      return t ? `${winner} ${t('analyze.result.won_timeout')}` : result;
    }
    return result;
  }

  if (lower.includes('draw')) {
    if (lower.includes('repetition')) {
      return t ? t('analyze.result.draw_repetition') : result;
    }
    if (lower.includes('pat') || lower.includes('stalemate')) {
      return t ? t('analyze.result.draw_stalemate') : result;
    }
    if (lower.includes('insufficient') || lower.includes('material')) {
      return t ? t('analyze.result.draw_material') : result;
    }
    if (lower.includes('agreement')) {
      return t ? t('analyze.result.draw_agreement') : result;
    }
    return null;
  }

  if (lower.includes('ongoing')) {
    return null;
  }

  return result;
}

/**
 * Extracts the piece from a move in algebraic notation
 * and returns the corresponding Unicode symbol
 */
export function getPieceSymbol(move: string, isWhite: boolean): string {
  if (!move) return '';

  // Standard algebraic notation:
  // - 0-0 or 0-0-0 = castling (king)
  // - K = king
  // - Q = queen
  // - R = rook
  // - B = bishop
  // - N = knight
  // - No prefix = pawn

  let piece = 'pawn';
  const firstChar = move[0];

  if (move.includes('0-0') || move.includes('O-O')) piece = 'king';
  else if (firstChar === 'K') piece = 'king';
  else if (firstChar === 'Q') piece = 'queen';
  else if (firstChar === 'R') piece = 'rook';
  else if (firstChar === 'B') piece = 'bishop';
  else if (firstChar === 'N') piece = 'knight';

  const symbols = {
    white: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
    black: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙',
    },
  };

  return symbols[isWhite ? 'white' : 'black'][piece as keyof typeof symbols.white];
}
