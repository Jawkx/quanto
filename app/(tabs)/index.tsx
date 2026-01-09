import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useCurrency } from '@/context/CurrencyContext';

const MAX_DIGITS = 12;

const COLORS = {
  primary: '#030712',
  secondary: '#374151',
  text: '#ffffff',
};

const OPACITY = {
  muted: 0.3,
  active: 1,
};

const operatorKeys = ['÷', '×', '+', '−'];
const keypadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '⌫'],
];

type Operator = '÷' | '×' | '+' | '−';

function calculate(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : 0;
  }
}

function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const rounded = Math.round(amount);
    const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${currency} ${grouped}`;
  }
}

export default function ConverterScreen() {
  const [input, setInput] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);

  const { sourceCurrency, targetCurrency, setSelectingFor } = useCurrency();
  const { rates, loading, error, refetch, convert } = useExchangeRates();

  const openCurrencySelector = (side: 'source' | 'target') => {
    setSelectingFor(side);
    router.push('/currency-selector');
  };

  const currentValue = useMemo(() => Number(input || '0'), [input]);
  const isCalculating = operator !== null && firstOperand !== null;

  const result = useMemo(() => {
    if (!isCalculating) return currentValue;
    return calculate(firstOperand, currentValue, operator);
  }, [isCalculating, firstOperand, currentValue, operator]);

  const resultAmount = useMemo(() => {
    const converted = convert(result, sourceCurrency, targetCurrency);
    return converted ?? result; // Fallback to same value if conversion fails
  }, [result, convert, sourceCurrency, targetCurrency]);

  const displayTarget = useMemo(
    () => formatCurrency(resultAmount, targetCurrency),
    [resultAmount, targetCurrency]
  );

  const rateDisplay = useMemo(() => {
    if (!rates) return null;
    const sourceRate = rates[sourceCurrency] || 1;
    const targetRate = rates[targetCurrency];
    if (!targetRate) return null;
    const rate = targetRate / sourceRate;
    return `1 ${sourceCurrency} = ${rate.toFixed(2)} ${targetCurrency}`;
  }, [rates, sourceCurrency, targetCurrency]);

  // Operators are muted when there's no meaningful input
  const operatorsEnabled = input !== '0' || firstOperand !== null;

  const handleKeyPress = (value: string) => {
    if (value === 'C') {
      setInput('0');
      setFirstOperand(null);
      setOperator(null);
      return;
    }

    if (value === '⌫') {
      setInput((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
      return;
    }

    setInput((prev) => {
      if (prev === '0') return value;
      if (prev.length >= MAX_DIGITS) return prev;
      return prev + value;
    });
  };

  const handleOperatorPress = (op: Operator) => {
    if (!operatorsEnabled) return;

    if (isCalculating) {
      // Chain: evaluate current expression, use result as new firstOperand
      const newFirst = calculate(firstOperand, currentValue, operator);
      setFirstOperand(newFirst);
      setOperator(op);
      setInput('0');
    } else {
      // Start new calculation
      setFirstOperand(currentValue);
      setOperator(op);
      setInput('0');
    }
  };

  const handleEquals = () => {
    if (!isCalculating) return;
    const finalResult = calculate(firstOperand, currentValue, operator);
    setInput(String(Math.round(finalResult)));
    setFirstOperand(null);
    setOperator(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />

      <View style={styles.topSection}>
        <View style={styles.backgroundSplit} pointerEvents="none">
          <View style={styles.backgroundLeft} />
          <View style={styles.backgroundRight} />
        </View>

        <View style={styles.header}>
          <Text style={styles.appName}>Quanto</Text>
          <View style={styles.rateInfo}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.text} />
            ) : error ? (
              <Pressable onPress={refetch}>
                <Text style={styles.errorText}>Tap to retry</Text>
              </Pressable>
            ) : rateDisplay ? (
              <Text style={styles.rateText}>{rateDisplay}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.conversionArea}>
          <View style={styles.panelGroup}>
            <Pressable
              style={[styles.panel, styles.leftPanel]}
              onPress={() => openCurrencySelector('source')}
            >
              <Text style={styles.currencyCode}>{sourceCurrency}</Text>
              {isCalculating ? (
                <>
                  <View style={styles.expressionRow}>
                    <Text style={[styles.amount, { opacity: OPACITY.muted }]}>
                      {formatNumber(firstOperand)} {operator}{' '}
                    </Text>
                    <Text style={styles.amount}>
                      {formatNumber(currentValue)}
                    </Text>
                  </View>
                  <Text style={[styles.equalsSign, { opacity: OPACITY.muted }]}>=</Text>
                  <Text style={styles.resultAmount}>{formatNumber(result)}</Text>
                </>
              ) : (
                <Text style={styles.amount}>{formatNumber(currentValue)}</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.panel, styles.rightPanel]}
              onPress={() => openCurrencySelector('target')}
            >
              <Text style={styles.currencyCode}>{targetCurrency}</Text>
              <Text style={styles.amount}>{displayTarget}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.operatorRow}>
          {operatorKeys.map((op) => {
            const isSelected = operator === op;
            return (
              <Pressable
                key={op}
                style={[
                  styles.operatorButton,
                  isSelected && styles.operatorButtonSelected,
                ]}
                onPress={() => handleOperatorPress(op as Operator)}
              >
                <Text
                  style={[
                    styles.operatorText,
                    { opacity: operatorsEnabled ? OPACITY.active : OPACITY.muted },
                  ]}
                >
                  {op}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            style={[
              styles.operatorButton,
              styles.equalsButton,
            ]}
            onPress={handleEquals}
          >
            <Text
              style={[
                styles.operatorText,
                { opacity: isCalculating ? OPACITY.active : OPACITY.muted },
              ]}
            >
              =
            </Text>
          </Pressable>
        </View>

        <View style={styles.keypad}>
          {keypadRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.keypadRow}>
              {row.map((key) => {
                const isAction = key === 'C' || key === '⌫';
                return (
                  <Pressable
                    key={key}
                    style={styles.keypadKey}
                    onPress={() => handleKeyPress(key)}
                  >
                    <Text style={[styles.keypadText, isAction && styles.keypadTextAction]}>
                      {key}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  topSection: {
    flex: 1.1,
    position: 'relative',
  },
  backgroundSplit: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  backgroundLeft: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  backgroundRight: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  appName: {
    color: COLORS.text,
    fontSize: 16,
    letterSpacing: 0.4,
    fontWeight: '500',
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateText: {
    color: COLORS.text,
    fontSize: 12,
    opacity: 0.7,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
  },
  conversionArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  expressionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equalsSign: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  resultAmount: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '600',
  },
  panelGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  panel: {
    flex: 1,
    paddingHorizontal: 12,
    minHeight: 100,
    justifyContent: 'flex-end',
  },
  leftPanel: {},
  rightPanel: {
    paddingLeft: 16,
  },
  currencyCode: {
    color: COLORS.text,
    fontSize: 14,
    letterSpacing: 0.8,
  },
  amount: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '600',
  },
  operatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  operatorButton: {
    borderRadius: 6,
    width: 48,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorButtonSelected: {
    backgroundColor: COLORS.secondary,
  },
  equalsButton: {},
  operatorText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  keypad: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 18,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18,
  },
  keypadKey: {
    width: 64,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  keypadTextAction: {
    color: COLORS.text,
  },
});
