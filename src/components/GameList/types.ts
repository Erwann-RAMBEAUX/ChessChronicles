export interface GameListOption {
  value: string;
  label: string;
}

export interface GameListPaginationState {
  current: number;
  totalPages: number;
  start: number;
  end: number;
}
