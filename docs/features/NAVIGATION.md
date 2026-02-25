# Navigation System

## Overview

AI Klubben använder React Navigation med en custom tab bar och fullscreen menu för navigation.

## Architecture

```
AppNavigator (Root)
  ├── TabNavigationProvider (Context)
  ├── MenuProvider (Context)
  └── NavigationContainer
      └── Stack.Navigator
          ├── Tab Screens (conditional)
          │   ├── Home
          │   ├── News
          │   ├── Courses
          │   ├── Content
          │   └── Profile
          └── Detail Screens
              ├── NewsDetail
              ├── ContentDetail
              ├── CourseDetail
              ├── Lesson
              └── Settings
```

## Navigation Types

### 1. Tab Navigation

Huvudnavigation via `FloatingTabBar`.

**Tabs:**

- 🏠 Home
- 📰 News
- 📚 Courses
- 📂 Content
- 👤 Profile

**Implementation:**

```typescript
const [activeTab, setActiveTab] = useState<TabKey>('Home');

const handleTabPress = (key: string) => {
  if (navigationRef.isReady()) {
    const currentRoute = navigationRef.getCurrentRoute()?.name;
    const tabScreens = ['Home', 'News', 'Courses', 'Content', 'Profile'];

    // Reset stack if on detail screen
    if (currentRoute && !tabScreens.includes(currentRoute)) {
      navigationRef.navigate(key as any);
    }
  }

  setActiveTab(key as TabKey);
};
```

### 2. Stack Navigation

För detail screens och nested navigation.

**Navigation Methods:**

```typescript
// Navigate to screen
navigation.navigate('CourseDetail', { id: courseId });

// Go back
navigation.goBack();

// Reset to screen
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
```

### 3. Menu Navigation

Fullscreen hamburger menu.

**Features:**

- Smooth fade in/out
- Floating orbs background
- Categorized menu items
- Logout option

## Components

### AppNavigator

Root navigation component.

**Responsibilities:**

- Setup NavigationContainer
- Manage active tab state
- Handle tab bar visibility
- Coordinate menu and navigation

**Key Logic:**

```typescript
// Hide tab bar on detail screens
const hideOnScreens = ['Lesson', 'CourseDetail', 'NewsDetail', 'ContentDetail', 'Auth'];
setIsTabBarVisible(!hideOnScreens.includes(routeName || ''));
```

### FloatingTabBar

Custom tab bar component.

**Features:**

- Floating design
- Active tab indicator
- Smooth animations
- Emoji icons

**Props:**

```typescript
interface FloatingTabBarProps {
  activeTab: string;
  onTabPress: (key: string) => void;
}
```

### FullscreenMenu

Hamburger menu overlay.

**Features:**

- Fullscreen modal
- Categorized sections
- Gradient cards
- Close button

**Props:**

```typescript
interface FullscreenMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}
```

### MenuButton

Hamburger menu button.

**Features:**

- Animated lines
- Press feedback
- Customizable size

## Contexts

### TabNavigationContext

Manages active tab state.

```typescript
interface TabNavigationContextType {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  navigateToTab: (tab: TabKey) => void;
}
```

### MenuContext

Manages menu visibility.

```typescript
interface MenuContextType {
  menuVisible: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}
```

## Navigation Flow

### Tab Switch

```
User taps tab
  ↓
FloatingTabBar.onTabPress
  ↓
AppNavigator.handleTabPress
  ↓
Check current route
  ↓
Reset stack if needed
  ↓
Update activeTab state
  ↓
TabNavigationContext updates
  ↓
Screen re-renders
```

### Detail Navigation

```
User taps item
  ↓
Screen.handlePress
  ↓
navigation.navigate('Detail', { id })
  ↓
Stack pushes new screen
  ↓
Tab bar hides
  ↓
Detail screen renders
```

### Back Navigation

```
User taps back
  ↓
Detail.handleGoBack
  ↓
navigation.goBack()
  ↓
Stack pops screen
  ↓
Tab bar shows
  ↓
Previous screen visible
```

## Deep Linking

Support för externa länkar (planned).

```typescript
const linking = {
  prefixes: ['aiklubben://', 'https://aiklubben.nu'],
  config: {
    screens: {
      Home: '',
      CourseDetail: 'course/:id',
      Lesson: 'lesson/:id',
      NewsDetail: 'news/:id',
    },
  },
};
```

## Animations

### Screen Transitions

```typescript
screenOptions={{
  headerShown: false,
  animation: 'fade',
}}
```

### Tab Bar

```typescript
<MotiView
  from={{ opacity: 0, translateY: 50 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={SPRING_CONFIGS.smooth}
>
```

### Menu

```typescript
<MotiView
  from={{ opacity: 0 }}
  animate={{ opacity: visible ? 1 : 0 }}
  transition={SPRING_CONFIGS.smooth}
>
```

## Type Safety

### Navigation Types

```typescript
export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  News: undefined;
  Courses: undefined;
  Content: undefined;
  Profile: undefined;
  NewsDetail: { id: string };
  ContentDetail: { id: string };
  CourseDetail: { id: string };
  Lesson: { id: string; courseId: string };
  Settings: undefined;
  Support: undefined;
  Privacy: undefined;
  About: undefined;
};
```

### Typed Navigation Hook

```typescript
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const navigation = useNavigation<NavigationProp>();
```

## Best Practices

### 1. Always Use TypeScript Types

```typescript
// Good
navigation.navigate('CourseDetail', { id: courseId });

// Bad
navigation.navigate('CourseDetail' as any);
```

### 2. Handle Back Button

```typescript
const handleGoBack = () => {
  console.log('[Screen] Going back');
  navigation.goBack();
};
```

### 3. Reset Stack When Needed

```typescript
// When switching tabs from detail screen
if (currentRoute && !tabScreens.includes(currentRoute)) {
  navigationRef.navigate(key as any);
}
```

### 4. Debug Logging

All navigation actions ska loggas:

```typescript
console.log('[Component] Navigation action', { screen, params });
```

## Troubleshooting

### Tab Bar Not Hiding

Check `hideOnScreens` array i AppNavigator.

### Stack Not Resetting

Ensure `navigationRef.navigate()` is called before `setActiveTab()`.

### Menu Not Closing

Verify `MenuContext.closeMenu()` is called in handlers.

## Future Enhancements

- [ ] Deep linking implementation
- [ ] Gesture navigation
- [ ] Screen transitions customization
- [ ] Navigation history
- [ ] Breadcrumbs (optional)

## Related Documentation

- [Components](../design/COMPONENT_LIBRARY.md)
- [Contexts](./CONTEXTS.md)
- [Architecture](../architecture/OVERVIEW.md)
