import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Check, X, ThumbsUp, ThumbsDown } from 'lucide-react-native';
// LinearGradient available if needed
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

// Screen dimensions available if needed

interface TrueFalseStepProps {
  content: {
    statement: string;
  };
  correctAnswer: boolean;
  explanation?: string;
  onAnswer: (answer: boolean, isCorrect: boolean) => void;
}

export const TrueFalseStep: React.FC<TrueFalseStepProps> = ({
  content,
  correctAnswer,
  explanation,
  onAnswer,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();

  console.log('[TrueFalseStep] Rendered', { statement: content.statement, correctAnswer });
  
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (answer: boolean) => {
    console.log('[TrueFalseStep] handleSelect', { answer, showFeedback });
    
    if (showFeedback) {
      console.log('[TrueFalseStep] Already showing feedback, ignoring');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAnswer(answer);
    setShowFeedback(true);
    const isCorrect = answer === correctAnswer;

    console.log('[TrueFalseStep] Answer checked', { answer, correctAnswer, isCorrect });

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    onAnswer(answer, isCorrect);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {/* Question Card */}
      <View style={styles.questionCard}>
        <Text variant="h2" style={[styles.statement, { color: colors.text.primary }]}>
          {content.statement}
        </Text>
      </View>

      {/* Answer Buttons - Side by Side */}
      <View style={styles.buttonsRow}>
        {/* SANT Button */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_CONFIGS.bouncy, delay: 100 }}
          style={styles.buttonWrapper}
        >
          <View
            style={[
              styles.button,
              styles.buttonTrue,
              selectedAnswer === true && styles.buttonSelected,
              showFeedback && correctAnswer === true && styles.buttonCorrect,
              showFeedback && selectedAnswer === true && !isCorrect && styles.buttonIncorrect,
            ]}
          >
          <Pressable
            onPress={() => handleSelect(true)}
            disabled={showFeedback}
            style={styles.buttonPressable}
          >
            <View style={styles.buttonIconContainer}>
              {showFeedback && correctAnswer === true ? (
                <MotiView
                  from={{ scale: 0, rotate: '-180deg' }}
                  animate={{ scale: 1, rotate: '0deg' }}
                  transition={SPRING_CONFIGS.bouncy}
                >
                  <Check size={40} color="#FFFFFF" strokeWidth={3} />
                </MotiView>
              ) : showFeedback && selectedAnswer === true && !isCorrect ? (
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING_CONFIGS.bouncy}
                >
                  <X size={40} color="#FFFFFF" strokeWidth={3} />
                </MotiView>
              ) : (
                <ThumbsUp size={36} color={selectedAnswer === true ? '#FFFFFF' : '#10B981'} />
              )}
            </View>
            <Text
              style={[
                styles.buttonText,
                { color: colors.text.primary },
                (selectedAnswer === true || (showFeedback && correctAnswer === true)) &&
                  styles.buttonTextSelected,
              ]}
            >
              {t.steps.trueLabel}
            </Text>
          </Pressable>
          </View>
        </MotiView>

        {/* FALSKT Button */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_CONFIGS.bouncy, delay: 200 }}
          style={styles.buttonWrapper}
        >
          <View
            style={[
              styles.button,
              styles.buttonFalse,
              selectedAnswer === false && styles.buttonSelected,
              showFeedback && correctAnswer === false && styles.buttonCorrect,
              showFeedback && selectedAnswer === false && !isCorrect && styles.buttonIncorrect,
            ]}
          >
          <Pressable
            onPress={() => handleSelect(false)}
            disabled={showFeedback}
            style={styles.buttonPressable}
          >
            <View style={styles.buttonIconContainer}>
              {showFeedback && correctAnswer === false ? (
                <MotiView
                  from={{ scale: 0, rotate: '-180deg' }}
                  animate={{ scale: 1, rotate: '0deg' }}
                  transition={SPRING_CONFIGS.bouncy}
                >
                  <Check size={40} color="#FFFFFF" strokeWidth={3} />
                </MotiView>
              ) : showFeedback && selectedAnswer === false && !isCorrect ? (
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING_CONFIGS.bouncy}
                >
                  <X size={40} color="#FFFFFF" strokeWidth={3} />
                </MotiView>
              ) : (
                <ThumbsDown size={36} color={selectedAnswer === false ? '#FFFFFF' : '#EF4444'} />
              )}
            </View>
            <Text
              style={[
                styles.buttonText,
                { color: colors.text.primary },
                (selectedAnswer === false || (showFeedback && correctAnswer === false)) &&
                  styles.buttonTextSelected,
              ]}
            >
              {t.steps.falseLabel}
            </Text>
          </Pressable>
          </View>
        </MotiView>
      </View>

      {/* Feedback Card */}
      {showFeedback && explanation && (
        <MotiView
          style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}
          from={{ opacity: 0, translateY: 20, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ ...SPRING_CONFIGS.bouncy, delay: 300 }}
        >
          <View style={styles.feedbackHeader}>
            {isCorrect ? (
              <Check size={24} color="#10B981" strokeWidth={3} />
            ) : (
              <X size={24} color="#EF4444" strokeWidth={3} />
            )}
            <Text
              style={[
                styles.feedbackTitle,
                isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect,
              ]}
            >
              {isCorrect ? t.steps.correctFeedback : t.steps.incorrectFeedback}
            </Text>
          </View>
          <Text variant="body" style={[styles.feedbackText, { color: colors.text.secondary }]}>
            {explanation}
          </Text>
        </MotiView>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  questionCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  statement: {
    // color set dynamically
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    borderWidth: 3,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  buttonPressable: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonTrue: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  buttonFalse: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  buttonSelected: {
    transform: [{ scale: 0.98 }],
  },
  buttonCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  buttonIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  buttonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    // color set dynamically
    fontWeight: '700',
    fontSize: 18,
  },
  buttonTextSelected: {
    color: '#FFFFFF',
  },
  feedback: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginTop: 8,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  feedbackTitleCorrect: {
    color: '#10B981',
  },
  feedbackTitleIncorrect: {
    color: '#EF4444',
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  feedbackIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  feedbackText: {
    // color set dynamically
    lineHeight: 22,
  },
});
