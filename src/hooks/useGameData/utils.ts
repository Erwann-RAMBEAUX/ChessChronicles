import type { TFunction } from 'i18next';

export const parseGameResult = (
  result: string | null,
  termination: string | null,
  whitePlayer: string,
  blackPlayer: string,
  t: TFunction
) => {
  if (!result || result === '*') {
    return undefined;
  }

  let message = '';
  let winner = '';

  if (result === '1-0') {
    winner = whitePlayer;
    message = t('game.result.playerWins', { player: winner });
  } else if (result === '0-1') {
    winner = blackPlayer;
    message = t('game.result.playerWins', { player: winner });
  } else if (result === '1/2-1/2') {
    message = t('game.result.draw');
  }

  if (termination) {
    const terminationLower = termination.toLowerCase();

    if (terminationLower.includes('checkmate')) {
      message += ` ${t('game.termination.by', 'par')} ${t('game.termination.checkmate', 'échec et mat')}`;
    } else if (terminationLower.includes('time')) {
      message += ` ${t('game.termination.by', 'par')} ${t('game.termination.time', 'au temps')}`;
    } else if (terminationLower.includes('resignation')) {
      message += ` ${t('game.termination.by', 'par')} ${t('game.termination.resignation', 'abandon')}`;
    } else if (terminationLower.includes('stalemate')) {
      message += ` ${t('game.termination.by', 'par')} ${t('game.termination.stalemate', 'pat')}`;
    } else if (terminationLower.includes('insufficient')) {
      message += ` ${t('game.termination.by', 'par')} ${t('game.termination.insufficient', 'matériel insuffisant')}`;
    } else if (terminationLower.includes('repetition')) {
      message += ` ${t('game.termination.by', 'par')} ${t('game.termination.repetition', 'répétition')}`;
    } else if (terminationLower.includes('50')) {
      message += ` ${t('game.termination.by', 'par')} ${t('game.termination.fiftyMoves', 'règle des 50 coups')}`;
    } else if (terminationLower.includes('agreement')) {
      message += ` ${t('game.termination.by', 'par')} ${t('game.termination.agreement', 'accord mutuel')}`;
    }
  }

  return message || undefined;
};
