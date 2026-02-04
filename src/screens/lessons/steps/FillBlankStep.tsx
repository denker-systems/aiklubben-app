import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Check, X, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';

interface FillBlankStepProps {
  content: {
    text: string;
    alternatives?: string[];
  };
  correctAnswer: string;
  explanation?: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

export const FillBlankStep: React.FC<FillBlankStepProps> = ({
  content,
  correctAnswer,
  explanation,
  onAnswer,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const checkAnswer = () => {
    if (!userAnswer.trim() || showFeedback) return;

    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.toLowerCase();
    const alternatives = content.alternatives?.map((alt) => alt.toLowerCase()) || [];

    const correct =
      normalizedAnswer === normalizedCorrect || alternatives.includes(normalizedAnswer);

    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(userAnswer, correct);
  };

  // Split text by ___ to show blank
  const parts = content.text.split('___');

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      <View style={styles.textContainer}>
        <Text variant="h3" style={styles.text}>
          {parts[0]}
        </Text>

        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                showFeedback && (isCorrect ? styles.inputCorrect : styles.inputIncorrect),
              ]}
              value={userAnswer}
              onChangeText={setUserAnswer}
              onSubmitEditing={checkAnswer}
              placeholder="Skriv ditt svar..."
              placeholderTextColor={uiColors.text.muted}
              editable={!showFeedback}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {showFeedback && (
              <MotiView
                style={styles.iconContainer}
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRING_CONFIGS.bouncy}
              >
                {isCorrect ? (
                  <Check size={24} color="#10B981" strokeWidth={3} />
                ) : (
                  <X size={24} color="#EF4444" strokeWidth={3} />
                )}
              </MotiView>
            )}
          </View>

          {!showFeedback && (
            <Pressable
              onPress={checkAnswer}
              disabled={!userAnswer.trim()}
              style={({ pressed }) => [
                styles.checkButton,
                !userAnswer.trim() && styles.checkButtonDisabled,
                pressed && styles.checkButtonPressed,
              ]}
            >
              <LinearGradient
                colors={
                  userAnswer.trim() ? [brandColors.purple, '#a855f7'] : ['#4B5563', '#374151']
                }
                style={styles.checkButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Send size={20} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          )}
        </View>

        {parts[1] && (
          <Text variant="h3" style={styles.text}>
            {parts[1]}
          </Text>
        )}
      </View>

      {showFeedback && !isCorrect && (
        <MotiView
          style={styles.correctAnswer}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 200 }}
        >
          <Text variant="body" style={styles.correctAnswerLabel}>
            Rätt svar:
          </Text>
          <Text variant="body" style={styles.correctAnswerText}>
            {correctAnswer}
          </Text>
        </MotiView>
      )}

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
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: uiColors.text.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: 150,
  },
  input: {
    backgroundColor: uiColors.card.background,
    borderWidth: 2,
    borderColor: uiColors.card.border,
    borderRadius: 12,
    padding: 12,
    paddingRight: 48,
    color: uiColors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  inputCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  inputIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12,
  },
  correctAnswer: {
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  correctAnswerLabel: {
    color: uiColors.text.secondary,
    marginBottom: 4,
  },
  correctAnswerText: {
    color: '#8B5CF6',
    fontWeight: '600',
    fontSize: 18,
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
  checkButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkButtonDisabled: {
    opacity: 0.5,
  },
  checkButtonPressed: {
    opacity: 0.8,
  },
  checkButtonGradient: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
