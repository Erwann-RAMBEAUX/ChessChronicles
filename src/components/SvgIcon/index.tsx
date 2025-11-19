import { useEffect, useState } from 'react';
import type { SvgIconProps } from './types';
import { normalizeSvg, svgCache } from './utils';

export function SvgIcon({ component, raw, url, className, title }: SvgIconProps) {
  const initial = raw ? normalizeSvg(raw) : null;
  const [svgText, setSvgText] = useState<string | null>(initial);

  useEffect(() => {
    let cancelled = false;
    if (raw) {
      return;
    }
    if (url) {
      const cached = svgCache.get(url);
      if (cached) {
        Promise.resolve().then(() => {
          if (!cancelled) setSvgText(cached);
        });
        return;
      }
      fetch(url)
        .then((r) => r.text())
        .then((text) => {
          if (cancelled) return;
          const n = normalizeSvg(text);
          svgCache.set(url, n);
          setSvgText(n);
        })
        .catch(() => {});
    } else {
      Promise.resolve().then(() => {
        if (!cancelled) setSvgText(null);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [raw, url]);

  if (raw) {
    const wrapperClass = `${className ?? ''} inline-block`;
    return (
      <span className={wrapperClass} aria-hidden dangerouslySetInnerHTML={{ __html: initial! }} />
    );
  }

  if (component && !url) {
    const Cmp = component;
    return <Cmp className={className} aria-label={title} />;
  }

  if (svgText) {
    const wrapperClass = `${className ?? ''} inline-block`;
    return (
      <span className={wrapperClass} aria-hidden dangerouslySetInnerHTML={{ __html: svgText }} />
    );
  }

  if (url) return <img src={url} alt={title} className={className} />;

  return null;
}

export default SvgIcon;
