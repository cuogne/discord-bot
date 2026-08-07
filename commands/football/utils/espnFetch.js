const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

export const ESPN_HEADERS = {
    'User-Agent': USER_AGENT,
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://www.espn.com',
};

export function logEspnError(context, error, url) {
    const info = {
        timestamp: new Date().toISOString(),
        command: context,
        url,
        message: error?.message,
        stack: error?.stack,
    };

    if (error?.status !== undefined) {
        info.status = error.status;
        info.statusText = error.statusText;
        info.responseBody = String(error.body || '').slice(0, 2000);
    }

    console.error(`[ESPN][${context}] API error:`, info);
}