import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';

interface QuestionHeaderProps {
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  icon: Icon,
  iconColor = brandColors.purple,
  title,
  subtitle,
  centered = true,
}) => {
  return (
    <MotiView
      style={[styles.container, centered && styles.centered]}
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {Icon && (
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Icon size={28} color={iconColor} />
        </View>
      )}
      <Text variant="h3" style={[styles.title, centered && styles.textCentered]}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="body" style={[styles.subtitle, centered && styles.textCentered]}>
          {subtitle}
        </Text>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  centered: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    color: uiColors.text.primary,
    lineHeight: 28,
  },
  textCentered: {
    textAlign: 'center',
  },
  subtitle: {
    color: uiColors.text.secondary,
    lineHeight: 22,
  },
});
