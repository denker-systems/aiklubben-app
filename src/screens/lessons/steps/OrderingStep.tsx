import React, { useState, useCallback, useRef } from 'react';
import { View, Pressable, StyleSheet, PanResponder, Animated, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
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

const ITEM_HEIGHT = 72;

export const OrderingStep: React.FC<OrderingStepProps> = ({
  content,
  correctOrder,
  explanation,
  onAnswer,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();
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
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const itemPositions = useRef<number[]>([]);

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

  const createPanResponder = useCallback(
    (index: number) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => !showFeedback,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return !showFeedback && Math.abs(gestureState.dy) > 5;
        },
        onPanResponderGrant: () => {
          setDraggingIndex(index);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // Disable scroll when dragging starts
          scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
        },
        onPanResponderMove: (_, gestureState) => {
          dragY.setValue(gestureState.dy);

          // Calculate which position we're hovering over
          const currentY = index * ITEM_HEIGHT + gestureState.dy;
          const hoverIndex = Math.round(currentY / ITEM_HEIGHT);
          const clampedIndex = Math.max(0, Math.min(items.length - 1, hoverIndex));

          if (clampedIndex !== index) {
            // Reorder items
            const newItems = [...items];
            const [removed] = newItems.splice(index, 1);
            newItems.splice(clampedIndex, 0, removed);
            setItems(newItems);
            setDraggingIndex(clampedIndex);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
        onPanResponderRelease: () => {
          dragY.setValue(0);
          setDraggingIndex(null);
          // Re-enable scroll
          scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      });
    },
    [items, showFeedback, dragY],
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
        subtitle={t.steps.useArrows}
      />

      <View style={styles.itemsContainer}>
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const isDragging = draggingIndex === index;

          let itemState: 'default' | 'correct' | 'incorrect' = 'default';
          if (showFeedback) {
            itemState = item.originalIndex === correctOrder[index] ? 'correct' : 'incorrect';
          }

          const panResponder = createPanResponder(index);

          return (
            <Animated.View
              key={item.originalIndex}
              {...panResponder.panHandlers}
              style={[
                styles.itemRow,
                { backgroundColor: ui.card.background, borderColor: ui.card.border },
                isSelected && styles.itemRowSelected,
                itemState === 'correct' && styles.itemRowCorrect,
                itemState === 'incorrect' && styles.itemRowIncorrect,
                isDragging && styles.itemRowDragging,
                isDragging && {
                  transform: [{ translateY: dragY }],
                },
              ]}
            >
              <View style={styles.orderNumber}>
                <Text style={styles.orderNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.itemContent}>
                <GripVertical size={20} color={isDragging ? brandColors.purple : colors.text.muted} />
                <Text variant="body" style={styles.itemText}>
                  {item.item}
                </Text>
              </View>

              <View style={styles.arrowButtons}>
                <Pressable
                  onPress={() => moveItem(index, 'up')}
                  disabled={isFirst || showFeedback}
                  style={[
                    styles.arrowButton,
                    (isFirst || showFeedback) && styles.arrowButtonDisabled,
                  ]}
                >
                  <ArrowUp size={18} color={isFirst ? colors.text.muted : brandColors.purple} />
                </Pressable>
                <Pressable
                  onPress={() => moveItem(index, 'down')}
                  disabled={isLast || showFeedback}
                  style={[
                    styles.arrowButton,
                    (isLast || showFeedback) && styles.arrowButtonDisabled,
                  ]}
                >
                  <ArrowDown size={18} color={isLast ? colors.text.muted : brandColors.purple} />
                </Pressable>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {!showFeedback && <ActionButton label={t.steps.checkOrder} onPress={handleCheck} />}

      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={explanation}
          correctAnswer={
            isCorrect ? undefined : correctOrder.map((i) => content.items[i]).join(' → ')
          }
          correctAnswerLabel={t.feedback.correctAnswerLabel}
        />
      )}
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  itemsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor and borderColor set dynamically
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
    // iOS shadow (Rule 01)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android
    elevation: 2,
  },
  itemRowSelected: {
    borderColor: brandColors.purple,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  itemRowCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  itemRowIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  itemRowDragging: {
    opacity: 0.9,
    shadowOpacity: 0.3,
    elevation: 8,
    zIndex: 1000,
  },
  orderNumber: {
    width: 44, // Apple HIG: min 44x44 touch target
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56, // Apple HIG: comfortable touch target
  },
  itemText: {
    // color from Text component
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  arrowButtons: {
    flexDirection: 'column',
    paddingRight: 8,
    gap: 4,
  },
  arrowButton: {
    width: 44, // Apple HIG: min 44x44 touch target
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
});
