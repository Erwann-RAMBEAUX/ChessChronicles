export type StockfishVersion = 'lite' | 'normal';

export interface StockfishSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface StockfishSettings {
  version: StockfishVersion;
  depth: number;
}
