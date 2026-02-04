import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
  onPress?: () => void;
  noPadding?: boolean;
}

export function Card({
  variant = 'default',
  onPress,
  children,
  style,
  noPadding = false,
  ...props
}: CardProps) {
  const { isDark } = useTheme();
  // Extract web-specific props to avoid type mismatch with TouchableOpacity
  const { onBlur, onFocus, onMouseEnter, onMouseLeave, ...otherProps } = props as any;

  const getVariantStyle = (): ViewStyle => {
    const bgColor = isDark ? '#121023' : '#FFFFFF';
    const borderColor = isDark ? 'rgba(139, 92, 246, 0.1)' : '#E5E7EB';

    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: bgColor,
          boxShadow: `0 4px 12px ${isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderWidth: 1,
          borderColor: 'rgba(139, 92, 246, 0.05)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#E5E7EB',
        };
      case 'glass':
        return {
          backgroundColor: isDark ? 'rgba(29, 25, 51, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          borderColor: 'rgba(139, 92, 246, 0.15)',
        };
      default:
        return {
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor: borderColor,
        };
    }
  };

  const combinedStyle = [styles.base, !noPadding && styles.padding, getVariantStyle(), style];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={combinedStyle as any}
        {...otherProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={combinedStyle as any} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  padding: {
    padding: 20,
  },
});
