# Lesson System Design

## Overview
Ett interaktivt lesson/step-system inspirerat av Duolingo och Brilliant för AI Klubben.

## Database Schema

### Tables

#### `course_lessons`
```sql
- id (uuid, primary key)
- course_id (uuid, foreign key → content.id)
- title (text)
- description (text)
- order_index (integer) -- För sekventiell ordning
- duration_minutes (integer)
- xp_reward (integer)
- is_locked (boolean) -- Låst tills föregående är klar
- prerequisite_lesson_id (uuid, nullable) -- Vilken lektion måste vara klar först
- created_at (timestamp)
- updated_at (timestamp)
```

#### `lesson_steps`
```sql
- id (uuid, primary key)
- lesson_id (uuid, foreign key → course_lessons.id)
- step_type (enum: 'content', 'multiple_choice', 'fill_blank', 'true_false', 'reflection')
- order_index (integer)
- content (jsonb) -- Flexibelt innehåll beroende på step_type
- correct_answer (text, nullable) -- För quiz-steps
- explanation (text, nullable) -- Förklaring efter svar
- created_at (timestamp)
```

#### `user_lesson_progress`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → profiles.id)
- lesson_id (uuid, foreign key → course_lessons.id)
- status (enum: 'not_started', 'in_progress', 'completed')
- current_step_index (integer)
- score (integer) -- Antal rätt svar
- total_steps (integer)
- completed_at (timestamp, nullable)
- xp_earned (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

## Step Types

### 1. **Content Step**
Visar information, förklaringar, bilder
```json
{
  "type": "content",
  "title": "Vad är maskininlärning?",
  "body": "Maskininlärning är...",
  "image_url": "https://...",
  "video_url": "https://..." // optional
}
```

### 2. **Multiple Choice**
Flervalsfråga
```json
{
  "type": "multiple_choice",
  "question": "Vad är en neural nätverk?",
  "options": [
    "Ett biologiskt nätverk",
    "En typ av AI-modell",
    "En databas",
    "Ett programmeringsspråk"
  ],
  "correct_index": 1,
  "explanation": "Ett neuralt nätverk är en typ av AI-modell..."
}
```

### 3. **Fill in the Blank**
Fyll i luckor
```json
{
  "type": "fill_blank",
  "text": "Maskininlärning är en del av ___.",
  "correct_answer": "artificiell intelligens",
  "alternatives": ["AI", "artificiell intelligens"],
  "explanation": "Maskininlärning är en underkategori av AI."
}
```

### 4. **True/False**
Sant eller falskt
```json
{
  "type": "true_false",
  "statement": "ChatGPT är en typ av Large Language Model.",
  "correct_answer": true,
  "explanation": "Ja, ChatGPT är byggt på GPT-arkitekturen..."
}
```

### 5. **Reflection**
Öppen reflektion (ingen rätt/fel)
```json
{
  "type": "reflection",
  "prompt": "Hur skulle du använda AI i ditt dagliga liv?",
  "placeholder": "Skriv dina tankar här...",
  "min_words": 20
}
```

## User Flow

### Lesson Start
1. User klickar på en lektion i CourseDetail
2. Navigera till LessonScreen
3. Visa lesson intro (titel, beskrivning, XP-belöning)
4. Börja med step 1

### During Lesson
1. Visa aktuell step baserat på type
2. User interagerar (läser, svarar på fråga, etc.)
3. Validera svar (om quiz-step)
4. Visa feedback (rätt/fel + förklaring)
5. Uppdatera progress
6. Nästa step eller completion

### Lesson Completion
1. Visa celebration screen
2. Beräkna och visa XP earned
3. Uppdatera user_lesson_progress
4. Lås upp nästa lektion (om applicable)
5. Navigera tillbaka till CourseDetail

## UI Components

### LessonScreen
- **Header**: Progress bar, step counter (1/10)
- **Content Area**: Dynamiskt baserat på step type
- **Action Buttons**: "Fortsätt", "Hoppa över", "Avsluta"
- **Exit Confirmation**: Modal om user vill avsluta mitt i

### Step Components
- `ContentStep`: Text, bilder, videos
- `MultipleChoiceStep`: Fråga + alternativ
- `FillBlankStep`: Input field med validation
- `TrueFalseStep`: Sant/Falskt knappar
- `ReflectionStep`: Textarea för fri text

### Feedback Components
- `CorrectFeedback`: Grön checkmark + förklaring
- `IncorrectFeedback`: Röd X + rätt svar + förklaring
- `CelebrationScreen`: Konfetti + XP earned + badges

## Gamification

### XP System
- Varje lektion ger XP
- Bonus XP för perfekt score
- Streak bonus för daglig aktivitet

### Progress Tracking
- Visa % completed per course
- Unlock system för lektioner
- Badges för milestones

### Motivation
- Celebratory animations (Moti)
- Progress bars
- Encouraging messages
- Streak tracking

## Technical Implementation

### Navigation
```typescript
// CourseDetailScreen → LessonScreen
navigation.navigate('Lesson', { 
  lessonId: lesson.id,
  courseId: course.id 
});

// LessonScreen → CourseDetailScreen (on complete)
navigation.navigate('CourseDetail', { 
  id: courseId,
  showCelebration: true 
});
```

### State Management
```typescript
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const [answers, setAnswers] = useState<Record<number, any>>({});
const [score, setScore] = useState(0);
```

### API Calls
```typescript
// Fetch lesson with steps
const { data: lesson } = await supabase
  .from('course_lessons')
  .select('*, lesson_steps(*)')
  .eq('id', lessonId)
  .single();

// Save progress
await supabase
  .from('user_lesson_progress')
  .upsert({
    user_id: userId,
    lesson_id: lessonId,
    current_step_index: index,
    status: 'in_progress'
  });
```

## Next Steps
1. Create database migrations
2. Build LessonScreen component
3. Implement step components
4. Add navigation
5. Test flow end-to-end
