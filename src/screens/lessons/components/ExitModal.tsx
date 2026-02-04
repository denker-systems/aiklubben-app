import React from 'react';
import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Text, Button } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';

interface ExitModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onCancel}>
        <MotiView
          style={styles.modal}
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_CONFIGS.bouncy}
        >
          <Text variant="h3" style={styles.title}>
            Avsluta lektionen?
          </Text>
          <Text variant="body" style={styles.message}>
            Din framsteg kommer inte att sparas om du avslutar nu.
          </Text>

          <View style={styles.buttons}>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <Text variant="body" style={styles.cancelText}>
                Fortsätt
              </Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.confirmButton}>
              <Text variant="body" style={styles.confirmText}>
                Avsluta
              </Text>
            </Pressable>
          </View>
        </MotiView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: uiColors.card.background,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: uiColors.card.border,
  },
  title: {
    color: uiColors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: uiColors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: uiColors.glass.medium,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: uiColors.text.primary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
