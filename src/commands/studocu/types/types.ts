export interface StudocuPdfResult {
  pdf: Buffer;
  pageCount: number;
}

export interface StudocuDownloadTimings {
  connectionMs: number;
  navigationMs: number;
  scanMs: number;
  pdfMs: number;
  closeMs: number;
}

export interface StudocuDownloadResult extends StudocuPdfResult {
  timings: StudocuDownloadTimings;
}

export type StudocuProgress =
  | { phase: 'connecting'; attempt: number }
  | { phase: 'navigating' }
  | { phase: 'navigated'; title: string }
  | { phase: 'scanning'; collected: number; expected: number }
  | { phase: 'rendering'; pageCount: number };

export type StudocuProgressCallback = (progress: StudocuProgress) => void;

export class StudocuDownloadError extends Error {
  constructor(
    public readonly reason: 'blocked' | 'connection' | 'unavailable' | 'incomplete' | 'invalid-pdf',
    options?: ErrorOptions,
  ) {
    super(`Studocu download failed: ${reason}`, options);
  }
}
