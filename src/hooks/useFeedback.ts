import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

type SoundKey = 'correct' | 'incorrect' | 'celebrate';

const soundSources: Record<SoundKey, any> = {
  correct: require('../../assets/sounds/correct.mp3'),
  incorrect: require('../../assets/sounds/incorrect.mp3'),
  celebrate: require('../../assets/sounds/celebrate.mp3'),
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
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(soundSources[key]);
    await sound.setVolumeAsync(soundVolumes[key]);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (err) {
    console.warn('[useFeedback] Sound error:', key, err);
  }
}

export function useFeedback() {

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
