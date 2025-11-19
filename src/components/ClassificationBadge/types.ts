import { Classification } from '../../types/evaluation';

export interface ClassificationBadgeProps {
  classification: Classification | string;
  className?: string;
  showAll?: boolean;
}
