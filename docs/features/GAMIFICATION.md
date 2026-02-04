# Gamification System

## Overview

AI Klubben använder gamification för att öka engagement och motivation. Systemet inkluderar XP, levels, streaks, och badges.

## Core Mechanics

### 1. Experience Points (XP)

**Earning XP:**
- Complete lesson: 10-50 XP (baserat på svårighetsgrad)
- Perfect score bonus: +20 XP
- Daily streak bonus: +5 XP per dag
- Read article: +15 XP
- Complete quiz: +25 XP

**XP Storage:**
```typescript
profiles.total_xp: INTEGER
```

### 2. Levels

8 nivåer från Nybörjare till AI Guru.

```typescript
export const LEVELS = [
  { level: 1, name: 'Nybörjare', minXP: 0, icon: '🌱' },
  { level: 2, name: 'Utforskare', minXP: 100, icon: '🔍' },
  { level: 3, name: 'Lärling', minXP: 300, icon: '📚' },
  { level: 4, name: 'Praktikant', minXP: 600, icon: '💼' },
  { level: 5, name: 'Expert', minXP: 1000, icon: '⭐' },
  { level: 6, name: 'Mästare', minXP: 1500, icon: '🎓' },
  { level: 7, name: 'Guru', minXP: 2500, icon: '🧙' },
  { level: 8, name: 'AI Guru', minXP: 5000, icon: '🚀' }
];
```

**Level Calculation:**
```typescript
export function getLevelForXP(xp: number): Level {
  return LEVELS.reduce((prev, curr) => 
    xp >= curr.minXP ? curr : prev
  );
}
```

### 3. Streaks

**Daily Streak:**
- Complete any lesson = streak +1
- Miss a day = streak reset to 1
- Tracked via `last_activity_date`

**Streak Logic:**
```typescript
const today = new Date().toISOString().split('T')[0];
const lastActive = profile.last_activity_date?.split('T')[0];

if (lastActive !== today) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActive === yesterdayStr) {
    // Consecutive day
    newStreak = currentStreak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }
}
```

**Storage:**
```typescript
profiles.current_streak: INTEGER
profiles.longest_streak: INTEGER
profiles.last_activity_date: TIMESTAMPTZ
```

### 4. Badges (Planned)

**Badge Categories:**
- **Learning:** Complete X lessons
- **Streak:** Maintain X day streak
- **Explorer:** Try all lesson types
- **Community:** Share content
- **Special:** Holiday/event badges

**Badge Structure:**
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'explorer' | 'community' | 'special';
  requirement: {
    type: string;
    value: number;
  };
}
```

## UI Components

### Progress Indicators

**XP Progress Bar:**
```typescript
const progress = getXPProgress(currentXP);
// Returns: { current, required, percentage }
```

**Level Badge:**
- Circular badge med level icon
- Animerad när level up
- Visar current level name

**Streak Counter:**
- Flame emoji 🔥
- Dagens streak-nummer
- Pulserar vid ny streak

### Celebration Animations

**Level Up:**
- Fullscreen confetti
- Level badge scale animation
- Haptic feedback (success)
- Sound effect (optional)

**Perfect Score:**
- Golden stars
- Bonus XP animation
- Haptic feedback (heavy)

**Streak Milestone:**
- Fire animation
- Streak badge bounce
- Haptic feedback (medium)

## Animation Configs

```typescript
export const SPRING_CONFIGS = {
  bouncy: {
    type: 'spring',
    damping: 8,
    stiffness: 180,
  },
  snappy: {
    type: 'spring',
    damping: 18,
    stiffness: 200,
  },
  celebratory: {
    type: 'spring',
    damping: 6,
    stiffness: 250,
  },
};
```

## Color Psychology

**Purple (#8B5CF6):** Primary, kreativitet
**Pink (#EC4899):** Celebrations, energi  
**Green (#10B981):** Success, achievement
**Orange (#F59E0B):** Streaks, urgency
**Gold (#F59E0B):** Perfect score, premium

## Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// Correct answer
Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);

// Incorrect answer
Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Error
);

// Button press
Haptics.impactAsync(
  Haptics.ImpactFeedbackStyle.Light
);

// Level up
Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);
```

## Data Tracking

### Profile Updates
```typescript
await supabase
  .from('profiles')
  .update({
    total_xp: newXP,
    current_streak: newStreak,
    longest_streak: Math.max(longestStreak, newStreak),
    last_activity_date: new Date().toISOString(),
    lessons_completed: lessonsCompleted + 1
  })
  .eq('id', userId);
```

### Activity Log
```typescript
await supabase
  .from('user_activities')
  .insert({
    user_id: userId,
    type: 'lesson_completed',
    title: lessonTitle,
    created_at: new Date().toISOString()
  });
```

## Best Practices

### Loss Aversion
- Visa streak-varning innan midnatt
- "Don't break your X day streak!"
- Push notification reminder

### Immediate Feedback
- Instant XP animation
- Haptic feedback på alla actions
- Visual confirmation (checkmarks, colors)

### Progress Visibility
- XP bar alltid synlig
- Level badge i header
- Streak counter prominent

### Micro-celebrations
- Små animationer för varje rätt svar
- Större för milestones
- Confetti för level up

## Performance Considerations

- **Debounce XP updates:** Batch updates
- **Lazy load badges:** Fetch on demand
- **Cache level calculations:** Memoize
- **Optimize animations:** Use native driver

## Future Enhancements

- [ ] Leaderboards
- [ ] Weekly challenges
- [ ] Achievement showcase
- [ ] Social sharing
- [ ] Referral rewards
- [ ] Premium badges

## Related Documentation

- [Lessons System](./LESSONS.md)
- [Design Guide](../design/GAMIFICATION_DESIGN_GUIDE.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)
