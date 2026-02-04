# Lessons System

## Overview

Lessons-systemet är kärnan i AI Klubbens utbildningsplattform. Det erbjuder interaktiva lektioner med olika typer av övningar och gamification.

## Architecture

```
Course (content table)
  └── Lessons (course_lessons)
      └── Steps (lesson_steps)
          ├── Content Steps
          ├── Quiz Steps
          └── Interactive Steps
```

## Lesson Flow

1. **Välj Kurs** → CourseDetailScreen
2. **Välj Lektion** → LessonPath component
3. **Genomför Steg** → LessonScreen
4. **Slutför** → CelebrationScreen

## Step Types

### 1. Content Step
Visar text och bilder.

```typescript
{
  step_type: 'content',
  content: {
    title: string,
    body: string,
    image_url?: string,
    video_url?: string
  }
}
```

**Component:** `ContentStep.tsx`

### 2. Multiple Choice
Flervalsfråga med alternativ.

```typescript
{
  step_type: 'multiple_choice',
  content: {
    question: string,
    options: string[]
  },
  correct_answer: string, // Index as string
  explanation?: string
}
```

**Component:** `MultipleChoiceStep.tsx`

### 3. True/False
Sant eller falskt-fråga.

```typescript
{
  step_type: 'true_false',
  content: {
    statement: string
  },
  correct_answer: 'true' | 'false',
  explanation?: string
}
```

**Component:** `TrueFalseStep.tsx`

### 4. Fill in the Blank
Fyll i det saknade ordet.

```typescript
{
  step_type: 'fill_blank',
  content: {
    text: string, // Med ___ som placeholder
    // ELLER
    text_before: string,
    text_after: string,
    alternatives?: string[] // Förslag
  },
  correct_answer: string,
  explanation?: string
}
```

**Component:** `FillBlankStep.tsx`

### 5. Match Pairs
Matcha par av items.

```typescript
{
  step_type: 'match_pairs',
  content: {
    pairs: Array<{
      left: string,
      right: string
    }>
  },
  correct_answer: string, // JSON array
  explanation?: string
}
```

**Component:** `MatchPairsStep.tsx`

### 6. Ordering
Ordna items i rätt ordning.

```typescript
{
  step_type: 'ordering',
  content: {
    instruction: string,
    items: string[]
  },
  correct_answer: string, // JSON array of correct order
  explanation?: string
}
```

**Component:** `OrderingStep.tsx`

## Lesson Progression

### Lives System
- Användare börjar med **3 liv**
- Fel svar = -1 liv
- 0 liv = Game Over screen

### Scoring
- Rätt svar = +1 poäng
- Fel svar = 0 poäng
- Slutpoäng = antal rätta svar

### XP Rewards
- Base XP per lektion: 10-50 XP
- Perfect score bonus: +20 XP
- Streak bonus: Varierar

## Components

### LessonScreen
Huvudkomponent för lektioner.

**Ansvar:**
- Hämta lesson data från Supabase
- Hantera step progression
- Spåra score och lives
- Spara progress till databas

**Key Methods:**
```typescript
handleAnswer(answer: any, isCorrect: boolean)
handleNext()
completeLesson()
```

### Step Components
Varje step type har sin egen komponent.

**Props Interface:**
```typescript
interface StepProps {
  content: any; // Step-specific
  correctAnswer?: string;
  explanation?: string;
  onAnswer: (answer: any, isCorrect: boolean) => void;
}
```

### CelebrationScreen
Visas när lektion är slutförd.

**Props:**
```typescript
interface CelebrationScreenProps {
  xpEarned: number;
  bonusXP: number;
  score: number;
  totalSteps: number;
  streak: number;
  leveledUp: boolean;
  newLevel?: Level;
  onContinue: () => void;
}
```

## Data Flow

```
1. User selects lesson
   ↓
2. LessonScreen fetches lesson + steps
   ↓
3. Display current step
   ↓
4. User answers
   ↓
5. Validate answer
   ↓
6. Update score/lives
   ↓
7. Move to next step
   ↓
8. Repeat 3-7
   ↓
9. Complete lesson
   ↓
10. Save progress to DB
   ↓
11. Update profile (XP, streak)
   ↓
12. Show CelebrationScreen
```

## Database Integration

### Fetching Lesson
```typescript
const { data: lesson } = await supabase
  .from('course_lessons')
  .select('*')
  .eq('id', lessonId)
  .single();

const { data: steps } = await supabase
  .from('lesson_steps')
  .select('*')
  .eq('lesson_id', lessonId)
  .order('order_index');
```

### Saving Progress
```typescript
await supabase
  .from('user_lesson_progress')
  .upsert({
    user_id: userId,
    lesson_id: lessonId,
    status: 'completed',
    score: score,
    total_steps: totalSteps,
    xp_earned: xpEarned,
    completed_at: new Date().toISOString()
  });
```

### Updating Profile
```typescript
await supabase
  .from('profiles')
  .update({
    total_xp: newXP,
    current_streak: newStreak,
    longest_streak: longestStreak,
    last_activity_date: new Date().toISOString(),
    lessons_completed: lessonsCompleted + 1
  })
  .eq('id', userId);
```

## Animations

Lessons använder Moti för animationer:

- **Step transitions:** Fade in/out
- **Correct answer:** Scale + green glow
- **Incorrect answer:** Shake + red glow
- **Lives:** Pulse när liv försvinner

## Error Handling

- **No lesson found:** Visa error screen
- **Network error:** Retry med exponential backoff
- **Invalid step type:** Fallback till content step
- **Save error:** Visa toast, fortsätt ändå

## Future Improvements

- [ ] Offline mode med local storage
- [ ] Adaptive difficulty
- [ ] Hints system
- [ ] Peer comparison
- [ ] Lesson bookmarks

## Related Documentation

- [Gamification](./GAMIFICATION.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)
- [Components](../design/COMPONENT_LIBRARY.md)
