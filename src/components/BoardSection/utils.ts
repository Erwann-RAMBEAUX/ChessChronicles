import {
  getClassificationColor,
  getClassificationColorDarker,
} from '../../utils/classificationColors';
import type { Classification } from '../../types/evaluation';
import type { BadgePositionInfo } from './types';

export interface SquarePosition {
  x: number;
  y: number;
}

export function getSquarePosition(
  square: string,
  size: number,
  orientation: 'white' | 'black'
): SquarePosition {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1]) - 1;
  const squareSize = size / 8;

  let x, y;
  if (orientation === 'white') {
    x = file * squareSize + squareSize / 2;
    y = (7 - rank) * squareSize + squareSize / 2;
  } else {
    x = (7 - file) * squareSize + squareSize / 2;
    y = rank * squareSize + squareSize / 2;
  }

  return { x, y };
}

export function buildCustomSquareStyles(
  lastMoveSquares: Record<string, unknown>,
  currentMoveClassification: Classification | null
): Record<string, unknown> {
  if (!lastMoveSquares || Object.keys(lastMoveSquares).length === 0) return {};

  const squares = Object.keys(lastMoveSquares);
  if (squares.length < 2) return lastMoveSquares;

  const fromSquare = squares[0];
  const toSquare = squares[1];

  const styledSquares: Record<string, unknown> = {};

  if (currentMoveClassification) {
    styledSquares[fromSquare] = {
      background: getClassificationColorDarker(currentMoveClassification),
    };
    styledSquares[toSquare] = { background: getClassificationColor(currentMoveClassification) };
  } else {
    styledSquares[fromSquare] = lastMoveSquares[fromSquare];
    styledSquares[toSquare] = lastMoveSquares[toSquare];
  }

  return styledSquares;
}

export function calculateBadgePosition(
  lastMoveSquareInfoTo: string | null | undefined,
  size: number,
  orientation: 'white' | 'black'
): BadgePositionInfo | null {
  if (!lastMoveSquareInfoTo || !size) return null;

  const square = lastMoveSquareInfoTo;
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1]) - 1;
  const squareSize = size / 8;

  let x, y;
  if (orientation === 'white') {
    x = file * squareSize;
    y = (7 - rank) * squareSize;
  } else {
    x = (7 - file) * squareSize;
    y = rank * squareSize;
  }

  return { x, y, squareSize };
}
