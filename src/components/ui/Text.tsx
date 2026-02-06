import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'body-lg' | 'caption' | 'tiny';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function Text({ variant = 'body', weight, style, children, ...props }: CustomTextProps) {
  const { colors } = useTheme();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return { fontSize: 28, fontWeight: '700' };
      case 'h2':
        return { fontSize: 24, fontWeight: '700' };
      case 'h3':
        return { fontSize: 20, fontWeight: '600' };
      case 'h4':
        return { fontSize: 17, fontWeight: '600' };
      case 'body-lg':
        return { fontSize: 16 };
      case 'body-sm':
        return { fontSize: 13 };
      case 'caption':
        return { fontSize: 12 };
      case 'tiny':
        return { fontSize: 11 };
      default:
        return { fontSize: 14 };
    }
  };

  const fontWeightStyle: TextStyle = weight
    ? {
        fontWeight:
          weight === 'medium'
            ? '500'
            : weight === 'semibold'
              ? '600'
              : weight === 'bold'
                ? '700'
                : '400',
      }
    : {};

  return (
    <RNText
      style={[{ color: colors.text.primary }, getVariantStyle(), fontWeightStyle, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
