import { useState, useMemo, useCallback } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { currencies, Currency } from '@/constants/currencies';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { CurrencyListItem } from '@/components/CurrencyListItem';
import { SearchBar } from '@/components/SearchBar';

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

  const handleSelect = useCallback((currency: Currency) => {
    if (selectingFor === 'source') {
      setSourceCurrency(currency.code);
    } else if (selectingFor === 'target') {
      setTargetCurrency(currency.code);
    }
    setSelectingFor(null);
    router.back();
  }, [selectingFor, setSourceCurrency, setTargetCurrency, setSelectingFor]);

  const handleClose = () => {
    setSelectingFor(null);
    router.back();
  };

  const renderCurrency = useCallback(({ item }: { item: Currency }) => (
    <CurrencyListItem
      item={item}
      isSelected={item.code === currentSelection}
      onSelect={handleSelect}
    />
  ), [currentSelection, handleSelect]);

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

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search currency..."
        />
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
  listContent: {
    paddingHorizontal: 16,
  },
});
