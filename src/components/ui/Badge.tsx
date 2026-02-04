import React from 'react';
import { View, Text as RNText, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ label, variant = 'primary', style, textStyle }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA' };
      case 'secondary':
        return { bg: 'rgba(236, 72, 153, 0.15)', text: '#F472B6' };
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24' };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171' };
      case 'outline':
        return { bg: 'transparent', text: '#9CA3AF', border: 'rgba(156, 163, 175, 0.3)' };
      default:
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA' };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: vStyles.bg,
          borderColor: vStyles.border,
          borderWidth: vStyles.border ? 1 : 0,
        },
        style,
      ]}
    >
      <RNText style={[styles.text, { color: vStyles.text }, textStyle]}>
        {label.toUpperCase()}
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
