export interface FiltersPanelProps {
  filters: Record<string, unknown>;
  updateFilters: (filters: Partial<Record<string, unknown>>) => void;
  suggestions: string[];
  games: unknown[];
}
