import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { Operator } from './hooks/useCalculator';

const OPACITY = {
  muted: 0.3,
  active: 1,
};

const operatorKeys: Operator[] = ['÷', '×', '+', '−'];

type OperatorRowProps = {
  currentOperator: Operator | null;
  operatorsEnabled: boolean;
  isCalculating: boolean;
  onOperatorPress: (op: Operator) => void;
  onEqualsPress: () => void;
};

export function OperatorRow({
  currentOperator,
  operatorsEnabled,
  isCalculating,
  onOperatorPress,
  onEqualsPress,
}: OperatorRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.operatorRow}>
      {operatorKeys.map((op) => {
        const isSelected = currentOperator === op;
        return (
          <Pressable
            key={op}
            style={[
              styles.operatorButton,
              isSelected && { backgroundColor: colors.secondary },
            ]}
            onPress={() => onOperatorPress(op)}
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
        style={[styles.operatorButton, styles.equalsButton]}
        onPress={onEqualsPress}
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
  );
}

const styles = StyleSheet.create({
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
  equalsButton: {},
  operatorText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
