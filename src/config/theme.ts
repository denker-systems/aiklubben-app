import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// AI Klubben Brand Colors from klubben-connect
export const brandColors = {
  purple: '#8B5CF6',
  lightPurple: '#A78BFA',
  darkPurple: '#7C3AED',
  pink: '#EC4899',
  lightPink: '#F472B6',
  darkPink: '#DB2777',
  teal: '#2DD4BF',
  lightTeal: '#5EEAD4',
  darkTeal: '#14B8A6',
  darkBg: '#121023',
  deepDark: '#0C0A17',
  lightBg: '#1D1933',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  orange: '#F97316',
  border: '#2A2445',
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brandColors.purple,
    primaryContainer: brandColors.darkPurple,
    secondary: brandColors.teal,
    secondaryContainer: brandColors.darkTeal,
    tertiary: brandColors.pink,
    background: brandColors.deepDark,
    surface: brandColors.darkBg,
    surfaceVariant: brandColors.lightBg,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#F9FAFB',
    onSurface: '#F9FAFB',
    onSurfaceVariant: '#9CA3AF',
    outline: '#2A2445',
    error: '#EF4444',
  },
  roundness: 12,
};

// Even though the app is dark-first, we provide a light theme for completeness
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.purple,
    primaryContainer: brandColors.lightPurple,
    secondary: brandColors.teal,
    secondaryContainer: brandColors.lightTeal,
    tertiary: brandColors.pink,
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceVariant: '#F3F4F6',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: brandColors.deepDark,
    onSurface: brandColors.deepDark,
    onSurfaceVariant: '#4B5563',
    outline: '#E5E7EB',
    error: '#EF4444',
  },
  roundness: 12,
};

export const getTheme = (isDark: boolean) => (isDark ? darkTheme : lightTheme);
