# Authentication System

## Overview

AI Klubben använder Supabase Auth för användarhantering med email/password authentication.

## Architecture

```
User Action
  ↓
AuthScreen Component
  ↓
useAuth Hook
  ↓
Supabase Auth Client
  ↓
JWT Token
  ↓
AuthContext State Update
  ↓
App Re-renders
```

## Components

### AuthScreen
Login/signup screen.

**Features:**
- Toggle mellan login/signup
- Email + password fields
- Input validation
- Error handling
- Loading states

**Flow:**
```typescript
1. User enters email/password
2. Validates input (not empty)
3. Calls useAuth.signIn() or useAuth.signUp()
4. Shows loading spinner
5. Handles success/error
6. Navigates to app on success
```

### useAuth Hook
Custom hook för auth operations.

**Methods:**
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, metadata?: any) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}
```

**Implementation:**
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Authentication Flow

### Sign Up
```
1. User enters email/password
   ↓
2. AuthScreen.handleAuth()
   ↓
3. useAuth.signUp(email, password, { name })
   ↓
4. Supabase creates auth.users entry
   ↓
5. Trigger creates profiles entry
   ↓
6. JWT token returned
   ↓
7. AuthContext updates user state
   ↓
8. Navigate to Home
```

### Sign In
```
1. User enters email/password
   ↓
2. AuthScreen.handleAuth()
   ↓
3. useAuth.signIn(email, password)
   ↓
4. Supabase validates credentials
   ↓
5. JWT token returned
   ↓
6. AuthContext updates user state
   ↓
7. Navigate to Home
```

### Sign Out
```
1. User clicks logout
   ↓
2. useAuth.signOut()
   ↓
3. Supabase.auth.signOut()
   ↓
4. Clear local session
   ↓
5. AuthContext clears user state
   ↓
6. Navigate to Auth screen
```

## Session Management

### Token Storage
Supabase hanterar token storage automatiskt:
- Access token (JWT)
- Refresh token
- Stored in secure storage

### Session Refresh
```typescript
useEffect(() => {
  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('[useAuth] Auth state changed', { event });
      
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      setLoading(false);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### Initial Session
```typescript
useEffect(() => {
  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);
  };
  
  getSession();
}, []);
```

## Protected Routes

### AppNavigator Logic
```typescript
{!user ? (
  <Stack.Screen name="Auth" component={AuthScreen} />
) : (
  <>
    {activeTab === 'Home' && <Stack.Screen name="Home" component={HomeScreen} />}
    {/* ... other screens */}
  </>
)}
```

### Loading State
```typescript
if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={brandColors.purple} />
    </View>
  );
}
```

## User Profile

### Profile Creation
Automatisk via database trigger:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Profile Data
```typescript
interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  total_xp: number;
  current_streak: number;
  // ... other fields
}
```

## Error Handling

### Common Errors
```typescript
// Invalid credentials
{ message: "Invalid login credentials" }

// Email already exists
{ message: "User already registered" }

// Weak password
{ message: "Password should be at least 6 characters" }

// Network error
{ message: "Network request failed" }
```

### Error Display
```typescript
const [error, setError] = useState<string | null>(null);

// Show error
if (authError) {
  setError(authError.message);
}

// Display
{error && (
  <Text style={{ color: '#EF4444' }}>
    {error}
  </Text>
)}
```

## Security

### Password Requirements
- Minimum 6 characters (Supabase default)
- Can be customized in Supabase dashboard

### JWT Token
- Expires after 1 hour (default)
- Auto-refreshed by Supabase client
- Stored securely

### Row Level Security
All database queries use JWT:
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

## Debug Logging

All auth operations loggas:

```typescript
console.log('[AuthScreen] handleAuth', { isLogin, email });
console.log('[useAuth] signIn attempt', { email });
console.log('[useAuth] Auth state changed', { event, userId });
console.log('[useAuth] signIn successful');
```

## Best Practices

### 1. Always Handle Loading
```typescript
if (loading) return <LoadingScreen />;
```

### 2. Clear Errors on Input Change
```typescript
const handleEmailChange = (text: string) => {
  setEmail(text);
  setError(null); // Clear error
};
```

### 3. Validate Input
```typescript
if (!email || !password) {
  setError('Vänligen fyll i alla fält');
  return;
}
```

### 4. Use Secure Storage
```typescript
import * as SecureStore from 'expo-secure-store';

// Store sensitive data
await SecureStore.setItemAsync('key', 'value');
```

## Future Enhancements

- [ ] Social login (Google, Apple)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Biometric authentication

## Related Documentation

- [Database Schema](../architecture/DATABASE_SCHEMA.md)
- [API Integration](../api/SUPABASE.md)
- [Security](../security/OVERVIEW.md)
