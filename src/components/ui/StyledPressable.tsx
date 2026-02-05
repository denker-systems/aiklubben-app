import React from 'react';
import { View, Pressable, PressableProps, ViewStyle, StyleSheet } from 'react-native';

interface StyledPressableProps extends Omit<PressableProps, 'style'> {
  style?: ViewStyle | ViewStyle[] | (ViewStyle | false | undefined)[];
  pressedStyle?: ViewStyle;
  children: React.ReactNode;
}

/**
 * A Pressable wrapper that renders visual styles (backgroundColor, border, etc.)
 * on a View wrapper instead of via Pressable's function-based style.
 *
 * This fixes a NativeWind 4 + iOS issue where jsxImportSource: 'nativewind'
 * causes Pressable function-based styles to lose backgroundColor and other
 * visual properties on iOS native.
 *
 * Pattern: View (visual styles) > Pressable (press interaction only)
 */
export function StyledPressable({
  style,
  pressedStyle,
  children,
  disabled,
  ...props
}: StyledPressableProps) {
  const flatStyle = StyleSheet.flatten(style);

  return (
    <View style={flatStyle}>
      <Pressable
        disabled={disabled}
        style={({ pressed }) => ({
          flex: 1,
          opacity: pressed ? 0.8 : 1,
          ...(pressed && pressedStyle ? pressedStyle : {}),
        })}
        {...props}
      >
        {children}
      </Pressable>
    </View>
  );
}
