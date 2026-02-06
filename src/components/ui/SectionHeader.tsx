import React, { memo, useMemo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Text } from './Text';
import { GradientIconBadge } from './GradientIconBadge';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';

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
  const { isDark } = useTheme();
  const ui = getUiColors(isDark);

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
        <Pressable onPress={onActionPress} style={[styles.actionButton, { backgroundColor: ui.glass.strong, borderColor: ui.glass.stroke }]}>
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
    // color from Text component
  },
  subtitle: {
    // color from Text component
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    // backgroundColor and borderColor set dynamically
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SectionHeaderComponent;
