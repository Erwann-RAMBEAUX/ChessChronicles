import { useTranslation } from 'react-i18next'
import { Dropdown, type Option } from './ui/Dropdown'

interface GameFallbackProps {
  fallbackId: string
  setFallbackId: (id: string) => void
  manualPgnInput: string
  setManualPgnInput: (pgn: string) => void
  selectedGameType: 'live' | 'daily'
  setSelectedGameType: (type: 'live' | 'daily') => void
  manualPgn: boolean
  isError: boolean
  onRetry: () => void
  onCancelManual: () => void
  onInjectPGN: () => void
}

export function GameFallback({
  fallbackId,
  setFallbackId,
  manualPgnInput,
  setManualPgnInput,
  selectedGameType,
  setSelectedGameType,
  manualPgn,
  isError,
  onRetry,
  onCancelManual,
  onInjectPGN,
}: GameFallbackProps) {
  const { t } = useTranslation()

  const gameTypeOptions: Option[] = [
    { value: 'live', label: 'Live' },
    { value: 'daily', label: 'Daily' },
  ]

  return (
    <div className="flex justify-center">
      <div className={`p-6 space-y-4 w-full max-w-md rounded-lg border ${
        isError 
          ? 'card border-red-500/50 bg-red-500/10' 
          : 'card'
      }`}>
        {/* Header - Show error title only if there's an actual error */}
        {isError ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded"></div>
              <h2 className="font-semibold text-sm text-red-400">{t('game.fallback.title', 'Partie introuvable')}</h2>
            </div>
            <p className="text-xs text-red-300/80">{t('game.fallback.desc', 'Réessayez avec un autre ID ou collez un PGN ci-dessous.')}</p>
          </>
        ) : (
          <>
            <h2 className="font-semibold text-sm">{t('game.analyze', 'Analyser une partie')}</h2>
            <p className="text-xs text-gray-400">Entrez un ID de partie ou collez un PGN pour commencer.</p>
          </>
        )}

        {/* Game Type Selector */}
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wide text-gray-400">{t('filters.modes', 'Type')}</label>
          <Dropdown
            options={gameTypeOptions}
            value={selectedGameType}
            onChange={(v) => setSelectedGameType(v as 'live' | 'daily')}
            widthClass="w-full"
          />
        </div>

        {/* Game ID Input */}
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wide text-gray-400">ID</label>
          <div className="flex gap-2">
            <input
              value={fallbackId}
              onChange={(e) => setFallbackId(e.target.value)}
              placeholder={t('game.fallback.idPlaceholder', 'ID')}
              className="input flex-1 text-sm h-9"
            />
            <button
              disabled={!fallbackId}
              onClick={onRetry}
              className="btn-primary px-4 h-9 text-xs disabled:opacity-40"
            >
              {t('game.fallback.retry', 'Charger')}
            </button>
            {manualPgn && (
              <button
                onClick={onCancelManual}
                className="btn-secondary px-4 h-9 text-xs"
              >
                {t('game.fallback.cancelManual', 'Annuler')}
              </button>
            )}
          </div>
        </div>

        {/* PGN Input */}
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wide text-gray-400">PGN</label>
          <textarea
            value={manualPgnInput}
            onChange={(e) => setManualPgnInput(e.target.value)}
            rows={4}
            placeholder={t('game.fallback.pgnPlaceholder', 'PGN')}
            className="input w-full text-xs font-mono"
          />
          <button
            disabled={!manualPgnInput.trim()}
            onClick={onInjectPGN}
            className="btn-primary w-full h-9 text-xs disabled:opacity-40"
          >
            {t('game.fallback.inject', 'Utiliser ce PGN')}
          </button>
        </div>
      </div>
    </div>
  )
}
