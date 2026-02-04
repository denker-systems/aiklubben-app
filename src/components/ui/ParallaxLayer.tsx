import React, { memo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

interface ParallaxLayerProps {
  children: React.ReactNode;
  scrollY: SharedValue<number>;
  speed?: number; // 0 = static, 1 = moves with scroll, <1 = slower (background)
  style?: ViewStyle;
  inputRange?: number[];
  outputRange?: number[];
}

/**
 * A layer component that moves at a different speed than scroll
 * Creates parallax depth effect
 *
 * speed < 1: Moves slower than scroll (background elements)
 * speed = 1: Moves with scroll (normal)
 * speed > 1: Moves faster than scroll (foreground elements)
 */
const ParallaxLayerComponent = memo(function ParallaxLayer({
  children,
  scrollY,
  speed = 0.5,
  style,
  inputRange,
  outputRange,
}: ParallaxLayerProps) {
  const animatedStyle = useAnimatedStyle(() => {
    if (inputRange && outputRange) {
      // Custom interpolation
      const translateY = interpolate(scrollY.value, inputRange, outputRange, Extrapolation.CLAMP);
      return {
        transform: [{ translateY }],
      };
    }

    // Default parallax based on speed
    // Negative speed = moves opposite direction (upward when scrolling down)
    return {
      transform: [{ translateY: scrollY.value * speed }],
    };
  });

  return <Animated.View style={[styles.layer, animatedStyle, style]}>{children}</Animated.View>;
});

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

export const ParallaxLayer = ParallaxLayerComponent;
export default ParallaxLayerComponent;
