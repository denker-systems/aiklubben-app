import React from 'react';
import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExitModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({ visible, onCancel, onConfirm }) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onCancel}>
        <MotiView
          style={[styles.modal, { backgroundColor: ui.card.background, borderColor: ui.card.border }]}
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_CONFIGS.bouncy}
        >
          <Text variant="h3" style={[styles.title, { color: colors.text.primary }]}>
            {t.lessons.exitTitle}
          </Text>
          <Text variant="body" style={[styles.message, { color: colors.text.secondary }]}>
            {t.lessons.exitMessage}
          </Text>

          <View style={styles.buttons}>
            <Pressable
              onPress={onCancel}
              style={[styles.cancelButton, { backgroundColor: colors.glass.medium }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t.lessons.continueAccessibility}
            >
              <Text variant="body" style={[styles.cancelText, { color: colors.text.primary }]}>
                {t.lessons.exitContinue}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={styles.confirmButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t.lessons.exitConfirmAccessibility}
            >
              <Text variant="body" style={styles.confirmText}>
                {t.lessons.exitConfirm}
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
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
