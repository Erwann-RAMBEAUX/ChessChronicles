import { Chess, KING } from 'chess.js';
import { isPieceSafe, BoardPiece } from './pieceSafety';
import { moveCreatesGreaterThreat } from './dangerLevels';

function setFenTurn(fen: string, color: 'w' | 'b'): string {
  const parts = fen.split(' ');
  parts[1] = color;
  return parts.join(' ');
}

export function isPieceTrapped(board: Chess, piece: BoardPiece, dangerLevels = true): boolean {
  const calibratedBoard = new Chess(setFenTurn(board.fen(), piece.color));

  const standingPieceSafety = isPieceSafe(calibratedBoard, piece);

  const pieceMoves = calibratedBoard.moves({
    square: piece.square,
    verbose: true,
  });

  const allMovesUnsafe = pieceMoves.every((move) => {
    if (move.captured === KING) return false;

    const escapeBoard = new Chess(calibratedBoard.fen());

    if (dangerLevels && moveCreatesGreaterThreat(escapeBoard, piece, move)) {
      return true;
    }

    const escapeMove = escapeBoard.move(move);

    const escapedPieceSafety = isPieceSafe(
      escapeBoard,
      { ...piece, square: escapeMove.to },
      escapeMove
    );

    return !escapedPieceSafety;
  });

  return !standingPieceSafety && allMovesUnsafe;
}
