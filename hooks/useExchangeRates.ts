import { useCallback, useEffect, useState } from 'react';
import {
  ExchangeRatesResponse,
  fetchLatestRates,
  convertCurrency,
} from '@/services/exchangeRates';

interface UseExchangeRatesResult {
  rates: Record<string, number> | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  convert: (amount: number, from: string, to: string) => number | null;
}

export function useExchangeRates(): UseExchangeRatesResult {
  const [data, setData] = useState<ExchangeRatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchLatestRates();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const convert = useCallback(
    (amount: number, from: string, to: string): number | null => {
      if (!data?.rates) return null;
      try {
        return convertCurrency(amount, from, to, data.rates);
      } catch {
        return null;
      }
    },
    [data?.rates]
  );

  return {
    rates: data?.rates ?? null,
    loading,
    error,
    lastUpdated: data?.timestamp ? new Date(data.timestamp * 1000) : null,
    refetch: fetch,
    convert,
  };
}
