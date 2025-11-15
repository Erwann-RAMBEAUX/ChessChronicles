import { useTranslation } from 'react-i18next'

interface GameFallbackProps {
  manualPgnInput: string
  setManualPgnInput: (pgn: string) => void
  manualPgn: boolean
  isError: boolean
  onCancelManual: () => void
  onInjectPGN: () => void
}

export function GameFallback({
  manualPgnInput,
  setManualPgnInput,
  manualPgn,
  isError,
  onCancelManual,
  onInjectPGN,
}: GameFallbackProps) {
  const { t } = useTranslation()

  return (
    <div className="flex justify-center">
      <div className={`p-6 space-y-4 w-full max-w-md rounded-lg border ${
        isError 
          ? 'card border-red-500/50 bg-red-500/10' 
          : 'card'
      }`}>
        {/* Header */}
        {isError ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded"></div>
              <h2 className="font-semibold text-sm text-red-400">{t('game.fallback.title', 'Partie introuvable')}</h2>
            </div>
            <p className="text-xs text-red-300/80">{t('game.fallback.desc', 'Collez un PGN ci-dessous pour analyser une partie.')}</p>
          </>
        ) : (
          <>
            <h2 className="font-semibold text-sm">{t('game.analyze', 'Analyser une partie')}</h2>
            <p className="text-xs text-gray-400">Collez un PGN pour commencer l'analyse.</p>
          </>
        )}

        {/* PGN Input */}
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wide text-gray-400">PGN</label>
          <textarea
            value={manualPgnInput}
            onChange={(e) => setManualPgnInput(e.target.value)}
            rows={6}
            placeholder={t('game.fallback.pgnPlaceholder', 'Collez votre PGN ici...')}
            className="input w-full text-xs font-mono"
          />
          <button
            disabled={!manualPgnInput.trim()}
            onClick={onInjectPGN}
            className="btn-primary w-full h-9 text-xs disabled:opacity-40"
          >
            {t('game.fallback.inject', 'Analyser ce PGN')}
          </button>
          {manualPgn && (
            <button
              onClick={onCancelManual}
              className="btn-secondary w-full h-9 text-xs"
            >
              {t('game.fallback.cancelManual', 'Annuler')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
