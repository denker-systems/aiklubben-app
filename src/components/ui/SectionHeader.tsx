import React, { memo, useMemo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Text } from './Text';
import { GradientIconBadge } from './GradientIconBadge';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';

type GradientColors = readonly [string, string, ...string[]];

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  gradient?: GradientColors;
  action?: string;
  onActionPress?: () => void;
  animated?: boolean;
  delay?: number;
  style?: ViewStyle;
}

const SectionHeaderComponent = memo(function SectionHeader({
  title,
  subtitle,
  emoji,
  gradient = ['#6366f1', '#8b5cf6'],
  action,
  onActionPress,
  animated = true,
  delay = 0,
  style,
}: SectionHeaderProps) {
  const transitionConfig = useMemo(
    () => ({
      ...SPRING_CONFIGS.smooth,
      delay,
    }),
    [delay],
  );

  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {emoji && (
          <GradientIconBadge emoji={emoji} gradient={gradient} size="medium" animated={false} />
        )}
        <View>
          <Text variant="h3" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {action && onActionPress && (
        <Pressable onPress={onActionPress} style={styles.actionButton}>
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      )}
    </View>
  );

  if (!animated) return content;

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={transitionConfig}
    >
      {content}
    </MotiView>
  );
});

export const SectionHeader = SectionHeaderComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    color: '#F9FAFB',
  },
  subtitle: {
    color: '#9CA3AF',
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: uiColors.glass.strong, // Use centralized glass color
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.glass.stroke,
  },
  actionText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SectionHeaderComponent;
