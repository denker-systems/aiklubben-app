import { brandColors } from './theme';

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

export const uiColors = {
  // Glass effects
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.15)',
    pressed: 'rgba(255, 255, 255, 0.1)',
    stroke: 'rgba(255, 255, 255, 0.1)',
  },
  // Text opacities
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    muted: '#6B7280',
  },
  // Standard Card Style (from Profile Badges)
  card: {
    background: '#1F1F1F', // Solid gray with 100% opacity
    border: 'rgba(255, 255, 255, 0.1)', // Subtle border for definition
    radius: 20, // Consistent rounded corners
  },
};
