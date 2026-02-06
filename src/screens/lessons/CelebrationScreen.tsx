import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Zap, TrendingUp, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text, AppIcon } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { brandColors } from '@/config/theme';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string; startX: number }> = ({
  delay,
  color,
  startX,
}) => {
  return (
    <MotiView
      style={[styles.confetti, { left: startX }]}
      from={{
        opacity: 1,
        translateY: -20,
        translateX: 0,
        rotate: '0deg',
        scale: 1,
      }}
      animate={{
        opacity: 0,
        translateY: SCREEN_HEIGHT * 0.6,
        translateX: (Math.random() - 0.5) * 100,
        rotate: `${Math.random() * 720}deg`,
        scale: 0.5,
      }}
      transition={{
        type: 'timing',
        duration: 2000 + Math.random() * 1000,
        delay,
      }}
    >
      <View style={[styles.confettiPiece, { backgroundColor: color }]} />
    </MotiView>
  );
};

interface CelebrationScreenProps {
  xpEarned: number;
  bonusXP?: number;
  score: number;
  totalSteps: number;
  streak?: number;
  leveledUp?: boolean;
  newLevel?: { name: string; icon: string };
  onContinue: () => void;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  xpEarned,
  bonusXP = 0,
  score,
  totalSteps,
  streak = 0,
  leveledUp = false,
  newLevel,
  onContinue,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t, ti } = useLanguage();

  console.log('[CelebrationScreen] Rendered', { 
    xpEarned, 
    bonusXP, 
    score, 
    totalSteps, 
    streak, 
    leveledUp,
    newLevel: newLevel?.name 
  });

  const percentage = Math.round((score / totalSteps) * 100);
  const isPerfect = score === totalSteps;
  const totalXP = xpEarned + bonusXP;
  const [showConfetti, setShowConfetti] = useState(true);

  const confettiColors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
  const confettiParticles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    delay: i * 50,
    color: confettiColors[i % confettiColors.length],
    startX: Math.random() * SCREEN_WIDTH,
  }));

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Confetti Effect */}
      {showConfetti && (
        <View style={styles.confettiContainer}>
          {confettiParticles.map((particle) => (
            <ConfettiParticle
              key={particle.id}
              delay={particle.delay}
              color={particle.color}
              startX={particle.startX}
            />
          ))}
        </View>
      )}

      {/* Floating Stars Background */}
      <MotiView
        style={styles.starsContainer}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 1000 }}
      >
        {[...Array(5)].map((_, i) => (
          <MotiView
            key={i}
            style={[styles.floatingStar, { left: `${15 + i * 18}%`, top: `${10 + (i % 3) * 15}%` }]}
            from={{ scale: 0, rotate: '0deg' }}
            animate={{ scale: 1, rotate: '360deg' }}
            transition={{ ...SPRING_CONFIGS.bouncy, delay: 500 + i * 100 }}
          >
            <Sparkles size={20} color="rgba(251, 191, 36, 0.4)" />
          </MotiView>
        ))}
      </MotiView>

      <MotiView
        style={styles.content}
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_CONFIGS.bouncy}
      >
        <MotiView
          from={{ scale: 0, rotate: '-180deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ ...SPRING_CONFIGS.bouncy, delay: 200 }}
        >
          <AppIcon name="courses-example" size={160} />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 400 }}
        >
          <Text variant="h1" style={styles.title}>
            {leveledUp
              ? `${t.lessons.levelUp} ${newLevel?.icon || '🌟'}`
              : isPerfect
                ? t.lessons.perfect
                : t.lessons.wellDone}
          </Text>
          <Text variant="body" style={styles.subtitle}>
            {leveledUp ? ti(t.lessons.youAreNow, { level: newLevel?.name || '' }) : t.lessons.lessonComplete}
          </Text>
        </MotiView>

        <View style={styles.stats}>
          <MotiView
            style={[styles.statCard, { backgroundColor: ui.card.background, borderColor: ui.card.border }]}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 600 }}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366f1']}
              style={styles.statIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Zap size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
            <View>
              <Text variant="h2" style={styles.statValue}>
                +{totalXP}
              </Text>
              <Text variant="caption" style={styles.statLabel}>
                {bonusXP > 0 ? `${xpEarned} + ${bonusXP} bonus` : t.lessons.xpEarned}
              </Text>
            </View>
          </MotiView>

          <MotiView
            style={[styles.statCard, { backgroundColor: ui.card.background, borderColor: ui.card.border }]}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 700 }}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.statIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TrendingUp size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
            <View>
              <Text variant="h2" style={styles.statValue}>
                {percentage}%
              </Text>
              <Text variant="caption" style={styles.statLabel}>
                {t.lessons.correctAnswers}
              </Text>
            </View>
          </MotiView>
        </View>

        {/* Streak Card */}
        {streak > 0 && (
          <MotiView
            style={styles.streakCard}
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_CONFIGS.bouncy, delay: 800 }}
          >
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              style={styles.streakGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.streakEmoji}>🔥</Text>
              <View style={styles.streakContent}>
                <Text style={styles.streakValue}>{ti(t.lessons.streakDays, { count: streak })}</Text>
                <Text style={styles.streakLabel}>{t.lessons.streakKeep}</Text>
              </View>
            </LinearGradient>
          </MotiView>
        )}

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 800 }}
          style={styles.buttonContainer}
        >
          <Pressable onPress={() => {
            console.log('[CelebrationScreen] Continue button pressed');
            onContinue();
          }} style={styles.button}>
            <LinearGradient
              colors={[brandColors.purple, '#a855f7']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text variant="body" style={styles.buttonText}>
                {t.lessons.continueButton}
              </Text>
            </LinearGradient>
          </Pressable>
        </MotiView>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
  confettiPiece: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  floatingStar: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    gap: 32,
    width: '100%',
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    // color from Text component
    textAlign: 'center',
  },
  subtitle: {
    // color from Text component
    textAlign: 'center',
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  statIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    // color from Text component
    fontWeight: '700',
  },
  statLabel: {
    // color from Text component
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  streakCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  streakEmoji: {
    fontSize: 36,
  },
  streakContent: {
    flex: 1,
  },
  streakValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  streakLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
});
