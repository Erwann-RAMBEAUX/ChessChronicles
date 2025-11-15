import { useEffect, useState } from 'react'
import { useChessStore } from '../store'
import { fetchProfile, fetchStats, fetchStreamerInfo } from '../api/chessCom'
import type { PlayerProfile, PlayerStats, TimeClassKey } from '../types'
import { countryFromUrl, countryFlagEmoji } from '../types'
import { FaTwitch } from 'react-icons/fa'

// Centralized icons + unified rendering
import { Icons } from '../icons'
import { SvgIcon } from './SvgIcon'

import pawnUrl from '../assets/pawn.svg'
import { useTranslation } from 'react-i18next'

export function ProfileSummary() {
  const { username } = useChessStore()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [twitch, setTwitch] = useState<{ url?: string; live?: boolean } | null>(null)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const ctl = new AbortController()
    let cancelled = false
    const load = async () => {
      if (!username) { setProfile(null); setStats(null); return }
      // Reset display to avoid showing previous data during loading
      setProfile(null); setStats(null); setError(undefined); setLoading(true)
      try {
        const [p, s, str] = await Promise.all([
          fetchProfile(username, ctl.signal),
          fetchStats(username, ctl.signal),
          fetchStreamerInfo(username)
        ])
        if (!cancelled) {
          setProfile(p); setStats(s)
          // Priority: profile.twitch_url or streaming_platforms first, then streamers endpoint
          const fromProfile = p?.twitch_url || p?.streaming_platforms?.find(pl => (pl.channel_url||'').includes('twitch.tv'))?.channel_url
          const url = fromProfile || str?.twitch_url
          setTwitch(url ? { url, live: str?.is_live } : null)
        }
      } catch (e: unknown) {
  const name = (e && typeof e === 'object' && 'name' in e) ? (e as { name?: string }).name : undefined
  const message = (e && typeof e === 'object' && 'message' in e) ? (e as { message?: string }).message || 'Erreur profil/stats' : 'Erreur profil/stats'
        if (!cancelled && name !== 'AbortError') setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true; ctl.abort() }
  }, [username])

  const cc = countryFromUrl(profile?.country)
  const flag = countryFlagEmoji(cc)
  const ratingLast = (k: TimeClassKey) => stats?.[k]?.last?.rating ?? '—'
  const record = (k: TimeClassKey) => {
    const r = stats?.[k]?.record
    if (!r) return '—'
    return `${r.win ?? 0}-${r.loss ?? 0}-${r.draw ?? 0}`
  }
  const fmt = (ts?: number) => (ts ? new Date(ts * 1000).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fr-FR') : '—')

  const ratingBest = (k: TimeClassKey) => stats?.[k]?.best?.rating ?? '—'
  const bestDate = (k: TimeClassKey) => fmt(stats?.[k]?.best?.date)

  // Icons now rendered via SvgIcon (single normalized component)

  // Optional: verify live status with Twitch Helix if env keys are set
  useEffect(() => {
    const url = twitch?.url
    if (!url) return
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID as string | undefined
    const token = import.meta.env.VITE_TWITCH_TOKEN as string | undefined
    if (!clientId || !token) return
    let cancelled = false
    const u = (() => {
      try { const u = new URL(url); return u.pathname.replace(/^\//,'').split('/')[0] } catch { return '' }
    })()
    if (!u) return
    const check = async () => {
      try {
        const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(u)}`, {
          headers: { 'Client-Id': clientId, 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) return
  type HelixStreams = { data?: Array<{ type?: string }> }
  const data = (await res.json()) as HelixStreams
  const arr = Array.isArray(data?.data) ? data.data : []
  const live = arr.length > 0 && arr[0]?.type === 'live'
        if (!cancelled) setTwitch((t) => t ? { ...t, live } : t)
      } catch {}
    }
    check()
    const id = setInterval(check, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [twitch?.url])

  if (!username || error === 'error.userNotFound') return null

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <img
          className="h-12 w-12 rounded-full object-cover bg-white/10"
          src={profile?.avatar || pawnUrl}
          alt="avatar"
          onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = pawnUrl }}
        />
        <div>
          <div className="font-semibold flex items-center gap-2">
            <span>{username || 'Utilisateur'}</span>
            {flag && <span title={cc} className="text-lg">{flag}</span>}
            {twitch?.url && twitch.url.includes('twitch.tv') && (
              <a href={twitch.url} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded flex items-center justify-center" title="Ouvrir Twitch" style={{ backgroundColor: '#9146FF' }}>
                <FaTwitch className="text-white text-sm" />
              </a>
            )}
            {twitch && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${twitch.live ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${twitch.live ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {twitch.live ? t('profile.live') : t('profile.offline')}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 flex flex-wrap gap-3">
            {profile?.league && <span>{t('profile.league')}: {profile.league}</span>}
            {typeof profile?.followers === 'number' && <span>{t('profile.followers')}: {profile.followers}</span>}
            {profile?.joined && <span>{t('profile.joined')}: {fmt(profile.joined)}</span>}
            {profile?.last_online && <span>{t('profile.lastOnline')}: {fmt(profile.last_online)}</span>}
          </div>
        </div>
        <div className="ml-auto" />
      </div>


      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Bullet */}
        <StatsTile
          icon={<SvgIcon {...Icons.bullet} title={t('mode.bullet')} className="h-6 w-6 text-yellow-400" />}
          label={t('mode.bullet')}
          current={ratingLast('chess_bullet')}
          best={ratingBest('chess_bullet')}
          bestDate={bestDate('chess_bullet')}
          record={record('chess_bullet')}
        />
        {/* Blitz */}
        <StatsTile
          icon={<SvgIcon {...Icons.blitz} title={t('mode.blitz')} className="h-6 w-6 text-yellow-400" />}
          label={t('mode.blitz')}
          current={ratingLast('chess_blitz')}
          best={ratingBest('chess_blitz')}
          bestDate={bestDate('chess_blitz')}
          record={record('chess_blitz')}
        />
        {/* Rapid */}
        <StatsTile
          icon={<SvgIcon {...Icons.rapid} title={t('mode.rapid')} className="h-6 w-6 text-green-400" />}
          label={t('mode.rapid')}
          current={ratingLast('chess_rapid')}
          best={ratingBest('chess_rapid')}
          bestDate={bestDate('chess_rapid')}
          record={record('chess_rapid')}
        />
        {/* Daily */}
        <StatsTile
          icon={<div className="relative inline-flex items-center"><SvgIcon {...Icons.daily} title={t('mode.daily')} className="h-6 w-6 text-yellow-400" /></div>}
          label={t('mode.daily')}
          current={ratingLast('chess_daily')}
          best={ratingBest('chess_daily')}
          bestDate={bestDate('chess_daily')}
          record={record('chess_daily')}
        />
        {/* Problems (Tactics) */}
        <div className="flex items-center gap-3 bg-white/5 rounded px-3 py-2">
          <SvgIcon {...Icons.puzzle} title={t('profile.problems')} className="h-6 w-6" />
          <div className="flex-1">
            <div className="text-xs text-gray-400">{t('profile.problems')}</div>
            <div className="font-semibold">{stats?.tactics?.highest?.rating ?? '—'}</div>
          </div>
        </div>
        {/* Puzzle Rush */}
        <div className="flex items-center gap-3 bg-white/5 rounded px-3 py-2">
          <div className="relative inline-flex items-center">
            <SvgIcon {...Icons.puzzleRush} title={t('profile.puzzleRush')} className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-400">{t('profile.puzzleRush')}</div>
            <div className="font-semibold">{stats?.puzzle_rush?.best?.score ?? '—'}</div>
          </div>
        </div>
      </div>

  {loading && <div className="mt-2 text-xs text-gray-400">{i18n.language==='en' ? '(loading...)' : 'Chargement…'}</div>}
    </div>
  )
}

function StatsTile({ icon, label, current, best, bestDate, record }: { icon: React.ReactNode; label: string; current: number | string; best: number | string; bestDate?: string | undefined; record?: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 bg-white/5 rounded px-3 py-2">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 truncate">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-lg font-semibold">{current}</div>
          <div className="text-xs text-gray-400">{record}</div>
        </div>
        <div className="text-xs text-gray-400">{best !== '—' ? `${t('profile.best')}: ${best} ${bestDate ? `(${bestDate})` : ''}` : '—'}</div>
      </div>
    </div>
  )
}
