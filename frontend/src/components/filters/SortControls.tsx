import { FilterSection } from './FilterSection'
import type { SortBy, SortDir } from '../../types'
import { Dropdown, type Option } from '../ui/Dropdown'
import { useTranslation } from 'react-i18next'

type Props = {
  sortBy: SortBy
  sortDir: SortDir
  onChange: (p: Partial<{ sortBy: SortBy; sortDir: SortDir }>) => void
  title?: string
}

/** Controls for sorting: criterion and direction. */
export function SortControls({ sortBy, sortDir, onChange, title = 'Tri' }: Props) {
  const { t } = useTranslation()
  const byOptions: Option[] = [
    { value: 'date', label: t('filters.sortBy.date') },
    { value: 'elo_user', label: t('filters.sortBy.eloUser') },
    { value: 'elo_opponent', label: t('filters.sortBy.eloOpponent') }
  ]
  const dirOptions: Option[] = [
    { value: 'desc', label: t('filters.desc') },
    { value: 'asc', label: t('filters.asc') }
  ]
  return (
    <FilterSection title={title}>
      <div className="flex gap-2">
        <Dropdown options={byOptions} value={sortBy} onChange={(v) => onChange({ sortBy: v as SortBy })} />
        <Dropdown options={dirOptions} value={sortDir} onChange={(v) => onChange({ sortDir: v as SortDir })} widthClass="w-28" />
      </div>
    </FilterSection>
  )
}
