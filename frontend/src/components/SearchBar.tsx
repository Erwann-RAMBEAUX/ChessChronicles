import { useState, useEffect } from 'react'
import { useChessStore } from '../store'
import { useTranslation } from 'react-i18next'

type Props = { value: string; onChange: (v: string) => void; compact?: boolean }

export function SearchBar({ value, onChange, compact }: Props) {
  const [local, setLocal] = useState(value)
  const { loadGames } = useChessStore()
  const { t } = useTranslation()

  // Synchroniser le state local quand la prop value change
  useEffect(() => {
    setLocal(value)
  }, [value])

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    onChange(local)
    await loadGames()
  }

  const inputClass = compact ? 'input flex-1 h-9 text-sm' : 'input flex-1'
  const buttonClass = compact ? 'btn-primary min-w-40 h-9 text-sm' : 'btn-primary min-w-44'
  return (
    <form className="flex items-center gap-3" onSubmit={submit}>
      <input className={inputClass} placeholder={t('search.placeholder')} value={local} onChange={(e) => setLocal(e.target.value)} />
      <button type="submit" className={buttonClass} disabled={!local.trim()}>
        {t('search.load')}
      </button>
    </form>
  )
}
