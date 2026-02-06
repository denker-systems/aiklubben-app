import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { brandColors } from '@/config/theme';
import { useLanguage } from '@/contexts/LanguageContext';

import { Heart, Zap } from 'lucide-react-native';

interface LessonProgressProps {
  currentStep: number;
  totalSteps: number;
  lives: number;
  streak: number;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({
  currentStep,
  totalSteps,
  lives,
  streak,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t, ti } = useLanguage();
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const maxLives = 3;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={[styles.track, { backgroundColor: colors.glass.light }]}>
          <MotiView
            style={styles.fill}
            from={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={SPRING_CONFIGS.smooth}
          />
        </View>

        <View style={styles.statsRow}>
          {/* Visual Hearts */}
          <View style={styles.heartsContainer}>
            {Array.from({ length: maxLives }).map((_, index) => (
              <MotiView
                key={index}
                from={index >= lives ? { scale: 1 } : undefined}
                animate={index >= lives ? { scale: 0.8 } : { scale: 1 }}
                transition={SPRING_CONFIGS.bouncy}
              >
                <Heart
                  size={20}
                  color="#EF4444"
                  fill={index < lives ? '#EF4444' : 'transparent'}
                  strokeWidth={index < lives ? 2 : 1.5}
                  style={{ opacity: index < lives ? 1 : 0.3 }}
                />
              </MotiView>
            ))}
          </View>

          {/* Streak Badge */}
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Zap size={14} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
        </View>
      </View>

      <Text variant="caption" style={[styles.stepText, { color: colors.text.secondary }]}>
        {ti(t.lessons.stepOf, { current: String(currentStep + 1), total: String(totalSteps) })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: brandColors.purple,
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    color: '#FBBF24',
    fontWeight: '700',
    fontSize: 13,
  },
  stepText: {
    fontWeight: '700',
    letterSpacing: 1,
  },
});
