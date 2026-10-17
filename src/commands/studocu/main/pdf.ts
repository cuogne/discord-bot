import type { Logger } from 'pino';
import type { Page } from 'playwright-core';
import {
  StudocuDownloadError,
  type StudocuPdfResult,
  type StudocuProgressCallback,
} from '../types/types.ts';

export async function renderStudocuPdf(
  page: Page,
  log: Logger,
  startedAt: number,
  onProgress?: StudocuProgressCallback,
): Promise<StudocuPdfResult> {
  const preparationStartedAt = Date.now();
  await page.evaluate(`(() => {
    const state = window.__downloadStudocuFree;
    state.observer?.disconnect();
    if (state.scanTimer !== null) {
      window.cancelAnimationFrame(state.scanTimer);
      state.scanTimer = null;
    }
  })()`);

  const pageCount = (await page.evaluate(`(() => {
    const state = window.__downloadStudocuFree;
    const container = document.createElement('div');
    container.id = 'download-studocu-free-print';
    for (const [, original] of [...state.pages.entries()].sort((a, b) => a[0] - b[0])) {
      container.appendChild(original.cloneNode(true));
    }
    document.body.appendChild(container);
    return container.children.length;
  })()`)) as number;
  const preparationMs = Date.now() - preparationStartedAt;
  const premiumNotice = await page.getByText('Why is this page out of focus?').count();
  // prettier-ignore
  log.info(
    {
      pageCount,
      premiumNotice: premiumNotice > 0,
    },
    'Studocu pages collected',
  );
  // prettier-ignore
  onProgress?.({
    phase: 'rendering',
    pageCount,
  });
  const renderStartedAt = Date.now();

  await page.evaluate('document.fonts.ready');
  const fontsReadyMs = Date.now() - renderStartedAt;
  await page.evaluate(`(async () => {
    const images = [...document.querySelectorAll('#download-studocu-free-print img')];
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  })()`);
  const imageDecodeMs = Date.now() - renderStartedAt - fontsReadyMs;

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new StudocuDownloadError('invalid-pdf');
  }

  // prettier-ignore
  log.info(
    {
      pageCount,
      pdfBytes: pdf.length,
      fontsReadyMs,
      preparationMs,
      imageDecodeMs,
      pdfMs: Date.now() - renderStartedAt - fontsReadyMs - imageDecodeMs,
      renderMs: Date.now() - renderStartedAt,
      totalMs: Date.now() - startedAt,
    },
    'Studocu PDF generated',
  );
  return { pdf, pageCount };
}
