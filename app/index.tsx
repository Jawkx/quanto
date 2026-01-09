import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/components/hooks/useCalculator';
import { useCurrencySwipe } from '@/components/hooks/useCurrencySwipe';
import { Header } from '@/components/Header';
import { SourcePanel, TargetPanel } from '@/components/CurrencyPanel';
import { OperatorRow } from '@/components/OperatorRow';
import { Keypad } from '@/components/Keypad';

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
  const { colors } = useTheme();
  const { sourceCurrency, targetCurrency, setSourceCurrency, setTargetCurrency, setSelectingFor } = useCurrency();
  const { rates, loading, error, refetch, convert } = useExchangeRates();

  const calculator = useCalculator();
  const sourcePanResponder = useCurrencySwipe(sourceCurrency, setSourceCurrency);
  const targetPanResponder = useCurrencySwipe(targetCurrency, setTargetCurrency);

  const openCurrencySelector = (side: 'source' | 'target') => {
    setSelectingFor(side);
    router.push('/currency-selector');
  };

  const resultAmount = useMemo(() => {
    const converted = convert(calculator.result, sourceCurrency, targetCurrency);
    return converted ?? calculator.result;
  }, [calculator.result, convert, sourceCurrency, targetCurrency]);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]} edges={['left', 'right', 'bottom']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      <View style={styles.topSection}>
        <View style={styles.backgroundSplit} pointerEvents="none">
          <View style={[styles.backgroundLeft, { backgroundColor: colors.primary }]} />
          <View style={[styles.backgroundRight, { backgroundColor: colors.secondary }]} />
        </View>

        <Header
          topInset={insets.top}
          rateDisplay={rateDisplay}
          loading={loading}
          error={error}
          onRetry={refetch}
        />

        <View style={styles.conversionArea}>
          <View style={styles.panelGroup}>
            <View style={styles.panelWrapper} {...sourcePanResponder.panHandlers}>
              <SourcePanel
                currency={sourceCurrency}
                currentValue={calculator.currentValue}
                firstOperand={calculator.firstOperand}
                operator={calculator.operator}
                historyRows={calculator.historyRows}
                isCalculating={calculator.isCalculating}
                result={calculator.result}
                onPress={() => openCurrencySelector('source')}
              />
            </View>
            <View style={styles.panelWrapper} {...targetPanResponder.panHandlers}>
              <TargetPanel
                currency={targetCurrency}
                displayAmount={displayTarget}
                onPress={() => openCurrencySelector('target')}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.bottomSection, { backgroundColor: colors.primary }]}>
        <OperatorRow
          currentOperator={calculator.operator}
          operatorsEnabled={calculator.operatorsEnabled}
          isCalculating={calculator.isCalculating}
          onOperatorPress={calculator.handleOperatorPress}
          onEqualsPress={calculator.handleEquals}
        />
        <Keypad onKeyPress={calculator.handleKeyPress} />
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
  conversionArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  panelGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  panelWrapper: {
    flex: 1,
  },
});
