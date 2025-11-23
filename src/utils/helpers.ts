import { RawGame, Game } from '../types';

export function formatMonth(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

export function derivePerspective(
    game: RawGame,
    username: string
): Pick<Game, 'userColor' | 'resultForUser' | 'opponent' | 'endDate' | 'id' | 'gameType'> {
    const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
    const userColor = isWhite ? 'white' : 'black';
    const opponent = isWhite ? game.black : game.white;
    const userRes = (isWhite ? game.white.result : game.black.result) || '';
    let resultForUser: 'win' | 'loss' | 'draw';
    if (userRes === 'win') resultForUser = 'win';
    else if (
        ['agreed', 'stalemate', 'repetition', 'insufficient', '50move', 'timevsinsufficient'].includes(
            userRes
        )
    )
        resultForUser = 'draw';
    else resultForUser = 'loss';
    const endDate = new Date(game.end_time * 1000);
    const id = `${game.url}#${game.end_time}`;

    const gameType: 'live' | 'daily' = game.time_class === 'daily' ? 'daily' : 'live';

    return { userColor, resultForUser, opponent, endDate, id, gameType };
}

export function countryFromUrl(url?: string): string | undefined {
    if (!url) return undefined;
    const cc = url.split('/').pop() || '';
    return cc || undefined;
}

export function countryFlagEmoji(cc?: string): string | undefined {
    if (!cc) return undefined;
    const code = cc.toUpperCase();
    if (code === 'XX') return '🌐';
    if (code.length !== 2) return undefined;
    const A = 0x1f1e6;
    return (
        String.fromCodePoint(A + (code.charCodeAt(0) - 65)) +
        String.fromCodePoint(A + (code.charCodeAt(1) - 65))
    );
}
