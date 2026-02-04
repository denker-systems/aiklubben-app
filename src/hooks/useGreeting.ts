import { useMemo } from 'react';

interface GreetingResult {
  greeting: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  emoji: string;
  motivation: string;
}

/**
 * Returns a time-aware, emotionally intelligent greeting
 * Based on Swedish time conventions
 */
export function useGreeting(userName?: string | null): GreetingResult {
  return useMemo(() => {
    const hour = new Date().getHours();
    const name = userName || 'där';

    let greeting: string;
    let timeOfDay: GreetingResult['timeOfDay'];
    let emoji: string;
    let motivation: string;

    if (hour >= 5 && hour < 10) {
      // Morning: 5-10
      timeOfDay = 'morning';
      emoji = '☀️';
      greeting = `God morgon, ${name}!`;
      motivation = 'Låt oss börja dagen starkt!';
    } else if (hour >= 10 && hour < 13) {
      // Late morning: 10-13
      timeOfDay = 'morning';
      emoji = '🌤️';
      greeting = `Hej, ${name}!`;
      motivation = 'Redo att lära dig något nytt?';
    } else if (hour >= 13 && hour < 17) {
      // Afternoon: 13-17
      timeOfDay = 'afternoon';
      emoji = '🌞';
      greeting = `Hej, ${name}!`;
      motivation = 'Fortsätt din AI-resa!';
    } else if (hour >= 17 && hour < 21) {
      // Evening: 17-21
      timeOfDay = 'evening';
      emoji = '🌅';
      greeting = `God kväll, ${name}!`;
      motivation = 'Perfekt tid för lite lärande!';
    } else {
      // Night: 21-5
      timeOfDay = 'night';
      emoji = '🌙';
      greeting = `Hej, ${name}!`;
      motivation = 'Sent uppe? Lär dig något spännande!';
    }

    return { greeting, timeOfDay, emoji, motivation };
  }, [userName]);
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
  return useMemo(() => {
    const { streak = 0, xp = 0, coursesCompleted = 0 } = stats;

    // Prioritize streak messages
    if (streak >= 7) {
      return `🔥 ${streak} dagar i rad! Du är en mästare!`;
    }
    if (streak >= 3) {
      return `🔥 ${streak} dagar i rad! Fortsätt så!`;
    }

    // XP milestones
    if (xp >= 1000) {
      return `⭐ Över 1000 XP! Imponerande!`;
    }
    if (xp >= 500) {
      return `⭐ Halvvägs till 1000 XP!`;
    }

    // Course completion
    if (coursesCompleted >= 5) {
      return `📚 ${coursesCompleted} kurser avklarade!`;
    }
    if (coursesCompleted >= 1) {
      return `📚 Bra jobbat med din första kurs!`;
    }

    // Default encouraging messages
    const defaultMessages = [
      'Låt oss lära oss något nytt idag! 🚀',
      'Din AI-resa fortsätter! 🧠',
      'Upptäck världen av AI! ✨',
      'Redo för nästa steg? 💪',
    ];

    return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
  }, [stats]);
}

/**
 * Returns celebration messages for achievements
 */
export function getCelebrationMessage(
  type: 'xp' | 'level' | 'streak' | 'course' | 'badge',
): string {
  const messages = {
    xp: ['🎉 Fantastiskt! +XP!', '⭐ Poäng intjänade!', '✨ Du växer!'],
    level: ['🎊 Grattis! Ny nivå!', '🏆 Du levlade upp!', '🚀 Nästa nivå upplåst!'],
    streak: ['🔥 Streak fortsätter!', '💪 Du håller igång!', '⚡ Ostagbar!'],
    course: ['📚 Kurs avklarad!', '🎓 Du klarade det!', '✅ Komplett!'],
    badge: ['🏅 Nytt märke!', '🎖️ Achievement unlocked!', '🌟 Du förtjänade det!'],
  };

  const typeMessages = messages[type];
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}

export default useGreeting;
