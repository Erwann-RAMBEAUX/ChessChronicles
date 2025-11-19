import type { CSSProperties } from 'react';
import type { Evaluation } from '../../types/evaluation';

export interface EvaluationBarProps {
  evaluation: Evaluation | null;
  orientation?: 'white' | 'black';
  finalResult?: string | null;
  className?: string;
  style?: CSSProperties;
}
