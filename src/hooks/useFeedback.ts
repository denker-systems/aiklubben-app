import { useCallback, useEffect } from 'react';
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

async function playSound(key: SoundKey) {
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
    Audio.setAudioModeAsync({ playsInSilentModeIOS: false }).catch(() => {});
  }, []);

  const feedbackCorrect = useCallback(async () => {
    await Promise.all([
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      playSound('correct'),
    ]);
  }, []);

  const feedbackIncorrect = useCallback(async () => {
    await Promise.all([
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      playSound('incorrect'),
    ]);
  }, []);

  const feedbackTap = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const feedbackCelebrate = useCallback(async () => {
    await Promise.all([
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      playSound('celebrate'),
    ]);
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
