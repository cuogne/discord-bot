import type { Logger } from 'pino';
import type { BrowserContext, Page } from 'playwright-core';
import { StudocuDownloadError, type StudocuProgressCallback } from '../types/types.ts';
import { getStudocuDocumentId } from '../utils/url.ts';

export async function navigateToStudocu(
  page: Page,
  context: BrowserContext,
  url: URL,
  log: Logger,
  onProgress?: StudocuProgressCallback,
): Promise<void> {
  let navigationStatus: number | undefined;
  let captchaFound = false;
  let captchaSolved = false;
  page.on('response', (response) => {
    if (response.request().isNavigationRequest() && response.frame() === page.mainFrame()) {
      navigationStatus = response.status();
    }
  });
  const cdp = await context.newCDPSession(page);
  cdp.on('event', ({ method }) => {
    if (method === 'Browserless.captchaFound') {
      captchaFound = true;
    }
    if (method === 'Browserless.captchaAutoSolved') {
      captchaSolved = true;
    }
  });

  log.info('Navigating to Studocu document');
  // prettier-ignore
  onProgress?.({
    phase: 'navigating',
  });
  const navigationStartedAt = Date.now();
  try {
    // prettier-ignore
    const response = await page.goto(url.toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    });
    navigationStatus = response?.status() ?? navigationStatus;
  } catch (error) {
    const networkError = String(error).match(
      /net::ERR_(?:CONNECTION_CLOSED|CONNECTION_RESET|EMPTY_RESPONSE)/,
    )?.[0];
    if (networkError) {
      // prettier-ignore
      log.warn({
        networkError,
        navigationMs: Date.now() - navigationStartedAt,
      }, 'Studocu navigation connection failed');
      throw new StudocuDownloadError('connection', { cause: error });
    }
    throw error;
  }

  const finalUrl = new URL(page.url());
  if (navigationStatus === 404 || navigationStatus === 410) {
    // prettier-ignore
    log.info({
      navigationStatus,
      finalPathname: finalUrl.pathname,
      navigationMs: Date.now() - navigationStartedAt,
    }, 'Studocu document is unavailable');
    throw new StudocuDownloadError('unavailable');
  }
  const sameDocument = getStudocuDocumentId(finalUrl) === getStudocuDocumentId(url);
  const documentVisible = sameDocument
    ? await page
        .waitForFunction(
          `(() => {
            // Keep this in sync with findVisibleStudocuPages() in resources/script.js.
            if (document.querySelector('div[data-page-index]')) return true;
            return [...document.querySelectorAll('[data-page-number], [id*="page" i]')].some(
              (element) => element.querySelector('.pc, img.bi, img[src], canvas'),
            );
          })()`,
          undefined,
          { timeout: 40_000 },
        )
        .then(() => true)
        .catch(() => false)
    : false;
  const title = await page.title();
  const pageIndexCount = await page.locator('div[data-page-index]').count();
  const fallbackPageCount = await page
    .locator('[data-page-number], [id*="page" i]')
    .filter({ has: page.locator('.pc, img.bi, img[src], canvas') })
    .count();
  // prettier-ignore
  log.info(
    {
      navigationStatus,
      title,
      sameDocument,
      finalPathname: finalUrl.pathname,
      captchaFound,
      captchaSolved,
      documentVisible,
      pageIndexCount,
      fallbackPageCount,
      navigationMs: Date.now() - navigationStartedAt,
    },
    'Studocu navigation finished',
  );
  if (!documentVisible) {
    throw new StudocuDownloadError('blocked');
  }
  // prettier-ignore
  onProgress?.({
    phase: 'navigated',
    title,
  });
}
