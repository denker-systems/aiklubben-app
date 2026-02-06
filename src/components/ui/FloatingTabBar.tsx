import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { brandColors } from '@/config/theme';
import { SPRING_CONFIGS } from '@/lib/animations';
import { AppIcon } from './AppIcon';

interface TabItem {
  key: string;
  emoji: string;
  iconName?: string;
  label: string;
}

interface FloatingTabBarProps {
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function FloatingTabBar({ activeTab, onTabPress }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const tabs: TabItem[] = [
    { key: 'Home', emoji: '🏠', iconName: 'home', label: t.tabs.home },
    { key: 'News', emoji: '📰', iconName: 'news', label: t.tabs.news },
    { key: 'Courses', emoji: '📚', iconName: 'courses', label: t.tabs.courses },
    { key: 'Content', emoji: '📂', label: t.tabs.content },
    { key: 'Profile', emoji: '👤', iconName: 'profile', label: t.tabs.profile },
  ];

  console.log('[FloatingTabBar] Rendered', { activeTab });

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 20), pointerEvents: 'box-none' },
      ]}
    >
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={SPRING_CONFIGS.smooth}
        style={[styles.tabContainer, { backgroundColor: isDark ? '#1D1933' : '#FFFFFF', borderColor: isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(0, 0, 0, 0.08)' }]}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;

          return (
            <MotiPressable
              key={tab.key}
              onPress={() => {
                console.log('[FloatingTabBar] Tab pressed:', tab.key);
                onTabPress(tab.key);
              }}
              style={styles.tabButton}
              animate={isActive ? { scale: 1.15 } : { scale: 1 }}
              transition={SPRING_CONFIGS.snappy}
            >
              <MotiView
                animate={{
                  opacity: isActive ? 1 : 0.4,
                }}
              >
                {tab.iconName ? (
                  <AppIcon name={tab.iconName} size={isActive ? 52 : 48} />
                ) : (
                  <Text style={[styles.tabEmoji, isActive && styles.tabEmojiActive]}>
                    {tab.emoji}
                  </Text>
                )}
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
    zIndex: 1000,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 32,
    gap: 20,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.4)',
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  tabEmoji: {
    fontSize: 24,
  },
  tabEmojiActive: {
    fontSize: 26,
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
