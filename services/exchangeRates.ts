const API_BASE = 'https://openexchangerates.org/api';

// You'll need to get a free API key from https://openexchangerates.org/signup/free
const APP_ID = process.env.EXPO_PUBLIC_OXR_APP_ID || '';

export interface ExchangeRatesResponse {
  disclaimer: string;
  license: string;
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}

export async function fetchLatestRates(): Promise<ExchangeRatesResponse> {
  if (!APP_ID) {
    throw new Error(
      'Missing API key. Set EXPO_PUBLIC_OXR_APP_ID in your environment or .env file.'
    );
  }

  const response = await fetch(`${API_BASE}/latest.json?app_id=${APP_ID}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  // Rates are relative to USD (base currency)
  // To convert from currency A to B: amount * (rate_B / rate_A)
  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    throw new Error(`Rate not found for ${!fromRate ? from : to}`);
  }

  return amount * (toRate / fromRate);
}
