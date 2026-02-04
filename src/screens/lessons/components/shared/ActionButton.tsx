import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { brandColors } from '@/config/theme';
import { uiColors } from '@/config/design';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const variantColors: Record<ButtonVariant, [string, string]> = {
  primary: [brandColors.purple, '#a855f7'],
  secondary: ['#4B5563', '#374151'],
  success: ['#10B981', '#059669'],
  danger: ['#EF4444', '#DC2626'],
  ghost: ['transparent', 'transparent'],
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = true,
  size = 'medium',
  style,
}) => {
  const colors = disabled ? variantColors.secondary : variantColors[variant];
  const isGhost = variant === 'ghost';

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
      from={{ opacity: 0 }}
      animate={{ opacity: disabled ? 0.6 : 1 }}
      transition={SPRING_CONFIGS.smooth}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.button, pressed && !disabled && styles.pressed]}
      >
        {isGhost ? (
          <MotiView
            style={[styles.ghostContent, getSizeStyles()]}
            animate={{ scale: disabled ? 1 : 1 }}
          >
            {Icon && iconPosition === 'left' && (
              <Icon size={size === 'small' ? 16 : 20} color={uiColors.text.secondary} />
            )}
            <Text variant="body" style={[styles.ghostLabel, size === 'small' && styles.labelSmall]}>
              {label}
            </Text>
            {Icon && iconPosition === 'right' && (
              <Icon size={size === 'small' ? 16 : 20} color={uiColors.text.secondary} />
            )}
          </MotiView>
        ) : (
          <LinearGradient
            colors={colors}
            style={[styles.gradient, getSizeStyles()]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {Icon && iconPosition === 'left' && (
              <Icon size={size === 'small' ? 16 : 20} color="#FFFFFF" />
            )}
            <Text variant="body" style={[styles.label, size === 'small' && styles.labelSmall]}>
              {label}
            </Text>
            {Icon && iconPosition === 'right' && (
              <Icon size={size === 'small' ? 16 : 20} color="#FFFFFF" />
            )}
          </LinearGradient>
        )}
      </Pressable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ghostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: uiColors.card.border,
    borderRadius: 16,
  },
  small: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  ghostLabel: {
    color: uiColors.text.secondary,
    fontWeight: '600',
    fontSize: 16,
  },
  labelSmall: {
    fontSize: 14,
  },
});
