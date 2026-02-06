import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Check, X, Lightbulb } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
import { brandColors } from '@/config/theme';

interface FeedbackCardProps {
  isCorrect: boolean;
  title?: string;
  explanation?: string;
  correctAnswer?: string;
  correctAnswerLabel?: string;
  delay?: number;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  isCorrect,
  title,
  explanation,
  correctAnswer,
  correctAnswerLabel,
  delay = 0,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();
  const defaultTitle = isCorrect ? t.feedback.correct : t.feedback.incorrect;
  const color = isCorrect ? '#10B981' : '#EF4444';

  return (
    <MotiView
      style={[styles.container, isCorrect ? styles.correct : styles.incorrect]}
      from={{ opacity: 0, translateY: 15, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ ...SPRING_CONFIGS.smooth, delay }}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
          {isCorrect ? (
            <Check size={20} color={color} strokeWidth={3} />
          ) : (
            <X size={20} color={color} strokeWidth={3} />
          )}
        </View>
        <Text variant="body" style={[styles.title, { color }]}>
          {title || defaultTitle}
        </Text>
      </View>

      {!isCorrect && correctAnswer && (
        <View style={styles.correctAnswerBox}>
          <Text variant="caption" style={[styles.correctAnswerLabel, { color: colors.text.muted }]}>
            {correctAnswerLabel || t.feedback.correctAnswerLabel}
          </Text>
          <Text variant="body" style={styles.correctAnswerText}>
            {correctAnswer}
          </Text>
        </View>
      )}

      {explanation && (
        <View style={styles.explanationBox}>
          <Lightbulb size={16} color={brandColors.purple} />
          <Text variant="body" style={[styles.explanationText, { color: colors.text.secondary }]}>
            {explanation}
          </Text>
        </View>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    gap: 16,
  },
  correct: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  incorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
  },
  correctAnswerBox: {
    padding: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  correctAnswerLabel: {
    // color set dynamically
    marginBottom: 4,
    fontSize: 12,
  },
  correctAnswerText: {
    color: brandColors.purple,
    fontWeight: '600',
    fontSize: 16,
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 4,
  },
  explanationText: {
    // color set dynamically
    flex: 1,
    lineHeight: 22,
  },
});
