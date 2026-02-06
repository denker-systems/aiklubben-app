import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Check, X, SlidersHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
import { brandColors } from '@/config/theme';

interface SliderStepProps {
  content: {
    question: string;
    min: number;
    max: number;
    step: number;
    unit?: string;
    labels?: { value: number; label: string }[];
  };
  correctAnswer: number;
  tolerance?: number; // Allow some tolerance for correct answer
  explanation?: string;
  onAnswer: (answer: number, isCorrect: boolean) => void;
}

export const SliderStep: React.FC<SliderStepProps> = ({
  content,
  correctAnswer,
  tolerance = 0,
  explanation,
  onAnswer,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t, ti } = useLanguage();
  const [value, setValue] = useState(Math.round((content.min + content.max) / 2));
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const range = content.max - content.min;
  const percentage = ((value - content.min) / range) * 100;

  const handleValueChange = useCallback(
    (newValue: number) => {
      if (showFeedback) return;
      const clampedValue = Math.max(content.min, Math.min(content.max, newValue));
      const steppedValue = Math.round(clampedValue / content.step) * content.step;
      setValue(steppedValue);
      Haptics.selectionAsync();
    },
    [content.min, content.max, content.step, showFeedback],
  );

  const handleIncrement = () => handleValueChange(value + content.step);
  const handleDecrement = () => handleValueChange(value - content.step);

  const handleCheck = useCallback(() => {
    if (showFeedback) return;

    const correct = Math.abs(value - correctAnswer) <= tolerance;
    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(value, correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [value, correctAnswer, tolerance, showFeedback, onAnswer]);

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {/* Header */}
      <View style={styles.header}>
        <SlidersHorizontal size={24} color={brandColors.purple} />
        <Text variant="h3" style={styles.question}>
          {content.question}
        </Text>
      </View>

      {/* Value Display */}
      <MotiView
        style={styles.valueDisplay}
        animate={{ scale: showFeedback ? 1 : [1, 1.02, 1] }}
        transition={{ type: 'timing', duration: 300 }}
      >
        <LinearGradient
          colors={
            showFeedback
              ? isCorrect
                ? ['#10B981', '#059669']
                : ['#EF4444', '#DC2626']
              : [brandColors.purple, '#a855f7']
          }
          style={styles.valueGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text variant="h1" style={styles.valueText}>
            {value}
            {content.unit && <Text style={styles.unitText}> {content.unit}</Text>}
          </Text>
        </LinearGradient>
      </MotiView>

      {/* Slider Controls */}
      <View style={styles.sliderContainer}>
        <Pressable
          onPress={handleDecrement}
          disabled={value <= content.min || showFeedback}
          style={[
            styles.controlButton,
            { backgroundColor: ui.card.background, borderColor: ui.card.border },
            (value <= content.min || showFeedback) && styles.controlButtonDisabled,
          ]}
        >
          <Text style={[styles.controlButtonText, { color: colors.text.primary }]}>−</Text>
        </Pressable>

        <View style={[styles.sliderTrack, { backgroundColor: colors.glass.light }]}>
          <MotiView
            style={[styles.sliderFill]}
            animate={{ width: `${percentage}%` }}
            transition={SPRING_CONFIGS.snappy}
          />
          <MotiView
            style={styles.sliderThumb}
            animate={{ left: `${percentage}%` }}
            transition={SPRING_CONFIGS.snappy}
          />
        </View>

        <Pressable
          onPress={handleIncrement}
          disabled={value >= content.max || showFeedback}
          style={[
            styles.controlButton,
            { backgroundColor: ui.card.background, borderColor: ui.card.border },
            (value >= content.max || showFeedback) && styles.controlButtonDisabled,
          ]}
        >
          <Text style={[styles.controlButtonText, { color: colors.text.primary }]}>+</Text>
        </Pressable>
      </View>

      {/* Labels */}
      {content.labels && (
        <View style={styles.labelsContainer}>
          {content.labels.map((label, index) => {
            const labelPercentage = ((label.value - content.min) / range) * 100;
            return (
              <Pressable
                key={index}
                onPress={() => handleValueChange(label.value)}
                disabled={showFeedback}
                style={[styles.labelItem, { left: `${labelPercentage}%` }]}
              >
                <View style={[styles.labelDot, { backgroundColor: colors.text.muted }, value === label.value && styles.labelDotActive]} />
                <Text
                  variant="caption"
                  style={[styles.labelText, { color: colors.text.muted }, value === label.value && styles.labelTextActive]}
                >
                  {label.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Min/Max Labels */}
      <View style={styles.rangeLabels}>
        <Text variant="caption" style={[styles.rangeLabel, { color: colors.text.muted }]}>
          {content.min}
          {content.unit}
        </Text>
        <Text variant="caption" style={[styles.rangeLabel, { color: colors.text.muted }]}>
          {content.max}
          {content.unit}
        </Text>
      </View>

      {/* Check Button */}
      {!showFeedback && (
        <Pressable onPress={handleCheck} style={styles.checkButton}>
          <Text variant="body" style={styles.checkButtonText}>
            {t.steps.checkAnswer}
          </Text>
        </Pressable>
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
              {isCorrect ? t.feedback.correct : t.feedback.incorrect}
            </Text>
          </View>

          {!isCorrect && (
            <Text variant="body" style={styles.correctValue}>
              {ti(t.steps.correctAnswerIs, { answer: String(correctAnswer) })}
              {content.unit}
            </Text>
          )}

          {explanation && (
            <Text variant="body" style={styles.feedbackText}>
              {explanation}
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  question: {
    // color from Text component
    textAlign: 'center',
    flex: 1,
  },
  valueDisplay: {
    alignItems: 'center',
  },
  valueGradient: {
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 24,
    alignItems: 'center',
    minWidth: 160,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 24,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 8,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    // backgroundColor and borderColor set dynamically
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButtonText: {
    // color set dynamically
    fontSize: 28,
    fontWeight: '600',
  },
  sliderTrack: {
    flex: 1,
    height: 12,
    // backgroundColor set dynamically
    borderRadius: 6,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: brandColors.purple,
    borderRadius: 6,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginLeft: -14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 3,
    borderColor: brandColors.purple,
  },
  labelsContainer: {
    position: 'relative',
    height: 48,
    marginHorizontal: 72,
  },
  labelItem: {
    position: 'absolute',
    transform: [{ translateX: -20 }],
    alignItems: 'center',
    gap: 4,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    // backgroundColor set dynamically
  },
  labelDotActive: {
    backgroundColor: brandColors.purple,
  },
  labelText: {
    // color set dynamically
    fontSize: 12,
  },
  labelTextActive: {
    color: brandColors.purple,
    fontWeight: '600',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 72,
  },
  rangeLabel: {
    // color set dynamically
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
  correctValue: {
    color: brandColors.purple,
    fontWeight: '600',
  },
  feedbackText: {
    // color from Text component
    lineHeight: 22,
  },
});
