import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Newspaper, BookOpen, User } from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useTheme } from '@/contexts/ThemeContext';
import { brandColors } from '@/config/theme';
import { SPRING_CONFIGS } from '@/lib/animations';

interface TabItem {
  key: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
}

const tabs: TabItem[] = [
  { key: 'Home', icon: Home, label: 'Hem' },
  { key: 'News', icon: Newspaper, label: 'Nyheter' },
  { key: 'Content', icon: BookOpen, label: 'Innehåll' },
  { key: 'Profile', icon: User, label: 'Profil' },
];

interface FloatingTabBarProps {
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function FloatingTabBar({ activeTab, onTabPress }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20), pointerEvents: 'box-none' }]}
    >
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={SPRING_CONFIGS.smooth}
        style={[
          styles.tabContainer,
          { backgroundColor: isDark ? 'rgba(29, 25, 51, 0.95)' : 'rgba(255, 255, 255, 0.95)' },
        ]}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <MotiPressable
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              style={styles.tabButton}
              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              transition={SPRING_CONFIGS.snappy}
            >
              <MotiView
                animate={{
                  opacity: isActive ? 1 : 0.5,
                }}
              >
                <Icon
                  size={24}
                  color={isActive ? brandColors.purple : isDark ? '#9CA3AF' : '#4B5563'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </MotiView>
              {isActive && (
                <MotiView
                  style={[styles.activeDot, { backgroundColor: brandColors.purple }]}
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </MotiPressable>
          );
        })}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 32,
    gap: 28,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.4)',
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    position: 'absolute',
    bottom: -4,
  },
});
