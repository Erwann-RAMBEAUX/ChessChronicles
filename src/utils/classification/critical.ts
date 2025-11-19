import { Chess, Move, Color } from 'chess.js';
import { Evaluation } from '../../types/evaluation';
import { isPieceSafe, BoardPiece } from './helpers/pieceSafety';
import { getExpectedPointsLoss } from '../evaluation';
import { isMoveCriticalCandidate } from './helpers/criticalMove';

function flipColor(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

function getCaptureSquare(move: Move) {
  return move.to;
}

export function considerCriticalClassification(
  previous: {
    board: Chess;
    evaluation: Evaluation;
    secondSubjectiveEvaluation?: Evaluation;
    secondTopLine?: { evaluation: Evaluation };
  },
  current: {
    board: Chess;
    playedMove: Move;
    subjectiveEvaluation: Evaluation;
    evaluation: Evaluation;
  }
): boolean {
  if (!isMoveCriticalCandidate(previous, current)) return false;

  if (current.subjectiveEvaluation.type === 'mate' && current.subjectiveEvaluation.value > 0)
    return false;

  if (current.playedMove.captured) {
    const piece: BoardPiece = {
      color: flipColor(current.playedMove.color),
      square: getCaptureSquare(current.playedMove),
      type: current.playedMove.captured,
    };
    const capturedPieceSafety = isPieceSafe(previous.board, piece);

    if (!capturedPieceSafety) return false;
  }

  if (!previous.secondTopLine?.evaluation) return false;

  const secondTopMovePointLoss = getExpectedPointsLoss(
    previous.evaluation,
    previous.secondTopLine.evaluation,
    current.playedMove.color
  );

  return secondTopMovePointLoss >= 0.1;
}
