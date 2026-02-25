import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { SPRING_CONFIGS } from '@/lib/animations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Direction = 'left' | 'right' | 'none';

interface AnimatedPageProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  active?: boolean;
}

const AnimatedPageComponent: React.FC<AnimatedPageProps> = ({
  children,
  direction = 'right',
  delay = 0,
  active = true,
}) => {
  const translateX =
    direction === 'right' ? SCREEN_WIDTH * 0.3 : direction === 'left' ? -SCREEN_WIDTH * 0.3 : 0;

  if (!active) return null;

  return (
    <MotiView
      key={direction}
      style={styles.container}
      from={{ opacity: 0, translateX }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ ...SPRING_CONFIGS.smooth, delay }}
    >
      {children}
    </MotiView>
  );
};

export const AnimatedPage = memo(AnimatedPageComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
