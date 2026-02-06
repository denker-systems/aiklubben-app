import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Lock, Check } from 'lucide-react-native';
import { Text } from './Text';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Badge } from '@/types/gamification';

interface AchievementBadgeProps {
  badge: Badge;
  unlocked: boolean;
  progress?: number;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({
  badge,
  unlocked,
  progress = 0,
  onPress,
  size = 'md',
}: AchievementBadgeProps) {
  const { t } = useLanguage();
  const sizes = {
    sm: { container: 56, icon: 24, text: 10 },
    md: { container: 72, icon: 32, text: 12 },
    lg: { container: 96, icon: 48, text: 14 },
  };

  const s = sizes[size];
  const progressPercentage = Math.min((progress / badge.requirement) * 100, 100);
  const badgeName = (t.badges as any)[badge.id]?.name || badge.name;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <MotiView
        style={[
          styles.container,
          {
            width: s.container,
            height: s.container,
          },
        ]}
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_CONFIGS.bouncy}
      >
        {/* Background ring */}
        <View
          style={[
            styles.ring,
            {
              width: s.container,
              height: s.container,
              borderColor: unlocked ? badge.color : 'rgba(75, 85, 99, 0.3)',
            },
          ]}
        />

        {/* Progress ring */}
        {!unlocked && progress > 0 && (
          <View
            style={[
              styles.progressRing,
              {
                width: s.container,
                height: s.container,
                borderColor: badge.color,
                borderTopColor: 'transparent',
                borderRightColor: progressPercentage > 25 ? badge.color : 'transparent',
                borderBottomColor: progressPercentage > 50 ? badge.color : 'transparent',
                borderLeftColor: progressPercentage > 75 ? badge.color : 'transparent',
                transform: [{ rotate: '-45deg' }],
              },
            ]}
          />
        )}

        {/* Inner circle */}
        <View
          style={[
            styles.inner,
            {
              width: s.container - 8,
              height: s.container - 8,
              backgroundColor: unlocked ? badge.color + '20' : 'rgba(31, 41, 55, 0.8)',
            },
          ]}
        >
          {unlocked ? (
            <MotiView
              from={{ scale: 0, rotate: '-180deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              transition={SPRING_CONFIGS.bouncy}
            >
              <Text style={{ fontSize: s.icon }}>{badge.icon}</Text>
            </MotiView>
          ) : (
            <Lock size={s.icon * 0.6} color="#6B7280" />
          )}
        </View>

        {/* Unlocked checkmark */}
        {unlocked && (
          <MotiView
            style={styles.checkmark}
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...SPRING_CONFIGS.bouncy, delay: 200 }}
          >
            <Check size={12} color="#FFFFFF" />
          </MotiView>
        )}
      </MotiView>

      {/* Label */}
      <Text
        variant="caption"
        numberOfLines={2}
        style={[
          styles.label,
          {
            fontSize: s.text,
            width: s.container + 16,
            color: unlocked ? '#F9FAFB' : '#6B7280',
          },
        ]}
      >
        {badgeName}
      </Text>
    </Pressable>
  );
}

interface BadgeGridProps {
  badges: Badge[];
  unlockedBadges: string[];
  badgeProgress?: Record<string, number>;
  onBadgePress?: (badge: Badge) => void;
}

export function BadgeGrid({
  badges,
  unlockedBadges,
  badgeProgress = {},
  onBadgePress,
}: BadgeGridProps) {
  return (
    <View style={styles.grid}>
      {badges.map((badge, index) => (
        <MotiView
          key={badge.id}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: index * 50 }}
        >
          <AchievementBadge
            badge={badge}
            unlocked={unlockedBadges.includes(badge.id)}
            progress={badgeProgress[badge.id] || 0}
            onPress={() => onBadgePress?.(badge)}
          />
        </MotiView>
      ))}
    </View>
  );
}

interface BadgeUnlockModalProps {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
}

export function BadgeUnlockOverlay({ badge, visible, onClose }: BadgeUnlockModalProps) {
  const { t } = useLanguage();
  if (!visible || !badge) return null;

  const badgeT = (t.badges as any)[badge.id];
  const badgeName = badgeT?.name || badge.name;
  const badgeDesc = badgeT?.description || badge.description;

  return (
    <MotiView
      style={styles.overlay}
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Pressable style={styles.overlayBackdrop} onPress={onClose} />

      <MotiView
        style={styles.unlockCard}
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={SPRING_CONFIGS.celebratory}
      >
        <Text style={styles.unlockTitle}>{t.components.newBadge}</Text>

        <MotiView
          style={[styles.unlockBadge, { borderColor: badge.color }]}
          from={{ rotate: '-180deg', scale: 0 }}
          animate={{ rotate: '0deg', scale: 1 }}
          transition={{ ...SPRING_CONFIGS.bouncy, delay: 300 }}
        >
          <Text style={styles.unlockIcon}>{badge.icon}</Text>
        </MotiView>

        <Text variant="h2" style={styles.unlockName}>
          {badgeName}
        </Text>
        <Text variant="body" style={styles.unlockDescription}>
          {badgeDesc}
        </Text>

        <Pressable
          style={[styles.unlockButton, { backgroundColor: badge.color }]}
          onPress={onClose}
        >
          <Text style={styles.unlockButtonText}>{t.components.awesome}</Text>
        </Pressable>
      </MotiView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ring: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 3,
  },
  progressRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 3,
  },
  inner: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  unlockCard: {
    backgroundColor: '#1A1625',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 320,
  },
  unlockTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FBBF24',
    marginBottom: 24,
  },
  unlockBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  unlockIcon: {
    fontSize: 56,
  },
  unlockName: {
    color: '#F9FAFB',
    marginBottom: 8,
    textAlign: 'center',
  },
  unlockDescription: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  unlockButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
