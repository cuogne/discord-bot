import { getToday } from "./getToday.js";

export async function getData(today) {
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

    return dataFormatted;
  }
  catch (error) {
    console.error('Error fetching gas price data:', error);
    return null;
  }
}