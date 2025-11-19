type GlobalWithCache = typeof globalThis & { __svgCache?: Map<string, string> };
const g = globalThis as GlobalWithCache;
export const svgCache: Map<string, string> = g.__svgCache || new Map<string, string>();
g.__svgCache = svgCache;

/**
 * Normalize an SVG string: remove explicit width/height and ensure a viewBox exists so it scales
 */
export function normalizeSvg(text: string): string {
  return text.replace(/<svg([^>]*)>/i, (m, g1) => {
    const attrs = g1 || '';
    const widthMatch = attrs.match(/width=['"]?([0-9]+(?:\.[0-9]+)?)['"]?/i);
    const heightMatch = attrs.match(/height=['"]?([0-9]+(?:\.[0-9]+)?)['"]?/i);
    const viewBoxMatch = attrs.match(/viewBox=['"]([^'"\]]+)['"]?/i);
    let vb = viewBoxMatch ? viewBoxMatch[1] : null;
    if (!vb && widthMatch && heightMatch) {
      vb = `0 0 ${widthMatch[1]} ${heightMatch[1]}`;
    }
    const noSize = attrs.replace(/\s*(width|height)=['"][^'"]*['"]/gi, '');
    if (vb && !viewBoxMatch) {
      return `<svg${noSize} viewBox="${vb}" width="100%" height="100%">`;
    }
    return `<svg${noSize} width="100%" height="100%">`;
  });
}
