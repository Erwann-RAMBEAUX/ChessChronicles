import { Chess, Square, PieceSymbol, Color, KING, Move } from 'chess.js';

export interface RawMove {
  piece: PieceSymbol;
  color: Color;
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

export interface BoardPiece {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

function setFenTurn(fen: string, color: Color): string {
  const parts = fen.split(' ');
  parts[1] = color;
  return parts.join(' ');
}

function getCaptureSquare(move: Move): Square {
  return move.to;
}

function flipColor(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

function toRawMove(move: Move): RawMove {
  return {
    piece: move.piece,
    color: move.color,
    from: move.from,
    to: move.to,
    promotion: move.promotion,
  };
}

function directAttackingMoves(board: Chess, piece: BoardPiece): RawMove[] {
  const attackerBoard = new Chess(setFenTurn(board.fen(), flipColor(piece.color)));

  const attackingMoves: RawMove[] = attackerBoard
    .moves({ verbose: true })
    .filter((move) => getCaptureSquare(move) === piece.square)
    .map(toRawMove);

  const kingAttackerSquare = attackerBoard
    .board()
    .flat()
    .find((p) => p && p.type === KING && p.color === flipColor(piece.color));

  if (kingAttackerSquare) {
    const kingSquare = attackerBoard
      .board()
      .flatMap((row, rowIndex) =>
        row.map((p, colIndex) => ({
          piece: p,
          square: `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` as Square,
        }))
      )
      .find(
        (item) =>
          item.piece && item.piece.type === KING && item.piece.color === flipColor(piece.color)
      )?.square;

    if (kingSquare && attackerBoard.isAttacked(piece.square, flipColor(piece.color))) {
      if (!attackingMoves.some((attack) => attack.piece === KING)) {
        attackingMoves.push({
          piece: KING,
          color: flipColor(piece.color),
          from: kingSquare,
          to: piece.square,
        });
      }
    }
  }

  return attackingMoves;
}

function isEqual(a: RawMove, b: RawMove): boolean {
  return a.from === b.from && a.to === b.to && a.piece === b.piece && a.color === b.color;
}

function xorWith(arr1: RawMove[], arr2: RawMove[]): RawMove[] {
  const result: RawMove[] = [];
  for (const item of arr1) {
    if (!arr2.some((x) => isEqual(x, item))) {
      result.push(item);
    }
  }
  for (const item of arr2) {
    if (!arr1.some((x) => isEqual(x, item))) {
      result.push(item);
    }
  }
  return result;
}

export function getAttackingMoves(
  board: Chess,
  piece: BoardPiece,
  transitive: boolean = true
): RawMove[] {
  const attackingMoves = directAttackingMoves(board, piece);

  if (!transitive) return attackingMoves;

  interface TransitiveAttacker {
    directFen: string;
    square: Square;
    type: PieceSymbol;
  }

  const frontier: TransitiveAttacker[] = attackingMoves.map((attackingMove) => ({
    directFen: board.fen(),
    square: attackingMove.from,
    type: attackingMove.piece,
  }));

  while (frontier.length > 0) {
    const transitiveAttacker = frontier.pop();
    if (!transitiveAttacker) break;

    const transitiveBoard = new Chess(transitiveAttacker.directFen);

    if (transitiveAttacker.type === KING) {
      continue;
    }

    const oldAttackingMoves = directAttackingMoves(transitiveBoard, piece);

    transitiveBoard.remove(transitiveAttacker.square);

    const revealedAttackingMoves = xorWith(
      oldAttackingMoves.filter((attackingMove) => attackingMove.from !== transitiveAttacker.square),
      directAttackingMoves(transitiveBoard, piece)
    );

    attackingMoves.push(...revealedAttackingMoves);

    frontier.push(
      ...revealedAttackingMoves.map((attackingMove) => ({
        directFen: transitiveBoard.fen(),
        square: attackingMove.from,
        type: attackingMove.piece,
      }))
    );
  }

  return attackingMoves;
}
