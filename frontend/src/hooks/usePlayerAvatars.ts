import { useEffect, useState } from 'react'
import { fetchProfile } from '../api/chessCom'
import pawnSvg from '../assets/pawn.svg'

export type PlayerMeta = { username?: string; rating?: number; avatar?: string }

export function usePlayerAvatars(params: {
  stateWhite?: { username: string; rating?: number }
  stateBlack?: { username: string; rating?: number }
  headerWhite?: string
  headerBlack?: string
  headerWhiteElo?: string
  headerBlackElo?: string
}) {
  const { stateWhite, stateBlack, headerWhite, headerBlack, headerWhiteElo, headerBlackElo } = params
  const [whiteMeta, setWhiteMeta] = useState<PlayerMeta>({})
  const [blackMeta, setBlackMeta] = useState<PlayerMeta>({})

  // Merge base meta
  useEffect(() => {
    const wUser = stateWhite?.username || headerWhite
    const bUser = stateBlack?.username || headerBlack
    const wRating = stateWhite?.rating || (headerWhiteElo ? parseInt(headerWhiteElo) : undefined)
    const bRating = stateBlack?.rating || (headerBlackElo ? parseInt(headerBlackElo) : undefined)
    setWhiteMeta(m => ({ ...m, username: wUser, rating: wRating }))
    setBlackMeta(m => ({ ...m, username: bUser, rating: bRating }))
  }, [stateWhite, stateBlack, headerWhite, headerBlack, headerWhiteElo, headerBlackElo])

  // Fetch avatars
  useEffect(() => {
    let cancelled = false
    async function run() {
      const tasks: Promise<void>[] = []
      if (whiteMeta.username && !whiteMeta.avatar) {
        tasks.push(
          fetchProfile(whiteMeta.username.toLowerCase())
            .then(p => { if (!cancelled) setWhiteMeta(m => ({ ...m, avatar: p.avatar || pawnSvg })) })
            .catch(() => { if (!cancelled) setWhiteMeta(m => ({ ...m, avatar: pawnSvg })) })
        )
      }
      if (blackMeta.username && !blackMeta.avatar) {
        tasks.push(
          fetchProfile(blackMeta.username.toLowerCase())
            .then(p => { if (!cancelled) setBlackMeta(m => ({ ...m, avatar: p.avatar || pawnSvg })) })
            .catch(() => { if (!cancelled) setBlackMeta(m => ({ ...m, avatar: pawnSvg })) })
        )
      }
      await Promise.all(tasks)
    }
    run()
    return () => { cancelled = true }
  }, [whiteMeta.username, blackMeta.username, whiteMeta.avatar, blackMeta.avatar])

  return { whiteMeta, blackMeta }
}
