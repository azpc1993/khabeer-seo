export function decodeUnicode(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') return str || '';
  try {
    return str.replace(/\\u[\dA-F]{4}/gi, (match) => {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });
  } catch {
    return str;
  }
}
