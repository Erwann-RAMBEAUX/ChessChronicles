import { FilterSection } from './FilterSection'
import { Dropdown, type Option } from '../ui/Dropdown'
import { useTranslation } from 'react-i18next'

type Props = {
  months: string[]
  value: string
  onChange: (m: string) => void
  title?: string
  allLabel?: string
}

/** Filter by month (YYYY-MM). */
export function MonthFilter({ months, value, onChange, title = 'Mois', allLabel = 'Tous' }: Props) {
  const { t, i18n } = useTranslation()
  
  // Format month as "Month Year"
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    const formatted = new Intl.DateTimeFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(date)
    // Capitaliser la première lettre du mois
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }
  
  const options: Option[] = [
    { value: 'all', label: allLabel }, 
    ...months.map(m => ({ value: m, label: formatMonth(m) }))
  ]
  return (
    <FilterSection title={title} inline>
      <Dropdown options={options} value={value} onChange={onChange} placeholder={t('filters.monthPlaceholder')} widthClass="w-40" />
    </FilterSection>
  )
}
