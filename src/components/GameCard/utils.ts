import type { Game } from '../../types';

export function formatGameDate(game: Game, language: string): string {
  const d = game.endDate;
  return d.toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR');
}

export function formatGameTime(game: Game, language: string): string {
  const d = game.endDate;
  return d.toLocaleTimeString(language === 'en' ? 'en-US' : 'fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getResultBgClass(resultForUser: string): string {
  if (resultForUser === 'win') return 'bg-green-500/20 text-green-300';
  if (resultForUser === 'loss') return 'bg-red-500/20 text-red-300';
  return 'bg-yellow-500/20 text-yellow-300';
}

export function getPieceSymbol(userColor: 'white' | 'black'): string {
  return userColor === 'white' ? '♞' : '♘';
}
