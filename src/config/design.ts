import { brandColors } from './theme';

// Theme Colors - Dark & Light Mode
export const themeColors = {
  dark: {
    // Backgrounds
    background: '#0C0A17',
    surface: '#1F1F1F',
    surfaceElevated: '#2A2A2A',
    card: '#1F1F1F',
    
    // Text
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
      muted: '#6B7280',
      inverse: '#0C0A17',
    },
    
    // Borders
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      subtle: 'rgba(255, 255, 255, 0.05)',
      strong: 'rgba(255, 255, 255, 0.2)',
    },
    
    // Glass effects
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.08)',
      strong: 'rgba(255, 255, 255, 0.15)',
      pressed: 'rgba(255, 255, 255, 0.1)',
    },
    
    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Tab bar
    tabBar: {
      background: 'rgba(31, 31, 31, 0.95)',
      active: brandColors.purple,
      inactive: '#6B7280',
    },
  },
  
  light: {
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceElevated: '#FFFFFF',
    card: '#FFFFFF',
    
    // Text
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    
    // Borders
    border: {
      default: 'rgba(0, 0, 0, 0.1)',
      subtle: 'rgba(0, 0, 0, 0.05)',
      strong: 'rgba(0, 0, 0, 0.2)',
    },
    
    // Glass effects
    glass: {
      light: 'rgba(0, 0, 0, 0.03)',
      medium: 'rgba(0, 0, 0, 0.05)',
      strong: 'rgba(0, 0, 0, 0.1)',
      pressed: 'rgba(0, 0, 0, 0.08)',
    },
    
    // Status colors
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
    
    // Tab bar
    tabBar: {
      background: 'rgba(255, 255, 255, 0.95)',
      active: brandColors.purple,
      inactive: '#9CA3AF',
    },
  },
};

export type ThemeColors = typeof themeColors.dark;

export const gradients = {
  // Primary Brand Gradients
  primary: [brandColors.purple, '#6366f1'] as const, // Purple to Indigo
  secondary: [brandColors.teal, brandColors.lightTeal] as const, // Teal
  accent: [brandColors.pink, brandColors.lightPink] as const, // Pink

  // Feature/Status Gradients
  fire: ['#f97316', '#ea580c'] as const, // Orange/Red (Streak)
  blue: ['#3B82F6', '#2563EB'] as const, // Blue (Lessons/Support)
  green: ['#10B981', '#059669'] as const, // Green (Success/Content)
  yellow: ['#F59E0B', '#D97706'] as const, // Amber (Trophies/Awards)
  gray: ['#6B7280', '#4B5563'] as const, // Gray (Settings)
  red: ['#EF4444', '#DC2626'] as const, // Red (Logout/Error)

  // Special
  purple_pink: [brandColors.purple, brandColors.pink] as const,
  dark_overlay: ['transparent', 'rgba(12, 10, 23, 0.7)', 'rgba(12, 10, 23, 0.95)'] as const,
};

// Theme-aware UI colors - use this via useTheme().colors or getUiColors(isDark)
export const getUiColors = (isDark: boolean) => ({
  glass: isDark
    ? {
        light: 'rgba(255, 255, 255, 0.05)',
        medium: 'rgba(255, 255, 255, 0.08)',
        strong: 'rgba(255, 255, 255, 0.15)',
        pressed: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.1)',
      }
    : {
        light: 'rgba(0, 0, 0, 0.03)',
        medium: 'rgba(0, 0, 0, 0.05)',
        strong: 'rgba(0, 0, 0, 0.1)',
        pressed: 'rgba(0, 0, 0, 0.06)',
        stroke: 'rgba(0, 0, 0, 0.1)',
      },
  text: isDark
    ? { primary: '#F9FAFB', secondary: '#9CA3AF', muted: '#6B7280' }
    : { primary: '#111827', secondary: '#4B5563', muted: '#9CA3AF' },
  card: isDark
    ? {
        background: '#1F1F1F',
        border: 'rgba(255, 255, 255, 0.1)',
        radius: 20,
      }
    : {
        background: '#FFFFFF',
        border: 'rgba(0, 0, 0, 0.08)',
        radius: 20,
      },
});

export type UiColors = ReturnType<typeof getUiColors>;

// @deprecated - Use getUiColors(isDark) instead for theme support
export const uiColors = getUiColors(true);
