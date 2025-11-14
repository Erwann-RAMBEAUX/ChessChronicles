import { FilterSection } from './FilterSection'
import { useTranslation } from 'react-i18next'
import { Dropdown, type Option } from '../ui/Dropdown'

type Props = {
  value: 'all' | 'bullet' | 'blitz' | 'rapid' | 'daily'
  onChange: (mode: 'all' | 'bullet' | 'blitz' | 'rapid' | 'daily') => void
  title?: string
}

/** Filter by time control (single-select with All). */
export function ModesFilter({ value, onChange, title = 'Type de Partie' }: Props) {
  const { t } = useTranslation()
  const options: Option[] = [
    { value: 'all', label: t('filters.all') },
    { value: 'bullet', label: t('mode.bullet') },
    { value: 'blitz', label: t('mode.blitz') },
    { value: 'rapid', label: t('mode.rapid') },
    { value: 'daily', label: t('mode.daily') },
  ]
  return (
    <FilterSection title={title} inline>
      <Dropdown options={options} value={value} onChange={(v)=> onChange(v as 'all' | 'bullet' | 'blitz' | 'rapid' | 'daily')} widthClass="w-40" />
    </FilterSection>
  )
}
