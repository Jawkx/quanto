import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { Currency } from '@/constants/currencies';

type CurrencyListItemProps = {
  item: Currency;
  isSelected: boolean;
  onSelect: (currency: Currency) => void;
};

export function CurrencyListItem({ item, isSelected, onSelect }: CurrencyListItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.currencyItem, isSelected && { backgroundColor: colors.selected }]}
      onPress={() => onSelect(item)}
    >
      <View style={styles.currencyInfo}>
        <Text style={[styles.currencyCode, { color: colors.text }]}>{item.code}</Text>
        <Text style={[styles.currencyName, { color: colors.textMuted }]}>{item.name}</Text>
      </View>
      <Text style={[styles.currencySymbol, { color: colors.textMuted }]}>{item.symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 14,
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 18,
    marginLeft: 12,
  },
});
