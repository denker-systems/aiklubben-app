import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { useMenu } from '@/contexts/MenuContext';

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
  const menuContext = useMenu();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
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
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.menuButton,
        {
          width: config.button,
          height: config.button,
          borderRadius: config.button / 2,
        },
        pressed && styles.menuButtonPressed,
        style,
      ]}
    >
      <View style={[styles.menuLine, { width: config.lineWidth }]} />
      <View style={[styles.menuLine, { width: config.lineShort }]} />
    </Pressable>
  );
});

export const MenuButton = MenuButtonComponent;

const styles = StyleSheet.create({
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  menuButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ scale: 0.95 }],
  },
  menuLine: {
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
});

export default MenuButtonComponent;
