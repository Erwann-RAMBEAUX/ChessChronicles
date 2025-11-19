import { Chess, Move, QUEEN } from 'chess.js';
import { Evaluation } from '../../../types/evaluation';

/**
 * Returns whether a move is critical to maintaining an advantage.
 * Exact copy from wintrchess
 */
export function isMoveCriticalCandidate(
  previous: { board: Chess; secondSubjectiveEvaluation?: Evaluation },
  current: {
    board: Chess;
    playedMove: Move;
    subjectiveEvaluation: Evaluation;
    evaluation: Evaluation;
  }
): boolean {
  const secondSubjectiveEval = previous.secondSubjectiveEvaluation;

  if (secondSubjectiveEval) {
    if (secondSubjectiveEval.type === 'centipawn' && secondSubjectiveEval.value >= 700)
      return false;
  } else {
    if (current.evaluation.type === 'centipawn' && current.subjectiveEvaluation.value >= 700)
      return false;
  }

  if (current.subjectiveEvaluation.value < 0) return false;

  if (current.playedMove.promotion === QUEEN) return false;

  if (previous.board.isCheck()) return false;

  return true;
}
