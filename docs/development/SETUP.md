# Development Setup

## Prerequisites

### Required Software
- **Node.js:** v20.x eller senare (LTS)
- **npm:** Latest stable
- **Git:** För version control
- **Expo CLI:** `npm install -g expo-cli`

### Platform-Specific

#### iOS Development (macOS only)
- **Xcode:** Latest version från App Store
- **iOS Simulator:** Installeras med Xcode
- **CocoaPods:** `sudo gem install cocoapods`

#### Android Development
- **Android Studio:** Latest version
- **Android SDK:** API Level 33+
- **Android Emulator:** Via Android Studio

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-org/aiklubben-app.git
cd aiklubben-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

Create `.env` file:
```bash
cp .env.example .env
```

Add Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npm start
```

## Running the App

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Physical Device
1. Install Expo Go app
2. Scan QR code from terminal

## Project Structure

```
aiklubben-app/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── screens/           # App screens
│   ├── navigation/        # Navigation setup
│   ├── hooks/             # Custom hooks
│   ├── contexts/          # React contexts
│   ├── config/            # Configuration
│   ├── types/             # TypeScript types
│   └── lib/               # Utilities
├── assets/                # Static assets
│   └── images/
├── docs/                  # Documentation
├── .expo/                 # Expo config
├── App.tsx               # Entry point
├── app.json              # Expo config
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## Configuration Files

### app.json
Expo configuration:
```json
{
  "expo": {
    "name": "AI Klubben",
    "slug": "aiklubben-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0C0A17"
    }
  }
}
```

### tsconfig.json
TypeScript configuration:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### tailwind.config.js
NativeWind configuration:
```javascript
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      }
    }
  }
}
```

## Development Tools

### VS Code Extensions
Rekommenderade extensions:
- ESLint
- Prettier
- TypeScript
- React Native Tools
- Tailwind CSS IntelliSense

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Scripts

### Development
```bash
npm start              # Start Metro bundler
npm run ios           # Run on iOS
npm run android       # Run on Android
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run type-check    # TypeScript check
```

### Build
```bash
npm run build         # Production build
```

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npx expo start -c

# Reset everything
rm -rf node_modules
npm install
npx expo start -c
```

### iOS Simulator Issues
```bash
# Reset simulator
xcrun simctl erase all

# Reinstall pods
cd ios && pod install && cd ..
```

### Android Emulator Issues
```bash
# Clear Android cache
cd android
./gradlew clean
cd ..
```

### TypeScript Errors
```bash
# Check for errors
npx tsc --noEmit

# Restart TypeScript server in VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

## Database Setup

### Supabase Local Development
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db push
```

### Seed Data
```bash
# Run seed script
npm run db:seed
```

## Testing

### Unit Tests (Planned)
```bash
npm test
```

### E2E Tests (Planned)
```bash
npm run test:e2e
```

## Next Steps

1. Read [Development Workflow](./WORKFLOW.md)
2. Review [Code Style Guide](./CODE_STYLE.md)
3. Check [Architecture Overview](../architecture/OVERVIEW.md)

## Getting Help

- Check [Troubleshooting](../troubleshooting/COMMON_ISSUES.md)
- Review [FAQ](../troubleshooting/FAQ.md)
- Contact development team
