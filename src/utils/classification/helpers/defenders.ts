import { Chess, Color, Move } from 'chess.js';
import { getAttackingMoves, BoardPiece, RawMove } from './attackers';

function setFenTurn(fen: string, color: Color): string {
  const parts = fen.split(' ');
  parts[1] = color;
  return parts.join(' ');
}

function flipColor(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

function minBy<T>(array: (T | undefined)[], iteratee: (item: T) => number): T | undefined {
  let minItem: T | undefined;
  let minValue = Infinity;

  for (const item of array) {
    if (item !== undefined) {
      const value = iteratee(item);
      if (value < minValue) {
        minValue = value;
        minItem = item;
      }
    }
  }

  return minItem;
}

export function getDefendingMoves(
  board: Chess,
  piece: BoardPiece,
  transitive: boolean = true
): RawMove[] {
  const defenderBoard = new Chess(board.fen());

  const attackingMoves = getAttackingMoves(defenderBoard, piece, false);

  const smallestRecapturerSet = minBy(
    attackingMoves
      .map((attackingMove) => {
        const captureBoard = new Chess(setFenTurn(defenderBoard.fen(), flipColor(piece.color)));

        try {
          captureBoard.move(attackingMove as unknown as Move);
        } catch {
          return undefined;
        }

        return getAttackingMoves(
          captureBoard,
          {
            type: attackingMove.piece,
            color: attackingMove.color,
            square: attackingMove.to,
          },
          transitive
        );
      })
      .filter((recapturers) => !!recapturers),
    (recapturers) => recapturers!.length
  );

  if (!smallestRecapturerSet) {
    const flippedPiece: BoardPiece = {
      type: piece.type,
      color: flipColor(piece.color),
      square: piece.square,
    };

    defenderBoard.put(flippedPiece, piece.square);

    return getAttackingMoves(defenderBoard, flippedPiece, transitive);
  }

  return smallestRecapturerSet;
}
