import { useState, useEffect } from 'react';
import { useChessStore } from '../../store';
import { useTranslation } from 'react-i18next';
import type { SearchBarProps } from './types';
import { INPUT_CLASSES, BUTTON_CLASSES } from './utils';

export function SearchBar({ value, onChange, compact }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const { loadGames } = useChessStore();
  const { t } = useTranslation();

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    onChange(local);
    await loadGames();
  };

  const inputClass = compact ? INPUT_CLASSES.compact : INPUT_CLASSES.normal;
  const buttonClass = compact ? BUTTON_CLASSES.compact : BUTTON_CLASSES.normal;

  return (
    <form className="flex items-center gap-3" onSubmit={submit}>
      <input
        className={inputClass}
        placeholder={t('home.search.placeholder')}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
      <button type="submit" className={buttonClass} disabled={!local.trim()}>
        {t('home.search.button')}
      </button>
    </form>
  );
}
