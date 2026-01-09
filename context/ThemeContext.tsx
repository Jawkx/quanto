import { useThemeStore } from '@/stores/themeStore';
import { ColorPalette } from '@/utils/colors';

interface ThemeContextType {
  colors: ColorPalette;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

// Re-export useTheme as a simple wrapper around the Zustand store
// This maintains backward compatibility with existing components
export function useTheme(): ThemeContextType {
  const { colors, primaryColor, setPrimaryColor } = useThemeStore();
  return { colors, primaryColor, setPrimaryColor };
}

// AppThemeProvider is now a pass-through since Zustand handles state
// Keeping it for backward compatibility with _layout.tsx
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
