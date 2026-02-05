import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { MotiView } from 'moti';
import { Check, X, Image as ImageIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';
import { StepContainer, QuestionHeader, FeedbackCard } from '../components/shared';

interface ImageOption {
  id: string;
  image_url?: string;
  emoji?: string;
  label: string;
}

interface ImageChoiceStepProps {
  content: {
    question: string;
    options: ImageOption[];
    columns?: 2 | 3;
  };
  correctId: string;
  explanation?: string;
  onAnswer: (selectedId: string, isCorrect: boolean) => void;
}

export const ImageChoiceStep: React.FC<ImageChoiceStepProps> = ({
  content,
  correctId,
  explanation,
  onAnswer,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const columns = content.columns || 2;

  const handleSelect = useCallback(
    (id: string) => {
      if (showFeedback) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedId(id);
      setShowFeedback(true);

      const isCorrect = id === correctId;
      onAnswer(id, isCorrect);

      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [correctId, showFeedback, onAnswer],
  );

  const isCorrect = selectedId === correctId;

  return (
    <StepContainer>
      <QuestionHeader icon={ImageIcon} iconColor="#EC4899" title={content.question} />

      <View style={[styles.grid, { gap: columns === 3 ? 10 : 14 }]}>
        {content.options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const isThisCorrect = option.id === correctId;
          const showAsCorrect = showFeedback && isThisCorrect;
          const showAsIncorrect = showFeedback && isSelected && !isCorrect;

          return (
            <MotiView
              key={option.id}
              style={[styles.optionWrapper, { width: `${100 / columns - 3}%` }]}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING_CONFIGS.bouncy, delay: index * 80 }}
            >
              <View
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  showAsCorrect && styles.optionCorrect,
                  showAsIncorrect && styles.optionIncorrect,
                ]}
              >
              <Pressable
                onPress={() => handleSelect(option.id)}
                disabled={showFeedback}
                style={styles.optionPressable}
              >
                <View style={styles.imageContainer}>
                  {option.image_url ? (
                    <Image
                      source={{ uri: option.image_url }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : option.emoji ? (
                    <Text style={styles.emoji}>{option.emoji}</Text>
                  ) : (
                    <View style={styles.placeholder}>
                      <ImageIcon size={32} color={uiColors.text.muted} />
                    </View>
                  )}

                  {showAsCorrect && (
                    <MotiView
                      style={styles.badge}
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={SPRING_CONFIGS.bouncy}
                    >
                      <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    </MotiView>
                  )}

                  {showAsIncorrect && (
                    <MotiView
                      style={[styles.badge, styles.badgeIncorrect]}
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={SPRING_CONFIGS.bouncy}
                    >
                      <X size={16} color="#FFFFFF" strokeWidth={3} />
                    </MotiView>
                  )}
                </View>

                <Text
                  variant="body"
                  style={[
                    styles.label,
                    showAsCorrect && styles.labelCorrect,
                    showAsIncorrect && styles.labelIncorrect,
                  ]}
                  numberOfLines={2}
                >
                  {option.label}
                </Text>
              </Pressable>
              </View>
            </MotiView>
          );
        })}
      </View>

      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={explanation}
          correctAnswer={
            isCorrect ? undefined : content.options.find((o) => o.id === correctId)?.label
          }
        />
      )}
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionWrapper: {
    aspectRatio: 0.85,
  },
  option: {
    flex: 1,
    backgroundColor: uiColors.card.background,
    borderWidth: 3,
    borderColor: uiColors.card.border,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    gap: 10,
  },
  optionPressable: {
    flex: 1,
    alignItems: 'center' as const,
    width: '100%' as const,
    gap: 10,
  },
  optionSelected: {
    borderColor: brandColors.purple,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  optionIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  optionPressed: {
    transform: [{ scale: 0.97 }],
    borderColor: brandColors.purple,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: uiColors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 48,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIncorrect: {
    backgroundColor: '#EF4444',
  },
  label: {
    color: uiColors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelCorrect: {
    color: '#10B981',
  },
  labelIncorrect: {
    color: '#EF4444',
  },
});
