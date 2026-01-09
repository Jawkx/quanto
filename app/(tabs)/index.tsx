import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { currencies } from '@/constants/currencies';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';

const MAX_DIGITS = 12;

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
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [historyRows, setHistoryRows] = useState<
    { left: number; op: Operator; right: number; result: number }[]
  >([]);

  const { sourceCurrency, targetCurrency, setSourceCurrency, setTargetCurrency, setSelectingFor } = useCurrency();
  const { rates, loading, error, refetch, convert } = useExchangeRates();
  const { colors } = useTheme();

  const openCurrencySelector = (side: 'source' | 'target') => {
    setSelectingFor(side);
    router.push('/currency-selector');
  };

  const sourceCurrencyRef = useRef(sourceCurrency);
  const targetCurrencyRef = useRef(targetCurrency);
  sourceCurrencyRef.current = sourceCurrency;
  targetCurrencyRef.current = targetCurrency;

  const getCurrencyIndex = (code: string) => currencies.findIndex(c => c.code === code);

  const cycleCurrency = (current: string, direction: 'next' | 'prev') => {
    const currentIndex = getCurrencyIndex(current);
    if (currentIndex === -1) return currencies[0].code;

    const newIndex = direction === 'next'
      ? (currentIndex + 1) % currencies.length
      : (currentIndex - 1 + currencies.length) % currencies.length;

    return currencies[newIndex].code;
  };

  const SWIPE_THRESHOLD = 50;

  const sourcePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          setSourceCurrency(cycleCurrency(sourceCurrencyRef.current, 'prev'));
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          setSourceCurrency(cycleCurrency(sourceCurrencyRef.current, 'next'));
        }
      },
    })
  ).current;

  const targetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          setTargetCurrency(cycleCurrency(targetCurrencyRef.current, 'prev'));
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          setTargetCurrency(cycleCurrency(targetCurrencyRef.current, 'next'));
        }
      },
    })
  ).current;

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
      setHistoryRows([]);
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
      setHistoryRows((prev) => ([
        ...prev,
        { left: firstOperand, op: operator, right: currentValue, result: newFirst },
      ]));
      setFirstOperand(newFirst);
      setOperator(op);
      setInput('0');
    } else {
      // Start new calculation
      setHistoryRows([]);
      setFirstOperand(currentValue);
      setOperator(op);
      setInput('0');
    }
  };

  const handleEquals = () => {
    if (!isCalculating) return;
    const finalResult = calculate(firstOperand, currentValue, operator);
    setHistoryRows((prev) => ([
      ...prev,
      { left: firstOperand, op: operator, right: currentValue, result: finalResult },
    ]));
    setInput(String(Math.round(finalResult)));
    setFirstOperand(null);
    setOperator(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]} edges={['left', 'right', 'bottom']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      <View style={styles.topSection}>
        <View style={styles.backgroundSplit} pointerEvents="none">
          <View style={[styles.backgroundLeft, { backgroundColor: colors.primary }]} />
          <View style={[styles.backgroundRight, { backgroundColor: colors.secondary }]} />
        </View>

        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.appName, { color: colors.text }]}>Quanto</Text>
            <Pressable
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.rateInfo}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : error ? (
              <Pressable onPress={refetch}>
                <Text style={[styles.errorText, { color: colors.error }]}>Tap to retry</Text>
              </Pressable>
            ) : rateDisplay ? (
              <Text style={[styles.rateText, { color: colors.text }]}>{rateDisplay}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.conversionArea}>
          <View style={styles.panelGroup}>
            <View style={styles.panelWrapper} {...sourcePanResponder.panHandlers}>
              <Pressable
                style={[styles.panel, styles.leftPanel]}
                onPress={() => openCurrencySelector('source')}
              >
                <Text style={[styles.currencyCode, { color: colors.text }]}>{sourceCurrency}</Text>
                <>
                  {historyRows.length > 0 && (
                    <View style={styles.historyStack}>
                      {historyRows.map((row, index) => (
                        <Text key={`hist-${index}`} style={[styles.historyText, { color: colors.text }]}>
                          {formatNumber(row.left)} {row.op} {formatNumber(row.right)} = {formatNumber(row.result)}
                        </Text>
                      ))}
                    </View>
                  )}
                  {isCalculating ? (
                    <>
                      <View style={styles.expressionRow}>
                        <Text style={[styles.amount, { color: colors.text, opacity: OPACITY.muted }]}>
                          {formatNumber(firstOperand)} {operator}{' '}
                        </Text>
                        <Text style={[styles.amount, { color: colors.text }]}>
                          {formatNumber(currentValue)}
                        </Text>
                      </View>
                      <Text style={[styles.equalsSign, { color: colors.text, opacity: OPACITY.muted }]}>=</Text>
                      <Text style={[styles.resultAmount, { color: colors.text }]}>{formatNumber(result)}</Text>
                    </>
                  ) : (
                    <Text style={[styles.amount, { color: colors.text }]}>{formatNumber(currentValue)}</Text>
                  )}
                </>
              </Pressable>
            </View>
            <View style={styles.panelWrapper} {...targetPanResponder.panHandlers}>
              <Pressable
                style={[styles.panel, styles.rightPanel]}
                onPress={() => openCurrencySelector('target')}
              >
                <Text style={[styles.currencyCode, { color: colors.text }]}>{targetCurrency}</Text>
                <Text style={[styles.amount, { color: colors.text }]}>{displayTarget}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.bottomSection, { backgroundColor: colors.primary }]}>
        <View style={styles.operatorRow}>
          {operatorKeys.map((op) => {
            const isSelected = operator === op;
            return (
              <Pressable
                key={op}
                style={[
                  styles.operatorButton,
                  isSelected && { backgroundColor: colors.secondary },
                ]}
                onPress={() => handleOperatorPress(op as Operator)}
              >
                <Text
                  style={[
                    styles.operatorText,
                    { color: colors.text, opacity: operatorsEnabled ? OPACITY.active : OPACITY.muted },
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
                { color: colors.text, opacity: isCalculating ? OPACITY.active : OPACITY.muted },
              ]}
            >
              =
            </Text>
          </Pressable>
        </View>

        <View style={styles.keypad}>
          {keypadRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.keypadRow}>
              {row.map((key) => (
                <Pressable
                  key={key}
                  style={styles.keypadKey}
                  onPress={() => handleKeyPress(key)}
                >
                  <Text style={[styles.keypadText, { color: colors.text }]}>
                    {key}
                  </Text>
                </Pressable>
              ))}
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
  },
  backgroundRight: {
    flex: 1,
  },
  bottomSection: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 16,
    letterSpacing: 0.4,
    fontWeight: '500',
  },
  settingsButton: {
    opacity: 0.7,
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  errorText: {
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
  historyStack: {
    marginBottom: 6,
  },
  historyText: {
    fontSize: 12,
    opacity: OPACITY.muted,
    lineHeight: 16,
  },
  equalsSign: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  resultAmount: {
    fontSize: 28,
    fontWeight: '600',
  },
  panelGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  panelWrapper: {
    flex: 1,
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
    fontSize: 14,
    letterSpacing: 0.8,
  },
  amount: {
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
  operatorButtonSelected: {},
  equalsButton: {},
  operatorText: {
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
    fontSize: 20,
    fontWeight: '600',
  },
});
