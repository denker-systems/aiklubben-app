# Database Schema

## Overview

AI Klubben använder Supabase (PostgreSQL) som databas med Row Level Security (RLS) aktiverat på alla tabeller.

## Core Tables

### `profiles`
Användarprofildata kopplad till Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url VARCHAR,
  bio TEXT,
  phone TEXT,
  city TEXT,
  
  -- Membership
  membership_type TEXT DEFAULT 'standard',
  membership_since TIMESTAMPTZ DEFAULT NOW(),
  
  -- Gamification
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  last_activity_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Preferences
  language_preference VARCHAR DEFAULT 'sv',
  interests JSONB DEFAULT '{}',
  social_links JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Users can read their own profile
- Users can update their own profile
- Admins can read all profiles

## Learning System

### `content`
Kurser och innehåll (används som "courses").

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  excerpt TEXT,
  category TEXT, -- 'course', 'article', etc.
  status TEXT DEFAULT 'draft',
  image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `course_lessons`
Lektioner inom en kurs.

```sql
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES content(id),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 10,
  xp_reward INTEGER DEFAULT 10,
  is_locked BOOLEAN DEFAULT false,
  prerequisite_lesson_id UUID REFERENCES course_lessons(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `lesson_steps`
Individuella steg inom en lektion.

```sql
CREATE TABLE lesson_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES course_lessons(id),
  step_type TEXT NOT NULL CHECK (step_type IN (
    'content',
    'multiple_choice',
    'fill_blank',
    'true_false',
    'match_pairs',
    'ordering',
    'reflection'
  )),
  order_index INTEGER DEFAULT 0,
  content JSONB NOT NULL, -- Step-specific data
  correct_answer TEXT,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Step Types:**
- `content`: Text/image content
- `multiple_choice`: Multiple choice question
- `fill_blank`: Fill in the blank
- `true_false`: True/false question
- `match_pairs`: Match pairs exercise
- `ordering`: Order items correctly
- `reflection`: Open-ended reflection

### `user_lesson_progress`
Spårar användarens framsteg i lektioner.

```sql
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  lesson_id UUID REFERENCES course_lessons(id),
  status TEXT DEFAULT 'not_started' CHECK (status IN (
    'not_started',
    'in_progress',
    'completed'
  )),
  current_step_index INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);
```

## Content Management

### `news`
Nyhetsartiklar.

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES news_categories(id),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `news_categories`
Kategorier för nyheter.

```sql
CREATE TABLE news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## User Engagement

### `saved_content`
Sparat innehåll per användare.

```sql
CREATE TABLE saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  content_id UUID REFERENCES content(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, content_id)
);
```

### `user_activities`
Aktivitetslogg för användare.

```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Settings & Configuration

### `settings`
Applikationsinställningar.

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `notification_settings`
Notifikationsinställningar per användare.

```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  email_updates BOOLEAN DEFAULT true,
  event_reminders BOOLEAN DEFAULT true,
  new_content BOOLEAN DEFAULT false,
  marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Indexes

Viktiga index för prestanda:

```sql
-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Lessons
CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_lesson_steps_lesson_id ON lesson_steps(lesson_id);
CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);

-- Content
CREATE INDEX idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX idx_content_category ON content(category);
```

## RLS Policies

Alla tabeller har Row Level Security aktiverat. Exempel:

```sql
-- Profiles: Users can read their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Lessons: All authenticated users can read
CREATE POLICY "Authenticated users can view lessons"
  ON course_lessons FOR SELECT
  TO authenticated
  USING (true);

-- Progress: Users can manage their own
CREATE POLICY "Users can manage own progress"
  ON user_lesson_progress
  USING (auth.uid() = user_id);
```

## Next Steps

- [API Integration](../api/SUPABASE.md)
- [Data Models](./DATA_MODELS.md)
