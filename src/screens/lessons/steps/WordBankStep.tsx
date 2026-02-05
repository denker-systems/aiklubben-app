import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Check, X, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';

interface WordBankStepProps {
  content: {
    instruction: string;
    sentence_template: string[]; // Array with placeholders marked as null
    word_bank: string[];
    correct_order: number[]; // Indices of correct words in word_bank
  };
  explanation?: string;
  onAnswer: (answer: string[], isCorrect: boolean) => void;
}

export const WordBankStep: React.FC<WordBankStepProps> = ({ content, explanation, onAnswer }) => {
  const [selectedWords, setSelectedWords] = useState<(string | null)[]>(
    content.sentence_template.map((part) => (part === null ? null : part)),
  );
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const blankCount = content.sentence_template.filter((p) => p === null).length;
  const filledCount = selectedWords.filter(
    (w, i) => content.sentence_template[i] === null && w !== null,
  ).length;
  const isComplete = filledCount === blankCount;

  const handleWordSelect = useCallback(
    (word: string, bankIndex: number) => {
      if (showFeedback || usedIndices.has(bankIndex)) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Find first empty blank
      const firstBlankIndex = selectedWords.findIndex(
        (w, i) => content.sentence_template[i] === null && w === null,
      );

      if (firstBlankIndex === -1) return;

      const newSelected = [...selectedWords];
      newSelected[firstBlankIndex] = word;
      setSelectedWords(newSelected);
      setUsedIndices(new Set([...usedIndices, bankIndex]));
    },
    [selectedWords, usedIndices, showFeedback, content.sentence_template],
  );

  const handleBlankTap = useCallback(
    (index: number) => {
      if (showFeedback) return;
      if (content.sentence_template[index] !== null) return;
      if (selectedWords[index] === null) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Find which bank index this word came from
      const word = selectedWords[index];
      const bankIndex = content.word_bank.findIndex((w, i) => w === word && usedIndices.has(i));

      const newSelected = [...selectedWords];
      newSelected[index] = null;
      setSelectedWords(newSelected);

      if (bankIndex !== -1) {
        const newUsed = new Set(usedIndices);
        newUsed.delete(bankIndex);
        setUsedIndices(newUsed);
      }
    },
    [selectedWords, usedIndices, showFeedback, content],
  );

  const handleCheck = useCallback(() => {
    if (!isComplete || showFeedback) return;

    // Get only the filled blanks in order
    const filledWords = selectedWords
      .map((word, i) => (content.sentence_template[i] === null ? word : null))
      .filter((w) => w !== null) as string[];

    // Get correct words
    const correctWords = content.correct_order.map((i) => content.word_bank[i]);

    const correct = filledWords.every((word, i) => word === correctWords[i]);

    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(filledWords, correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isComplete, selectedWords, content, onAnswer, showFeedback]);

  const handleReset = useCallback(() => {
    if (showFeedback) return;
    setSelectedWords(content.sentence_template.map((part) => (part === null ? null : part)));
    setUsedIndices(new Set());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [content.sentence_template, showFeedback]);

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {/* Instruction */}
      <Text variant="h3" style={styles.instruction}>
        {content.instruction}
      </Text>

      {/* Sentence Builder Area */}
      <View style={styles.sentenceContainer}>
        <View style={styles.sentenceRow}>
          {selectedWords.map((word, index) => {
            const isBlank = content.sentence_template[index] === null;
            const isFilled = isBlank && word !== null;
            // isEmpty = isBlank && word === null - reserved for styling

            if (!isBlank) {
              return (
                <Text key={index} variant="body" style={styles.staticWord}>
                  {word}
                </Text>
              );
            }

            return (
              <Pressable key={index} onPress={() => handleBlankTap(index)} disabled={showFeedback}>
                <MotiView
                  style={[
                    styles.blankSlot,
                    isFilled && styles.blankSlotFilled,
                    showFeedback &&
                      isFilled &&
                      (isCorrect ? styles.blankSlotCorrect : styles.blankSlotIncorrect),
                  ]}
                  animate={{
                    scale: isFilled ? 1 : 0.95,
                  }}
                  transition={SPRING_CONFIGS.snappy}
                >
                  {isFilled ? (
                    <Text variant="body" style={styles.filledWord}>
                      {word}
                    </Text>
                  ) : (
                    <View style={styles.placeholder} />
                  )}
                </MotiView>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Word Bank */}
      <View style={styles.wordBankContainer}>
        <View style={styles.wordBankHeader}>
          <Text variant="caption" style={styles.wordBankLabel}>
            VÄLJ ORD
          </Text>
          {!showFeedback && usedIndices.size > 0 && (
            <Pressable onPress={handleReset} style={styles.resetButton}>
              <RotateCcw size={16} color={uiColors.text.muted} />
              <Text variant="caption" style={styles.resetText}>
                Återställ
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.wordBank}>
          {content.word_bank.map((word, index) => {
            const isUsed = usedIndices.has(index);

            return (
              <MotiView
                key={index}
                animate={{
                  opacity: isUsed ? 0.3 : 1,
                  scale: isUsed ? 0.95 : 1,
                }}
                transition={SPRING_CONFIGS.snappy}
              >
                <View
                  style={[
                    styles.wordChip,
                    isUsed && styles.wordChipUsed,
                  ]}
                >
                  <Pressable
                    onPress={() => handleWordSelect(word, index)}
                    disabled={isUsed || showFeedback}
                    style={({ pressed }) => ({
                      opacity: pressed && !isUsed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      variant="body"
                      style={[styles.wordChipText, isUsed && styles.wordChipTextUsed]}
                    >
                      {word}
                    </Text>
                  </Pressable>
                </View>
              </MotiView>
            );
          })}
        </View>
      </View>

      {/* Check Button */}
      {!showFeedback && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: isComplete ? 1 : 0.5 }}
          transition={SPRING_CONFIGS.smooth}
        >
          <Pressable
            onPress={handleCheck}
            disabled={!isComplete}
            style={[styles.checkButton, !isComplete && styles.checkButtonDisabled]}
          >
            <Text variant="body" style={styles.checkButtonText}>
              Kontrollera
            </Text>
          </Pressable>
        </MotiView>
      )}

      {/* Feedback */}
      {showFeedback && (
        <MotiView
          style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={SPRING_CONFIGS.smooth}
        >
          <View style={styles.feedbackHeader}>
            {isCorrect ? (
              <Check size={24} color="#10B981" strokeWidth={3} />
            ) : (
              <X size={24} color="#EF4444" strokeWidth={3} />
            )}
            <Text
              variant="body"
              style={[styles.feedbackTitle, { color: isCorrect ? '#10B981' : '#EF4444' }]}
            >
              {isCorrect ? 'Helt rätt!' : 'Inte riktigt'}
            </Text>
          </View>
          {explanation && (
            <Text variant="body" style={styles.feedbackText}>
              {explanation}
            </Text>
          )}
          {!isCorrect && (
            <View style={styles.correctAnswerContainer}>
              <Text variant="caption" style={styles.correctAnswerLabel}>
                Rätt svar:
              </Text>
              <Text variant="body" style={styles.correctAnswerText}>
                {content.correct_order.map((i) => content.word_bank[i]).join(' ')}
              </Text>
            </View>
          )}
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
  instruction: {
    color: uiColors.text.primary,
    textAlign: 'center',
  },
  sentenceContainer: {
    backgroundColor: uiColors.card.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: uiColors.card.border,
  },
  sentenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  staticWord: {
    color: uiColors.text.primary,
    fontSize: 18,
  },
  blankSlot: {
    minWidth: 80,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: brandColors.purple,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  blankSlotFilled: {
    borderStyle: 'solid',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  blankSlotCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  blankSlotIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  placeholder: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 2,
  },
  filledWord: {
    color: uiColors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  wordBankContainer: {
    gap: 12,
  },
  wordBankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordBankLabel: {
    color: uiColors.text.muted,
    fontWeight: '700',
    letterSpacing: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  resetText: {
    color: uiColors.text.muted,
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  wordChip: {
    backgroundColor: uiColors.card.background,
    borderWidth: 2,
    borderColor: uiColors.card.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  wordChipUsed: {
    borderColor: 'transparent',
  },
  wordChipPressed: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: brandColors.purple,
  },
  wordChipText: {
    color: uiColors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  wordChipTextUsed: {
    color: uiColors.text.muted,
  },
  checkButton: {
    backgroundColor: brandColors.purple,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#4B5563',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  feedback: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  feedbackIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feedbackTitle: {
    fontWeight: '700',
    fontSize: 18,
  },
  feedbackText: {
    color: uiColors.text.primary,
    lineHeight: 22,
  },
  correctAnswerContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  correctAnswerLabel: {
    color: uiColors.text.muted,
    marginBottom: 4,
  },
  correctAnswerText: {
    color: brandColors.purple,
    fontWeight: '600',
  },
});
