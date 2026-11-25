export function assetUrl(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) {
    return path;
  }
  const clean = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}
