import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Flame } from 'lucide-react-native';
import { Text } from './Text';
import { SPRING_CONFIGS } from '@/lib/animations';

interface StreakDisplayProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export function StreakDisplay({
  streak,
  size = 'md',
  showLabel = true,
  animated = true,
}: StreakDisplayProps) {
  const sizes = {
    sm: { icon: 16, text: 14, container: 32 },
    md: { icon: 24, text: 18, container: 44 },
    lg: { icon: 36, text: 28, container: 64 },
  };

  const s = sizes[size];
  const isActive = streak > 0;
  const flameColor = isActive ? '#F97316' : '#4B5563';

  return (
    <View style={styles.container}>
      <MotiView
        style={[
          styles.flameContainer,
          {
            width: s.container,
            height: s.container,
            backgroundColor: isActive ? 'rgba(249, 115, 22, 0.15)' : 'rgba(75, 85, 99, 0.15)',
          },
        ]}
        animate={
          animated && isActive
            ? {
                scale: [1, 1.05, 1],
              }
            : { scale: 1 }
        }
        transition={{
          type: 'timing',
          duration: 1500,
          loop: isActive,
        }}
      >
        <MotiView
          animate={
            animated && isActive
              ? {
                  rotate: ['-3deg', '3deg', '-3deg'],
                }
              : { rotate: '0deg' }
          }
          transition={{
            type: 'timing',
            duration: 800,
            loop: isActive,
          }}
        >
          <Flame size={s.icon} color={flameColor} fill={isActive ? flameColor : 'transparent'} />
        </MotiView>
      </MotiView>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.streakNumber,
            { fontSize: s.text, color: isActive ? '#F97316' : '#6B7280' },
          ]}
        >
          {streak}
        </Text>
        {showLabel && (
          <Text
            variant="caption"
            style={[styles.streakLabel, { color: isActive ? '#FDBA74' : '#9CA3AF' }]}
          >
            {streak === 1 ? 'dag' : 'dagar'}
          </Text>
        )}
      </View>
    </View>
  );
}

interface StreakCardProps {
  streak: number;
  longestStreak: number;
}

export function StreakCard({ streak, longestStreak }: StreakCardProps) {
  const isActive = streak > 0;
  const milestones = [7, 30, 100, 365];
  const nextMilestone = milestones.find((m) => m > streak) || streak;
  const progress = Math.min((streak / nextMilestone) * 100, 100);

  return (
    <MotiView
      style={styles.card}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      <View style={styles.cardHeader}>
        <StreakDisplay streak={streak} size="lg" showLabel={false} />
        <View style={styles.cardHeaderText}>
          <Text variant="h3" style={styles.cardTitle}>
            {streak} dagars streak! 🔥
          </Text>
          <Text variant="caption" style={styles.cardSubtitle}>
            Längsta streak: {longestStreak} dagar
          </Text>
        </View>
      </View>

      <View style={styles.milestoneSection}>
        <Text variant="caption" style={styles.milestoneLabel}>
          Nästa milstolpe: {nextMilestone} dagar
        </Text>
        <View style={styles.progressTrack}>
          <MotiView
            style={[styles.progressFill, { width: `${progress}%` }]}
            from={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 500 }}
          />
        </View>
        <Text variant="caption" style={styles.progressText}>
          {streak} / {nextMilestone}
        </Text>
      </View>

      {!isActive && (
        <View style={styles.frozenBadge}>
          <Text style={styles.frozenText}>❄️ Din streak är pausad!</Text>
        </View>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flameContainer: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontWeight: '800',
    lineHeight: 28,
  },
  streakLabel: {
    marginTop: -4,
  },
  card: {
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    color: '#F9FAFB',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#FDBA74',
  },
  milestoneSection: {
    gap: 8,
  },
  milestoneLabel: {
    color: '#9CA3AF',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  progressText: {
    color: '#FDBA74',
    textAlign: 'right',
  },
  frozenBadge: {
    marginTop: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  frozenText: {
    color: '#60A5FA',
    fontWeight: '600',
  },
});
