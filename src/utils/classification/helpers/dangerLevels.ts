import { Chess, Move, QUEEN } from 'chess.js';
import { getUnsafePieces, BoardPiece } from './pieceSafety';
import { getAttackingMoves, RawMove } from './attackers';

const pieceValues: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: Infinity,
};

function parseSanMove(san: string): { checkmate: boolean } {
  return { checkmate: san.endsWith('#') };
}

function isEqual(a: RawMove, b: RawMove): boolean {
  return a.from === b.from && a.to === b.to && a.piece === b.piece;
}

function differenceWith(arr1: RawMove[], arr2: RawMove[]): RawMove[] {
  return arr1.filter((item1) => !arr2.some((item2) => isEqual(item1, item2)));
}

function relativeUnsafePieceAttacks(
  actionBoard: Chess,
  threatenedPiece: BoardPiece,
  colour: 'w' | 'b',
  playedMove?: Move
): RawMove[] {
  return getUnsafePieces(actionBoard, colour, playedMove)
    .filter(
      (unsafePiece) =>
        unsafePiece.square !== threatenedPiece.square &&
        pieceValues[unsafePiece.type] >= pieceValues[threatenedPiece.type]
    )
    .map((unsafePiece) => getAttackingMoves(actionBoard, unsafePiece, false))
    .reduce((acc, val) => acc.concat(val), []);
}

export function moveCreatesGreaterThreat(
  board: Chess,
  threatenedPiece: BoardPiece,
  actingMove: Move | RawMove
): boolean {
  const actionBoard = new Chess(board.fen());

  const previousRelativeAttacks = relativeUnsafePieceAttacks(
    actionBoard,
    threatenedPiece,
    actingMove.color
  );

  let bakedMove: Move;
  try {
    bakedMove = actionBoard.move(actingMove as unknown as Move);
  } catch {
    return false;
  }

  const relativeAttacks = relativeUnsafePieceAttacks(
    actionBoard,
    threatenedPiece,
    actingMove.color,
    bakedMove
  );

  const newRelativeAttacks = differenceWith(relativeAttacks, previousRelativeAttacks);

  if (newRelativeAttacks.length > 0) return true;

  const lowValueCheckmatePin =
    pieceValues[threatenedPiece.type] < pieceValues[QUEEN] &&
    actionBoard.moves().some((move) => parseSanMove(move).checkmate);

  return lowValueCheckmatePin;
}

export function moveLeavesGreaterThreat(
  board: Chess,
  threatenedPiece: BoardPiece,
  actingMove: Move | RawMove
): boolean {
  const actionBoard = new Chess(board.fen());

  try {
    actionBoard.move(actingMove as unknown as Move);
  } catch {
    return false;
  }

  const relativeAttacks = relativeUnsafePieceAttacks(
    actionBoard,
    threatenedPiece,
    actingMove.color
  );

  if (relativeAttacks.length > 0) return true;

  const lowValueCheckmatePin =
    pieceValues[threatenedPiece.type] < pieceValues[QUEEN] &&
    actionBoard.moves().some((move) => parseSanMove(move).checkmate);

  return lowValueCheckmatePin;
}

export function hasDangerLevels(
  board: Chess,
  threatenedPiece: BoardPiece,
  actingMoves: RawMove[],
  equalityStrategy: 'creates' | 'leaves' = 'leaves'
): boolean {
  return actingMoves.every((actingMove) =>
    equalityStrategy === 'creates'
      ? moveCreatesGreaterThreat(board, threatenedPiece, actingMove)
      : moveLeavesGreaterThreat(board, threatenedPiece, actingMove)
  );
}
