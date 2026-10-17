import { readFile } from 'node:fs/promises';
import type { Logger } from 'pino';
import type { Page } from 'playwright-core';
import { StudocuDownloadError, type StudocuProgressCallback } from '../types/types.ts';

const STUDOCU_SCRIPT_URL = new URL('../resources/script.js', import.meta.url);
const MAX_SCROLL_MS = 95_000;
const SCROLL_PAUSE_MS = 100;
const SCAN_POLL_MS = 700;

interface ScanStatus {
  collected: number;
  expected: number;
  complete: boolean;
  atBottom: boolean;
  passes: number;
  stopped: boolean;
}

export async function collectStudocuPages(
  page: Page,
  log: Logger,
  onProgress?: StudocuProgressCallback,
): Promise<void> {
  const script = await readFile(STUDOCU_SCRIPT_URL, 'utf8');
  await page.evaluate(script);
  log.info('Studocu page collector started');
  const scanStartedAt = Date.now();

  // Scroll inside Browserless so each page does not require a CDP round trip from Bun.
  await page.evaluate(`(() => {
    const controller = { stopped: false, passes: 0 };
    window.__studocuAutoScroll = controller;
    function tick() {
      if (controller.stopped) return;
      const state = window.__downloadStudocuFree;
      let complete = state.expectedPages > 0 && state.pages.size === state.expectedPages;
      for (let i = 1; complete && i <= state.expectedPages; i++) {
        if (!state.pages.has(i)) complete = false;
      }
      if (complete) {
        controller.stopped = true;
        return;
      }
      const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      if (window.scrollY + window.innerHeight >= height - 5) {
        controller.passes++;
        if (controller.passes >= 2) {
          controller.stopped = true;
          return;
        }
        window.scrollTo(0, 0);
        window.setTimeout(tick, 500);
        return;
      }
      window.scrollBy(0, Math.max(700, window.innerHeight * 0.8));
      window.setTimeout(tick, ${SCROLL_PAUSE_MS});
    }
    tick();
  })()`);

  let status: ScanStatus = {
    collected: 0,
    expected: 0,
    complete: false,
    atBottom: false,
    passes: 0,
    stopped: false,
  };
  let lastCollected = -1;
  let lastExpected = -1;
  const deadline = Date.now() + MAX_SCROLL_MS;

  while (Date.now() < deadline) {
    await page.waitForTimeout(SCAN_POLL_MS);
    status = (await page.evaluate(`(() => {
      const state = window.__downloadStudocuFree;
      const controller = window.__studocuAutoScroll;
      let complete = state.expectedPages > 0 && state.pages.size === state.expectedPages;
      for (let i = 1; complete && i <= state.expectedPages; i++) {
        if (!state.pages.has(i)) complete = false;
      }
      const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      return {
        collected: state.pages.size,
        expected: state.expectedPages,
        complete,
        atBottom: window.scrollY + window.innerHeight >= height - 5,
        passes: controller.passes,
        stopped: controller.stopped,
      };
    })()`)) as ScanStatus;

    if (status.collected !== lastCollected || status.expected !== lastExpected || status.atBottom) {
      // prettier-ignore
      log.info(
        {
          collected: status.collected,
          expected: status.expected,
          atBottom: status.atBottom,
          pass: status.passes + 1,
        },
        'Studocu scan progress',
      );
      lastCollected = status.collected;
      lastExpected = status.expected;
      // prettier-ignore
      onProgress?.({
        phase: 'scanning',
        collected: status.collected,
        expected: status.expected,
      });
    }

    if (status.complete || status.stopped) {
      break;
    }
  }

  await page.evaluate('window.__studocuAutoScroll.stopped = true');

  if (!status.complete) {
    // prettier-ignore
    log.warn(
      {
        collected: status.collected,
        expected: status.expected,
        atBottom: status.atBottom,
        passes: status.passes,
        scanMs: Date.now() - scanStartedAt,
      },
      'Studocu scan did not finish',
    );
    throw new StudocuDownloadError('incomplete');
  }
  // prettier-ignore
  log.info({
    scanMs: Date.now() - scanStartedAt,
  }, 'Studocu scan finished');
}
