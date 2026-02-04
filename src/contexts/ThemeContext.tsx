import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themeColors, ThemeColors } from '@/config/design';

export type ThemeType = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'aiklubben-theme';
const NOTIFICATIONS_STORAGE_KEY = 'aiklubben-notifications';

interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isLoading: boolean;
  isDark: boolean;
  colors: ThemeColors;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: ThemeType }> = ({
  children,
  defaultTheme = 'dark', // Default to dark for AI Klubben
}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsState] = useState(true);

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

  // Memoized theme colors based on resolved theme
  const colors = useMemo((): ThemeColors => {
    return themeColors[resolvedTheme];
  }, [resolvedTheme]);

  const setTheme = useCallback(async (newTheme: ThemeType) => {
    console.log('[ThemeContext] Setting theme:', newTheme);
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

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    console.log('[ThemeContext] Setting notifications enabled:', enabled);
    try {
      setNotificationsState(enabled);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('❌ Error saving notifications setting:', error);
    }
  }, []);

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // Load theme
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme as ThemeType);
        }
        
        // Load notifications
        const savedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (savedNotifications !== null) {
          setNotificationsState(JSON.parse(savedNotifications));
        }
      } catch (error) {
        console.error('❌ Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();
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
        colors,
        notificationsEnabled,
        setNotificationsEnabled,
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
