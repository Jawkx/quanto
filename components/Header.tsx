import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

type HeaderProps = {
  topInset: number;
  rateDisplay: string | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function Header({ topInset, rateDisplay, loading, error, onRetry }: HeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { paddingTop: topInset + 8 }]}>
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
          <Pressable onPress={onRetry}>
            <Text style={[styles.errorText, { color: colors.error }]}>Tap to retry</Text>
          </Pressable>
        ) : rateDisplay ? (
          <Text style={[styles.rateText, { color: colors.text }]}>{rateDisplay}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
