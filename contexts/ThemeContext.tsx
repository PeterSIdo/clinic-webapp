import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { storageService } from '@/utils/storage';

type ColorScheme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  colorScheme: ColorScheme;
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme || 'light');
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('auto');

  const loadThemePreference = async () => {
    try {
      const settings = await storageService.getSettings();
      setThemePreferenceState(settings.theme);
      
      if (settings.theme === 'auto') {
        setColorScheme(systemColorScheme || 'light');
      } else {
        setColorScheme(settings.theme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setColorScheme(systemColorScheme || 'light');
    }
  };

  useEffect(() => {
    loadThemePreference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setThemePreference = async (theme: ThemePreference) => {
    try {
      await storageService.updateTheme(theme);
      setThemePreferenceState(theme);
      
      if (theme === 'auto') {
        setColorScheme(systemColorScheme || 'light');
      } else {
        setColorScheme(theme);
      }
    } catch (error) {
      console.error('Error setting theme preference:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
