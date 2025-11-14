import { FilterSection } from './FilterSection'
import { useTranslation } from 'react-i18next'
import { Dropdown, type Option } from '../ui/Dropdown'

type Props = {
  value: 'all' | 'white' | 'black'
  onChange: (c: 'all' | 'white' | 'black') => void
  title?: string
}

/** Filter by side color played by the user (single-select with All). */
export function ColorFilter({ value, onChange, title = 'Couleur' }: Props) {
  const { t } = useTranslation()
  const options: Option[] = [
    { value: 'all', label: t('filters.all') },
    { value: 'white', label: t('color.white') },
    { value: 'black', label: t('color.black') },
  ]
  return (
    <FilterSection title={title} inline>
      <Dropdown options={options} value={value} onChange={(v)=> onChange(v as 'all' | 'white' | 'black')} widthClass="w-40"/>
    </FilterSection>
  )
}
