// Spring configurations for different animation feels
export const SPRING_CONFIGS = {
  // Playful bounce - Duolingo-style celebrations
  bouncy: {
    type: 'spring',
    damping: 8,
    stiffness: 180,
    mass: 0.8,
  } as const,
  // Quick responsive feedback
  snappy: {
    type: 'spring',
    damping: 18,
    stiffness: 200,
  } as const,
  // Smooth transitions
  smooth: {
    type: 'spring',
    damping: 22,
    stiffness: 100,
  } as const,
  // Gentle easing for subtle movements
  gentle: {
    type: 'spring',
    damping: 30,
    stiffness: 80,
  } as const,
  // Wobbly effect for fun interactions
  wobbly: {
    type: 'spring',
    damping: 5,
    stiffness: 120,
    mass: 0.5,
  } as const,
  // Extra bouncy for achievements/rewards
  celebratory: {
    type: 'spring',
    damping: 6,
    stiffness: 250,
    mass: 0.6,
  } as const,
};

// Timing configurations for precise control
export const TIMING_CONFIGS = {
  instant: {
    type: 'timing',
    duration: 100,
  } as const,
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
  dramatic: {
    type: 'timing',
    duration: 800,
  } as const,
};

// Stagger delays for list animations
export const STAGGER_DELAYS = {
  fast: 40,
  normal: 80,
  slow: 150,
};

// Pre-built animation variants (Moti-compatible)
export const ANIMATION_PRESETS = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    animate: { opacity: 0 },
  },

  // Slide animations
  slideUp: {
    from: { opacity: 0, translateY: 30 },
    animate: { opacity: 1, translateY: 0 },
  },
  slideDown: {
    from: { opacity: 0, translateY: -30 },
    animate: { opacity: 1, translateY: 0 },
  },
  slideLeft: {
    from: { opacity: 0, translateX: 30 },
    animate: { opacity: 1, translateX: 0 },
  },
  slideRight: {
    from: { opacity: 0, translateX: -30 },
    animate: { opacity: 1, translateX: 0 },
  },

  // Scale animations
  scaleIn: {
    from: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
  scaleOut: {
    from: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 0.8 },
  },
  popIn: {
    from: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
  },

  // Gamification animations
  pulseGlow: {
    from: { scale: 1, opacity: 0.8 },
    animate: { scale: 1.05, opacity: 1 },
  },
  shake: {
    from: { translateX: 0 },
    animate: { translateX: [-5, 5, -5, 5, 0] },
  },
  bounce: {
    from: { translateY: 0 },
    animate: { translateY: [-10, 0] },
  },
  wiggle: {
    from: { rotate: '0deg' },
    animate: { rotate: ['-3deg', '3deg', '-3deg', '0deg'] },
  },
};

// Menu/Modal animation configurations
export const MENU_ANIMATIONS = {
  overlay: {
    from: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: TIMING_CONFIGS.fast,
  },
  slideFromRight: {
    from: { translateX: '100%', opacity: 0 },
    animate: { translateX: 0, opacity: 1 },
    exit: { translateX: '100%', opacity: 0 },
    transition: SPRING_CONFIGS.snappy,
  },
  slideFromBottom: {
    from: { translateY: '100%' },
    animate: { translateY: 0 },
    exit: { translateY: '100%' },
    transition: SPRING_CONFIGS.smooth,
  },
  scaleFromCenter: {
    from: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: SPRING_CONFIGS.snappy,
  },
};

// Progress bar animations
export const PROGRESS_ANIMATIONS = {
  fill: (progress: number) => ({
    from: { width: '0%' },
    animate: { width: `${progress}%` },
    transition: { ...SPRING_CONFIGS.smooth, delay: 200 },
  }),
  pulse: {
    animate: {
      scale: [1, 1.02, 1],
      opacity: [0.8, 1, 0.8],
    },
    transition: {
      type: 'timing',
      duration: 1500,
      loop: true,
    },
  },
};

// XP/Points animation helpers
export const GAMIFICATION_ANIMATIONS = {
  xpGain: {
    from: { opacity: 0, translateY: 20, scale: 0.5 },
    animate: { opacity: 1, translateY: 0, scale: 1 },
    exit: { opacity: 0, translateY: -30, scale: 0.8 },
    transition: SPRING_CONFIGS.celebratory,
  },
  streakFlame: {
    animate: {
      scale: [1, 1.1, 1],
      rotate: ['-2deg', '2deg', '-2deg'],
    },
    transition: {
      type: 'timing',
      duration: 800,
      loop: true,
    },
  },
  badgeUnlock: {
    from: { opacity: 0, scale: 0, rotate: '-180deg' },
    animate: { opacity: 1, scale: 1, rotate: '0deg' },
    transition: SPRING_CONFIGS.bouncy,
  },
  levelUp: {
    from: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: [1.3, 0.9, 1.1, 1] },
    transition: SPRING_CONFIGS.celebratory,
  },
};

// Tab bar animations
export const TAB_ANIMATIONS = {
  activeTab: {
    scale: 1.15,
    translateY: -2,
  },
  inactiveTab: {
    scale: 1,
    translateY: 0,
  },
  indicator: {
    from: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: SPRING_CONFIGS.bouncy,
  },
};
