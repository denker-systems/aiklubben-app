import React, { useCallback, memo } from 'react';
import { View, Pressable, StyleSheet, Modal } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Star, Clock, Zap, X, Trophy, Target } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import * as Haptics from 'expo-haptics';

// Screen dimensions available if needed

interface LessonDialogProps {
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
  lesson: {
    title: string;
    description?: string;
    duration?: number;
    xpReward?: number;
    lessonNumber: number;
    totalLessons: number;
    isCompleted?: boolean;
  };
}

const LessonDialogComponent: React.FC<LessonDialogProps> = ({
  visible,
  onClose,
  onStart,
  lesson,
}) => {
  // useCallback for performance (Rule 10)
  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  }, [onStart]);

  const handleClose = useCallback(() => {
    Haptics.selectionAsync();
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 50 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, translateY: 50 }}
          transition={SPRING_CONFIGS.bouncy}
          style={styles.dialogContainer}
        >
          <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
            {/* Close Button - Apple HIG: min 44x44 touch target */}
            <Pressable
              style={styles.closeButton}
              onPress={handleClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Stäng dialog"
              accessibilityHint="Stänger lektionsförhandsgranskningen"
            >
              <X size={20} color="#9CA3AF" />
            </Pressable>

            {/* Lesson Icon */}
            <MotiView
              from={{ scale: 0, rotate: '-45deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              transition={{ ...SPRING_CONFIGS.bouncy, delay: 100 }}
              style={styles.iconContainer}
            >
              <LinearGradient
                colors={lesson.isCompleted ? ['#10B981', '#059669'] : ['#8B5CF6', '#6366F1']}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {lesson.isCompleted ? (
                  <Trophy size={36} color="#FFFFFF" />
                ) : (
                  <Star size={36} color="#FFFFFF" fill="#FFFFFF" />
                )}
              </LinearGradient>
            </MotiView>

            {/* Lesson Number Badge */}
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: 150 }}
              style={styles.lessonBadge}
            >
              <Text style={styles.lessonBadgeText}>
                Lektion {lesson.lessonNumber} av {lesson.totalLessons}
              </Text>
            </MotiView>

            {/* Title */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: 200 }}
            >
              <Text variant="h2" style={styles.title}>
                {lesson.title}
              </Text>
            </MotiView>

            {/* Description */}
            {lesson.description && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...SPRING_CONFIGS.smooth, delay: 250 }}
              >
                <Text variant="body" style={styles.description}>
                  {lesson.description}
                </Text>
              </MotiView>
            )}

            {/* Stats Row */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: 300 }}
              style={styles.statsRow}
            >
              <View style={styles.statItem}>
                <Clock size={18} color="#9CA3AF" />
                <Text style={styles.statText}>{lesson.duration || 5} min</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Zap size={18} color="#FCD34D" />
                <Text style={styles.statText}>+{lesson.xpReward || 10} XP</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Target size={18} color="#8B5CF6" />
                <Text style={styles.statText}>5 steg</Text>
              </View>
            </MotiView>

            {/* Start Button */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ ...SPRING_CONFIGS.bouncy, delay: 350 }}
              style={styles.buttonContainer}
            >
              <Pressable
                onPress={handleStart}
                style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={lesson.isCompleted ? 'Öva igen' : 'Starta lektion'}
                accessibilityHint={`Startar ${lesson.title}`}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.startButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.startButtonText}>
                    {lesson.isCompleted ? 'Öva igen' : 'Starta lektion'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </MotiView>

            {/* Bottom decorative element */}
            <View style={styles.bottomDecoration}>
              <View style={styles.decorationDot} />
              <View style={styles.decorationLine} />
              <View style={styles.decorationDot} />
            </View>
          </Pressable>
        </MotiView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 360,
  },
  dialog: {
    backgroundColor: '#1A1625',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  lessonBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  lessonBadgeText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContainer: {
    width: '100%',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  decorationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  decorationLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 1,
  },
});

// Memoized export for performance (Rule 10)
export const LessonDialog = memo(LessonDialogComponent);
