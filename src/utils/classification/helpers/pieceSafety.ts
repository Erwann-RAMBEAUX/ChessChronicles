import { Chess, Move, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, PieceSymbol, Square } from 'chess.js';
import { getAttackingMoves, BoardPiece, RawMove } from './attackers';
import { getDefendingMoves } from './defenders';

const pieceValues: Record<PieceSymbol, number> = {
  [PAWN]: 1,
  [KNIGHT]: 3,
  [BISHOP]: 3,
  [ROOK]: 5,
  [QUEEN]: 9,
  [KING]: Infinity,
};

function minBy<T>(array: T[], iteratee: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  let minItem = array[0];
  let minValue = iteratee(array[0]);

  for (let i = 1; i < array.length; i++) {
    const value = iteratee(array[i]);
    if (value < minValue) {
      minValue = value;
      minItem = array[i];
    }
  }

  return minItem;
}

function toBoardPiece(move: RawMove): BoardPiece {
  return {
    type: move.piece,
    color: move.color,
    square: move.from,
  };
}

export function isPieceSafe(board: Chess, piece: BoardPiece, playedMove?: Move): boolean {
  const directAttackers = getAttackingMoves(board, piece, false).map(toBoardPiece);

  const attackers = getAttackingMoves(board, piece).map(toBoardPiece);
  const defenders = getDefendingMoves(board, piece).map(toBoardPiece);

  if (
    playedMove?.captured &&
    piece.type === ROOK &&
    pieceValues[playedMove.captured] === pieceValues[KNIGHT] &&
    attackers.length === 1 &&
    defenders.length > 0 &&
    pieceValues[attackers[0].type] === pieceValues[KNIGHT]
  ) {
    return true;
  }

  const hasLowerValueAttacker = directAttackers.some(
    (attacker) => pieceValues[attacker.type] < pieceValues[piece.type]
  );

  if (hasLowerValueAttacker) return false;

  if (attackers.length <= defenders.length) {
    return true;
  }

  const lowestValueAttacker = minBy(directAttackers, (attacker) => pieceValues[attacker.type]);

  if (!lowestValueAttacker) return true;

  if (
    pieceValues[piece.type] < pieceValues[lowestValueAttacker.type] &&
    defenders.some((defender) => pieceValues[defender.type] < pieceValues[lowestValueAttacker.type])
  ) {
    return true;
  }

  if (defenders.some((defender) => defender.type === PAWN)) {
    return true;
  }

  return false;
}

export function getUnsafePieces(board: Chess, color: 'w' | 'b', playedMove?: Move): BoardPiece[] {
  const capturedPieceValue = playedMove?.captured ? pieceValues[playedMove.captured] : 0;

  const pieces: BoardPiece[] = [];
  board.board().forEach((row, rowIndex) => {
    row.forEach((p, colIndex) => {
      if (p && p.color === color) {
        const square = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` as Square;
        pieces.push({ type: p.type, color: p.color, square });
      }
    });
  });

  return pieces.filter(
    (piece) =>
      piece.type !== PAWN &&
      piece.type !== KING &&
      pieceValues[piece.type] > capturedPieceValue &&
      !isPieceSafe(board, piece, playedMove)
  );
}

export type { BoardPiece };
