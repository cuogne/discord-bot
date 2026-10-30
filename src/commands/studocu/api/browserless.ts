import { chromium, type Browser } from 'playwright-core';

const DEFAULT_BROWSERLESS_WS_URL = 'wss://production-sfo.browserless.io/stealth?solveCaptchas=true';
const AD_BLOCK_LISTS = 'easylist,easyprivacy';

export function isBrowserlessAdBlockingEnabled(): boolean {
  return process.env.BROWSERLESS_BLOCK_ADS?.trim().toLowerCase() !== 'false';
}

export function describeBrowserlessError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const apiKey = process.env.BROWSERLESS_API_KEY?.trim();
  if (!apiKey) {
    return message;
  }

  return message
    .replaceAll(apiKey, '[REDACTED]')
    .replaceAll(encodeURIComponent(apiKey), '[REDACTED]');
}

export function sanitizeBrowserlessError(error: unknown, depth = 0): Error {
  const safe = new Error(describeBrowserlessError(error));
  if (error instanceof Error) {
    safe.name = error.name;
    if ('reason' in error && typeof error.reason === 'string') {
      Object.assign(safe, { reason: error.reason });
    }
    if ('cause' in error && error.cause && depth < 4) {
      Object.assign(safe, { cause: sanitizeBrowserlessError(error.cause, depth + 1) });
    }
    const apiKey = process.env.BROWSERLESS_API_KEY?.trim();
    if (error.stack && apiKey) {
      safe.stack = error.stack
        .replaceAll(apiKey, '[REDACTED]')
        .replaceAll(encodeURIComponent(apiKey), '[REDACTED]');
    } else if (error.stack) {
      safe.stack = error.stack;
    }
  }
  return safe;
}

export async function connectBrowserless(residentialProxy = false): Promise<Browser> {
  const apiKey = process.env.BROWSERLESS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing BROWSERLESS_API_KEY');
  }

  const endpoint = new URL(process.env.BROWSERLESS_WS_URL?.trim() || DEFAULT_BROWSERLESS_WS_URL);
  if (endpoint.protocol !== 'wss:') {
    throw new Error('BROWSERLESS_WS_URL must use wss://');
  }

  endpoint.searchParams.set('token', apiKey);
  if (isBrowserlessAdBlockingEnabled()) {
    endpoint.searchParams.set('blockAds', 'true');
    endpoint.searchParams.set('blockAdsInclude', AD_BLOCK_LISTS);
  } else {
    endpoint.searchParams.delete('blockAds');
    endpoint.searchParams.delete('blockAdsInclude');
  }
  if (residentialProxy) {
    endpoint.searchParams.set('proxy', 'residential');
    endpoint.searchParams.set('proxyCountry', 'vn');
    endpoint.searchParams.set('proxyLocaleMatch', 'true');
    endpoint.searchParams.set('proxySticky', 'true');
  }
  if (!endpoint.searchParams.has('timeout')) {
    endpoint.searchParams.set('timeout', '120000');
  }
  // prettier-ignore
  return chromium.connectOverCDP(endpoint.toString(), {
    timeout: 30_000,
  });
}
