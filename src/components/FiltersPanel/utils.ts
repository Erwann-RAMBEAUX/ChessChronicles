export function buildMonthsList(games: Array<{ endDate: Date | string }>): string[] {
  const set = new Set<string>();
  for (const g of games) {
    const end = typeof g.endDate === 'string' ? new Date(g.endDate) : g.endDate;
    set.add(`${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`);
  }
  return Array.from(set).sort().reverse();
}
