export const SPRING_CONFIGS = {
  bouncy: {
    type: 'spring',
    damping: 12,
    stiffness: 100,
  } as const,
  snappy: {
    type: 'spring',
    damping: 20,
    stiffness: 150,
  } as const,
  smooth: {
    type: 'spring',
    damping: 25,
    stiffness: 120,
  } as const,
};

export const TIMING_CONFIGS = {
  fast: {
    type: 'timing',
    duration: 200,
  } as const,
  normal: {
    type: 'timing',
    duration: 300,
  } as const,
  slow: {
    type: 'timing',
    duration: 500,
  } as const,
};

export const STAGGER_DELAYS = {
  fast: 50,
  normal: 100,
  slow: 200,
};
