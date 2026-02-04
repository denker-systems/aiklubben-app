# Architecture Overview

## 🏗️ System Architecture

AI Klubben är en React Native mobilapp med en modern, skalbar arkitektur.

## Tech Stack

### Frontend
- **React Native:** 0.76.6 (via Expo SDK 52)
- **TypeScript:** Strikt typning för säkerhet
- **Expo:** Managed workflow för snabb utveckling
- **NativeWind:** Tailwind CSS för React Native

### Backend
- **Supabase:** PostgreSQL databas + Auth + Storage
- **REST API:** Auto-genererad från Supabase
- **Row Level Security (RLS):** Säker dataåtkomst

### State Management
- **React Context:** Global state (Auth, Theme, Menu, Language)
- **React Hooks:** Lokal komponent-state
- **Custom Hooks:** useAuth, use3DEffects, useAnimationConfig

### Navigation
- **React Navigation:** Native Stack Navigator
- **Tab-based:** FloatingTabBar för huvudnavigation
- **Deep Linking:** Support för externa länkar

### Styling & Animation
- **NativeWind:** Tailwind CSS utilities
- **Moti:** Deklarativa animationer (Reanimated 2)
- **Custom Design System:** Färger, typografi, spacing

## Project Structure

```
src/
├── components/          # Återanvändbara komponenter
│   ├── layout/         # Layout-komponenter
│   └── ui/             # UI-komponenter
├── config/             # Konfiguration
│   ├── supabase.ts     # Supabase client
│   ├── theme.ts        # Tema-konfiguration
│   └── design.ts       # Design tokens
├── contexts/           # React Contexts
│   ├── LanguageContext.tsx
│   ├── MenuContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom hooks
│   ├── useAuth.ts
│   └── use3DEffects.ts
├── navigation/         # Navigation setup
│   └── AppNavigator.tsx
├── screens/            # App screens
│   ├── auth/
│   ├── courses/
│   ├── lessons/
│   ├── home/
│   ├── news/
│   ├── content/
│   └── profile/
├── types/              # TypeScript types
│   ├── gamification.ts
│   └── navigation.ts
└── lib/                # Utilities
    └── animations.ts
```

## Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Supabase Client (API Call)
    ↓
PostgreSQL Database
    ↓
RLS Policy Check
    ↓
Response Data
    ↓
Component State Update
    ↓
UI Re-render
```

## Key Architectural Decisions

### 1. Expo Managed Workflow
- **Varför:** Snabbare utveckling, enklare deployment
- **Tradeoff:** Begränsad till Expo-moduler

### 2. Supabase Backend
- **Varför:** PostgreSQL + Auth + Storage i ett paket
- **Tradeoff:** Vendor lock-in

### 3. Context API över Redux
- **Varför:** Enklare för mindre apps, mindre boilerplate
- **Tradeoff:** Kan bli komplext vid mycket state

### 4. NativeWind över Styled Components
- **Varför:** Tailwind-syntax, snabbare utveckling
- **Tradeoff:** Mindre TypeScript-säkerhet för styles

## Performance Considerations

- **Lazy Loading:** Screens laddas on-demand
- **Memoization:** React.memo för tunga komponenter
- **Image Optimization:** expo-image med caching
- **Animation:** Moti använder native driver

## Security

- **Row Level Security (RLS):** Alla tabeller har RLS policies
- **JWT Tokens:** Supabase Auth för säker autentisering
- **Secure Storage:** expo-secure-store för känslig data
- **Input Validation:** Zod schemas för formulär

## Scalability

- **Modular Structure:** Features är isolerade
- **Reusable Components:** DRY-princip
- **Type Safety:** TypeScript förhindrar runtime-fel
- **Database Indexing:** Optimerade queries

## Next Steps

- [Tech Stack Details](./TECH_STACK.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Integration](../api/SUPABASE.md)
