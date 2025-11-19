import { ClassificationBadgeProps } from './types';
import { NOT_DISPLAYED_CLASSIFICATIONS, classificationConfig } from './utils';

export function ClassificationBadge({
  classification,
  className = '',
  showAll = false,
}: ClassificationBadgeProps) {
  const classificationStr = String(classification).toLowerCase();

  if (!showAll && NOT_DISPLAYED_CLASSIFICATIONS.includes(classificationStr)) {
    return null;
  }

  const config = classificationConfig[classificationStr];
  if (!config) {
    return null;
  }

  return (
    <img
      src={config.image}
      alt={config.alt}
      title={config.alt}
      className={`h-5 w-5 ${className}`}
      loading="lazy"
    />
  );
}

export default ClassificationBadge;
