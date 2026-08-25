import { logger } from '../../../logging/logger.ts';

const NEKOS_API = 'https://nekos.best/api/v2';

interface NekosResponse {
  results?: {
    url?: string;
  }[];
}

export async function fetchActionImage(action: string): Promise<string> {
  const url = `${NEKOS_API}/${action}?amount=1`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'hihi' },
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error(
      {
        url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        body,
      },
      '[Nekos.best] Request failed',
    );
    throw new Error(`Nekos.best responded with status ${response.status}`);
  }

  const data = (await response.json()) as NekosResponse;
  const actionImage = data.results?.[0]?.url;

  if (!actionImage) {
    logger.error(
      {
        url,
        data,
      },
      '[Nekos.best] Invalid response',
    );

    throw new Error(`No ${action} image returned from Nekos.best`);
  }

  return actionImage;
}
