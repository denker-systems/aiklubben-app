import React, { useState, useEffect, memo } from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import type { TreasureReward } from '@/types/gamification';

interface TreasureChestModalProps {
  visible: boolean;
  reward: TreasureReward | null;
  onClose: () => void;
}

export const TreasureChestModal: React.FC<TreasureChestModalProps> = memo(
  ({ visible, reward, onClose }) => {
    const [isOpened, setIsOpened] = useState(false);

    useEffect(() => {
      if (visible) {
        setIsOpened(false);
      }
    }, [visible]);

    const handleOpen = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsOpened(true);
    };

    if (!reward) return null;

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_CONFIGS.bouncy}
            style={styles.container}
          >
            {!isOpened ? (
              // Closed chest - tap to open
              <Pressable onPress={handleOpen} style={styles.chestContainer}>
                <MotiView
                  from={{ rotate: '0deg' }}
                  animate={{ rotate: ['0deg', '-5deg', '5deg', '0deg'] }}
                  transition={{
                    type: 'timing',
                    duration: 500,
                    loop: true,
                  }}
                  style={styles.chestIconWrapper}
                >
                  <Text style={styles.chestIcon}>🎁</Text>
                </MotiView>
                <Text variant="h3" weight="bold" style={styles.title}>
                  Bonusbelöning!
                </Text>
                <Text variant="body" style={styles.subtitle}>
                  Tryck för att öppna
                </Text>
              </Pressable>
            ) : (
              // Opened chest - show reward
              <View style={styles.rewardContainer}>
                <MotiView
                  from={{ opacity: 0, scale: 0, rotate: '0deg' }}
                  animate={{ opacity: 1, scale: 1, rotate: '360deg' }}
                  transition={{ ...SPRING_CONFIGS.celebratory, delay: 100 }}
                  style={styles.rewardIconWrapper}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#FBBF24']}
                    style={styles.rewardIconBg}
                  >
                    <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  </LinearGradient>
                </MotiView>

                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ ...SPRING_CONFIGS.smooth, delay: 300 }}
                >
                  <Text variant="h2" weight="bold" style={styles.rewardTitle}>
                    {reward.title}
                  </Text>
                  <Text variant="body" style={styles.rewardDescription}>
                    {reward.description}
                  </Text>
                </MotiView>

                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 600 }}
                >
                  <Pressable onPress={onClose} style={styles.collectButton}>
                    <LinearGradient
                      colors={['#8B5CF6', '#6366F1']}
                      style={styles.collectButtonGradient}
                    >
                      <Text style={styles.collectButtonText}>Samla in</Text>
                    </LinearGradient>
                  </Pressable>
                </MotiView>
              </View>
            )}
          </MotiView>
        </View>
      </Modal>
    );
  }
);

TreasureChestModal.displayName = 'TreasureChestModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: uiColors.card.background,
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  chestContainer: {
    alignItems: 'center',
    padding: 16,
  },
  chestIconWrapper: {
    marginBottom: 16,
  },
  chestIcon: {
    fontSize: 80,
  },
  title: {
    color: '#F59E0B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: uiColors.text.secondary,
    textAlign: 'center',
  },
  rewardContainer: {
    alignItems: 'center',
    padding: 8,
  },
  rewardIconWrapper: {
    marginBottom: 20,
  },
  rewardIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardIcon: {
    fontSize: 48,
  },
  rewardTitle: {
    color: uiColors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardDescription: {
    color: uiColors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  collectButton: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 160,
  },
  collectButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  collectButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
