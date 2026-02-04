import React from 'react';
import {
  Pressable,
  PressableProps,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { brandColors } from '@/config/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: brandColors.purple, text: '#FFFFFF' };
      case 'secondary':
        return { backgroundColor: brandColors.pink, text: '#FFFFFF' };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: brandColors.purple,
          text: brandColors.purple,
        };
      case 'ghost':
        return { backgroundColor: 'transparent', text: brandColors.purple };
      case 'destructive':
        return { backgroundColor: '#EF4444', text: '#FFFFFF' };
      default:
        return { backgroundColor: brandColors.purple, text: '#FFFFFF' };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { height: 36, paddingHorizontal: 16, fontSize: 13 };
      case 'lg':
        return { height: 56, paddingHorizontal: 32, fontSize: 18 };
      case 'icon':
        return { height: 44, width: 44, paddingHorizontal: 0, fontSize: 0 };
      default:
        return { height: 48, paddingHorizontal: 24, fontSize: 15 };
    }
  };

  const vStyle = getVariantStyle();
  const sStyle = getSizeStyle();

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => {
        const baseStyle: ViewStyle = {
          backgroundColor: vStyle.backgroundColor,
          height: sStyle.height,
          paddingHorizontal: sStyle.paddingHorizontal,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          borderColor: vStyle.border,
          borderWidth: vStyle.border ? 1 : 0,
          opacity: disabled || loading ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        };
        return [baseStyle, style as ViewStyle];
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          {typeof children === 'string' ? (
            <Text weight="bold" style={{ color: vStyle.text, fontSize: sStyle.fontSize }}>
              {children}
            </Text>
          ) : (
            children
          )}
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
