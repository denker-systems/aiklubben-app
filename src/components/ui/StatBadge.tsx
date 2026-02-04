import React, { memo, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { SPRING_CONFIGS } from '@/lib/animations';

type GradientColors = readonly [string, string, ...string[]];

interface StatBadgeProps {
  emoji: string;
  value: string | number;
  label: string;
  gradient: GradientColors;
  animated?: boolean;
  delay?: number;
  style?: ViewStyle;
}

const StatBadgeComponent = memo(function StatBadge({
  emoji,
  value,
  label,
  gradient,
  animated = true,
  delay = 0,
  style,
}: StatBadgeProps) {
  const transitionConfig = useMemo(
    () => ({
      ...SPRING_CONFIGS.bouncy,
      delay,
    }),
    [delay],
  );

  const content = (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradient}
        style={styles.iconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </LinearGradient>
      <View style={styles.info}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
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

export const StatBadge = StatBadgeComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  info: {
    alignItems: 'flex-start',
  },
  value: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});

export default StatBadgeComponent;
