import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

type SoundKey = 'correct' | 'incorrect' | 'celebrate';

const soundFiles: Record<SoundKey, any> = {
  correct: require('@/assets/sounds/correct.mp3'),
  incorrect: require('@/assets/sounds/incorrect.mp3'),
  celebrate: require('@/assets/sounds/celebrate.mp3'),
};

const soundVolumes: Record<SoundKey, number> = {
  correct: 0.6,
  incorrect: 0.6,
  celebrate: 0.7,
};

const isNative = Platform.OS !== 'web';

async function playSound(key: SoundKey) {
  if (!isNative) return;
  try {
    const { sound } = await Audio.Sound.createAsync(soundFiles[key], {
      shouldPlay: true,
      volume: soundVolumes[key],
    });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // Sound file missing or unavailable – silently ignore
  }
}

export function useFeedback() {
  useEffect(() => {
    if (!isNative) return;
    Audio.setAudioModeAsync({ playsInSilentModeIOS: false }).catch(() => {});
  }, []);

  const feedbackCorrect = useCallback(async () => {
    if (!isNative) return;
    await Promise.all([
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      playSound('correct'),
    ]);
  }, []);

  const feedbackIncorrect = useCallback(async () => {
    if (!isNative) return;
    await Promise.all([
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      playSound('incorrect'),
    ]);
  }, []);

  const feedbackTap = useCallback(async () => {
    if (!isNative) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const feedbackCelebrate = useCallback(async () => {
    if (!isNative) return;
    await Promise.all([
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      playSound('celebrate'),
    ]);
  }, []);

  const feedbackHeavy = useCallback(async () => {
    if (!isNative) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const feedbackSelection = useCallback(async () => {
    if (!isNative) return;
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
