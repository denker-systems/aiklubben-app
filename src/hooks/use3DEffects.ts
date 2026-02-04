import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

/**
 * 3D Perspective and Depth Effects for React Native
 * Creates subtle tilt and parallax effects for visual depth
 */

// Spring config for smooth 3D movements
const TILT_SPRING = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

/**
 * Creates a subtle 3D tilt effect on press
 * Cards appear to "lift" and tilt slightly toward the touch point
 */
export function useTilt3D() {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateZ = useSharedValue(0);

  const onPressIn = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const width = 300; // Approximate card width
    const height = 200; // Approximate card height

    // Calculate tilt based on touch position (subtle: max 3 degrees)
    const tiltX = (locationY / height - 0.5) * -6; // Inverted for natural feel
    const tiltY = (locationX / width - 0.5) * 6;

    rotateX.value = withSpring(tiltX, TILT_SPRING);
    rotateY.value = withSpring(tiltY, TILT_SPRING);
    scale.value = withSpring(1.02, TILT_SPRING);
    translateZ.value = withSpring(10, TILT_SPRING);
  }, [rotateX, rotateY, scale, translateZ]);

  const onPressOut = useCallback(() => {
    rotateX.value = withSpring(0, TILT_SPRING);
    rotateY.value = withSpring(0, TILT_SPRING);
    scale.value = withSpring(1, TILT_SPRING);
    translateZ.value = withSpring(0, TILT_SPRING);
  }, [rotateX, rotateY, scale, translateZ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
    rotateX,
    rotateY,
    scale,
  };
}

/**
 * Creates a subtle idle floating/breathing animation
 * Makes elements feel alive with gentle movement
 */
export function useFloatingAnimation(amplitude: number = 3, duration: number = 3000) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Start floating animation
  const startFloating = useCallback(() => {
    translateY.value = withTiming(amplitude, { duration }, () => {
      translateY.value = withTiming(-amplitude, { duration }, () => {
        translateY.value = withTiming(0, { duration: duration / 2 });
      });
    });

    rotate.value = withTiming(1, { duration: duration * 1.5 }, () => {
      rotate.value = withTiming(-1, { duration: duration * 1.5 }, () => {
        rotate.value = withTiming(0, { duration: duration });
      });
    });
  }, [amplitude, duration, translateY, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
  }));

  return { animatedStyle, startFloating, translateY, rotate };
}

/**
 * Creates parallax effect based on scroll position
 * Different layers move at different speeds for depth
 */
export function useParallaxScroll(scrollY: SharedValue<number>) {
  // Background layer - moves slowest
  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.3 }],
  }));

  // Midground layer - moves at medium speed
  const midgroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.5 }],
  }));

  // Foreground layer - moves fastest (or stays with scroll)
  const foregroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.8 }],
  }));

  return { backgroundStyle, midgroundStyle, foregroundStyle };
}

/**
 * Creates depth-based scale effect
 * Elements scale slightly based on their position in viewport
 */
export function useDepthScale(
  scrollY: SharedValue<number>,
  elementY: number,
  viewportHeight: number,
) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.value - elementY);
    const normalizedDistance = distance / viewportHeight;

    // Scale from 0.95 to 1.0 based on distance from center
    const scale = interpolate(
      normalizedDistance,
      [0, 0.5, 1],
      [1, 0.98, 0.95],
      Extrapolation.CLAMP,
    );

    // Slight opacity reduction for distant elements
    const opacity = interpolate(
      normalizedDistance,
      [0, 0.5, 1],
      [1, 0.95, 0.85],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return animatedStyle;
}

/**
 * Creates a card hover/press effect with 3D perspective
 * Simpler version that doesn't require touch coordinates
 */
export function useCard3D() {
  const pressed = useSharedValue(false);

  const onPressIn = useCallback(() => {
    pressed.value = true;
  }, [pressed]);

  const onPressOut = useCallback(() => {
    pressed.value = false;
  }, [pressed]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(pressed.value ? 0.97 : 1, TILT_SPRING);
    const rotateX = withSpring(pressed.value ? 2 : 0, TILT_SPRING);
    const translateY = withSpring(pressed.value ? 4 : 0, TILT_SPRING);

    return {
      transform: [{ perspective: 1000 }, { scale }, { rotateX: `${rotateX}deg` }, { translateY }],
    };
  });

  return { animatedStyle, onPressIn, onPressOut };
}

/**
 * Creates layered shadow effect for depth
 * Multiple shadows at different offsets create 3D illusion
 */
export function getLayeredShadow(elevation: number = 1) {
  const shadows = [];

  for (let i = 1; i <= elevation; i++) {
    shadows.push({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: i * 2 },
      shadowOpacity: 0.1 / i,
      shadowRadius: i * 3,
    });
  }

  // Return the combined shadow (simplified for RN)
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation * 3 },
    shadowOpacity: 0.15,
    shadowRadius: elevation * 5,
    elevation: elevation * 3, // Android
  };
}

export default {
  useTilt3D,
  useFloatingAnimation,
  useParallaxScroll,
  useDepthScale,
  useCard3D,
  getLayeredShadow,
};
