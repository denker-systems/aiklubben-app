import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { FolderOpen, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  StepContainer,
  QuestionHeader,
  FeedbackCard,
  ActionButton,
  OptionChip,
} from '../components/shared';

interface Category {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

interface CategorySortStepProps {
  content: {
    instruction: string;
    categories: Category[];
    items: string[];
  };
  correctMapping: Record<string, string>; // item -> categoryId
  explanation?: string;
  onAnswer: (mapping: Record<string, string>, isCorrect: boolean) => void;
}

export const CategorySortStep: React.FC<CategorySortStepProps> = ({
  content,
  correctMapping,
  explanation,
  onAnswer,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t, ti } = useLanguage();
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const unassignedItems = content.items.filter((item) => !assignments[item]);
  const allAssigned = unassignedItems.length === 0;

  const handleItemSelect = useCallback(
    (item: string) => {
      if (showFeedback) return;
      Haptics.selectionAsync();
      setSelectedItem(selectedItem === item ? null : item);
    },
    [selectedItem, showFeedback],
  );

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      if (showFeedback || !selectedItem) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setAssignments((prev) => ({
        ...prev,
        [selectedItem]: categoryId,
      }));
      setSelectedItem(null);
    },
    [selectedItem, showFeedback],
  );

  const handleRemoveAssignment = useCallback(
    (item: string) => {
      if (showFeedback) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setAssignments((prev) => {
        const newAssignments = { ...prev };
        delete newAssignments[item];
        return newAssignments;
      });
    },
    [showFeedback],
  );

  const handleCheck = useCallback(() => {
    if (showFeedback || !allAssigned) return;

    const correct = Object.entries(assignments).every(
      ([item, catId]) => correctMapping[item] === catId,
    );

    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(assignments, correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [assignments, correctMapping, allAssigned, showFeedback, onAnswer]);

  const getItemState = (item: string, categoryId: string) => {
    if (!showFeedback) return 'default';
    return correctMapping[item] === categoryId ? 'correct' : 'incorrect';
  };

  return (
    <StepContainer>
      <QuestionHeader
        icon={FolderOpen}
        iconColor="#3B82F6"
        title={content.instruction}
        subtitle={selectedItem ? ti(t.steps.chooseCategoryFor, { item: selectedItem }) : t.steps.chooseItemFirst}
      />

      {/* Unassigned Items */}
      {unassignedItems.length > 0 && (
        <View style={styles.itemsSection}>
          <Text variant="caption" style={[styles.sectionLabel, { color: colors.text.muted }]}>
            {t.steps.toSort}
          </Text>
          <View style={styles.itemsGrid}>
            {unassignedItems.map((item, index) => (
              <OptionChip
                key={item}
                label={item}
                state={selectedItem === item ? 'selected' : 'default'}
                onPress={() => handleItemSelect(item)}
                disabled={showFeedback}
                size="small"
                index={index}
              />
            ))}
          </View>
        </View>
      )}

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        {content.categories.map((category, catIndex) => {
          const categoryItems = Object.entries(assignments)
            .filter(([_, catId]) => catId === category.id)
            .map(([item]) => item);

          return (
            <MotiView
              key={category.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: catIndex * 100 }}
            >
              <Pressable
                onPress={() => handleCategorySelect(category.id)}
                disabled={showFeedback || !selectedItem}
                style={[
                  styles.categoryCard,
                  { backgroundColor: ui.card.background, borderColor: selectedItem ? category.color : ui.card.border },
                  selectedItem && styles.categoryCardActive,
                ]}
              >
                <View style={[styles.categoryHeader, { backgroundColor: `${category.color}15` }]}>
                  <Text style={styles.categoryEmoji}>{category.emoji || '📁'}</Text>
                  <Text variant="body" style={[styles.categoryName, { color: category.color }]}>
                    {category.name}
                  </Text>
                  <Text variant="caption" style={[styles.categoryCount, { color: colors.text.muted, backgroundColor: colors.glass.light }]}>
                    {categoryItems.length}
                  </Text>
                </View>

                <View style={styles.categoryItems}>
                  {categoryItems.length === 0 ? (
                    <Text variant="caption" style={[styles.emptyText, { color: colors.text.muted }]}>
                      {selectedItem ? t.steps.tapToAdd : t.steps.empty}
                    </Text>
                  ) : (
                    categoryItems.map((item) => {
                      const state = getItemState(item, category.id);
                      return (
                        <Pressable
                          key={item}
                          onPress={() => handleRemoveAssignment(item)}
                          disabled={showFeedback}
                          style={[
                            styles.assignedItem,
                            { backgroundColor: colors.glass.light },
                            state === 'correct' && styles.assignedItemCorrect,
                            state === 'incorrect' && styles.assignedItemIncorrect,
                          ]}
                        >
                          <Text variant="caption" style={styles.assignedItemText}>
                            {item}
                          </Text>
                          {state === 'correct' && (
                            <Check size={14} color="#10B981" strokeWidth={3} />
                          )}
                          {state === 'incorrect' && <X size={14} color="#EF4444" strokeWidth={3} />}
                        </Pressable>
                      );
                    })
                  )}
                </View>
              </Pressable>
            </MotiView>
          );
        })}
      </View>

      {!showFeedback && (
        <ActionButton label={t.steps.checkAnswer} onPress={handleCheck} disabled={!allAssigned} />
      )}

      {showFeedback && <FeedbackCard isCorrect={isCorrect} explanation={explanation} />}
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  itemsSection: {
    gap: 10,
  },
  sectionLabel: {
    // color set dynamically
    fontWeight: '700',
    letterSpacing: 1,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    // backgroundColor set dynamically
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  categoryCardActive: {
    borderStyle: 'dashed',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontWeight: '700',
    flex: 1,
  },
  categoryCount: {
    // color and backgroundColor set dynamically
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    minHeight: 48,
  },
  emptyText: {
    // color set dynamically
    fontStyle: 'italic',
  },
  assignedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    // backgroundColor set dynamically
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  assignedItemCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  assignedItemIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  assignedItemText: {
    // color from Text component
    fontWeight: '500',
  },
});
