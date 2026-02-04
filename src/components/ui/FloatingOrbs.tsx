import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { brandColors } from '@/config/theme';

interface OrbConfig {
  size: number;
  color: string;
  position: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  opacity: number;
  delay?: number;
}

interface FloatingOrbsProps {
  variant?: 'default' | 'header' | 'menu' | 'profile';
  visible?: boolean;
  animated?: boolean;
}

const orbConfigs: Record<string, OrbConfig[]> = {
  default: [
    {
      size: 200,
      color: brandColors.purple,
      position: { top: -50, right: -80 },
      opacity: 0.15,
      delay: 0,
    },
    {
      size: 250,
      color: brandColors.pink,
      position: { top: 100, left: -100 },
      opacity: 0.1,
      delay: 100,
    },
  ],
  header: [
    {
      size: 180,
      color: brandColors.purple,
      position: { top: -60, right: -60 },
      opacity: 0.2,
      delay: 0,
    },
    {
      size: 140,
      color: brandColors.pink,
      position: { top: 40, left: -70 },
      opacity: 0.12,
      delay: 50,
    },
  ],
  menu: [
    {
      size: 300,
      color: brandColors.purple,
      position: { top: -100, right: -100 },
      opacity: 0.3,
      delay: 100,
    },
    {
      size: 400,
      color: brandColors.pink,
      position: { bottom: 100, left: -150 },
      opacity: 0.2,
      delay: 200,
    },
  ],
  profile: [
    {
      size: 200,
      color: brandColors.purple,
      position: { top: -50, right: -80 },
      opacity: 0.15,
      delay: 0,
    },
    {
      size: 250,
      color: brandColors.pink,
      position: { top: 100, left: -100 },
      opacity: 0.1,
      delay: 100,
    },
    {
      size: 150,
      color: brandColors.orange,
      position: { bottom: 200, right: -50 },
      opacity: 0.08,
      delay: 150,
    },
  ],
};

const FloatingOrbsComponent = memo(function FloatingOrbs({
  variant = 'default',
  visible = true,
  animated = true,
}: FloatingOrbsProps) {
  const orbs = useMemo(() => orbConfigs[variant] || orbConfigs.default, [variant]);

  // Pre-compute orb styles to avoid inline object creation
  const orbStyles = useMemo(
    () =>
      orbs.map((orb) => [
        styles.orb,
        {
          width: orb.size,
          height: orb.size,
          borderRadius: orb.size / 2,
          backgroundColor: orb.color,
          ...orb.position,
        },
      ]),
    [orbs],
  );

  // Static animation values - don't recreate on every render
  const fromAnimation = useMemo(
    () => (animated ? { opacity: 0, scale: 0.5 } : undefined),
    [animated],
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {orbs.map((orb, index) => (
        <MotiView
          key={`orb-${variant}-${index}`}
          style={orbStyles[index]}
          from={fromAnimation}
          animate={{
            opacity: visible ? orb.opacity : 0,
            scale: visible ? 1 : 0.5,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: visible ? orb.delay || 0 : 0,
          }}
        />
      ))}
    </View>
  );
});

export const FloatingOrbs = FloatingOrbsComponent;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
});

export default FloatingOrbsComponent;
