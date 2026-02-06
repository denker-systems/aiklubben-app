import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { useMenu } from '@/contexts/MenuContext';
import { useTheme } from '@/contexts/ThemeContext';

interface MenuButtonProps {
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

const MenuButtonComponent = memo(function MenuButton({
  style,
  size = 'medium',
  onPress,
}: MenuButtonProps) {
  const { isDark, colors } = useTheme();
  const menuContext = useMenu();

  const handlePress = useCallback(() => {
    console.log('[MenuButton] Button pressed');
    if (onPress) {
      console.log('[MenuButton] Calling custom onPress');
      onPress();
    } else {
      console.log('[MenuButton] Opening menu');
      menuContext?.openMenu();
    }
  }, [onPress, menuContext]);

  const config = useMemo(() => {
    const sizeConfig = {
      small: { button: 36, lineWidth: 16, lineShort: 10 },
      medium: { button: 44, lineWidth: 20, lineShort: 14 },
      large: { button: 52, lineWidth: 24, lineShort: 18 },
    };
    return sizeConfig[size];
  }, [size]);

  return (
    <View
      style={[
        styles.menuButton,
        {
          width: config.button,
          height: config.button,
          borderRadius: config.button / 2,
        },
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)' },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={styles.menuButtonPressable}
      >
        <View style={[styles.menuLine, { width: config.lineWidth, backgroundColor: colors.text.primary }]} />
        <View style={[styles.menuLine, { width: config.lineShort, backgroundColor: colors.text.primary }]} />
      </Pressable>
    </View>
  );
});

export const MenuButton = MenuButtonComponent;

const styles = StyleSheet.create({
  menuButton: {
    // backgroundColor set dynamically
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  menuButtonPressable: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
  menuButtonPressed: {
    // backgroundColor set dynamically
    transform: [{ scale: 0.95 }],
  },
  menuLine: {
    height: 2,
    // backgroundColor set dynamically
    borderRadius: 1,
  },
});

export default MenuButtonComponent;
