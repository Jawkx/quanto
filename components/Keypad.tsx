import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const keypadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '⌫'],
];

type KeypadProps = {
  onKeyPress: (key: string) => void;
};

export function Keypad({ onKeyPress }: KeypadProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.keypad}>
      {keypadRows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.keypadRow}>
          {row.map((key) => (
            <Pressable
              key={key}
              style={styles.keypadKey}
              onPress={() => onKeyPress(key)}
            >
              <Text style={[styles.keypadText, { color: colors.text }]}>
                {key}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
