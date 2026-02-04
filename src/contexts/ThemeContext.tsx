import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'aiklubben-theme';

interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isLoading: boolean;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: ThemeType }> = ({
  children,
  defaultTheme = 'dark', // Default to dark for AI Klubben
}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  const getSystemTheme = useCallback((): ResolvedTheme => {
    return systemColorScheme === 'light' ? 'light' : 'dark';
  }, [systemColorScheme]);

  const resolveTheme = useCallback(
    (themeValue: ThemeType): ResolvedTheme => {
      if (themeValue === 'system') {
        return getSystemTheme();
      }
      return themeValue;
    },
    [getSystemTheme],
  );

  const resolvedTheme = resolveTheme(theme);
  const isDark = resolvedTheme === 'dark';

  const setTheme = useCallback(async (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('❌ Error saving theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('❌ Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;

    const subscription = Appearance.addChangeListener(() => {
      setThemeState('system');
    });

    return () => subscription.remove();
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isLoading,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
