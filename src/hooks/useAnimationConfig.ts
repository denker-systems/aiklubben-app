import { useMemo, useCallback } from 'react';
import { SPRING_CONFIGS, TIMING_CONFIGS } from '@/lib/animations';

/**
 * Performance-optimized animation configuration hooks
 * These hooks prevent recreation of animation objects on every render
 */

/**
 * Returns a memoized spring transition config with optional delay
 */
export function useSpringTransition(
  type: keyof typeof SPRING_CONFIGS = 'smooth',
  delay: number = 0,
) {
  return useMemo(
    () => ({
      ...SPRING_CONFIGS[type],
      delay,
    }),
    [type, delay],
  );
}

/**
 * Returns a memoized timing transition config with optional delay
 */
export function useTimingTransition(
  type: keyof typeof TIMING_CONFIGS = 'normal',
  delay: number = 0,
) {
  return useMemo(
    () => ({
      ...TIMING_CONFIGS[type],
      delay,
    }),
    [type, delay],
  );
}

/**
 * Returns memoized animation states for common patterns
 */
export function useFadeInAnimation(delay: number = 0) {
  const from = useMemo(() => ({ opacity: 0 }), []);
  const animate = useMemo(() => ({ opacity: 1 }), []);
  const transition = useSpringTransition('smooth', delay);

  return { from, animate, transition };
}

export function useSlideUpAnimation(delay: number = 0) {
  const from = useMemo(() => ({ opacity: 0, translateY: 30 }), []);
  const animate = useMemo(() => ({ opacity: 1, translateY: 0 }), []);
  const transition = useSpringTransition('smooth', delay);

  return { from, animate, transition };
}

export function useScaleInAnimation(delay: number = 0) {
  const from = useMemo(() => ({ opacity: 0, scale: 0.8 }), []);
  const animate = useMemo(() => ({ opacity: 1, scale: 1 }), []);
  const transition = useSpringTransition('bouncy', delay);

  return { from, animate, transition };
}

export function usePopInAnimation(delay: number = 0) {
  const from = useMemo(() => ({ opacity: 0, scale: 0, translateY: 20 }), []);
  const animate = useMemo(() => ({ opacity: 1, scale: 1, translateY: 0 }), []);
  const transition = useSpringTransition('bouncy', delay);

  return { from, animate, transition };
}

/**
 * Returns a staggered delay calculator
 */
export function useStaggerDelay(baseDelay: number = 0, staggerMs: number = 100) {
  return useCallback((index: number) => baseDelay + index * staggerMs, [baseDelay, staggerMs]);
}

/**
 * Performance tips for animations:
 *
 * 1. AVOID animating layout properties (width, height, flex) - use transform instead
 * 2. PREFER opacity and transform animations - they run on the UI thread
 * 3. MEMOIZE transition configs - don't create new objects on every render
 * 4. USE timing over spring for simpler animations - springs are more expensive
 * 5. LIMIT concurrent animations - too many at once causes frame drops
 * 6. DISABLE animations when not visible - use AnimatePresence sparingly
 * 7. USE FlashList instead of FlatList for long lists
 * 8. WRAP list items in React.memo()
 */
