export interface GameFallbackProps {
  manualPgnInput: string;
  setManualPgnInput: (pgn: string) => void;
  manualPgn: boolean;
  isError: boolean;
  onCancelManual: () => void;
  onInjectPGN: () => void;
  errorMessage?: string;
}
