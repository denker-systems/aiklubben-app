import React, { useState, useCallback, memo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Check, X } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
import { brandColors } from '@/config/theme';
import * as Haptics from 'expo-haptics';

// Screen dimensions available if needed

interface MultipleChoiceStepProps {
  content: {
    question: string;
    options: string[];
  };
  correctIndex: number;
  explanation?: string;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
}

const MultipleChoiceStepComponent: React.FC<MultipleChoiceStepProps> = ({
  content,
  correctIndex,
  explanation,
  onAnswer,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();

  console.log('[MultipleChoiceStep] Rendered', { 
    question: content.question, 
    optionsCount: content.options.length, 
    correctIndex 
  });
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // useCallback for performance (Rule 10)
  const handleSelect = useCallback(
    (index: number) => {
      console.log('[MultipleChoiceStep] handleSelect', { index, showFeedback });
      
      if (showFeedback) {
        console.log('[MultipleChoiceStep] Already showing feedback, ignoring');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedIndex(index);
      setShowFeedback(true);
      const isCorrect = index === correctIndex;

      console.log('[MultipleChoiceStep] Answer checked', { selectedIndex: index, correctIndex, isCorrect });

      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      onAnswer(index, isCorrect);
    },
    [showFeedback, correctIndex, onAnswer],
  );

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  const isCorrect = selectedIndex === correctIndex;

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {/* Question Card */}
      <View style={styles.questionCard}>
        <Text variant="h2" style={[styles.question, { color: colors.text.primary }]}>
          {content.question}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {content.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isThisCorrect = index === correctIndex;
          const showAsCorrect = showFeedback && isThisCorrect;
          const showAsIncorrect = showFeedback && isSelected && !isCorrect;

          return (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: 50 + index * 60 }}
            >
              <View
                style={[
                  styles.option,
                  { backgroundColor: ui.card.background, borderColor: ui.card.border },
                  isSelected && !showFeedback && styles.optionSelected,
                  showAsCorrect && styles.optionCorrect,
                  showAsIncorrect && styles.optionIncorrect,
                ] as ViewStyle[]}
              >
              <Pressable
                onPress={() => handleSelect(index)}
                disabled={showFeedback}
                style={styles.optionPressable}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Alternativ ${getOptionLetter(index)}: ${option}`}
                accessibilityHint={showFeedback ? undefined : t.steps.tapToSelect}
                accessibilityState={{
                  selected: isSelected,
                  disabled: showFeedback,
                }}
              >
                {/* Letter Badge */}
                <View
                  style={[
                    styles.letterBadge,
                    isSelected && !showFeedback && styles.letterBadgeSelected,
                    showAsCorrect && styles.letterBadgeCorrect,
                    showAsIncorrect && styles.letterBadgeIncorrect,
                  ]}
                >
                  {showAsCorrect ? (
                    <MotiView
                      from={{ scale: 0, rotate: '-180deg' }}
                      animate={{ scale: 1, rotate: '0deg' }}
                      transition={SPRING_CONFIGS.bouncy}
                    >
                      <Check size={20} color="#FFFFFF" strokeWidth={3} />
                    </MotiView>
                  ) : showAsIncorrect ? (
                    <MotiView
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={SPRING_CONFIGS.bouncy}
                    >
                      <X size={20} color="#FFFFFF" strokeWidth={3} />
                    </MotiView>
                  ) : (
                    <Text style={[styles.letterText, isSelected && styles.letterTextSelected]}>
                      {getOptionLetter(index)}
                    </Text>
                  )}
                </View>

                {/* Option Text */}
                <Text
                  variant="body"
                  style={[
                    styles.optionText,
                    isSelected && !showFeedback && styles.optionTextSelected,
                    showAsCorrect && styles.optionTextCorrect,
                    showAsIncorrect && styles.optionTextIncorrect,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
              </View>
            </MotiView>
          );
        })}
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
    gap: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  question: {
    // color set dynamically
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor and borderColor set dynamically
    borderWidth: 3,
    borderRadius: 20,
    padding: 18,
    minHeight: 72,
  },
  optionPressable: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  optionSelected: {
    borderColor: brandColors.purple,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  optionIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  optionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  letterBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  letterBadgeSelected: {
    backgroundColor: brandColors.purple,
    borderColor: brandColors.purple,
  },
  letterBadgeCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  letterBadgeIncorrect: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  letterText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '700',
  },
  letterTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    // color from Text component
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  optionTextSelected: {
    // color from Text component
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionTextIncorrect: {
    color: '#FFFFFF',
    fontWeight: '600',
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

// Memoized export for performance (Rule 10)
export const MultipleChoiceStep = memo(MultipleChoiceStepComponent);
