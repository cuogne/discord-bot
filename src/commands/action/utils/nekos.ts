import { fetchWithTimeout } from '../../../utils/http.ts';

const NEKOS_API = 'https://nekos.best/api/v2';

interface NekosResponse {
  results?: {
    url?: string;
  }[];
}

class NekosApiError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status?: number,
    readonly responseBody?: string,
  ) {
    super(message);
    this.name = 'NekosApiError';
  }
}

export async function fetchActionImage(action: string): Promise<string> {
  const url = `${NEKOS_API}/${action}?amount=1`;

  const response = await fetchWithTimeout(url, {
    headers: { 'User-Agent': 'hihi' },
  });

  if (!response.ok) {
    const responseBody = (await response.text()).slice(0, 2000);
    throw new NekosApiError(
      `Nekos.best responded with HTTP ${response.status}`,
      url,
      response.status,
      responseBody,
    );
  }

  const data = (await response.json()) as NekosResponse;
  const actionImage = data.results?.[0]?.url;

  if (!actionImage) {
    throw new NekosApiError(
      `Nekos.best returned no ${action} image`,
      url,
      response.status,
      JSON.stringify(data).slice(0, 2000),
    );
  }

  return actionImage;
}
