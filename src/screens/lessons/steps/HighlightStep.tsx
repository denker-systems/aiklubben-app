import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Highlighter } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { brandColors } from '@/config/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { StepContainer, QuestionHeader, FeedbackCard, ActionButton } from '../components/shared';

interface HighlightStepProps {
  content: {
    instruction: string;
    text: string;
    words: string[];
  };
  correctIndices: number[];
  explanation?: string;
  onAnswer: (selectedIndices: number[], isCorrect: boolean) => void;
}

export const HighlightStep: React.FC<HighlightStepProps> = ({
  content,
  correctIndices,
  explanation,
  onAnswer,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t, ti } = useLanguage();
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleWordPress = useCallback(
    (index: number) => {
      if (showFeedback) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newSelected = new Set(selectedIndices);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      setSelectedIndices(newSelected);
    },
    [selectedIndices, showFeedback],
  );

  const handleCheck = useCallback(() => {
    if (showFeedback) return;

    const selected = Array.from(selectedIndices).sort((a, b) => a - b);
    const correct = [...correctIndices].sort((a, b) => a - b);

    const isMatch =
      selected.length === correct.length && selected.every((val, idx) => val === correct[idx]);

    setIsCorrect(isMatch);
    setShowFeedback(true);
    onAnswer(selected, isMatch);

    if (isMatch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [selectedIndices, correctIndices, showFeedback, onAnswer]);

  const getWordState = (index: number) => {
    if (!showFeedback) {
      return selectedIndices.has(index) ? 'selected' : 'default';
    }

    const isSelected = selectedIndices.has(index);
    const shouldBeSelected = correctIndices.includes(index);

    if (isSelected && shouldBeSelected) return 'correct';
    if (isSelected && !shouldBeSelected) return 'incorrect';
    if (!isSelected && shouldBeSelected) return 'missed';
    return 'default';
  };

  return (
    <StepContainer>
      <QuestionHeader
        icon={Highlighter}
        iconColor="#F59E0B"
        title={content.instruction}
        subtitle={t.steps.tapToHighlight}
      />

      <View style={[styles.textContainer, { backgroundColor: ui.card.background, borderColor: ui.card.border }]}>
        <View style={styles.wordsContainer}>
          {content.words.map((word, index) => {
            const state = getWordState(index);

            return (
              <Pressable key={index} onPress={() => handleWordPress(index)} disabled={showFeedback}>
                <MotiView
                  style={[
                    styles.word,
                    state === 'selected' && styles.wordSelected,
                    state === 'correct' && styles.wordCorrect,
                    state === 'incorrect' && styles.wordIncorrect,
                    state === 'missed' && styles.wordMissed,
                  ]}
                  animate={{
                    scale: state === 'selected' ? 1.02 : 1,
                  }}
                  transition={SPRING_CONFIGS.snappy}
                >
                  <Text
                    variant="body"
                    style={[
                      styles.wordText,
                      state === 'selected' && styles.wordTextSelected,
                      state === 'correct' && styles.wordTextCorrect,
                      state === 'incorrect' && styles.wordTextIncorrect,
                      state === 'missed' && styles.wordTextMissed,
                    ]}
                  >
                    {word}
                  </Text>
                </MotiView>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedIndices.size > 0 && !showFeedback && (
        <View style={styles.selectionInfo}>
          <Text variant="caption" style={styles.selectionText}>
            {ti(t.steps.wordsHighlighted, { count: selectedIndices.size })}
          </Text>
        </View>
      )}

      {!showFeedback && (
        <ActionButton
          label={t.steps.checkAnswer}
          onPress={handleCheck}
          disabled={selectedIndices.size === 0}
        />
      )}

      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={explanation}
          correctAnswer={
            isCorrect ? undefined : correctIndices.map((i) => content.words[i]).join(', ')
          }
          correctAnswerLabel={t.steps.correctWords}
        />
      )}
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  word: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wordSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  wordCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  wordIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  wordMissed: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: brandColors.purple,
    borderStyle: 'dashed',
  },
  wordText: {
    // color from Text component
    fontSize: 17,
    lineHeight: 24,
  },
  wordTextSelected: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  wordTextCorrect: {
    color: '#10B981',
    fontWeight: '600',
  },
  wordTextIncorrect: {
    color: '#EF4444',
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  wordTextMissed: {
    color: brandColors.purple,
    fontWeight: '600',
  },
  selectionInfo: {
    alignItems: 'center',
  },
  selectionText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
});
