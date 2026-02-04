# Tech Stack

## Core Technologies

### React Native & Expo
- **react-native:** 0.76.6
- **expo:** ~52.0.29
- **expo-router:** Filbaserad routing (ej aktivt använd)

**Varför Expo?**
- Over-the-air updates
- Enklare native module integration
- Snabbare utvecklingscykel
- Inbyggd support för iOS/Android

### TypeScript
- **Version:** ~5.5.3
- **Config:** Strikt mode aktiverat
- **Benefits:**
  - Type safety
  - IntelliSense
  - Refactoring support
  - Dokumentation via types

## UI & Styling

### NativeWind
- **Version:** ^4.1.23
- **Tailwind CSS:** ^3.4.11
- Utility-first CSS för React Native
- Custom design tokens i `tailwind.config.js`

### Moti (Animation)
- **Version:** ^0.29.0
- **Reanimated:** ^3.16.5
- Deklarativa animationer
- Native performance
- Spring physics

### Icons & Assets
- **lucide-react-native:** ^0.468.0
- **expo-image:** För optimerad bildhantering
- **Linear Gradients:** expo-linear-gradient

## Navigation

### React Navigation
- **@react-navigation/native:** ^6.1.18
- **@react-navigation/native-stack:** ^6.11.0
- Native stack navigator för iOS/Android
- Deep linking support
- Type-safe navigation

## Backend & Data

### Supabase
- **@supabase/supabase-js:** ^2.49.1
- PostgreSQL database
- Authentication
- Row Level Security
- Real-time subscriptions

### Storage
- **@react-native-async-storage/async-storage:** ^2.1.0
- **expo-secure-store:** För känslig data (tokens)

## Development Tools

### Linting & Formatting
- **ESLint:** Code quality
- **Prettier:** Code formatting
- **TypeScript Compiler:** Type checking

### Build & Deploy
- **EAS Build:** Expo Application Services
- **Metro Bundler:** React Native bundler
- **Babel:** JavaScript compiler

## Native Modules

### Expo Modules
- **expo-haptics:** Haptisk feedback
- **expo-status-bar:** Status bar styling
- **expo-system-ui:** System UI theming
- **expo-splash-screen:** Splash screen
- **expo-font:** Custom fonts

### React Native Modules
- **react-native-safe-area-context:** Safe area insets
- **react-native-screens:** Native screen optimization
- **react-native-gesture-handler:** Touch gestures

## Utilities

### Date & Time
- **date-fns:** ^4.1.0
- Lightweight date manipulation
- Locale support (Swedish)

### Forms & Validation
- **react-hook-form:** ^7.53.0
- **zod:** ^3.23.8
- Type-safe form validation

## Performance

### Optimization Techniques
- React.memo för komponenter
- useCallback för event handlers
- useMemo för tunga beräkningar
- Native driver för animationer
- Image caching via expo-image

### Bundle Size
- Tree shaking via Metro
- Code splitting (lazy loading)
- Optimized production builds

## Testing (Planned)

### Unit Testing
- Jest
- React Native Testing Library

### E2E Testing
- Detox (planned)

## Version Management

### Package Manager
- **npm:** Latest stable
- **package-lock.json:** Locked dependencies

### Node Version
- **Node.js:** LTS (Latest Stable)
- Rekommenderat: v20.x eller senare

## Development Environment

### Required Tools
- Node.js (LTS)
- npm
- Expo CLI
- iOS Simulator (macOS)
- Android Studio (Android development)

### Recommended IDE
- Visual Studio Code
- Extensions:
  - ESLint
  - Prettier
  - TypeScript
  - React Native Tools
  - Tailwind CSS IntelliSense

## Next Steps

- [Project Structure](./PROJECT_STRUCTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
