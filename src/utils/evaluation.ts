import { Evaluation, Classification } from '../types/evaluation';
import { Color } from 'chess.js';

function flipColor(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

/**
 * Calculates expected points based on evaluation
 * Exact implementation from wintrchess
 */
export function getExpectedPoints(
  evaluation: Evaluation,
  moveColor: Color,
  centipawnGradient = 0.0035
): number {
  if (evaluation.type === 'mate') {
    if (evaluation.value === 0) {
      return Number(moveColor === 'w');
    }
    return Number(evaluation.value > 0);
  }

  return 1 / (1 + Math.exp(-centipawnGradient * evaluation.value));
}

/**
 * Calculates the expected points loss between two evaluations
 * Exact implementation from wintrchess
 */
export function getExpectedPointsLoss(
  previousEvaluation: Evaluation,
  currentEvaluation: Evaluation,
  moveColor: Color
): number {
  return Math.max(
    0,
    (getExpectedPoints(previousEvaluation, flipColor(moveColor)) -
      getExpectedPoints(currentEvaluation, moveColor)) *
      (moveColor === 'w' ? 1 : -1)
  );
}

/**
 * Classifies a move based on point loss and additional context
 * Exact implementation from wintrchess pointLossClassify
 */
export function classifyMove(
  previousEval: Evaluation,
  currentEval: Evaluation,
  moveColor: 'white' | 'black'
): Classification {
  const color: Color = moveColor === 'white' ? 'w' : 'b';
  const previousSubjectiveValue = previousEval.value * (color === 'w' ? 1 : -1);
  const subjectiveValue = currentEval.value * (color === 'w' ? 1 : -1);

  if (previousEval.type === 'mate' && currentEval.type === 'mate') {
    if (previousSubjectiveValue > 0 && subjectiveValue < 0) {
      return subjectiveValue < -3 ? Classification.MISTAKE : Classification.BLUNDER;
    }

    const mateLoss = (currentEval.value - previousEval.value) * (color === 'w' ? 1 : -1);

    if (mateLoss < 0 || (mateLoss === 0 && subjectiveValue < 0)) {
      return Classification.BEST;
    } else if (mateLoss < 2) {
      return Classification.EXCELLENT;
    } else if (mateLoss < 7) {
      return Classification.OKAY;
    } else {
      return Classification.INACCURACY;
    }
  }

  if (previousEval.type === 'mate' && currentEval.type === 'centipawn') {
    if (subjectiveValue >= 800) {
      return Classification.EXCELLENT;
    } else if (subjectiveValue >= 400) {
      return Classification.OKAY;
    } else if (subjectiveValue >= 200) {
      return Classification.INACCURACY;
    } else if (subjectiveValue >= 0) {
      return Classification.MISTAKE;
    } else {
      return Classification.BLUNDER;
    }
  }

  if (previousEval.type === 'centipawn' && currentEval.type === 'mate') {
    if (subjectiveValue > 0) {
      return Classification.BEST;
    } else if (subjectiveValue >= -2) {
      return Classification.BLUNDER;
    } else if (subjectiveValue >= -5) {
      return Classification.MISTAKE;
    } else {
      return Classification.INACCURACY;
    }
  }

  const pointLoss = getExpectedPointsLoss(previousEval, currentEval, color);

  if (pointLoss < 0.01) {
    return Classification.BEST;
  } else if (pointLoss < 0.045) {
    return Classification.EXCELLENT;
  } else if (pointLoss < 0.08) {
    return Classification.OKAY;
  } else if (pointLoss < 0.12) {
    return Classification.INACCURACY;
  } else if (pointLoss < 0.22) {
    return Classification.MISTAKE;
  } else {
    return Classification.BLUNDER;
  }
}

/**
 * Calculates the bar percentage for the evaluation bar
 * Returns a value between 0 (white winning) and 100 (black winning)
 * The bar represents the BLACK side height
 */
export function calculateBarPercentage(evaluation: Evaluation): number {
  if (evaluation.type === 'mate') {
    if (evaluation.value === 0) return 50;
    return evaluation.value > 0 ? 0 : 100;
  }

  const MAX_CP = 2000;
  const cpClamped = Math.max(-MAX_CP, Math.min(MAX_CP, evaluation.value));
  return 50 - (cpClamped / MAX_CP) * 50;
}
