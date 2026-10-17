export function parseStudocuDocumentUrl(input: string): URL | null {
  try {
    const url = new URL(input.trim());
    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      url.port !== '' ||
      url.username !== '' ||
      url.password !== '' ||
      !/^(?:[a-z0-9-]+\.)*studocu\.(?:com|vn)$/i.test(url.hostname) ||
      !/^\/[a-z]{2}(?:-[a-z]{2})?\/document\/[^?#]+\/\d+\/?$/i.test(url.pathname)
    ) {
      return null;
    }

    url.protocol = 'https:';
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

export function getStudocuDocumentId(url: URL): string | undefined {
  return url.pathname.match(/\/(\d+)\/?$/)?.[1];
}
