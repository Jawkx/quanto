import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useThemeStore, PRESET_COLORS } from '@/stores/themeStore';

export default function SettingsScreen() {
  const { colors, primaryColor, setPrimaryColor } = useThemeStore();

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="light" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={8}>
          <Text style={[styles.closeButton, { color: colors.text }]}>Done</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map((preset) => {
            const isSelected = primaryColor === preset.hex;
            return (
              <Pressable
                key={preset.hex}
                style={[
                  styles.colorOption,
                  { borderColor: isSelected ? colors.text : 'transparent' },
                ]}
                onPress={() => setPrimaryColor(preset.hex)}
              >
                <View style={[styles.colorSwatch, { backgroundColor: preset.hex }]} />
                <Text style={[styles.colorName, { color: colors.text }]}>{preset.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.previewSection}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Preview</Text>
          <View style={styles.previewContainer}>
            <View style={[styles.previewBox, { backgroundColor: colors.primary }]}>
              <Text style={[styles.previewLabel, { color: colors.text }]}>Primary</Text>
            </View>
            <View style={[styles.previewBox, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.previewLabel, { color: colors.text }]}>Secondary</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 80,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  colorName: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewSection: {
    marginTop: 32,
  },
  previewContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  previewBox: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
