import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { AlertTriangle, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';
import { StepContainer, QuestionHeader, FeedbackCard } from '../components/shared';

interface CodeLine {
  lineNumber: number;
  code: string;
  hasError?: boolean;
}

interface SpotErrorStepProps {
  content: {
    instruction: string;
    context?: string;
    lines: CodeLine[];
  };
  correctLineNumbers: number[];
  explanation?: string;
  onAnswer: (selectedLines: number[], isCorrect: boolean) => void;
}

export const SpotErrorStep: React.FC<SpotErrorStepProps> = ({
  content,
  correctLineNumbers,
  explanation,
  onAnswer,
}) => {
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleLinePress = useCallback(
    (lineNumber: number) => {
      if (showFeedback) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newSelected = new Set(selectedLines);
      if (newSelected.has(lineNumber)) {
        newSelected.delete(lineNumber);
      } else {
        newSelected.add(lineNumber);
      }
      setSelectedLines(newSelected);
    },
    [selectedLines, showFeedback],
  );

  const handleCheck = useCallback(() => {
    if (showFeedback || selectedLines.size === 0) return;

    const selected = Array.from(selectedLines).sort((a, b) => a - b);
    const correct = [...correctLineNumbers].sort((a, b) => a - b);

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
  }, [selectedLines, correctLineNumbers, showFeedback, onAnswer]);

  const getLineState = (lineNumber: number) => {
    if (!showFeedback) {
      return selectedLines.has(lineNumber) ? 'selected' : 'default';
    }

    const isSelected = selectedLines.has(lineNumber);
    const isError = correctLineNumbers.includes(lineNumber);

    if (isSelected && isError) return 'correct';
    if (isSelected && !isError) return 'incorrect';
    if (!isSelected && isError) return 'missed';
    return 'default';
  };

  return (
    <StepContainer>
      <QuestionHeader
        icon={AlertTriangle}
        iconColor="#EF4444"
        title={content.instruction}
        subtitle="Tryck på raden/raderna som innehåller fel"
      />

      {content.context && (
        <View style={styles.contextBox}>
          <Text variant="body" style={styles.contextText}>
            {content.context}
          </Text>
        </View>
      )}

      <View style={styles.codeContainer}>
        {content.lines.map((line, index) => {
          const state = getLineState(line.lineNumber);

          return (
            <Pressable
              key={line.lineNumber}
              onPress={() => handleLinePress(line.lineNumber)}
              disabled={showFeedback}
            >
              <MotiView
                style={[
                  styles.codeLine,
                  state === 'selected' && styles.codeLineSelected,
                  state === 'correct' && styles.codeLineCorrect,
                  state === 'incorrect' && styles.codeLineIncorrect,
                  state === 'missed' && styles.codeLineMissed,
                ]}
                animate={{
                  scale: state === 'selected' ? 1.01 : 1,
                }}
                transition={SPRING_CONFIGS.snappy}
              >
                <View
                  style={[
                    styles.lineNumber,
                    state === 'selected' && styles.lineNumberSelected,
                    state === 'correct' && styles.lineNumberCorrect,
                    state === 'incorrect' && styles.lineNumberIncorrect,
                    state === 'missed' && styles.lineNumberMissed,
                  ]}
                >
                  <Text style={styles.lineNumberText}>{line.lineNumber}</Text>
                </View>

                <View style={styles.codeContent}>
                  <Text style={styles.codeText}>{line.code}</Text>
                </View>

                {state === 'correct' && (
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={SPRING_CONFIGS.bouncy}
                    style={styles.stateIcon}
                  >
                    <Check size={18} color="#10B981" strokeWidth={3} />
                  </MotiView>
                )}

                {state === 'incorrect' && (
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={SPRING_CONFIGS.bouncy}
                    style={styles.stateIcon}
                  >
                    <X size={18} color="#EF4444" strokeWidth={3} />
                  </MotiView>
                )}

                {state === 'missed' && (
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={SPRING_CONFIGS.bouncy}
                    style={styles.stateIcon}
                  >
                    <AlertTriangle size={18} color={brandColors.purple} strokeWidth={2} />
                  </MotiView>
                )}
              </MotiView>
            </Pressable>
          );
        })}
      </View>

      {selectedLines.size > 0 && !showFeedback && (
        <Pressable onPress={handleCheck} style={styles.checkButton}>
          <Text style={styles.checkButtonText}>
            Kontrollera ({selectedLines.size} {selectedLines.size === 1 ? 'rad' : 'rader'} vald)
          </Text>
        </Pressable>
      )}

      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={explanation}
          correctAnswer={isCorrect ? undefined : `Rad ${correctLineNumbers.join(', ')}`}
          correctAnswerLabel="Fel på rad:"
        />
      )}
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  contextBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  contextText: {
    color: uiColors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  codeContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: uiColors.card.border,
  },
  codeLine: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  codeLineSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  codeLineCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  codeLineIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  codeLineMissed: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  lineNumber: {
    width: 44,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  lineNumberSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  lineNumberCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  lineNumberIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  lineNumberMissed: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  lineNumberText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  codeContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  codeText: {
    color: '#e4e4e7',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  stateIcon: {
    paddingRight: 12,
    justifyContent: 'center',
  },
  checkButton: {
    backgroundColor: brandColors.purple,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
