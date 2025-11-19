import { useMemo } from 'react';
import { calculateBarPercentage } from '../../utils/evaluation';
import type { EvaluationBarProps } from './types';
import { styles, formatEvaluationText, getAdvantageInfo } from './utils';

export function EvaluationBar({
  evaluation,
  orientation = 'white',
  finalResult,
  className = '',
  style = {},
}: EvaluationBarProps) {
  const blackBarPercentage = useMemo(() => {
    if (!evaluation) return 50;
    return calculateBarPercentage(evaluation);
  }, [evaluation]);

  const evaluationText = useMemo(() => formatEvaluationText(evaluation), [evaluation]);
  const flipped = orientation === 'black';
  const { blackAdvantage } = getAdvantageInfo(evaluation);

  const textAtTop = blackAdvantage ? !flipped : flipped;
  const textColor = textAtTop ? (flipped ? '#000' : '#fff') : !flipped ? '#000' : '#fff';

  if (
    finalResult &&
    (finalResult === '1-0' || finalResult === '0-1' || finalResult === '1/2-1/2')
  ) {
    let finalBlackPercentage = 50;
    let resultText = '½-½';

    if (finalResult === '1-0') {
      finalBlackPercentage = 0;
      resultText = '1-0';
    } else if (finalResult === '0-1') {
      finalBlackPercentage = 100;
      resultText = '0-1';
    }

    const bottomPlayerWon = flipped ? finalResult === '0-1' : finalResult === '1-0';
    const finalTextAtBottom = bottomPlayerWon || finalResult === '1/2-1/2';
    const finalTextColor =
      bottomPlayerWon || finalResult === '1/2-1/2'
        ? !flipped
          ? '#000'
          : '#fff'
        : flipped
          ? '#000'
          : '#fff';

    return (
      <div
        className={`${styles.evaluationBar} ${className} ${flipped ? 'flex-col-reverse' : ''} rounded-lg overflow-hidden border border-slate-700/50`}
        style={{ backgroundColor: '#fff', ...style }}
      >
        <div
          className={styles.blackBar}
          style={{
            backgroundColor: '#1a2332',
            height: `${finalBlackPercentage}%`,
          }}
        />
        <span
          className={styles.evaluationText}
          style={
            finalTextAtBottom
              ? { bottom: '7px', color: finalTextColor }
              : { top: '7px', color: finalTextColor }
          }
        >
          {resultText}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.evaluationBar} ${className} ${flipped ? 'flex-col-reverse' : ''} rounded-lg overflow-hidden border border-slate-700/50`}
      style={{ backgroundColor: '#fff', ...style }}
    >
      <div
        className={styles.blackBar}
        style={{
          backgroundColor: '#1a2332',
          height: `${blackBarPercentage}%`,
        }}
      />
      <span
        className={styles.evaluationText}
        style={textAtTop ? { top: '7px', color: textColor } : { bottom: '7px', color: textColor }}
      >
        {evaluationText}
      </span>
    </div>
  );
}
