import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Check, X } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';

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
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (answer: boolean) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    const isCorrect = answer === correctAnswer;
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
      <Text variant="h3" style={styles.statement}>
        {content.statement}
      </Text>

      <View style={styles.buttons}>
        <Pressable
          onPress={() => handleSelect(true)}
          disabled={showFeedback}
          style={({ pressed }) => [
            styles.button,
            selectedAnswer === true && styles.buttonSelected,
            showFeedback && correctAnswer === true && styles.buttonCorrect,
            showFeedback && selectedAnswer === true && !isCorrect && styles.buttonIncorrect,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text variant="h2" style={styles.buttonText}>
            Sant
          </Text>
          {showFeedback && correctAnswer === true && (
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={SPRING_CONFIGS.bouncy}
              style={styles.icon}
            >
              <Check size={32} color="#10B981" strokeWidth={3} />
            </MotiView>
          )}
        </Pressable>

        <Pressable
          onPress={() => handleSelect(false)}
          disabled={showFeedback}
          style={({ pressed }) => [
            styles.button,
            selectedAnswer === false && styles.buttonSelected,
            showFeedback && correctAnswer === false && styles.buttonCorrect,
            showFeedback && selectedAnswer === false && !isCorrect && styles.buttonIncorrect,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text variant="h2" style={styles.buttonText}>
            Falskt
          </Text>
          {showFeedback && correctAnswer === false && (
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={SPRING_CONFIGS.bouncy}
              style={styles.icon}
            >
              <Check size={32} color="#10B981" strokeWidth={3} />
            </MotiView>
          )}
        </Pressable>
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
    gap: 32,
  },
  statement: {
    color: uiColors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttons: {
    gap: 16,
  },
  button: {
    backgroundColor: uiColors.card.background,
    borderWidth: 2,
    borderColor: uiColors.card.border,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  buttonSelected: {
    borderColor: '#8B5CF6',
  },
  buttonCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  buttonIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: uiColors.text.primary,
    fontWeight: '700',
  },
  icon: {
    position: 'absolute',
    top: 16,
    right: 16,
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
