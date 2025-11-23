export type RawPlayer = {
    username: string;
    rating?: number;
    result?: string;
};

export type RawGame = {
    url: string;
    pgn?: string;
    time_control: string;
    end_time: number;
    rated?: boolean;
    tcn?: string;
    uuid?: string;
    initial_setup?: string;
    fen?: string;
    time_class: 'daily' | 'rapid' | 'blitz' | 'bullet' | string;
    rules?: string;
    resultMessage?: string;
    white: RawPlayer;
    black: RawPlayer;
};

export type Game = RawGame & {
    id: string;
    opponent: RawPlayer;
    userColor: 'white' | 'black';
    resultForUser: 'win' | 'loss' | 'draw';
    endDate: Date;
    gameType: 'live' | 'daily';
};

export type Filters = {
    color: 'all' | 'white' | 'black';
    results: 'all' | 'win' | 'loss' | 'draw';
    modes: string[];
    month: 'all' | string; // YYYY-MM
    opponentQuery: string;
    sortBy: SortBy;
    sortDir: SortDir;
};

export type PlayerProfile = {
    avatar?: string;
    player_id: number;
    url: string;
    username: string;
    name?: string;
    title?: string;
    followers?: number;
    country?: string;
    last_online?: number;
    joined?: number;
    status?: string;
    is_streamer?: boolean;
    verified?: boolean;
    league?: string;
    twitch_url?: string;
    streaming_platforms?: Array<{ type?: string; channel_url?: string }>;
};

export type TimeClassKey = 'chess_bullet' | 'chess_blitz' | 'chess_rapid' | 'chess_daily';

export type TimeClassStats = {
    last?: { rating?: number; date?: number; rd?: number };
    best?: { rating?: number; date?: number; game?: string };
    record?: {
        win?: number;
        loss?: number;
        draw?: number;
        time_per_move?: number;
        timeout_percent?: number;
    };
};

export type PlayerStats = {
    chess_bullet?: TimeClassStats;
    chess_blitz?: TimeClassStats;
    chess_rapid?: TimeClassStats;
    chess_daily?: TimeClassStats;
    tactics?: { highest?: { rating?: number; date?: number } };
    puzzle_rush?: { best?: { total_attempts?: number; score?: number } };
};

export type StreamerInfo = {
    twitch_url?: string;
    is_live?: boolean;
};

export type SortBy = 'date' | 'elo_opponent' | 'elo_user';
export type SortDir = 'asc' | 'desc';
