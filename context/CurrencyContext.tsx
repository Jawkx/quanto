import { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextType {
  sourceCurrency: string;
  targetCurrency: string;
  setSourceCurrency: (code: string) => void;
  setTargetCurrency: (code: string) => void;
  selectingFor: 'source' | 'target' | null;
  setSelectingFor: (side: 'source' | 'target' | null) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('JPY');
  const [selectingFor, setSelectingFor] = useState<'source' | 'target' | null>(null);

  return (
    <CurrencyContext.Provider
      value={{
        sourceCurrency,
        targetCurrency,
        setSourceCurrency,
        setTargetCurrency,
        selectingFor,
        setSelectingFor,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
