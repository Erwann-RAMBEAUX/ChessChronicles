import { Chess, Move } from 'chess.js';
import type { Evaluation } from '../../types/evaluation';
import { getUnsafePieces } from './helpers/pieceSafety';
import { isPieceTrapped } from './helpers/pieceTrapped';
import { hasDangerLevels } from './helpers/dangerLevels';
import { getAttackingMoves } from './helpers/attackers';
import { isMoveCriticalCandidate } from './helpers/criticalMove';

export function considerBrilliantClassification(
  previous: { board: Chess; evaluation: Evaluation; secondSubjectiveEvaluation?: Evaluation },
  current: { board: Chess; playedMove: Move; subjectiveEvaluation: Evaluation; evaluation: Evaluation }
): boolean {
  if (!isMoveCriticalCandidate(previous, current)) return false;

  if (current.playedMove.promotion) return false;

  const previousUnsafePieces = getUnsafePieces(previous.board, current.playedMove.color);

  const unsafePieces = getUnsafePieces(current.board, current.playedMove.color, current.playedMove);

  if (!current.board.isCheck() && unsafePieces.length < previousUnsafePieces.length) return false;

  const dangerLevelsProtected = unsafePieces.every((unsafePiece) =>
    hasDangerLevels(
      current.board,
      unsafePiece,
      getAttackingMoves(current.board, unsafePiece, false)
    )
  );

  if (dangerLevelsProtected) return false;

  const previousTrappedPieces = previousUnsafePieces.filter((unsafePiece) =>
    isPieceTrapped(previous.board, unsafePiece)
  );

  const trappedPieces = unsafePieces.filter((unsafePiece) =>
    isPieceTrapped(current.board, unsafePiece)
  );

  const movedPieceTrapped = previousTrappedPieces.some(
    (trappedPiece) => trappedPiece.square === current.playedMove.from
  );

  if (
    trappedPieces.length === unsafePieces.length ||
    movedPieceTrapped ||
    trappedPieces.length < previousTrappedPieces.length
  ) {
    return false;
  }

  return unsafePieces.length > 0;
}
