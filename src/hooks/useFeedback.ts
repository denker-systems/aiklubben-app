import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function useFeedback() {
  const feedbackCorrect = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const feedbackIncorrect = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const feedbackTap = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const feedbackCelebrate = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const feedbackHeavy = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const feedbackSelection = useCallback(async () => {
    await Haptics.selectionAsync();
  }, []);

  return {
    feedbackCorrect,
    feedbackIncorrect,
    feedbackTap,
    feedbackCelebrate,
    feedbackHeavy,
    feedbackSelection,
  };
}
