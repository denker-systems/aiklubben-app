import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { MotiView } from 'moti';
import { X, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Text } from '@/components/ui';
import { brandColors } from '@/config/theme';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { getLevelForXP, XP_VALUES } from '@/types/gamification';

// Components
import { LessonProgress } from './components/LessonProgress';
import { ExitModal } from './components/ExitModal';
import { CelebrationScreen } from './CelebrationScreen';
import { GameOverScreen } from './GameOverScreen';

// Step components
import { ContentStep } from './steps/ContentStep';
import { MultipleChoiceStep } from './steps/MultipleChoiceStep';
import { FillBlankStep } from './steps/FillBlankStep';
import { TrueFalseStep } from './steps/TrueFalseStep';
import { ReflectionStep } from './steps/ReflectionStep';
import { WordBankStep } from './steps/WordBankStep';
import { MatchPairsStep } from './steps/MatchPairsStep';
import { SliderStep } from './steps/SliderStep';
import { OrderingStep } from './steps/OrderingStep';
import { ImageChoiceStep } from './steps/ImageChoiceStep';
import { HighlightStep } from './steps/HighlightStep';
import { CategorySortStep } from './steps/CategorySortStep';
import { SpotErrorStep } from './steps/SpotErrorStep';
import { VideoStep } from './steps/VideoStep';
import { CodeSnippetStep } from './steps/CodeSnippetStep';

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

type StepType =
  | 'content'
  | 'multiple_choice'
  | 'fill_blank'
  | 'true_false'
  | 'reflection'
  | 'word_bank'
  | 'match_pairs'
  | 'slider'
  | 'ordering'
  | 'image_choice'
  | 'highlight'
  | 'category_sort'
  | 'spot_error'
  | 'video'
  | 'code_snippet';

interface LessonStep {
  id: string;
  step_type: StepType;
  order_index: number;
  content: any;
  correct_answer?: string;
  explanation?: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  xp_reward: number;
  lesson_steps: LessonStep[];
}

// Type-safe navigation (Rule 08)
type LessonRouteProp = RouteProp<RootStackParamList, 'Lesson'>;
type LessonNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lesson'>;

export const LessonScreen = () => {
  const route = useRoute<LessonRouteProp>();
  const navigation = useNavigation<LessonNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { lessonId, courseId } = route.params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  // isWrong state removed - use feedbackType instead
  const [isGameOver, setIsGameOver] = useState(false);

  // Celebration data
  const [celebrationData, setCelebrationData] = useState<{
    xpEarned: number;
    bonusXP: number;
    newStreak: number;
    leveledUp: boolean;
    newLevel?: { name: string; icon: string };
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('current_streak')
        .eq('id', user.id)
        .single();
      if (data) setStreak(data.current_streak || 0);
    };
    fetchUserData();
    fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, user]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*, lesson_steps(*)')
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      // Sort steps by order_index
      if (data.lesson_steps) {
        data.lesson_steps.sort((a: LessonStep, b: LessonStep) => a.order_index - b.order_index);
      }

      setLesson(data);
    } catch (err) {
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const playSound = async (type: 'correct' | 'incorrect') => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        type === 'correct'
          ? {
              uri: 'https://vskmxctdyojqqxgsbpdt.supabase.co/storage/v1/object/public/assets/sounds/correct.mp3',
            }
          : {
              uri: 'https://vskmxctdyojqqxgsbpdt.supabase.co/storage/v1/object/public/assets/sounds/incorrect.mp3',
            },
      );
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound', error);
    }
  };

  const handleAnswer = async (answer: any, isCorrect?: boolean) => {
    setAnswers({ ...answers, [currentStepIndex]: answer });

    if (isCorrect !== undefined) {
      if (isCorrect) {
        setScore(score + 1);
        setFeedbackType('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await playSound('correct');
      } else {
        setFeedbackType('incorrect');
        const newLives = Math.max(0, lives - 1);
        setLives(newLives);
        if (newLives === 0) {
          setIsGameOver(true);
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        await playSound('incorrect');
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setCanContinue(true);
  };

  const handleNext = async () => {
    if (!lesson || !canContinue) return;

    if (lives === 0) {
      navigation.navigate('CourseDetail', { id: courseId });
      return;
    }

    setFeedbackType(null);
    if (currentStepIndex < lesson.lesson_steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCanContinue(false); // Reset for next step
    } else {
      // Lesson completed
      await completeLesson();
    }
  };

  const completeLesson = async () => {
    if (!lesson || !user) return;

    const totalSteps = lesson.lesson_steps.length;
    const isPerfect = score === totalSteps;

    // Calculate XP: base + perfect bonus + streak bonus
    let baseXP = lesson.xp_reward;
    let bonusXP = 0;

    // Perfect score bonus: +50% XP
    if (isPerfect) {
      bonusXP += Math.round(baseXP * 0.5);
    }

    // Streak bonus: +10 XP per streak day (max 50)
    const streakBonus = Math.min(streak * XP_VALUES.streak_bonus, 50);
    bonusXP += streakBonus;

    const totalXP = baseXP + bonusXP;

    try {
      // 1. Get current profile data
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('total_xp, current_streak, longest_streak, last_activity_date, lessons_completed')
        .eq('id', user.id)
        .single();

      if (!currentProfile) return;

      const currentXP = currentProfile.total_xp || 0;
      const newXP = currentXP + totalXP;
      const lessonsCompleted = (currentProfile.lessons_completed || 0) + 1;

      // 2. Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const lastActive = currentProfile.last_activity_date?.split('T')[0];
      let newStreak = currentProfile.current_streak || 0;

      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
          // Consecutive day - increase streak
          newStreak += 1;
        } else if (lastActive !== today) {
          // Streak broken - reset to 1
          newStreak = 1;
        }
      }

      const longestStreak = Math.max(currentProfile.longest_streak || 0, newStreak);

      // 3. Check for level up
      const oldLevel = getLevelForXP(currentXP);
      const newLevel = getLevelForXP(newXP);
      const leveledUp = newLevel.level > oldLevel.level;

      // 4. Save lesson progress
      await supabase.from('user_lesson_progress').upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        status: 'completed',
        current_step_index: totalSteps,
        score: score,
        total_steps: totalSteps,
        completed_at: new Date().toISOString(),
        xp_earned: totalXP,
      });

      // 5. Update profile with XP, streak, and stats
      await supabase
        .from('profiles')
        .update({
          total_xp: newXP,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: new Date().toISOString(),
          lessons_completed: lessonsCompleted,
        })
        .eq('id', user.id);

      // 6. Set celebration data
      setCelebrationData({
        xpEarned: baseXP,
        bonusXP: bonusXP,
        newStreak: newStreak,
        leveledUp: leveledUp,
        newLevel: leveledUp ? { name: newLevel.name, icon: newLevel.icon } : undefined,
      });
    } catch (err) {
      console.error('Error saving progress:', err);
      // Still show celebration even if save fails
      setCelebrationData({
        xpEarned: baseXP,
        bonusXP: bonusXP,
        newStreak: streak,
        leveledUp: false,
      });
    }

    setShowCelebration(true);
  };

  // useCallback for performance (Rule 10)
  const handleExit = useCallback(() => {
    setShowExitModal(true);
  }, []);

  // Navigate to CourseDetail instead of goBack to maintain correct navigation flow
  const confirmExit = useCallback(() => {
    navigation.navigate('CourseDetail', { id: courseId });
  }, [navigation, courseId]);

  const handleCelebrationContinue = useCallback(() => {
    navigation.navigate('CourseDetail', { id: courseId });
  }, [navigation, courseId]);

  const handleRetry = useCallback(() => {
    setLives(3);
    setCurrentStepIndex(0);
    setAnswers({});
    setScore(0);
    setIsGameOver(false);
    setFeedbackType(null);
    setCanContinue(false);
  }, []);

  const handleCloseExitModal = useCallback(() => {
    setShowExitModal(false);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.purple} />
        </View>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text variant="body" style={styles.errorText}>
          Kunde inte ladda lektionen
        </Text>
      </View>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen
        onRetry={handleRetry}
        onExit={() => navigation.navigate('CourseDetail', { id: courseId })}
      />
    );
  }

  if (showCelebration && celebrationData) {
    return (
      <CelebrationScreen
        xpEarned={celebrationData.xpEarned}
        bonusXP={celebrationData.bonusXP}
        score={score}
        totalSteps={lesson.lesson_steps.length}
        streak={celebrationData.newStreak}
        leveledUp={celebrationData.leveledUp}
        newLevel={celebrationData.newLevel}
        onContinue={handleCelebrationContinue}
      />
    );
  }

  const currentStep = lesson.lesson_steps[currentStepIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={handleExit}
          style={styles.exitButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Avsluta lektion"
          accessibilityHint="Öppnar dialogruta för att bekräfta avslut"
        >
          <X size={24} color={uiColors.text.primary} />
        </Pressable>

        <LessonProgress
          currentStep={currentStepIndex}
          totalSteps={lesson.lesson_steps.length}
          lives={lives}
          streak={streak}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          key={currentStepIndex}
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={SPRING_CONFIGS.smooth}
        >
          {currentStep.step_type === 'content' && (
            <ContentStep content={currentStep.content} onContinue={() => setCanContinue(true)} />
          )}

          {currentStep.step_type === 'multiple_choice' && (
            <MultipleChoiceStep
              content={currentStep.content}
              correctIndex={parseInt(currentStep.correct_answer || '0')}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'true_false' && (
            <TrueFalseStep
              content={currentStep.content}
              correctAnswer={currentStep.correct_answer === 'true'}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'fill_blank' && (
            <FillBlankStep
              content={currentStep.content}
              correctAnswer={currentStep.correct_answer || ''}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'reflection' && (
            <ReflectionStep content={currentStep.content} onAnswer={handleAnswer} />
          )}

          {currentStep.step_type === 'word_bank' && (
            <WordBankStep
              content={currentStep.content}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'match_pairs' && (
            <MatchPairsStep
              content={currentStep.content}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'slider' && (
            <SliderStep
              content={currentStep.content}
              correctAnswer={parseFloat(currentStep.correct_answer || '0')}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'ordering' && (
            <OrderingStep
              content={currentStep.content}
              correctOrder={JSON.parse(currentStep.correct_answer || '[]')}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'image_choice' && (
            <ImageChoiceStep
              content={currentStep.content}
              correctId={currentStep.correct_answer || ''}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'highlight' && (
            <HighlightStep
              content={currentStep.content}
              correctIndices={JSON.parse(currentStep.correct_answer || '[]')}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'category_sort' && (
            <CategorySortStep
              content={currentStep.content}
              correctMapping={JSON.parse(currentStep.correct_answer || '{}')}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'spot_error' && (
            <SpotErrorStep
              content={currentStep.content}
              correctLineNumbers={JSON.parse(currentStep.correct_answer || '[]')}
              explanation={currentStep.explanation}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep.step_type === 'video' && (
            <VideoStep content={currentStep.content} onContinue={() => setCanContinue(true)} />
          )}

          {currentStep.step_type === 'code_snippet' && (
            <CodeSnippetStep
              content={currentStep.content}
              onContinue={() => setCanContinue(true)}
            />
          )}

          {/* Feedback Overlay */}
          {feedbackType && (
            <MotiView
              from={{ translateY: 100 }}
              animate={{ translateY: 0 }}
              style={[
                styles.feedbackOverlay,
                feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
              ]}
            >
              <View style={styles.feedbackHeader}>
                <View style={styles.feedbackIcon}>
                  {feedbackType === 'correct' ? (
                    <CheckCircle size={32} color="#10B981" />
                  ) : (
                    <X size={32} color="#EF4444" />
                  )}
                </View>
                <Text
                  variant="h2"
                  style={[
                    styles.feedbackTitle,
                    { color: feedbackType === 'correct' ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {feedbackType === 'correct' ? 'Snyggt!' : 'Inte riktigt rätt'}
                </Text>
              </View>

              {currentStep.explanation && (
                <Text style={styles.explanationText}>{currentStep.explanation}</Text>
              )}
            </MotiView>
          )}
        </MotiView>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleNext}
          disabled={!canContinue}
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
        >
          <LinearGradient
            colors={canContinue ? [brandColors.purple, '#a855f7'] : ['#4B5563', '#374151']}
            style={styles.continueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text variant="body" style={styles.continueText}>
              {currentStepIndex < lesson.lesson_steps.length - 1 ? 'Fortsätt' : 'Slutför'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Exit Modal */}
      <ExitModal visible={showExitModal} onCancel={handleCloseExitModal} onConfirm={confirmExit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0A17',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.card.border,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: uiColors.card.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: uiColors.text.secondary,
    textAlign: 'center',
    padding: 20,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: uiColors.card.border,
    backgroundColor: '#0C0A17',
  },
  continueButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    padding: 20,
    alignItems: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  feedbackOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 100,
  },
  feedbackCorrect: {
    backgroundColor: '#DCFCE7',
  },
  feedbackIncorrect: {
    backgroundColor: '#FEE2E2',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  feedbackIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  explanationText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginTop: 8,
  },
});
