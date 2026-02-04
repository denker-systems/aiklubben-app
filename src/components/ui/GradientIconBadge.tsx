import React, { memo, useMemo } from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { SPRING_CONFIGS } from '@/lib/animations';

type GradientColors = readonly [string, string, ...string[]];

interface GradientIconBadgeProps {
  emoji: string;
  gradient: GradientColors;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  animated?: boolean;
  delay?: number;
  style?: ViewStyle;
}

const sizeConfig = {
  small: { container: 36, emoji: 16, borderRadius: 10 },
  medium: { container: 48, emoji: 22, borderRadius: 14 },
  large: { container: 56, emoji: 26, borderRadius: 16 },
  xlarge: { container: 72, emoji: 32, borderRadius: 20 },
};

const GradientIconBadgeComponent = memo(function GradientIconBadge({
  emoji,
  gradient,
  size = 'medium',
  animated = true,
  delay = 0,
  style,
}: GradientIconBadgeProps) {
  const config = sizeConfig[size];

  // Memoize styles to prevent recreation
  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        width: config.container,
        height: config.container,
        borderRadius: config.borderRadius,
      },
      style,
    ],
    [config, style],
  );

  const emojiStyle = useMemo(() => [styles.emoji, { fontSize: config.emoji }], [config.emoji]);

  const transitionConfig = useMemo(
    () => ({
      ...SPRING_CONFIGS.bouncy,
      delay,
    }),
    [delay],
  );

  const content = (
    <LinearGradient
      colors={gradient}
      style={containerStyle}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={emojiStyle}>{emoji}</Text>
    </LinearGradient>
  );

  if (!animated) return content;

  return (
    <MotiView
      from={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={transitionConfig}
    >
      {content}
    </MotiView>
  );
});

export const GradientIconBadge = GradientIconBadgeComponent;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});

export default GradientIconBadgeComponent;
