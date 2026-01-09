import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePalette, ColorPalette, DEFAULT_PRIMARY_COLOR } from '@/utils/colors';

// Preset colors - easy to modify
export const PRESET_COLORS = [
  { name: 'Slate', hex: '#334155' },
  { name: 'Ocean', hex: '#0369a1' },
  { name: 'Indigo', hex: '#4338ca' },
  { name: 'Amber', hex: '#b45309' },
  { name: 'Rose', hex: '#be123c' },
];

interface ThemeState {
  primaryColor: string;
  colors: ColorPalette;
  setPrimaryColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      primaryColor: DEFAULT_PRIMARY_COLOR,
      colors: generatePalette(DEFAULT_PRIMARY_COLOR),
      setPrimaryColor: (color: string) => {
        // Validate hex color format
        if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
          set({
            primaryColor: color,
            colors: generatePalette(color),
          });
        }
      },
    }),
    {
      name: 'quanto-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ primaryColor: state.primaryColor }),
      onRehydrateStorage: () => (state) => {
        // Regenerate colors from persisted primaryColor after rehydration
        if (state?.primaryColor) {
          state.colors = generatePalette(state.primaryColor);
        }
      },
    }
  )
);
