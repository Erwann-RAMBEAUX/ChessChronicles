export const NOT_DISPLAYED_CLASSIFICATIONS = ['okay', 'excellent'];

export const classificationConfig: Record<string, { image: string; alt: string }> = {
  brilliant: { image: '/img/classification/brilliant.png', alt: '!!' },
  critical: { image: '/img/classification/critical.png', alt: 'Critical' },
  best: { image: '/img/classification/best.png', alt: 'Best' },
  excellent: { image: '/img/classification/excellent.png', alt: 'Excellent' },
  okay: { image: '/img/classification/okay.png', alt: 'Okay' },
  inaccuracy: { image: '/img/classification/inaccuracy.png', alt: 'Inaccuracy' },
  mistake: { image: '/img/classification/mistake.png', alt: 'Mistake' },
  blunder: { image: '/img/classification/blunder.png', alt: 'Blunder' },
  theory: { image: '/img/classification/theory.png', alt: 'Theory' },
};
