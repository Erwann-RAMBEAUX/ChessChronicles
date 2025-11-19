import { useEffect, useState } from 'react';

export interface OpeningsDatabase {
  [fen: string]: string;
}

let cachedDatabase: OpeningsDatabase | null = null;
let loadingPromise: Promise<OpeningsDatabase> | null = null;

/**
 * Normalize a FEN string to just the position part (first part before spaces)
 * e.g., "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" -> "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
 */
export function normalizeFen(fen: string): string {
  return fen.split(' ')[0];
}

/**
 * Load the openings database from the public folder
 * Returns a mapping of FEN strings to opening names
 */
export async function loadOpeningsDatabase(): Promise<OpeningsDatabase> {
  if (cachedDatabase) {
    return cachedDatabase;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      const response = await fetch('/docs/openings.json');
      if (!response.ok) throw new Error('Failed to load openings database');
      cachedDatabase = await response.json();
      return cachedDatabase as OpeningsDatabase;
    } catch (error) {
      console.error('[openings] ❌ Error loading openings database:', error);
      cachedDatabase = {};
      return cachedDatabase;
    }
  })();

  return await loadingPromise;
}

/**
 * Hook to use the openings database
 */
export function useOpeningsDatabase() {
  const [database, setDatabase] = useState<OpeningsDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOpeningsDatabase()
      .then((db) => {
        setDatabase(db);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { database, loading, error };
}
