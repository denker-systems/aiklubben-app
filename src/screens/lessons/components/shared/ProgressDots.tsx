import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { brandColors } from '@/config/theme';

interface ProgressDotsProps {
  total: number;
  current: number;
  completed?: number[];
  size?: 'small' | 'medium' | 'large';
  activeColor?: string;
  completedColor?: string;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  total,
  current,
  completed = [],
  size = 'medium',
  activeColor = brandColors.purple,
  completedColor = '#10B981',
}) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);

  const getDotSize = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
        return 14;
      default:
        return 10;
    }
  };

  const dotSize = getDotSize();

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        const isCompleted = completed.includes(index) || index < current;
        // isPending = index > current && !completed.includes(index) - reserved for future use

        return (
          <MotiView
            key={index}
            style={[
              styles.dot,
              {
                width: isActive ? dotSize * 2.5 : dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
              },
            ]}
            animate={{
              backgroundColor: isActive
                ? activeColor
                : isCompleted
                  ? completedColor
                  : colors.glass.medium,
              scale: isActive ? 1 : 0.9,
            }}
            transition={SPRING_CONFIGS.snappy}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    // backgroundColor set dynamically via animate
  },
});
