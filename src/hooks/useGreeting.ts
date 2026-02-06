import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GreetingResult {
  greeting: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  emoji: string;
  motivation: string;
}

/**
 * Returns a time-aware, emotionally intelligent greeting
 * Uses i18n translations for language support
 */
export function useGreeting(userName?: string | null): GreetingResult {
  const { t } = useLanguage();

  return useMemo(() => {
    const hour = new Date().getHours();
    const name = userName || t.common.friend;

    let greeting: string;
    let timeOfDay: GreetingResult['timeOfDay'];
    let emoji: string;
    let motivation: string;

    if (hour >= 5 && hour < 10) {
      // Morning: 5-10
      timeOfDay = 'morning';
      emoji = '☀️';
      greeting = `${t.greetings.morning}, ${name}!`;
      motivation = t.greetingsExtended.morningMotivation;
    } else if (hour >= 10 && hour < 13) {
      // Late morning: 10-13
      timeOfDay = 'morning';
      emoji = '🌤️';
      greeting = `${t.greetingsExtended.lateMorning}, ${name}!`;
      motivation = t.greetingsExtended.lateMorningMotivation;
    } else if (hour >= 13 && hour < 17) {
      // Afternoon: 13-17
      timeOfDay = 'afternoon';
      emoji = '🌞';
      greeting = `${t.greetings.afternoon}, ${name}!`;
      motivation = t.greetingsExtended.afternoonMotivation;
    } else if (hour >= 17 && hour < 21) {
      // Evening: 17-21
      timeOfDay = 'evening';
      emoji = '🌅';
      greeting = `${t.greetings.evening}, ${name}!`;
      motivation = t.greetingsExtended.eveningMotivation;
    } else {
      // Night: 21-5
      timeOfDay = 'night';
      emoji = '🌙';
      greeting = `${t.greetingsExtended.night}, ${name}!`;
      motivation = t.greetingsExtended.nightMotivation;
    }

    return { greeting, timeOfDay, emoji, motivation };
  }, [userName, t]);
}

/**
 * Returns encouraging messages based on user stats
 */
export function useEncouragingMessage(stats: {
  streak?: number;
  xp?: number;
  coursesCompleted?: number;
  level?: string;
}): string {
  const { t, ti } = useLanguage();

  return useMemo(() => {
    const { streak = 0, xp = 0, coursesCompleted = 0 } = stats;

    // Prioritize streak messages
    if (streak >= 7) {
      return ti(t.encouraging.streakMaster, { count: streak });
    }
    if (streak >= 3) {
      return ti(t.encouraging.streakGoing, { count: streak });
    }

    // XP milestones
    if (xp >= 1000) {
      return t.encouraging.xpOver1000;
    }
    if (xp >= 500) {
      return t.encouraging.xpHalfway;
    }

    // Course completion
    if (coursesCompleted >= 5) {
      return ti(t.encouraging.coursesMany, { count: coursesCompleted });
    }
    if (coursesCompleted >= 1) {
      return t.encouraging.coursesFirst;
    }

    // Default encouraging messages
    const defaultMessages = [
      t.encouraging.default1,
      t.encouraging.default2,
      t.encouraging.default3,
      t.encouraging.default4,
    ];

    return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
  }, [stats, t, ti]);
}

/**
 * Returns celebration messages for achievements
 */
export function useCelebrationMessage(
  type: 'xp' | 'level' | 'streak' | 'course' | 'badge',
): string {
  const { t } = useLanguage();

  const messages = {
    xp: [t.celebration.xp1, t.celebration.xp2, t.celebration.xp3],
    level: [t.celebration.level1, t.celebration.level2, t.celebration.level3],
    streak: [t.celebration.streak1, t.celebration.streak2, t.celebration.streak3],
    course: [t.celebration.course1, t.celebration.course2, t.celebration.course3],
    badge: [t.celebration.badge1, t.celebration.badge2, t.celebration.badge3],
  };

  const typeMessages = messages[type];
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}

export default useGreeting;
