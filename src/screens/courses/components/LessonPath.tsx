import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { LessonNode } from './LessonNode';
import { LessonDialog } from './LessonDialog';
import { SPRING_CONFIGS } from '@/lib/animations';
import * as Haptics from 'expo-haptics';

// Dimensions available if needed for responsive layout
// Duolingo-style: wider zigzag pattern, no connector lines
const NODE_OFFSET = 50;

interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  completed: boolean;
  locked: boolean;
  progress?: number;
}

interface LessonPathProps {
  lessons: Lesson[];
  onLessonPress: (lessonId: string) => void;
  currentLessonId?: string;
}

const LessonPathComponent: React.FC<LessonPathProps> = ({
  lessons,
  onLessonPress,
  currentLessonId,
}) => {
  console.log('[LessonPath] Rendered', { lessonsCount: lessons.length, currentLessonId });
  
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: Lesson; index: number } | null>(
    null,
  );

  const getNodePosition = (index: number): 'left' | 'center' | 'right' => {
    const pattern = ['center', 'right', 'center', 'left'] as const;
    return pattern[index % pattern.length];
  };

  const getHorizontalOffset = (position: 'left' | 'center' | 'right'): number => {
    switch (position) {
      case 'left':
        return -NODE_OFFSET;
      case 'right':
        return NODE_OFFSET;
      default:
        return 0;
    }
  };

  const getLessonStatus = (lesson: Lesson, index: number) => {
    if (lesson.completed) return 'completed';
    if (lesson.locked) return 'locked';
    if (
      lesson.id === currentLessonId ||
      (!currentLessonId && index === lessons.findIndex((l) => !l.completed && !l.locked))
    ) {
      return 'current';
    }
    return 'available';
  };

  // useCallback for performance (Rule 10)
  const handleNodePress = useCallback((lesson: Lesson, index: number) => {
    console.log('[LessonPath] handleNodePress', { lessonId: lesson.id, title: lesson.title, index });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLesson({ lesson, index });
  }, []);

  const handleStartLesson = useCallback(() => {
    console.log('[LessonPath] handleStartLesson', { lessonId: selectedLesson?.lesson.id });
    if (selectedLesson) {
      onLessonPress(selectedLesson.lesson.id);
      setSelectedLesson(null);
    }
  }, [selectedLesson, onLessonPress]);

  const handleCloseDialog = useCallback(() => {
    console.log('[LessonPath] handleCloseDialog');
    setSelectedLesson(null);
  }, []);

  // Apple HIG: Spacing between elements should be 12-48px
  // Using 24px base spacing, 32px for current node
  const NODE_SPACING = 24;
  const CURRENT_NODE_SPACING = 32;

  return (
    <View style={styles.container}>
      {lessons.map((lesson, index) => {
        const position = getNodePosition(index);
        const offset = getHorizontalOffset(position);
        const status = getLessonStatus(lesson, index);
        const isCurrent = status === 'current';

        return (
          <MotiView
            key={lesson.id}
            style={[
              styles.nodeWrapper,
              {
                // Apple HIG: explicit margins for proper spacing
                marginLeft: offset,
                marginBottom: isCurrent ? CURRENT_NODE_SPACING : NODE_SPACING,
              },
            ]}
            from={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{ ...SPRING_CONFIGS.bouncy, delay: 100 + index * 80 }}
          >
            <LessonNode
              status={status}
              progress={lesson.progress || (isCurrent ? 0 : lesson.completed ? 100 : 0)}
              lessonNumber={index + 1}
              onPress={() => handleNodePress(lesson, index)}
              delay={150 + index * 80}
              size={isCurrent ? 'large' : 'medium'}
            />
          </MotiView>
        );
      })}

      {/* Lesson Dialog */}
      <LessonDialog
        visible={selectedLesson !== null}
        onClose={handleCloseDialog}
        onStart={handleStartLesson}
        lesson={{
          title: selectedLesson?.lesson.title || '',
          description: selectedLesson?.lesson.description,
          duration: selectedLesson?.lesson.duration,
          xpReward: 10,
          lessonNumber: (selectedLesson?.index || 0) + 1,
          totalLessons: lessons.length,
          isCompleted: selectedLesson?.lesson.completed,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  nodeWrapper: {
    alignItems: 'center',
  },
});

// Memoized export for performance (Rule 10)
export const LessonPath = memo(LessonPathComponent);
