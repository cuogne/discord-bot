import { fetchWithTimeout } from '../../utils/http.ts';

interface ExchangeRate {
  rate: number;
  date?: string;
}

export async function getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
  if (from === to) {
    return { rate: 1 };
  }

  const url = new URL(`https://api.frankfurter.dev/v2/rate/${from}/${to}`);
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Frankfurter returned HTTP ${response.status}`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== 'object' ||
    data === null ||
    !('base' in data) ||
    data.base !== from ||
    !('quote' in data) ||
    data.quote !== to ||
    !('rate' in data) ||
    typeof data.rate !== 'number' ||
    !Number.isFinite(data.rate) ||
    data.rate <= 0 ||
    !('date' in data) ||
    typeof data.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
  ) {
    throw new Error('Frankfurter returned an invalid exchange rate');
  }

  return { rate: data.rate, date: data.date };
}

export function formatCurrencyDisplay(
  amount: number,
  from: string,
  to: string,
  exchangeRate: ExchangeRate,
): { title: string; footer: string } {
  const converted = amount * exchangeRate.rate;
  if (!Number.isFinite(converted)) {
    throw new Error('Currency conversion overflowed');
  }

  const fromAmount = new Intl.NumberFormat(from === 'VND' ? 'vi-VN' : 'en-US', {
    maximumFractionDigits: amount < 1 ? 8 : ['VND', 'JPY', 'KRW'].includes(from) ? 0 : 2,
  }).format(amount);
  const toAmount = new Intl.NumberFormat(to === 'VND' ? 'vi-VN' : 'en-US', {
    maximumFractionDigits: converted < 1 ? 8 : ['VND', 'JPY', 'KRW'].includes(to) ? 0 : 2,
  }).format(converted);
  const unitRate = new Intl.NumberFormat(to === 'VND' ? 'vi-VN' : 'en-US', {
    maximumSignificantDigits: 10,
  }).format(exchangeRate.rate);
  const rateDate = exchangeRate.date
    ? ` · Tỷ giá ngày ${exchangeRate.date.split('-').reverse().join('/')}`
    : '';

  return {
    title: `${fromAmount} ${from} = ${toAmount} ${to}`,
    footer: `1 ${from} = ${unitRate} ${to}${rateDate}`,
  };
}
