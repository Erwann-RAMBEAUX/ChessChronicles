import { useMemo } from 'react'
import { useChessStore } from '../store'
import { ColorFilter } from './filters/ColorFilter'
import { ModesFilter } from './filters/ModesFilter'
import { ResultsFilter } from './filters/ResultsFilter'
import { MonthFilter } from './filters/MonthFilter'
import { OpponentFilter } from './filters/OpponentFilter'
import { SortControls } from './filters/SortControls'
import { useTranslation } from 'react-i18next'

export function FiltersPanel() {
  const { filters, updateFilters, suggestions, games } = useChessStore()
  const { t } = useTranslation()

  // Build list of month keys (YYYY-MM) from currently loaded games
  const months = useMemo(() => {
    const set = new Set<string>()
    for (const g of games) set.add(`${g.endDate.getFullYear()}-${String(g.endDate.getMonth() + 1).padStart(2, '0')}`)
    return Array.from(set).sort().reverse()
  }, [games])

  return (
    <div className="card p-4 sticky top-20">
      <h3 className="font-semibold text-lg mb-3">{t('filters.heading')}</h3>

      <div className="space-y-4">
  <ModesFilter title={t('filters.modes')} value={filters.modes} onChange={(m) => updateFilters({ modes: m })} />
  <ResultsFilter title={t('filters.results')} value={filters.results} onChange={(r) => updateFilters({ results: r })} />
  <ColorFilter title={t('filters.color')} value={filters.color} onChange={(c) => updateFilters({ color: c })} />
  <MonthFilter title={t('filters.month')} allLabel={t('filters.all')} months={months} value={filters.month} onChange={(m) => updateFilters({ month: m })} />
  <OpponentFilter title={t('filters.opponent')} query={filters.opponentQuery} suggestions={suggestions} onChange={(q) => updateFilters({ opponentQuery: q })} />
  <SortControls title={t('filters.sort')} sortBy={filters.sortBy} sortDir={filters.sortDir} onChange={(p) => updateFilters(p)} />
      </div>
    </div>
  )
}
