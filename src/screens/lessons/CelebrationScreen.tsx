import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Zap, Trophy, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';

interface CelebrationScreenProps {
  xpEarned: number;
  score: number;
  totalSteps: number;
  onContinue: () => void;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  xpEarned,
  score,
  totalSteps,
  onContinue,
}) => {
  const percentage = Math.round((score / totalSteps) * 100);
  const isPerfect = score === totalSteps;

  return (
    <View style={styles.container}>
      {/* Confetti effect could be added here */}
      
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
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Trophy size={48} color="#FFFFFF" strokeWidth={2} />
          </LinearGradient>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 400 }}
        >
          <Text variant="h1" style={styles.title}>
            {isPerfect ? 'Perfekt! 🎉' : 'Bra jobbat! ✨'}
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Du klarade lektionen!
          </Text>
        </MotiView>

        <View style={styles.stats}>
          <MotiView
            style={styles.statCard}
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
                +{xpEarned}
              </Text>
              <Text variant="caption" style={styles.statLabel}>
                XP Earned
              </Text>
            </View>
          </MotiView>

          <MotiView
            style={styles.statCard}
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
                Rätt svar
              </Text>
            </View>
          </MotiView>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 800 }}
          style={styles.buttonContainer}
        >
          <Pressable onPress={onContinue} style={styles.button}>
            <LinearGradient
              colors={[brandColors.purple, '#a855f7']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text variant="body" style={styles.buttonText}>
                Fortsätt →
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
    backgroundColor: '#0C0A17',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    color: uiColors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    color: uiColors.text.secondary,
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
    backgroundColor: uiColors.card.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: uiColors.card.border,
  },
  statIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: uiColors.text.primary,
    fontWeight: '700',
  },
  statLabel: {
    color: uiColors.text.secondary,
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
});
