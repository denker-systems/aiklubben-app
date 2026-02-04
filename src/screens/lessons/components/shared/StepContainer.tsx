import React from 'react';
import { StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { SPRING_CONFIGS } from '@/lib/animations';

interface StepContainerProps {
  children: React.ReactNode;
  delay?: number;
}

export const StepContainer: React.FC<StepContainerProps> = ({ children, delay = 0 }) => {
  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ ...SPRING_CONFIGS.smooth, delay }}
    >
      {children}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
});
