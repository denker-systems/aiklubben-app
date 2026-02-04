import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Zap } from 'lucide-react-native';
import { Text } from './Text';
import { SPRING_CONFIGS } from '@/lib/animations';
import { getLevelForXP, getXPProgress } from '@/types/gamification';

interface XPDisplayProps {
  xp: number;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function XPDisplay({ xp, showLevel = true, size = 'md', animated = true }: XPDisplayProps) {
  const level = getLevelForXP(xp);

  const sizes = {
    sm: { icon: 14, text: 12, padding: 6 },
    md: { icon: 18, text: 14, padding: 10 },
    lg: { icon: 24, text: 18, padding: 14 },
  };

  const s = sizes[size];

  const Container = animated ? MotiView : View;
  const animationProps = animated
    ? {
        from: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: SPRING_CONFIGS.bouncy,
      }
    : {};

  return (
    <Container
      style={[styles.container, { paddingHorizontal: s.padding, paddingVertical: s.padding / 2 }]}
      {...animationProps}
    >
      <View style={styles.xpBadge}>
        <Zap size={s.icon} color="#FBBF24" fill="#FBBF24" />
        <Text style={[styles.xpText, { fontSize: s.text }]}>{xp.toLocaleString()} XP</Text>
      </View>

      {showLevel && (
        <View style={[styles.levelBadge, { backgroundColor: level.color + '20' }]}>
          <Text style={[styles.levelIcon, { fontSize: s.text }]}>{level.icon}</Text>
          <Text style={[styles.levelText, { fontSize: s.text - 2, color: level.color }]}>
            Lvl {level.level}
          </Text>
        </View>
      )}
    </Container>
  );
}

interface XPProgressBarProps {
  xp: number;
  showLabels?: boolean;
  height?: number;
}

export function XPProgressBar({ xp, showLabels = true, height = 8 }: XPProgressBarProps) {
  const level = getLevelForXP(xp);
  const progress = getXPProgress(xp);

  return (
    <View style={styles.progressContainer}>
      {showLabels && (
        <View style={styles.progressLabels}>
          <Text variant="caption" style={styles.progressLabel}>
            {level.icon} {level.name}
          </Text>
          <Text variant="caption" style={styles.progressLabel}>
            {progress.current} / {progress.max === Infinity ? '∞' : progress.max} XP
          </Text>
        </View>
      )}

      <View style={[styles.progressTrack, { height }]}>
        <MotiView
          style={[styles.progressFill, { backgroundColor: level.color, height }]}
          from={{ width: '0%' }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 300 }}
        />
        <MotiView
          style={[styles.progressGlow, { backgroundColor: level.color }]}
          from={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ type: 'timing', duration: 2000, loop: true }}
        />
      </View>
    </View>
  );
}

interface XPGainAnimationProps {
  amount: number;
  visible: boolean;
  onComplete?: () => void;
}

export function XPGainAnimation({ amount, visible, onComplete }: XPGainAnimationProps) {
  if (!visible) return null;

  return (
    <MotiView
      style={styles.xpGainContainer}
      from={{ opacity: 0, translateY: 20, scale: 0.5 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      exit={{ opacity: 0, translateY: -30 }}
      transition={SPRING_CONFIGS.celebratory}
      onDidAnimate={(key, finished) => {
        if (key === 'opacity' && finished) {
          setTimeout(() => onComplete?.(), 1500);
        }
      }}
    >
      <Zap size={20} color="#FBBF24" fill="#FBBF24" />
      <Text style={styles.xpGainText}>+{amount} XP</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpText: {
    color: '#FBBF24',
    fontWeight: '700',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelIcon: {
    marginRight: 2,
  },
  levelText: {
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#9CA3AF',
  },
  progressTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },
  progressGlow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    borderRadius: 4,
  },
  xpGainContainer: {
    position: 'absolute',
    top: -40,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  xpGainText: {
    color: '#FBBF24',
    fontWeight: '800',
    fontSize: 16,
  },
});
