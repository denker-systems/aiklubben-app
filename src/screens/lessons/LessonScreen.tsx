import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MotiView } from 'moti';
import { ArrowLeft, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Text, Button } from '@/components/ui';
import { brandColors } from '@/config/theme';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';

// Components
import { LessonProgress } from './components/LessonProgress';
import { ExitModal } from './components/ExitModal';
import { CelebrationScreen } from './CelebrationScreen';

// Step components
import { ContentStep } from './steps/ContentStep';
import { MultipleChoiceStep } from './steps/MultipleChoiceStep';
import { FillBlankStep } from './steps/FillBlankStep';
import { TrueFalseStep } from './steps/TrueFalseStep';
import { ReflectionStep } from './steps/ReflectionStep';

interface LessonStep {
  id: string;
  step_type: 'content' | 'multiple_choice' | 'fill_blank' | 'true_false' | 'reflection';
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

export const LessonScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
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

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

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

  const handleAnswer = (answer: any, isCorrect?: boolean) => {
    setAnswers({ ...answers, [currentStepIndex]: answer });

    if (isCorrect !== undefined && isCorrect) {
      setScore(score + 1);
    }

    // Enable continue button
    setCanContinue(true);
  };

  const handleNext = async () => {
    if (!lesson || !canContinue) return;

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
    const xpEarned = lesson.xp_reward;

    try {
      // Save progress
      await supabase.from('user_lesson_progress').upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        status: 'completed',
        current_step_index: totalSteps,
        score: score,
        total_steps: totalSteps,
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
      });

      // Update user XP
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', user.id)
        .single();

      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({ total_xp: (currentProfile.total_xp || 0) + xpEarned })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }

    setShowCelebration(true);
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigation.goBack();
  };

  const handleCelebrationContinue = () => {
    navigation.navigate('CourseDetail', { id: courseId });
  };

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

  if (showCelebration) {
    return (
      <CelebrationScreen
        xpEarned={lesson.xp_reward}
        score={score}
        totalSteps={lesson.lesson_steps.length}
        onContinue={handleCelebrationContinue}
      />
    );
  }

  const currentStep = lesson.lesson_steps[currentStepIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={handleExit} style={styles.exitButton}>
          <X size={24} color={uiColors.text.primary} />
        </Pressable>

        <LessonProgress currentStep={currentStepIndex} totalSteps={lesson.lesson_steps.length} />
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
      <ExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={confirmExit}
      />
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
});
