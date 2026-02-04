# Common Issues & Solutions

## Metro Bundler Issues

### Cache Problems
**Symptom:** App not updating with code changes

**Solution:**
```bash
# Clear Metro cache
npx expo start -c

# Or clear all caches
rm -rf node_modules
npm install
npx expo start -c
```

### Port Already in Use
**Symptom:** "Port 8081 already in use"

**Solution:**
```bash
# Kill process on port
lsof -ti:8081 | xargs kill -9

# Or use different port
npx expo start --port 8082
```

## Navigation Issues

### Tab Bar Not Hiding
**Symptom:** Tab bar visible on detail screens

**Solution:**
Check `hideOnScreens` array in AppNavigator:
```typescript
const hideOnScreens = [
  'Lesson',
  'CourseDetail',
  'NewsDetail',
  'ContentDetail',
  'Auth'
];
```

### Stack Not Resetting
**Symptom:** Detail screen persists when switching tabs

**Solution:**
Ensure navigation reset logic runs:
```typescript
if (currentRoute && !tabScreens.includes(currentRoute)) {
  navigationRef.navigate(key as any);
}
```

### Back Button Not Working
**Symptom:** Back button doesn't navigate

**Solution:**
Use `navigation.goBack()` instead of `navigateToTab()`:
```typescript
const handleGoBack = () => {
  navigation.goBack();
};
```

## Database Issues

### Column Does Not Exist
**Symptom:** `column does not exist` error

**Solution:**
1. Check database schema
2. Run migrations
3. Update query to match actual columns

```typescript
// Wrong
.select('non_existent_column')

// Right
.select('actual_column_name')
```

### RLS Policy Blocking Query
**Symptom:** No data returned despite existing records

**Solution:**
1. Check RLS policies in Supabase dashboard
2. Verify user is authenticated
3. Ensure policy allows operation

```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### Query Timeout
**Symptom:** Query takes too long

**Solution:**
1. Add indexes
2. Limit results
3. Optimize query

```typescript
// Add limit
.select('*')
.limit(50)

// Use specific columns
.select('id, name, email')
```

## Authentication Issues

### Session Not Persisting
**Symptom:** User logged out on app restart

**Solution:**
Ensure Supabase client is configured correctly:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
```

### Invalid Credentials
**Symptom:** "Invalid login credentials" error

**Solution:**
1. Verify email/password are correct
2. Check if user exists in auth.users
3. Ensure password meets requirements (min 6 chars)

### Token Expired
**Symptom:** Queries fail with auth error

**Solution:**
Token should auto-refresh. If not:
```typescript
const { data: { session } } = await supabase.auth.refreshSession();
```

## Build Issues

### iOS Build Fails
**Symptom:** Build fails with CocoaPods error

**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Fails
**Symptom:** Gradle build error

**Solution:**
```bash
cd android
./gradlew clean
cd ..
```

### TypeScript Errors
**Symptom:** Type errors in build

**Solution:**
```bash
# Check errors
npx tsc --noEmit

# Fix imports
# Restart TS server in VS Code
```

## Performance Issues

### Slow Animations
**Symptom:** Animations lag or stutter

**Solution:**
1. Use native driver
2. Reduce animation complexity
3. Memoize components

```typescript
// Use native driver
<MotiView
  animate={{ opacity: 1 }}
  transition={{ type: 'timing', useNativeDriver: true }}
/>

// Memoize
export default React.memo(Component);
```

### Memory Leaks
**Symptom:** App becomes slow over time

**Solution:**
1. Cleanup subscriptions
2. Clear timers
3. Remove event listeners

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('changes')
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Large Bundle Size
**Symptom:** App takes long to load

**Solution:**
1. Lazy load screens
2. Optimize images
3. Remove unused dependencies

## UI Issues

### Keyboard Covering Input
**Symptom:** Keyboard hides text input

**Solution:**
```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  <TextInput />
</KeyboardAvoidingView>
```

### SafeArea Not Working
**Symptom:** Content under status bar/notch

**Solution:**
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

<View style={{ paddingTop: insets.top }}>
```

### Images Not Loading
**Symptom:** Images show broken icon

**Solution:**
1. Check image URL
2. Verify network permissions
3. Use expo-image

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  placeholder={blurhash}
  contentFit="cover"
/>
```

## Development Issues

### Hot Reload Not Working
**Symptom:** Changes don't reflect in app

**Solution:**
1. Restart Metro bundler
2. Clear cache
3. Reload app manually (shake device)

### Environment Variables Not Loading
**Symptom:** `undefined` for env vars

**Solution:**
1. Ensure `.env` file exists
2. Restart Metro bundler
3. Use `EXPO_PUBLIC_` prefix

```env
# Wrong
SUPABASE_URL=...

# Right
EXPO_PUBLIC_SUPABASE_URL=...
```

### Module Not Found
**Symptom:** "Module not found" error

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear cache
npx expo start -c
```

## Getting More Help

If issue persists:
1. Check [FAQ](./FAQ.md)
2. Review [Debug Guide](./DEBUG_GUIDE.md)
3. Contact development team
4. Check Expo/Supabase documentation
