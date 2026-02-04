# Supabase API Integration

## Overview

AI Klubben använder Supabase som backend med PostgreSQL, Auth, och Storage.

## Configuration

### Client Setup
```typescript
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'User Name'
    }
  }
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Auth State Listener
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle sign in
  } else if (event === 'SIGNED_OUT') {
    // Handle sign out
  }
});
```

## Database Queries

### Select
```typescript
// Get all
const { data, error } = await supabase
  .from('profiles')
  .select('*');

// Get single
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Select specific columns
const { data, error } = await supabase
  .from('profiles')
  .select('id, name, email');

// With filters
const { data, error } = await supabase
  .from('news')
  .select('*')
  .eq('is_published', true)
  .order('published_at', { ascending: false })
  .limit(10);
```

### Insert
```typescript
const { data, error } = await supabase
  .from('user_activities')
  .insert({
    user_id: userId,
    type: 'lesson_completed',
    title: 'Lesson Title'
  });
```

### Update
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    total_xp: newXP,
    current_streak: newStreak
  })
  .eq('id', userId);
```

### Upsert
```typescript
const { data, error } = await supabase
  .from('user_lesson_progress')
  .upsert({
    user_id: userId,
    lesson_id: lessonId,
    status: 'completed',
    score: score
  });
```

### Delete
```typescript
const { data, error } = await supabase
  .from('saved_content')
  .delete()
  .eq('user_id', userId)
  .eq('content_id', contentId);
```

## Relations

### Join Tables
```typescript
const { data, error } = await supabase
  .from('news')
  .select(`
    *,
    category:news_categories(name, emoji),
    author:profiles(name, avatar_url)
  `)
  .eq('is_published', true);
```

### Nested Relations
```typescript
const { data, error } = await supabase
  .from('content')
  .select(`
    *,
    lessons:course_lessons(
      *,
      steps:lesson_steps(*)
    )
  `)
  .eq('id', courseId)
  .single();
```

## Real-time Subscriptions

### Subscribe to Changes
```typescript
const channel = supabase
  .channel('profiles-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${userId}`
    },
    (payload) => {
      console.log('Profile updated:', payload.new);
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

## Storage

### Upload File
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file);
```

### Get Public URL
```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`);

const publicUrl = data.publicUrl;
```

### Delete File
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .remove([`${userId}/avatar.png`]);
```

## Error Handling

### Common Patterns
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

if (error) {
  console.error('[API] Error:', error);
  // Handle error
  return;
}

if (!data) {
  console.warn('[API] No data found');
  // Handle empty result
  return;
}

// Use data
console.log('[API] Data fetched:', data);
```

### Error Types
```typescript
// PostgreSQL error
{
  code: '42703',
  message: 'column does not exist',
  details: null,
  hint: null
}

// Auth error
{
  message: 'Invalid login credentials'
}

// Network error
{
  message: 'Network request failed'
}
```

## Row Level Security

### Policies
All queries automatically use RLS based on JWT token.

```sql
-- Example: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

### Bypass RLS (Service Role)
```typescript
// Only use in secure backend
const { data } = await supabase
  .from('profiles')
  .select('*'); // Bypasses RLS with service role key
```

## Performance Optimization

### Indexes
Ensure proper indexes exist:
```sql
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_news_published ON news(is_published, published_at DESC);
```

### Limit Results
```typescript
const { data } = await supabase
  .from('news')
  .select('*')
  .limit(20);
```

### Pagination
```typescript
const { data } = await supabase
  .from('news')
  .select('*')
  .range(0, 19); // First 20 items
```

### Count
```typescript
const { count } = await supabase
  .from('profiles')
  .select('*', { count: 'exact', head: true });
```

## Best Practices

### 1. Always Handle Errors
```typescript
if (error) {
  console.error('[Component] Error:', error);
  // Show user-friendly message
  return;
}
```

### 2. Use TypeScript Types
```typescript
interface Profile {
  id: string;
  name: string;
  email: string;
}

const { data } = await supabase
  .from('profiles')
  .select('*')
  .returns<Profile[]>();
```

### 3. Debug Logging
```typescript
console.log('[Component] Fetching data');
const { data, error } = await supabase.from('table').select('*');
console.log('[Component] Data fetched:', { count: data?.length });
```

### 4. Cleanup Subscriptions
```typescript
useEffect(() => {
  const channel = supabase.channel('changes').subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}, []);
```

## Related Documentation

- [Database Schema](../architecture/DATABASE_SCHEMA.md)
- [Authentication](../features/AUTHENTICATION.md)
