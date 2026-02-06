import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Check, Link } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
import { brandColors } from '@/config/theme';

interface Pair {
  left: string;
  right: string;
}

interface MatchPairsStepProps {
  content: {
    instruction: string;
    pairs: Pair[];
  };
  explanation?: string;
  onAnswer: (matches: Record<string, string>, isCorrect: boolean) => void;
}

type SelectedItem = {
  side: 'left' | 'right';
  index: number;
  value: string;
};

export const MatchPairsStep: React.FC<MatchPairsStepProps> = ({
  content,
  explanation,
  onAnswer,
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [showFeedback, setShowFeedback] = useState(false);
  const [, setIsCorrect] = useState(false);
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);

  // Shuffle right side items for display
  const shuffledRightIndices = useMemo(() => {
    const indices = content.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [content.pairs]);

  // isAllMatched = matches.size === content.pairs.length - reserved for completion check

  const handleItemPress = useCallback(
    (side: 'left' | 'right', index: number, value: string) => {
      if (showFeedback) return;

      // Check if already matched
      if (side === 'left' && matches.has(index)) return;
      if (side === 'right' && Array.from(matches.values()).includes(index)) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!selected) {
        setSelected({ side, index, value });
        setWrongPair(null);
      } else if (selected.side === side) {
        // Same side - switch selection
        setSelected({ side, index, value });
      } else {
        // Different side - try to match
        const leftIndex = side === 'left' ? index : selected.index;
        const rightIndex = side === 'right' ? index : selected.index;

        // Check if this is a correct match
        const isMatch = shuffledRightIndices[rightIndex] === leftIndex;

        if (isMatch) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const newMatches = new Map(matches);
          newMatches.set(leftIndex, rightIndex);
          setMatches(newMatches);
          setSelected(null);

          // Check if all matched
          if (newMatches.size === content.pairs.length) {
            setIsCorrect(true);
            setShowFeedback(true);
            const matchResult: Record<string, string> = {};
            newMatches.forEach((rightIdx, leftIdx) => {
              matchResult[content.pairs[leftIdx].left] =
                content.pairs[shuffledRightIndices[rightIdx]].right;
            });
            onAnswer(matchResult, true);
          }
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setWrongPair({ left: leftIndex, right: rightIndex });
          setTimeout(() => {
            setWrongPair(null);
            setSelected(null);
          }, 600);
        }
      }
    },
    [selected, matches, showFeedback, content.pairs, shuffledRightIndices, onAnswer],
  );

  const getItemState = (side: 'left' | 'right', index: number) => {
    const isSelected = selected?.side === side && selected?.index === index;
    const isMatched =
      side === 'left' ? matches.has(index) : Array.from(matches.values()).includes(index);
    const isWrong =
      wrongPair &&
      ((side === 'left' && wrongPair.left === index) ||
        (side === 'right' && wrongPair.right === index));

    return { isSelected, isMatched, isWrong };
  };

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {/* Instruction */}
      <View style={styles.header}>
        <Link size={24} color={brandColors.purple} />
        <Text variant="h3" style={styles.instruction}>
          {content.instruction}
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.glass.light }]}>
          <MotiView
            style={styles.progressFill}
            animate={{ width: `${(matches.size / content.pairs.length) * 100}%` }}
            transition={SPRING_CONFIGS.smooth}
          />
        </View>
        <Text variant="caption" style={[styles.progressText, { color: colors.text.muted }]}>
          {matches.size} / {content.pairs.length} {t.steps.matched}
        </Text>
      </View>

      {/* Matching Area */}
      <View style={styles.matchingArea}>
        {/* Left Column */}
        <View style={styles.column}>
          {content.pairs.map((pair, index) => {
            const { isSelected, isMatched, isWrong } = getItemState('left', index);

            return (
              <MotiView
                key={`left-${index}`}
                animate={{
                  scale: isWrong ? [1, 1.05, 0.95, 1] : isMatched ? 0.95 : 1,
                  opacity: isMatched ? 0.6 : 1,
                }}
                transition={SPRING_CONFIGS.snappy}
              >
                <Pressable
                  onPress={() => handleItemPress('left', index, pair.left)}
                  disabled={isMatched || showFeedback}
                  style={[
                    styles.matchItem,
                    { backgroundColor: ui.card.background, borderColor: ui.card.border },
                    styles.matchItemLeft,
                    isSelected && styles.matchItemSelected,
                    isMatched && styles.matchItemMatched,
                    isWrong && styles.matchItemWrong,
                  ]}
                >
                  <Text
                    variant="body"
                    style={[styles.matchItemText, isMatched && [styles.matchItemTextMatched, { color: colors.text.secondary }]]}
                  >
                    {pair.left}
                  </Text>
                  {isMatched && <Check size={18} color="#10B981" strokeWidth={3} />}
                </Pressable>
              </MotiView>
            );
          })}
        </View>

        {/* Connection Lines Visual */}
        <View style={styles.connectionArea}>
          {Array.from(matches.entries()).map(([leftIdx, rightIdx]) => (
            <MotiView
              key={`line-${leftIdx}`}
              style={styles.connectionDot}
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={SPRING_CONFIGS.bouncy}
            >
              <View style={styles.dot} />
            </MotiView>
          ))}
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          {shuffledRightIndices.map((originalIndex, displayIndex) => {
            const pair = content.pairs[originalIndex];
            const { isSelected, isMatched, isWrong } = getItemState('right', displayIndex);

            return (
              <MotiView
                key={`right-${displayIndex}`}
                animate={{
                  scale: isWrong ? [1, 1.05, 0.95, 1] : isMatched ? 0.95 : 1,
                  opacity: isMatched ? 0.6 : 1,
                }}
                transition={SPRING_CONFIGS.snappy}
              >
                <Pressable
                  onPress={() => handleItemPress('right', displayIndex, pair.right)}
                  disabled={isMatched || showFeedback}
                  style={[
                    styles.matchItem,
                    { backgroundColor: ui.card.background, borderColor: ui.card.border },
                    styles.matchItemRight,
                    isSelected && styles.matchItemSelected,
                    isMatched && styles.matchItemMatched,
                    isWrong && styles.matchItemWrong,
                  ]}
                >
                  {isMatched && <Check size={18} color="#10B981" strokeWidth={3} />}
                  <Text
                    variant="body"
                    style={[styles.matchItemText, isMatched && [styles.matchItemTextMatched, { color: colors.text.secondary }]]}
                  >
                    {pair.right}
                  </Text>
                </Pressable>
              </MotiView>
            );
          })}
        </View>
      </View>

      {/* Feedback */}
      {showFeedback && (
        <MotiView
          style={[styles.feedback, styles.feedbackCorrect]}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={SPRING_CONFIGS.smooth}
        >
          <View style={styles.feedbackHeader}>
            <Check size={24} color="#10B981" strokeWidth={3} />
            <Text variant="body" style={[styles.feedbackTitle, { color: '#10B981' }]}>
              {t.steps.allPairsMatched}
            </Text>
          </View>
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
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  instruction: {
    // color from Text component
    textAlign: 'center',
  },
  progressContainer: {
    gap: 8,
  },
  progressTrack: {
    height: 8,
    // backgroundColor set dynamically
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    // color set dynamically
    textAlign: 'center',
  },
  matchingArea: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  connectionArea: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  connectionDot: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // backgroundColor and borderColor set dynamically
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    minHeight: 56,
  },
  matchItemLeft: {
    justifyContent: 'space-between',
  },
  matchItemRight: {
    justifyContent: 'flex-start',
  },
  matchItemSelected: {
    borderColor: brandColors.purple,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  matchItemMatched: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  matchItemWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  matchItemText: {
    // color from Text component
    fontSize: 15,
    flex: 1,
  },
  matchItemTextMatched: {
    // color set dynamically
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
    // color from Text component
    lineHeight: 22,
  },
});
