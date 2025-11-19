export interface StatsTileProps {
  icon: React.ReactNode;
  label: string;
  current: number | string;
  best: number | string;
  bestDate?: string | undefined;
  record?: string;
}
