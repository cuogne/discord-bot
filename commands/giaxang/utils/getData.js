const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const gasPriceCache = new Map();
const inFlightRequests = new Map();

function getCachedData(today) {
  const cached = gasPriceCache.get(today);

  if (!cached) {
    return null;
  }

  const isExpired = Date.now() - cached.fetchedAt > CACHE_TTL_MS;
  if (isExpired) {
    gasPriceCache.delete(today);
    return null;
  }

  return cached.data;
}

export async function getData(today) {
  const cachedData = getCachedData(today);
  if (cachedData) {
    return cachedData;
  }

  if (inFlightRequests.has(today)) {
    return inFlightRequests.get(today);
  }

  const requestPromise = (async () => {
  try {
    const api = `https://giaxanghomnay.com/api/pvdate/${today}`;
    const response = await fetch(api);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const dataRaw = await response.json();
    const rows = Array.isArray(dataRaw?.[0]) ? dataRaw[0] : dataRaw;

    if (!Array.isArray(rows)) {
      throw new Error('Unexpected API response format');
    }

    const dataFormatted = rows.map(({ title, date, zone1_price }) => ({
      title,
      date,
      zone1_price
    }));

    gasPriceCache.set(today, {
      data: dataFormatted,
      fetchedAt: Date.now()
    });

    return dataFormatted;
  }
  catch (error) {
    console.error('Error fetching gas price data:', error);
    return null;
  }
  finally {
    inFlightRequests.delete(today);
  }
  })();

  inFlightRequests.set(today, requestPromise);
  return requestPromise;
}