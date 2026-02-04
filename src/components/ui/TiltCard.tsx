import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { uiColors } from '@/config/design';

interface TiltCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  tiltAmount?: number; // degrees
  scaleAmount?: number;
  elevation?: number;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

/**
 * A card component with subtle 3D tilt effect on press
 * Creates depth through perspective transforms
 */
const TiltCardComponent = memo(function TiltCard({
  children,
  style,
  onPress,
  disabled = false,
  tiltAmount = 3,
  scaleAmount = 0.98,
  elevation = 2,
}: TiltCardProps) {
  const pressed = useSharedValue(false);
  const rotateX = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    pressed.value = true;
    rotateX.value = withSpring(tiltAmount, SPRING_CONFIG);
  }, [tiltAmount, pressed, rotateX]);

  const handlePressOut = useCallback(() => {
    pressed.value = false;
    rotateX.value = withSpring(0, SPRING_CONFIG);
  }, [pressed, rotateX]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(pressed.value ? scaleAmount : 1, SPRING_CONFIG);
    const translateY = withSpring(pressed.value ? 2 : 0, SPRING_CONFIG);

    return {
      transform: [
        { perspective: 1000 },
        { scale },
        { rotateX: `${rotateX.value}deg` },
        { translateY },
      ],
    };
  });

  const shadowStyle = getShadowStyle(elevation);

  return (
    <Animated.View style={[styles.container, shadowStyle, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.pressable}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
});

function getShadowStyle(elevation: number) {
  // Use a more subtle shadow color for dark mode
  const shadowColor = '#000';
  return {
    shadowColor,
    shadowOffset: { width: 0, height: elevation * 2 },
    shadowOpacity: 0.2 + elevation * 0.03, // Increased opacity slightly for visibility on dark bg
    shadowRadius: elevation * 4,
    elevation: elevation * 2,
  };
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20, // Match design system
    overflow: 'visible',
    backgroundColor: uiColors.card.background, // Default background
  },
  pressable: {
    flex: 1,
  },
});

export const TiltCard = TiltCardComponent;
export default TiltCardComponent;
