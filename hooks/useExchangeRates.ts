import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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

const ONE_HOUR_MS = 1000 * 60 * 60;

export function useExchangeRates(): UseExchangeRatesResult {
  const { data, isLoading, error, refetch } = useQuery<ExchangeRatesResponse, Error>({
    queryKey: ['exchangeRates'],
    queryFn: fetchLatestRates,
    staleTime: ONE_HOUR_MS,
  });

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
    loading: isLoading,
    error: error?.message ?? null,
    lastUpdated: data?.timestamp ? new Date(data.timestamp * 1000) : null,
    refetch: async () => { await refetch(); },
    convert,
  };
}
