import React, { memo } from 'react';
import { Image, View, StyleSheet, ImageSourcePropType } from 'react-native';

/**
 * Icon name to asset mapping.
 * Replace placeholder `null` values with actual require('./path.png') when assets are ready.
 */
const iconAssets: Record<string, ImageSourcePropType | null> = {
  // Navigation / Tabs
  home: null,
  news: null,
  courses: null,
  content: null,
  profile: null,

  // Menu & Actions
  settings: null,
  support: null,
  privacy: null,
  about: null,
  logout: null,

  // Stats
  xp: null,
  streak: null,

  // Course levels
  beginner: null,
  intermediate: null,
  advanced: null,

  // Daily goal
  goal: null,

  // Content categories
  resources: null,
  platforms: null,
  events: null,
};

// Placeholder colors per icon for fallback
const placeholderColors: Record<string, string> = {
  home: '#6366f1',
  news: '#f43f5e',
  courses: '#8B5CF6',
  content: '#0ea5e9',
  profile: '#a855f7',
  settings: '#6B7280',
  support: '#3B82F6',
  privacy: '#14B8A6',
  about: '#6366f1',
  logout: '#EF4444',
  xp: '#8B5CF6',
  streak: '#F59E0B',
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
  resources: '#8B5CF6',
  platforms: '#10B981',
  events: '#EC4899',
  goal: '#F59E0B',
};

interface AppIconProps {
  name: string;
  size?: number;
}

/**
 * Renders a PNG icon from assets/icons/.
 * Falls back to a colored circle placeholder when the asset is not yet available.
 *
 * Usage:
 *   <AppIcon name="home" size={24} />
 */
const AppIconComponent = memo(function AppIcon({ name, size = 24 }: AppIconProps) {
  const source = iconAssets[name];

  if (source) {
    return (
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  // Placeholder: colored circle
  const color = placeholderColors[name] || '#6B7280';
  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `${color}30`,
          borderColor: `${color}60`,
        },
      ]}
    >
      <View
        style={{
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: (size * 0.4) / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
});

/**
 * Register an icon asset at runtime.
 * Call this after adding PNG files to assets/icons/.
 *
 * Example:
 *   registerIcon('home', require('../../assets/icons/home.png'));
 */
export function registerIcon(name: string, source: ImageSourcePropType) {
  iconAssets[name] = source;
}

/**
 * Check if an icon has an asset registered.
 */
export function hasIconAsset(name: string): boolean {
  return iconAssets[name] != null;
}

/**
 * Get all registered icon names.
 */
export function getIconNames(): string[] {
  return Object.keys(iconAssets);
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export const AppIcon = AppIconComponent;
export default AppIconComponent;
