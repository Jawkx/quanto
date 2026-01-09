import { useState, useMemo } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { currencies, Currency } from '@/constants/currencies';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';

export default function CurrencySelector() {
  const [search, setSearch] = useState('');
  const {
    sourceCurrency,
    targetCurrency,
    setSourceCurrency,
    setTargetCurrency,
    selectingFor,
    setSelectingFor,
  } = useCurrency();
  const { colors } = useTheme();

  const currentSelection = selectingFor === 'source' ? sourceCurrency : targetCurrency;

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return currencies;
    const query = search.toLowerCase();
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query)
    );
  }, [search]);

  const handleSelect = (currency: Currency) => {
    if (selectingFor === 'source') {
      setSourceCurrency(currency.code);
    } else if (selectingFor === 'target') {
      setTargetCurrency(currency.code);
    }
    setSelectingFor(null);
    router.back();
  };

  const handleClose = () => {
    setSelectingFor(null);
    router.back();
  };

  const renderCurrency = ({ item }: { item: Currency }) => {
    const isSelected = item.code === currentSelection;
    return (
      <Pressable
        style={[styles.currencyItem, isSelected && { backgroundColor: colors.selected }]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.currencyInfo}>
          <Text style={[styles.currencyCode, { color: colors.text }]}>{item.code}</Text>
          <Text style={[styles.currencyName, { color: colors.textMuted }]}>{item.name}</Text>
        </View>
        <Text style={[styles.currencySymbol, { color: colors.textMuted }]}>{item.symbol}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="light" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={8}>
          <Text style={[styles.closeButton, { color: colors.textMuted }]}>Cancel</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          data={filteredCurrencies}
          renderItem={renderCurrency}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />

        <SafeAreaView edges={['bottom']} style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.secondary, color: colors.text }]}
              placeholder="Search currency..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    fontSize: 16,
  },
  keyboardAvoid: {
    flex: 1,
  },
  searchWrapper: {},
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
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
