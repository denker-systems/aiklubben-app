import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_STORAGE_KEY = '@aiklubben_review_requested';
const MIN_LESSONS_BEFORE_REVIEW = 3;
const LESSONS_KEY = '@aiklubben_completed_lessons_count';

export async function incrementCompletedLessons(): Promise<number> {
  const raw = await AsyncStorage.getItem(LESSONS_KEY);
  const count = parseInt(raw || '0', 10) + 1;
  await AsyncStorage.setItem(LESSONS_KEY, String(count));
  return count;
}

export async function requestReviewIfEligible(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  try {
    const alreadyRequested = await AsyncStorage.getItem(REVIEW_STORAGE_KEY);
    if (alreadyRequested) return;

    const raw = await AsyncStorage.getItem(LESSONS_KEY);
    const count = parseInt(raw || '0', 10);
    if (count < MIN_LESSONS_BEFORE_REVIEW) return;

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(REVIEW_STORAGE_KEY, 'true');
  } catch {
    // silently ignore
  }
}

export function useReviewPrompt() {
  const trackLessonComplete = useCallback(async () => {
    const count = await incrementCompletedLessons();
    if (count >= MIN_LESSONS_BEFORE_REVIEW) {
      await requestReviewIfEligible();
    }
  }, []);

  return { trackLessonComplete };
}
