export interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}
