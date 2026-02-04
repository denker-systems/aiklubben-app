import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { MenuButton } from './MenuButton';
import { FloatingOrbs } from './FloatingOrbs';
import { ParallaxLayer } from './ParallaxLayer';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showMenu?: boolean;
  showOrbs?: boolean;
  orbsVariant?: 'default' | 'header' | 'menu' | 'profile';
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  style?: ViewStyle;
  scrollY?: SharedValue<number>;
  transparent?: boolean;
}

const ScreenHeaderComponent = memo(function ScreenHeader({
  title,
  subtitle,
  showMenu = true,
  showOrbs = true,
  orbsVariant = 'header',
  rightContent,
  leftContent,
  style,
  scrollY,
  transparent = false,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  // Keep header fully transparent
  const headerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: 'transparent',
    };
  });

  return (
    <Animated.View style={[styles.stickyHeader, headerStyle]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }, style]}>
        {/* Parallax Orbs Layer */}
        {showOrbs && scrollY && (
          <ParallaxLayer scrollY={scrollY} speed={0.3}>
            <FloatingOrbs variant={orbsVariant} />
          </ParallaxLayer>
        )}
        {showOrbs && !scrollY && <FloatingOrbs variant={orbsVariant} />}

        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {leftContent}
            <View>
              <Text variant="h1" style={styles.headerTitle}>
                {title}
              </Text>
              {subtitle && (
                <Text variant="body" style={styles.headerSubtitle}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerRight}>
            {rightContent}
            {showMenu && <MenuButton />}
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

export const ScreenHeader = ScreenHeaderComponent;

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'visible',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'visible',
  },
  gradientFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#F9FAFB',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});

// Helper to calculate header height for padding
export const getHeaderHeight = (insets: { top: number }) => {
  return insets.top + 16 + 60; // top inset + padding + content height
};

export default ScreenHeaderComponent;
