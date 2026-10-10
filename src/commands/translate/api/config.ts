export interface DeepLConfig {
  apiKey: string;
  endpoint: URL;
}

export class DeepLConfigError extends Error {
  constructor() {
    super('DeepL API configuration is missing or invalid');
    this.name = 'DeepLConfigError';
  }
}

export function resolveDeepLEndpoint(configuredUrl: string): URL {
  try {
    const endpoint = new URL(configuredUrl);
    if (
      endpoint.protocol !== 'https:' ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash
    ) {
      throw new DeepLConfigError();
    }

    const path = endpoint.pathname.replace(/\/$/, '');
    if (path !== '' && path !== '/v2' && path !== '/v2/translate') {
      throw new DeepLConfigError();
    }

    endpoint.pathname = '/v2/translate';
    return endpoint;
  } catch {
    throw new DeepLConfigError();
  }
}

export function getDeepLConfig(): DeepLConfig {
  const apiKey = process.env.DEEPL_API_KEY?.trim();
  if (!apiKey) {
    throw new DeepLConfigError();
  }

  const defaultUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com'
    : 'https://api.deepl.com';
  const configuredUrl = process.env.DEEPL_API_URL?.trim() || defaultUrl;
  return { apiKey, endpoint: resolveDeepLEndpoint(configuredUrl) };
}
