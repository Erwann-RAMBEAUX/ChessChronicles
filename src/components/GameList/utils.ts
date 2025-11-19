import type { GameListOption } from './types';

export const PER_PAGE_OPTIONS: GameListOption[] = [
  { value: '15', label: '15' },
  { value: '30', label: '30' },
  { value: '50', label: '50' },
];

export function calculatePaginationState(games: unknown[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(games.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const end = start + pageSize;

  return { current, totalPages, start, end };
}

export function generatePaginationItems(current: number, totalPages: number): (number | 'gap')[] {
  const items: (number | 'gap')[] = [];
  const last = totalPages;

  if (last > 0) {
    items.push(1);
    if (current === 1) {
      if (last >= 2) items.push(2);
      if (last > 3) items.push('gap');
    } else if (current === last) {
      if (last > 3) items.push('gap');
      if (last - 1 >= 2) items.push(last - 1);
    } else {
      const left = current - 1;
      const right = current + 1;
      if (left > 2) items.push('gap');
      [left, current, right].forEach((n) => {
        if (n !== 1 && n !== last && !items.includes(n as number)) items.push(n);
      });
      if (right < last - 1) items.push('gap');
    }
    if (last > 1 && !items.includes(last)) items.push(last);
  }

  return items;
}
