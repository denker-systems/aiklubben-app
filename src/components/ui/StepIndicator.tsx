import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { SPRING_CONFIGS } from '@/lib/animations';
import { brandColors } from '@/config/theme';

interface StepIndicatorProps {
  total: number;
  current: number;
  activeColor?: string;
  inactiveColor?: string;
}

const StepIndicatorComponent: React.FC<StepIndicatorProps> = ({
  total,
  current,
  activeColor = brandColors.purple,
  inactiveColor = 'rgba(255, 255, 255, 0.15)',
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index <= current;
        return (
          <MotiView
            key={index}
            style={[styles.dot, { backgroundColor: isActive ? activeColor : inactiveColor }]}
            animate={{
              scale: index === current ? 1.3 : 1,
              opacity: isActive ? 1 : 0.4,
            }}
            transition={SPRING_CONFIGS.snappy}
          />
        );
      })}
    </View>
  );
};

export const StepIndicator = memo(StepIndicatorComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
