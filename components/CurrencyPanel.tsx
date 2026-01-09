import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { HistoryRow, Operator } from './hooks/useCalculator';

const OPACITY = {
  muted: 0.3,
  active: 1,
};

function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

type SourcePanelProps = {
  currency: string;
  currentValue: number;
  firstOperand: number | null;
  operator: Operator | null;
  historyRows: HistoryRow[];
  isCalculating: boolean;
  result: number;
  onPress: () => void;
};

export function SourcePanel({
  currency,
  currentValue,
  firstOperand,
  operator,
  historyRows,
  isCalculating,
  result,
  onPress,
}: SourcePanelProps) {
  const { colors } = useTheme();

  return (
    <Pressable style={[styles.panel, styles.leftPanel]} onPress={onPress}>
      <Text style={[styles.currencyCode, { color: colors.text }]}>{currency}</Text>
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
                {formatNumber(firstOperand!)} {operator}{' '}
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
  );
}

type TargetPanelProps = {
  currency: string;
  displayAmount: string;
  onPress: () => void;
};

export function TargetPanel({ currency, displayAmount, onPress }: TargetPanelProps) {
  const { colors } = useTheme();

  return (
    <Pressable style={[styles.panel, styles.rightPanel]} onPress={onPress}>
      <Text style={[styles.currencyCode, { color: colors.text }]}>{currency}</Text>
      <Text style={[styles.amount, { color: colors.text }]}>{displayAmount}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
