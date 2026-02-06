import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { CheckCircle, Circle, Gift } from 'lucide-react-native';
import { Text } from './Text';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { brandColors } from '@/config/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DailyQuest } from '@/types/gamification';

interface DailyQuestsCardProps {
  quests: DailyQuest[];
  onQuestPress?: (quest: DailyQuest) => void;
}

const QuestItem: React.FC<{ quest: DailyQuest; index: number }> = memo(({ quest, index }) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const progress = Math.min(quest.progress / quest.target, 1);

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ ...SPRING_CONFIGS.snappy, delay: index * 50 }}
      style={[styles.questItem, { backgroundColor: colors.glass.light }]}
    >
      <View style={[styles.questIcon, { backgroundColor: colors.glass.medium }]}>
        <Text style={styles.questEmoji}>{quest.icon}</Text>
      </View>

      <View style={styles.questContent}>
        <View style={styles.questHeader}>
          <Text variant="body" weight="semibold" style={styles.questTitle}>
            {quest.title}
          </Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{quest.xpReward} XP</Text>
          </View>
        </View>

        <Text variant="caption" style={[styles.questDescription, { color: colors.text.muted }]}>
          {quest.description}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.glass.medium }]}>
            <MotiView
              animate={{ width: `${progress * 100}%` }}
              transition={SPRING_CONFIGS.smooth}
              style={[
                styles.progressFill,
                { backgroundColor: quest.completed ? '#10B981' : brandColors.purple },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text.muted }]}>
            {quest.progress}/{quest.target}
          </Text>
        </View>
      </View>

      <View style={styles.questStatus}>
        {quest.completed ? (
          <CheckCircle size={24} color="#10B981" fill="#10B981" />
        ) : (
          <Circle size={24} color={colors.text.muted} />
        )}
      </View>
    </MotiView>
  );
});

QuestItem.displayName = 'QuestItem';

export const DailyQuestsCard: React.FC<DailyQuestsCardProps> = memo(({ quests }) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();
  const completedCount = quests.filter((q) => q.completed).length;
  const allCompleted = completedCount === quests.length;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_CONFIGS.bouncy}
      style={[styles.container, { backgroundColor: ui.card.background, borderColor: ui.card.border }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Gift size={20} color={brandColors.purple} />
          <Text variant="h4" weight="bold" style={styles.headerTitle}>
            {t.components.dailyQuests}
          </Text>
        </View>
        <View
          style={[styles.completionBadge, { backgroundColor: colors.glass.light }, allCompleted && styles.completionBadgeComplete]}
        >
          <Text
            style={[styles.completionText, { color: colors.text.secondary }, allCompleted && styles.completionTextComplete]}
          >
            {completedCount}/{quests.length}
          </Text>
        </View>
      </View>

      {/* Quest List */}
      <View style={styles.questList}>
        {quests.map((quest, index) => (
          <QuestItem key={quest.id} quest={quest} index={index} />
        ))}
      </View>

      {/* Completion bonus message */}
      {allCompleted && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_CONFIGS.bouncy}
          style={styles.bonusMessage}
        >
          <Text style={styles.bonusText}>{t.components.allQuestsComplete}</Text>
        </MotiView>
      )}
    </MotiView>
  );
});

DailyQuestsCard.displayName = 'DailyQuestsCard';

const styles = StyleSheet.create({
  container: {
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    // color from Text component
  },
  completionBadge: {
    // backgroundColor set dynamically
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completionBadgeComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  completionText: {
    // color set dynamically
    fontSize: 12,
    fontWeight: '600',
  },
  completionTextComplete: {
    color: '#10B981',
  },
  questList: {
    gap: 12,
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    // backgroundColor set dynamically
    borderRadius: 12,
    padding: 12,
  },
  questIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    // backgroundColor set dynamically
    alignItems: 'center',
    justifyContent: 'center',
  },
  questEmoji: {
    fontSize: 20,
  },
  questContent: {
    flex: 1,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  questTitle: {
    // color from Text component
    fontSize: 14,
  },
  xpBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  xpText: {
    color: brandColors.purple,
    fontSize: 11,
    fontWeight: '600',
  },
  questDescription: {
    // color set dynamically
    fontSize: 12,
    marginBottom: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    // backgroundColor set dynamically
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    // color set dynamically
    fontSize: 10,
    fontWeight: '500',
    minWidth: 24,
  },
  questStatus: {
    marginLeft: 4,
  },
  bonusMessage: {
    marginTop: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  bonusText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 14,
  },
});
