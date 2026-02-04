# Debug Guide

## Debug Logging

### Console Logging Standards

All components ska logga viktiga events:

```typescript
// Component render
console.log('[ComponentName] Rendered', { props });

// User actions
console.log('[ComponentName] Action triggered', { data });

// API calls
console.log('[ComponentName] Fetching data');
console.log('[ComponentName] Data fetched:', { count: data?.length });

// Navigation
console.log('[ComponentName] Navigating to:', screen);

// Errors
console.error('[ComponentName] Error:', error);
```

### Log Format
```
[ComponentName] Event description { data }
```

**Examples:**
```typescript
console.log('[LessonScreen] handleNext', { 
  currentStepIndex: 2, 
  totalSteps: 5 
});

console.log('[FloatingTabBar] Tab pressed:', 'Courses');

console.error('[HomeScreen] Error fetching news:', error);
```

## React Native Debugger

### Enable Debugger
```bash
# In simulator/emulator
Press 'j' in terminal

# Or
Cmd+D (iOS) / Cmd+M (Android)
Select "Debug"
```

### Chrome DevTools
1. Open debugger
2. Navigate to `http://localhost:8081/debugger-ui`
3. Use Console, Network, Sources tabs

### React DevTools
```bash
# Install
npm install -g react-devtools

# Run
react-devtools
```

## Network Debugging

### Inspect Requests
```typescript
// Log all Supabase requests
const { data, error } = await supabase
  .from('profiles')
  .select('*');

console.log('[API] Request:', {
  table: 'profiles',
  method: 'SELECT',
  response: { data, error }
});
```

### Network Monitor
```bash
# In simulator
Cmd+D -> "Show Performance Monitor"
```

### Proxy Setup (Charles/Proxyman)
1. Install proxy tool
2. Configure device proxy
3. Trust SSL certificate
4. Monitor traffic

## Performance Profiling

### React Profiler
```typescript
import { Profiler } from 'react';

<Profiler id="LessonScreen" onRender={onRenderCallback}>
  <LessonScreen />
</Profiler>

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log('[Profiler]', {
    id,
    phase,
    actualDuration
  });
}
```

### Memory Leaks
```typescript
// Check for leaks
useEffect(() => {
  console.log('[Component] Mounted');
  
  return () => {
    console.log('[Component] Unmounted');
  };
}, []);
```

### Animation Performance
```typescript
// Monitor FPS
import { PerformanceMonitor } from 'react-native';

// Use native driver
<Animated.View
  style={{
    transform: [{
      translateY: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100],
      })
    }]
  }}
/>
```

## Database Debugging

### Query Logging
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

console.log('[DB] Query:', {
  table: 'profiles',
  filter: { id: userId },
  result: { count: data?.length, error }
});
```

### RLS Debugging
```sql
-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';

-- Test policy
SELECT * FROM profiles 
WHERE id = auth.uid();
```

### Explain Query
```sql
EXPLAIN ANALYZE
SELECT * FROM profiles WHERE id = '...';
```

## State Debugging

### Context Values
```typescript
const { user, loading } = useAuth();

console.log('[Component] Auth state:', {
  hasUser: !!user,
  userId: user?.id,
  loading
});
```

### Props Debugging
```typescript
useEffect(() => {
  console.log('[Component] Props changed:', props);
}, [props]);
```

### State Changes
```typescript
const [count, setCount] = useState(0);

useEffect(() => {
  console.log('[Component] Count changed:', count);
}, [count]);
```

## Navigation Debugging

### Current Route
```typescript
import { useRoute, useNavigation } from '@react-navigation/native';

const route = useRoute();
const navigation = useNavigation();

console.log('[Navigation] Current route:', route.name);
console.log('[Navigation] Params:', route.params);
```

### Navigation State
```typescript
const navigationRef = useNavigationContainerRef();

useEffect(() => {
  const unsubscribe = navigationRef.addListener('state', (e) => {
    const state = e.data.state;
    console.log('[Navigation] State changed:', state);
  });

  return unsubscribe;
}, []);
```

## Error Tracking

### Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', {
      error,
      errorInfo
    });
  }

  render() {
    return this.props.children;
  }
}
```

### Global Error Handler
```typescript
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('[Global] Error:', {
    error,
    isFatal
  });
});
```

## Testing Scenarios

### Test User Flows
```typescript
// 1. Login
console.log('[Test] Step 1: Login');
await signIn(email, password);

// 2. Navigate
console.log('[Test] Step 2: Navigate to Courses');
navigation.navigate('Courses');

// 3. Select lesson
console.log('[Test] Step 3: Start lesson');
navigation.navigate('Lesson', { id: lessonId });

// 4. Complete
console.log('[Test] Step 4: Complete lesson');
await completeLesson();
```

### Edge Cases
```typescript
// Empty state
console.log('[Test] Testing empty state');
setData([]);

// Error state
console.log('[Test] Testing error state');
setError(new Error('Test error'));

// Loading state
console.log('[Test] Testing loading state');
setLoading(true);
```

## Tools

### Recommended Tools
- **React Native Debugger:** Full debugging suite
- **Flipper:** Mobile app debugger
- **React DevTools:** Component inspection
- **Charles Proxy:** Network monitoring
- **Sentry:** Error tracking (production)

### VS Code Extensions
- **React Native Tools:** Debugging support
- **ESLint:** Code quality
- **TypeScript:** Type checking
- **GitLens:** Git integration

## Best Practices

### 1. Log Everything Important
```typescript
// Good
console.log('[Component] Action', { data });

// Bad
// No logging
```

### 2. Use Descriptive Messages
```typescript
// Good
console.log('[LessonScreen] Moving to next step:', stepIndex);

// Bad
console.log('next');
```

### 3. Include Context
```typescript
// Good
console.error('[API] Error fetching profile:', {
  userId,
  error: error.message
});

// Bad
console.error(error);
```

### 4. Clean Up Before Commit
```typescript
// Remove debug logs
// console.log('[Debug] Test data:', data);

// Keep important logs
console.log('[Component] Rendered', { props });
```

## Related Documentation

- [Common Issues](./COMMON_ISSUES.md)
- [FAQ](./FAQ.md)
