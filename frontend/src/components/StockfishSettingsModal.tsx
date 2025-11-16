import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SlSettings, SlClose } from 'react-icons/sl'
import { useChessStore } from '../store'

interface StockfishSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StockfishSettingsModal({ isOpen, onClose }: StockfishSettingsModalProps) {
  const { t } = useTranslation()
  const { stockfishVersion, stockfishDepth, setStockfishVersion, setStockfishDepth } = useChessStore()

  const [localVersion, setLocalVersion] = useState(stockfishVersion)
  const [localDepth, setLocalDepth] = useState(stockfishDepth)

  const handleSave = () => {
    setStockfishVersion(localVersion)
    setStockfishDepth(localDepth)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <SlSettings className="h-5 w-5" />
            {t('analysis.settings.title', 'Réglages de l\'analyse')}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <SlClose className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Version Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('analysis.settings.version', 'Version de Stockfish')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLocalVersion('lite')}
                className={`btn flex-1 ${localVersion === 'lite' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t('analysis.settings.lite', 'Lite')}
              </button>
              <button
                onClick={() => setLocalVersion('normal')}
                className={`btn flex-1 ${localVersion === 'normal' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t('analysis.settings.normal', 'Normale')}
              </button>
            </div>
          </div>

          {/* Depth Selection */}
          <div>
            <label htmlFor="depth-input" className="block text-sm font-medium text-gray-300 mb-1">
              {t('analysis.settings.depth', 'Profondeur (1-30)')}
            </label>
            <input
              id="depth-input"
              type="number"
              min="1"
              max="30"
              value={localDepth}
              onChange={(e) => setLocalDepth(parseInt(e.target.value, 10))}
              className="input w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            {t('common.cancel', 'Annuler')}
          </button>
          <button onClick={handleSave} className="btn-primary">
            {t('common.save', 'Enregistrer')}
          </button>
        </div>
      </div>
    </div>
  )
}
