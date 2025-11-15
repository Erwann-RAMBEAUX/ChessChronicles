import { FilterSection } from './FilterSection'
import { useTranslation } from 'react-i18next'
import { Dropdown, type Option } from '../ui/Dropdown'

type Props = {
  value: 'all' | 'win' | 'loss' | 'draw'
  onChange: (res: 'all' | 'win' | 'loss' | 'draw') => void
  title?: string
}

/** Filter by result (single-select with All). */
export function ResultsFilter({ value, onChange, title = 'Result' }: Props) {
  const { t } = useTranslation()
  const options: Option[] = [
    { value: 'all', label: t('filters.all') },
    { value: 'win', label: t('result.win') },
    { value: 'loss', label: t('result.loss') },
    { value: 'draw', label: t('result.draw') },
  ]
  return (
    <FilterSection title={title} inline>
      <Dropdown options={options} value={value} onChange={(v)=> onChange(v as 'all' | 'win' | 'loss' | 'draw')} widthClass="w-40" />
    </FilterSection>
  )
}
