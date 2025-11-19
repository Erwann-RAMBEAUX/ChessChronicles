import { useMemo, useState, useEffect } from 'react';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import { useChessStore } from '../../store';
import { ColorFilter } from '../filters/ColorFilter';
import { ModesFilter } from '../filters/ModesFilter';
import { ResultsFilter } from '../filters/ResultsFilter';
import { MonthFilter } from '../filters/MonthFilter';
import { OpponentFilter } from '../filters/OpponentFilter';
import { SortControls } from '../filters/SortControls';
import { useTranslation } from 'react-i18next';
import { buildMonthsList } from './utils';

export function FiltersPanel({
  initiallyCollapsed = false,
  className = '',
}: {
  initiallyCollapsed?: boolean;
  className?: string;
}) {
  const { filters, updateFilters, suggestions, games } = useChessStore();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsLarge(e.matches);
    onChange(mq);
    try {
      mq.addEventListener('change', onChange);
    } catch {
      mq.addListener(onChange as any);
    }
    return () => {
      try {
        mq.removeEventListener('change', onChange);
      } catch {
        mq.removeListener(onChange as any);
      }
    };
  }, []);

  useEffect(() => {
    if (isLarge) setCollapsed(false);
  }, [isLarge]);

  const months = useMemo(() => buildMonthsList(games), [games]);

  if (collapsed && !isLarge) {
    return (
      <div className={`bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{t('filters.heading')}</div>
          <button
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
            onClick={() => setCollapsed(false)}
            aria-expanded={false}
          >
            <span>{t('filters.open', { defaultValue: 'Afficher' })}</span>
            <LuChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 sticky top-20 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg mb-3">{t('filters.heading')}</h3>
        {!isLarge && (
          <button
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
            onClick={() => setCollapsed(true)}
            aria-expanded={!collapsed}
          >
            <span>{t('filters.close', { defaultValue: 'Réduire' })}</span>
            <LuChevronUp className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <ModesFilter
          title={t('filters.modes')}
          value={filters.modes}
          onChange={(m) => updateFilters({ modes: m })}
        />
        <ResultsFilter
          title={t('filters.results')}
          value={filters.results}
          onChange={(r) => updateFilters({ results: r })}
        />
        <ColorFilter
          title={t('filters.color')}
          value={filters.color}
          onChange={(c) => updateFilters({ color: c })}
        />
        <MonthFilter
          title={t('filters.month')}
          allLabel={t('filters.all')}
          months={months}
          value={filters.month}
          onChange={(m) => updateFilters({ month: m })}
        />
        <OpponentFilter
          title={t('filters.opponent')}
          query={filters.opponentQuery}
          suggestions={suggestions}
          onChange={(q) => updateFilters({ opponentQuery: q })}
        />
        <SortControls
          title={t('filters.sort')}
          sortBy={filters.sortBy}
          sortDir={filters.sortDir}
          onChange={(p) => updateFilters(p)}
        />
      </div>
    </div>
  );
}
