import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Check, X } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';

type ChipState = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled' | 'used';

interface OptionChipProps {
  label: string;
  state?: ChipState;
  onPress?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  index?: number;
  style?: ViewStyle;
}

export const OptionChip: React.FC<OptionChipProps> = ({
  label,
  state = 'default',
  onPress,
  disabled = false,
  size = 'medium',
  showIcon = true,
  index = 0,
  style,
}) => {
  const isDisabled = disabled || state === 'disabled' || state === 'used';

  const getStateStyles = () => {
    switch (state) {
      case 'selected':
        return styles.selected;
      case 'correct':
        return styles.correct;
      case 'incorrect':
        return styles.incorrect;
      case 'used':
        return styles.used;
      case 'disabled':
        return styles.disabled;
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: state === 'used' ? 0.4 : 1,
        scale: state === 'used' ? 0.95 : 1,
      }}
      transition={{ ...SPRING_CONFIGS.snappy, delay: index * 30 }}
    >
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.chip,
          getSizeStyles(),
          getStateStyles(),
          pressed && !isDisabled && styles.pressed,
          style,
        ]}
      >
        <Text
          variant="body"
          style={[
            styles.label,
            size === 'small' && styles.labelSmall,
            size === 'large' && styles.labelLarge,
            state === 'used' && styles.labelUsed,
          ]}
        >
          {label}
        </Text>

        {showIcon && state === 'correct' && (
          <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_CONFIGS.bouncy}>
            <Check size={20} color="#10B981" strokeWidth={3} />
          </MotiView>
        )}

        {showIcon && state === 'incorrect' && (
          <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_CONFIGS.bouncy}>
            <X size={20} color="#EF4444" strokeWidth={3} />
          </MotiView>
        )}
      </Pressable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: uiColors.card.background,
    borderWidth: 2,
    borderColor: uiColors.card.border,
    borderRadius: 16,
  },
  small: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 20,
  },
  selected: {
    borderColor: brandColors.purple,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  correct: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  incorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  used: {
    borderColor: 'transparent',
    backgroundColor: uiColors.glass.light,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: brandColors.purple,
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: uiColors.text.primary,
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: 14,
  },
  labelLarge: {
    fontSize: 18,
    fontWeight: '600',
  },
  labelUsed: {
    color: uiColors.text.muted,
  },
});
