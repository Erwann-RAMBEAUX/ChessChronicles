import { useEffect, useState } from 'react';
import { fetchProfile } from '../../api/chessCom';
import type { PlayerMeta, UsePlayerAvatarsParams, UsePlayerAvatarsReturn } from './types';
import { DEFAULT_AVATAR } from './utils';

export function usePlayerAvatars(params: UsePlayerAvatarsParams): UsePlayerAvatarsReturn {
  const { stateWhite, stateBlack, headerWhite, headerBlack, headerWhiteElo, headerBlackElo } =
    params;
  const [whiteMeta, setWhiteMeta] = useState<PlayerMeta>({});
  const [blackMeta, setBlackMeta] = useState<PlayerMeta>({});

  useEffect(() => {
    const wUser = stateWhite?.username || headerWhite;
    const bUser = stateBlack?.username || headerBlack;
    const wRating = stateWhite?.rating || (headerWhiteElo ? parseInt(headerWhiteElo) : undefined);
    const bRating = stateBlack?.rating || (headerBlackElo ? parseInt(headerBlackElo) : undefined);
    setWhiteMeta((m) =>
      m.username === wUser && m.rating === wRating ? m : { ...m, username: wUser, rating: wRating }
    );
    setBlackMeta((m) =>
      m.username === bUser && m.rating === bRating ? m : { ...m, username: bUser, rating: bRating }
    );
  }, [stateWhite, stateBlack, headerWhite, headerBlack, headerWhiteElo, headerBlackElo]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const tasks: Promise<void>[] = [];
      if (whiteMeta.username && !whiteMeta.avatar) {
        tasks.push(
          fetchProfile(whiteMeta.username.toLowerCase())
            .then((p) => {
              if (!cancelled) setWhiteMeta((m) => ({ ...m, avatar: p.avatar || DEFAULT_AVATAR }));
            })
            .catch(() => {
              if (!cancelled) setWhiteMeta((m) => ({ ...m, avatar: DEFAULT_AVATAR }));
            })
        );
      }
      if (blackMeta.username && !blackMeta.avatar) {
        tasks.push(
          fetchProfile(blackMeta.username.toLowerCase())
            .then((p) => {
              if (!cancelled) setBlackMeta((m) => ({ ...m, avatar: p.avatar || DEFAULT_AVATAR }));
            })
            .catch(() => {
              if (!cancelled) setBlackMeta((m) => ({ ...m, avatar: DEFAULT_AVATAR }));
            })
        );
      }
      await Promise.all(tasks);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [whiteMeta.username, blackMeta.username, whiteMeta.avatar, blackMeta.avatar]);

  return { whiteMeta, blackMeta };
}

export * from './types';
