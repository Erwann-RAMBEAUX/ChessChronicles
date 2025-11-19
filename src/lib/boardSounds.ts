import { Chess, Move } from 'chess.js';

const moveSounds = {
  move: '/audio/move.mp3',
  check: '/audio/check.mp3',
  capture: '/audio/capture.mp3',
  castle: '/audio/castle.mp3',
  promote: '/audio/promote.mp3',
  gameEnd: '/audio/gameend.mp3',
};

interface ParsedMove {
  capture: boolean;
  castling: boolean;
  promotion: boolean;
  check: boolean;
  checkmate: boolean;
}

function parseSanMove(san: string): ParsedMove {
  return {
    capture: san.includes('x'),
    castling: san.includes('O'),
    promotion: san.includes('='),
    check: san.includes('+'),
    checkmate: san.includes('#'),
  };
}

export function playBoardSound(move: Move, fen: string) {
  const board = new Chess(fen);

  board.move(move);
  const isGameOver = board.isGameOver();

  if (isGameOver) {
    new Audio(moveSounds.gameEnd).play();
    return;
  }

  const parsedMove = parseSanMove(move.san);

  if (parsedMove.checkmate || parsedMove.check) {
    new Audio(moveSounds.check).play();
  } else if (parsedMove.castling) {
    new Audio(moveSounds.castle).play();
  } else if (parsedMove.promotion) {
    new Audio(moveSounds.promote).play();
  } else if (parsedMove.capture) {
    new Audio(moveSounds.capture).play();
  } else {
    new Audio(moveSounds.move).play();
  }
}

export default playBoardSound;
