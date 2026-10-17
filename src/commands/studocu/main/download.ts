import type { Browser } from 'playwright-core';
import { logger } from '../../../logging/logger.ts';
import { connectBrowserless, isBrowserlessAdBlockingEnabled } from '../api/browserless.ts';
import { collectStudocuPages } from './collector.ts';
import { navigateToStudocu } from './navigation.ts';
import { renderStudocuPdf } from './pdf.ts';
import {
  StudocuDownloadError,
  type StudocuDownloadResult,
  type StudocuDownloadTimings,
  type StudocuPdfResult,
  type StudocuProgressCallback,
} from '../types/types.ts';
import { getStudocuDocumentId } from '../utils/url.ts';

export async function downloadStudocu(
  url: URL,
  onProgress?: StudocuProgressCallback,
): Promise<StudocuDownloadResult> {
  const residentialProxy = process.env.BROWSERLESS_RESIDENTIAL_PROXY?.trim() !== 'false';
  const startedAt = Date.now();
  let navigationUrl = url;
  const timings: StudocuDownloadTimings = {
    connectionMs: 0,
    navigationMs: 0,
    scanMs: 0,
    pdfMs: 0,
    closeMs: 0,
  };

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await downloadAttempt(
        navigationUrl,
        residentialProxy,
        startedAt,
        attempt,
        timings,
        onProgress,
      );
      return { ...result, timings };
    } catch (error) {
      if (
        attempt === 2 ||
        !(
          error instanceof StudocuDownloadError &&
          (error.reason === 'connection' || error.reason === 'blocked')
        )
      ) {
        throw error;
      }

      // prettier-ignore
      logger.warn(
        {
          command: 'studocu',
          documentId: getStudocuDocumentId(url),
          attempt,
          reason: error.reason,
        },
        'Retrying Studocu navigation with a fresh Browserless session',
      );
      navigationUrl = new URL(url);
      navigationUrl.search = '';
    }
  }

  throw new StudocuDownloadError('connection');
}

async function downloadAttempt(
  url: URL,
  residentialProxy: boolean,
  startedAt: number,
  attempt: number,
  timings: StudocuDownloadTimings,
  onProgress?: StudocuProgressCallback,
): Promise<StudocuPdfResult> {
  const log = logger.child({
    command: 'studocu',
    documentId: getStudocuDocumentId(url),
    attempt,
    adBlocking: isBrowserlessAdBlockingEnabled(),
    proxy: residentialProxy
      ? 'residential-vn'
      : process.env.BROWSERLESS_WS_URL?.includes('proxy=residential')
        ? 'configured-residential'
        : 'direct',
  });

  log.info('Connecting to Browserless');
  // prettier-ignore
  onProgress?.({
    phase: 'connecting',
    attempt,
  });
  const connectionStartedAt = Date.now();
  let browser: Browser;
  try {
    browser = await connectBrowserless(residentialProxy);
  } finally {
    timings.connectionMs += Date.now() - connectionStartedAt;
  }
  try {
    const context = browser.contexts()[0];
    const page = context?.pages()[0];
    if (!context || !page) {
      log.warn('Browserless did not provide a default page');
      throw new StudocuDownloadError('blocked');
    }

    const navigationStartedAt = Date.now();
    try {
      await navigateToStudocu(page, context, url, log, onProgress);
    } finally {
      timings.navigationMs += Date.now() - navigationStartedAt;
    }

    const scanStartedAt = Date.now();
    try {
      await collectStudocuPages(page, log, onProgress);
    } finally {
      timings.scanMs += Date.now() - scanStartedAt;
    }

    const pdfStartedAt = Date.now();
    try {
      return await renderStudocuPdf(page, log, startedAt, onProgress);
    } finally {
      timings.pdfMs += Date.now() - pdfStartedAt;
    }
  } finally {
    const closeStartedAt = Date.now();
    try {
      await browser.close();
      log.info('Browserless session closed');
    } finally {
      timings.closeMs += Date.now() - closeStartedAt;
    }
  }
}
