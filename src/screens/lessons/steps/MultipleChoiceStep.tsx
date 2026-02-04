import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Check, X } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';

interface MultipleChoiceStepProps {
  content: {
    question: string;
    options: string[];
  };
  correctIndex: number;
  explanation?: string;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
}

export const MultipleChoiceStep: React.FC<MultipleChoiceStepProps> = ({
  content,
  correctIndex,
  explanation,
  onAnswer,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (index: number) => {
    if (showFeedback) return;

    setSelectedIndex(index);
    setShowFeedback(true);
    const isCorrect = index === correctIndex;
    onAnswer(index, isCorrect);
  };

  const isCorrect = selectedIndex === correctIndex;

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      <Text variant="h3" style={styles.question}>
        {content.question}
      </Text>

      <View style={styles.options}>
        {content.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isThisCorrect = index === correctIndex;
          const showAsCorrect = showFeedback && isThisCorrect;
          const showAsIncorrect = showFeedback && isSelected && !isCorrect;

          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(index)}
              disabled={showFeedback}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                showAsCorrect && styles.optionCorrect,
                showAsIncorrect && styles.optionIncorrect,
                pressed && styles.optionPressed,
              ]}
            >
              <Text
                variant="body"
                style={[
                  styles.optionText,
                  (showAsCorrect || showAsIncorrect) && styles.optionTextBold,
                ]}
              >
                {option}
              </Text>

              {showAsCorrect && (
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING_CONFIGS.bouncy}
                >
                  <Check size={24} color="#10B981" strokeWidth={3} />
                </MotiView>
              )}

              {showAsIncorrect && (
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING_CONFIGS.bouncy}
                >
                  <X size={24} color="#EF4444" strokeWidth={3} />
                </MotiView>
              )}
            </Pressable>
          );
        })}
      </View>

      {showFeedback && explanation && (
        <MotiView
          style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 300 }}
        >
          <Text variant="body" style={styles.feedbackText}>
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
  question: {
    color: uiColors.text.primary,
    marginBottom: 8,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: uiColors.card.background,
    borderWidth: 2,
    borderColor: uiColors.card.border,
    borderRadius: 16,
    padding: 20,
  },
  optionSelected: {
    borderColor: brandColors.purple,
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    color: uiColors.text.primary,
    flex: 1,
  },
  optionTextBold: {
    fontWeight: '600',
  },
  feedback: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
    color: uiColors.text.primary,
  },
});
