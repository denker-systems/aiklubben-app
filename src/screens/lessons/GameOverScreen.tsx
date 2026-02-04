import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { HeartOff, RefreshCcw, Home } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
// brandColors available if needed

interface GameOverScreenProps {
  onRetry: () => void;
  onExit: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRetry, onExit }) => {
  return (
    <View style={styles.container}>
      <MotiView
        style={styles.content}
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_CONFIGS.bouncy}
      >
        <View style={styles.iconContainer}>
          <HeartOff size={80} color="#EF4444" strokeWidth={1.5} />
        </View>

        <View style={styles.textContainer}>
          <Text variant="h1" style={styles.title}>
            Slut på liv!
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Oroa dig inte, du kan försöka igen eller komma tillbaka senare.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={onRetry}
            style={styles.retryButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Försök igen från början"
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366f1']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <RefreshCcw size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text variant="body" style={styles.buttonText}>
                Försök igen
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={onExit}
            style={styles.exitButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Avsluta och gå tillbaka till kursen"
          >
            <Home size={20} color={uiColors.text.secondary} style={{ marginRight: 8 }} />
            <Text variant="body" style={styles.exitButtonText}>
              Avsluta
            </Text>
          </Pressable>
        </View>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0A17',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    gap: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#EF4444',
    textAlign: 'center',
  },
  subtitle: {
    color: uiColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  retryButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  exitButton: {
    flexDirection: 'row',
    padding: 18,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: uiColors.card.border,
  },
  exitButtonText: {
    color: uiColors.text.secondary,
    fontWeight: '600',
  },
});
