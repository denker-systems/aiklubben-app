import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';

interface LessonProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <MotiView
          style={styles.fill}
          from={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={SPRING_CONFIGS.smooth}
        />
      </View>
      <Text variant="caption" style={styles.text}>
        {currentStep + 1} / {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: uiColors.glass.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: brandColors.purple,
    borderRadius: 4,
  },
  text: {
    color: uiColors.text.secondary,
    fontWeight: '600',
    minWidth: 50,
  },
});
