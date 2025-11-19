import { stripLangPrefix } from '../../i18n';

export function isActiveRoute(path: string, currentPath: string): boolean {
  let stripped = stripLangPrefix(currentPath);
  if (!stripped.startsWith('/')) stripped = stripped === '' ? '/' : `/${stripped}`;
  if (path === '/' && (stripped === '/' || stripped === '')) return true;
  if (path === '/game' && (stripped === '/game' || stripped === '/analyze')) return true;
  if (path !== '/' && stripped.startsWith(path)) return true;
  return false;
}
