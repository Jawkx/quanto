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

const COLORS = {
  primary: '#030712',
  secondary: '#374151',
  text: '#ffffff',
  textMuted: '#9ca3af',
  border: '#4b5563',
  selected: '#1f2937',
};

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
        style={[styles.currencyItem, isSelected && styles.currencyItemSelected]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyCode}>{item.code}</Text>
          <Text style={styles.currencyName}>{item.name}</Text>
        </View>
        <Text style={styles.currencySymbol}>{item.symbol}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={8}>
          <Text style={styles.closeButton}>Cancel</Text>
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

        <SafeAreaView edges={['bottom']} style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search currency..."
              placeholderTextColor={COLORS.textMuted}
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
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  keyboardAvoid: {
    flex: 1,
  },
  searchWrapper: {
    backgroundColor: COLORS.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.text,
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
  currencyItemSelected: {
    backgroundColor: COLORS.selected,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  currencySymbol: {
    color: COLORS.textMuted,
    fontSize: 18,
    marginLeft: 12,
  },
});
