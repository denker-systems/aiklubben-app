import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';
import { StepContainer, QuestionHeader, FeedbackCard, ActionButton } from '../components/shared';
import { ListOrdered } from 'lucide-react-native';

interface OrderingStepProps {
  content: {
    instruction: string;
    items: string[];
  };
  correctOrder: number[];
  explanation?: string;
  onAnswer: (order: number[], isCorrect: boolean) => void;
}

export const OrderingStep: React.FC<OrderingStepProps> = ({
  content,
  correctOrder,
  explanation,
  onAnswer,
}) => {
  const [items, setItems] = useState(() => {
    const shuffled = content.items.map((item, i) => ({ item, originalIndex: i }));
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const moveItem = useCallback(
    (fromIndex: number, direction: 'up' | 'down') => {
      if (showFeedback) return;

      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= items.length) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newItems = [...items];
      [newItems[fromIndex], newItems[toIndex]] = [newItems[toIndex], newItems[fromIndex]];
      setItems(newItems);
      setSelectedIndex(toIndex);
    },
    [items, showFeedback],
  );

  const handleItemPress = useCallback(
    (index: number) => {
      if (showFeedback) return;
      Haptics.selectionAsync();
      setSelectedIndex(selectedIndex === index ? null : index);
    },
    [selectedIndex, showFeedback],
  );

  const handleCheck = useCallback(() => {
    if (showFeedback) return;

    const currentOrder = items.map((item) => item.originalIndex);
    const correct = currentOrder.every((val, idx) => val === correctOrder[idx]);

    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(currentOrder, correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [items, correctOrder, showFeedback, onAnswer]);

  return (
    <StepContainer>
      <QuestionHeader
        icon={ListOrdered}
        title={content.instruction}
        subtitle="Använd pilarna för att ordna stegen"
      />

      <View style={styles.itemsContainer}>
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          let itemState: 'default' | 'correct' | 'incorrect' = 'default';
          if (showFeedback) {
            itemState = item.originalIndex === correctOrder[index] ? 'correct' : 'incorrect';
          }

          return (
            <MotiView
              key={item.originalIndex}
              style={[
                styles.itemRow,
                isSelected && styles.itemRowSelected,
                itemState === 'correct' && styles.itemRowCorrect,
                itemState === 'incorrect' && styles.itemRowIncorrect,
              ]}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ ...SPRING_CONFIGS.snappy, delay: index * 50 }}
            >
              <View style={styles.orderNumber}>
                <Text style={styles.orderNumberText}>{index + 1}</Text>
              </View>

              <Pressable
                style={styles.itemContent}
                onPress={() => handleItemPress(index)}
                disabled={showFeedback}
              >
                <GripVertical size={20} color={uiColors.text.muted} />
                <Text variant="body" style={styles.itemText}>
                  {item.item}
                </Text>
              </Pressable>

              <View style={styles.arrowButtons}>
                <Pressable
                  onPress={() => moveItem(index, 'up')}
                  disabled={isFirst || showFeedback}
                  style={[
                    styles.arrowButton,
                    (isFirst || showFeedback) && styles.arrowButtonDisabled,
                  ]}
                >
                  <ArrowUp size={18} color={isFirst ? uiColors.text.muted : brandColors.purple} />
                </Pressable>
                <Pressable
                  onPress={() => moveItem(index, 'down')}
                  disabled={isLast || showFeedback}
                  style={[
                    styles.arrowButton,
                    (isLast || showFeedback) && styles.arrowButtonDisabled,
                  ]}
                >
                  <ArrowDown size={18} color={isLast ? uiColors.text.muted : brandColors.purple} />
                </Pressable>
              </View>
            </MotiView>
          );
        })}
      </View>

      {!showFeedback && <ActionButton label="Kontrollera ordningen" onPress={handleCheck} />}

      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={explanation}
          correctAnswer={
            isCorrect ? undefined : correctOrder.map((i) => content.items[i]).join(' → ')
          }
          correctAnswerLabel="Rätt ordning:"
        />
      )}
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  itemsContainer: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: uiColors.card.background,
    borderWidth: 2,
    borderColor: uiColors.card.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemRowSelected: {
    borderColor: brandColors.purple,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  itemRowCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  itemRowIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  orderNumber: {
    width: 40,
    height: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  orderNumberText: {
    color: brandColors.purple,
    fontWeight: '700',
    fontSize: 16,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  itemText: {
    color: uiColors.text.primary,
    flex: 1,
  },
  arrowButtons: {
    flexDirection: 'column',
    paddingRight: 8,
    gap: 2,
  },
  arrowButton: {
    padding: 6,
    borderRadius: 8,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
});
