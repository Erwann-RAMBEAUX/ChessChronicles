import type { Evaluation } from '../../types/evaluation';

export const styles = {
  evaluationBar: 'relative w-full h-full flex flex-col overflow-hidden',
  blackBar: 'w-full transition-[height] duration-200',
  evaluationText: 'absolute left-1/2 -translate-x-1/2 text-[0.70rem] font-bold pointer-events-none z-10',
};

export function formatEvaluationText(evaluation: Evaluation | null): string {
  if (!evaluation) return '';

  if (evaluation.type === 'mate') {
    return `M${Math.abs(evaluation.value)}`;
  }

  if (evaluation.value === 0) return '1/2';

  const absValue = Math.abs(evaluation.value / 100);
  return absValue.toFixed(2);
}

export function getAdvantageInfo(evaluation: Evaluation | null) {
  const whiteAdvantage = evaluation
    ? evaluation.type === 'mate'
      ? evaluation.value > 0
      : evaluation.value > 0
    : false;
  const blackAdvantage = evaluation
    ? evaluation.type === 'mate'
      ? evaluation.value < 0
      : evaluation.value < 0
    : false;

  return { whiteAdvantage, blackAdvantage };
}
