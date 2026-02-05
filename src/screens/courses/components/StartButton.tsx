import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';

interface StartButtonProps {
  onPress: () => void;
  label?: string;
  visible?: boolean;
}

export const StartButton: React.FC<StartButtonProps> = ({
  onPress,
  label = 'START',
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10, scale: 0.8 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={SPRING_CONFIGS.bouncy}
      style={styles.container}
    >
      {/* Speech bubble pointer */}
      <View style={styles.pointer} />

      <View style={styles.button}>
        <Pressable
          onPress={onPress}
          style={styles.buttonPressable}
        >
          <Text style={styles.text}>{label}</Text>
        </Pressable>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressable: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  text: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    position: 'absolute',
    bottom: -10,
    zIndex: 1,
  },
});
