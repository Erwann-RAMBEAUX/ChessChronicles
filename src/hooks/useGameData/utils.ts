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
    message = t('analyze.result.playerWins', { player: winner });
  } else if (result === '0-1') {
    winner = blackPlayer;
    message = t('analyze.result.playerWins', { player: winner });
  } else if (result === '1/2-1/2') {
    message = t('analyze.result.draw');
  }

  if (termination) {
    const terminationLower = termination.toLowerCase();

    if (terminationLower.includes('checkmate')) {
      message += ` ${t('analyze.termination.by', 'par')} ${t('analyze.termination.checkmate', 'échec et mat')}`;
    } else if (terminationLower.includes('time')) {
      message += ` ${t('analyze.termination.by', 'par')} ${t('analyze.termination.time', 'au temps')}`;
    } else if (terminationLower.includes('resignation')) {
      message += ` ${t('analyze.termination.by', 'par')} ${t('analyze.termination.resignation', 'abandon')}`;
    } else if (terminationLower.includes('stalemate')) {
      message += ` ${t('analyze.termination.by', 'par')} ${t('analyze.termination.stalemate', 'pat')}`;
    } else if (terminationLower.includes('insufficient')) {
      message += ` ${t('analyze.termination.by', 'par')} ${t('analyze.termination.insufficient', 'matériel insuffisant')}`;
    } else if (terminationLower.includes('repetition')) {
      message += ` ${t('analyze.termination.by', 'par')} ${t('analyze.termination.repetition', 'répétition')}`;
    } else if (terminationLower.includes('50')) {
      message += ` ${t('analyze.termination.by', 'par')} ${t('analyze.termination.fiftyMoves', 'règle des 50 coups')}`;
    } else if (terminationLower.includes('agreement')) {
      message += ` ${t('analyze.termination.by', 'par')} ${t('analyze.termination.agreement', 'accord mutuel')}`;
    }
  }

  return message || undefined;
};
