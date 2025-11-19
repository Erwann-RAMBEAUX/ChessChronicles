import { Classification } from '../types/evaluation';

/**
 * Get the color for a square based on move classification
 * Used for highlighting the last move squares with classification-based colors
 */
export function getClassificationColor(classification: Classification | string | null): string {
  if (!classification) return 'rgba(184, 200, 81, 0.8)';

  const classStr = String(classification).toLowerCase();

  const colors: Record<string, string> = {
    brilliant: 'rgba(27, 170, 166, 0.85)',
    critical: 'rgba(91, 139, 175, 0.85)',
    best: 'rgba(152, 188, 73, 0.85)',
    excellent: 'rgba(152, 188, 73, 0.85)',
    theory: 'rgba(168, 135, 100, 0.85)',
    okay: 'rgba(151, 175, 139, 0.85)',
    inaccuracy: 'rgba(244, 191, 68, 0.85)',
    mistake: 'rgba(226, 140, 40, 0.85)',
    blunder: 'rgba(201, 50, 48, 0.85)',
  };

  return colors[classStr] || 'rgba(255, 255, 255, 0)';
}

/**
 * Get darker version of classification color for origin square
 */
export function getClassificationColorDarker(
  classification: Classification | string | null
): string {
  const lightColor = getClassificationColor(classification);
  return lightColor.replace('0.85', '0.6');
}
