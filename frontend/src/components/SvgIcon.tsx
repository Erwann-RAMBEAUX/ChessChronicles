import React, { useEffect, useState } from 'react'

export type SvgIconSource = {
  component?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  raw?: string
  url?: string
}

export type SvgIconProps = SvgIconSource & {
  className?: string
  title?: string
}

// Global cache for fetched/normalized SVGs
type GlobalWithCache = typeof globalThis & { __svgCache?: Map<string, string> }
const g = globalThis as GlobalWithCache
const svgCache: Map<string, string> = g.__svgCache || new Map<string, string>()
g.__svgCache = svgCache

// Normalize an SVG string: remove explicit width/height and ensure a viewBox exists so it scales
function normalizeSvg(text: string) {
  return text.replace(/<svg([^>]*)>/i, (m, g1) => {
    const attrs = g1 || ''
    const widthMatch = attrs.match(/width=['"]?([0-9]+(?:\.[0-9]+)?)['"]?/i)
    const heightMatch = attrs.match(/height=['"]?([0-9]+(?:\.[0-9]+)?)['"]?/i)
    const viewBoxMatch = attrs.match(/viewBox=['"]([^'"\]]+)['"]?/i)
    let vb = viewBoxMatch ? viewBoxMatch[1] : null
    if (!vb && widthMatch && heightMatch) {
      vb = `0 0 ${widthMatch[1]} ${heightMatch[1]}`
    }
    const noSize = attrs.replace(/\s*(width|height)=['"][^'"]*['"]/gi, '')
    if (vb && !viewBoxMatch) {
      return `<svg${noSize} viewBox="${vb}" width="100%" height="100%">`
    }
    return `<svg${noSize} width="100%" height="100%">`
  })
}

export function SvgIcon({ component, raw, url, className, title }: SvgIconProps) {
  // Prefer raw when provided for stable inlining
  const initial = raw ? normalizeSvg(raw) : null
  const [svgText, setSvgText] = useState<string | null>(initial)

  useEffect(() => {
    let cancelled = false
    if (raw) { return } // already inlined synchronously
    if (url) {
      const cached = svgCache.get(url)
      if (cached) {
        // Avoid synchronous setState in effect; queue in microtask
        Promise.resolve().then(() => { if (!cancelled) setSvgText(cached) })
        return
      }
      fetch(url).then(r => r.text()).then(text => {
        if (cancelled) return
        const n = normalizeSvg(text)
        svgCache.set(url, n)
        setSvgText(n)
      }).catch(() => {})
    } else {
      Promise.resolve().then(() => { if (!cancelled) setSvgText(null) })
    }
    return () => { cancelled = true }
  }, [raw, url])

  if (raw) {
    const wrapperClass = `${className ?? ''} inline-block`
    return <span className={wrapperClass} aria-hidden dangerouslySetInnerHTML={{ __html: initial! }} />
  }

  if (component && !url) {
    const Cmp = component
    return <Cmp className={className} aria-label={title} />
  }

  if (svgText) {
    const wrapperClass = `${className ?? ''} inline-block`
    return <span className={wrapperClass} aria-hidden dangerouslySetInnerHTML={{ __html: svgText }} />
  }

  if (url) return <img src={url} alt={title} className={className} />

  return null
}

export default SvgIcon
