---
description: Deploy app to Apple App Store via EAS
---

# Deploy iOS App to Apple App Store

This workflow guides you through deploying the AI Klubben app to the Apple App Store using Expo Application Services (EAS).

## Prerequisites

- Expo account (logged in via `eas login`)
- Apple Developer account
- EAS CLI installed globally (`npm install -g eas-cli`)

## Initial Deployment (First Time Only)

### 1. Configure Project

Ensure `app.json` has required iOS configuration:
- `bundleIdentifier`: `nu.aiklubben.app`
- `buildNumber`: Auto-incremented by EAS
- `version`: Semantic version (e.g., `1.0.0`)

### 2. Initialize EAS Project

```bash
eas project:init
```

Select your Expo account/organization when prompted.

### 3. Build for iOS

```bash
eas build --platform ios --profile production
```

This will:
- Generate/reuse Apple signing credentials
- Build the app in the cloud (~10-20 minutes)
- Provide a `.ipa` file download link

### 4. Submit to App Store Connect

```bash
eas submit --platform ios --latest
```

This will:
- Upload the build to App Store Connect
- Create the app listing if it doesn't exist
- Generate App Store Connect API key (first time)

### 5. Complete App Store Connect Setup

Go to [App Store Connect](https://appstoreconnect.apple.com) and:
- Add app description and metadata
- Upload screenshots (required for different iPhone sizes)
- Set app category
- Add privacy policy URL
- Add support URL
- Submit for review

## Updating the App (Subsequent Releases)

### For Native Changes (new dependencies, iOS config changes)

1. **Update version in `app.json`:**
```json
"version": "1.0.1"
```
(buildNumber auto-increments)

2. **Build new version:**
```bash
eas build --platform ios --profile production
```

3. **Submit to App Store:**
```bash
eas submit --platform ios --latest
```

4. **Update metadata in App Store Connect** (if needed)

5. **Submit for review**

### For JavaScript/UI Changes Only (OTA Updates)

For quick fixes that don't require App Store review:

```bash
eas update --branch production --message "Description of changes"
```

**Note:** OTA updates only work for JS/React code changes, not native dependencies.

## Build Profiles

Defined in `eas.json`:

- **production**: Full App Store builds with auto-increment
- **preview**: Internal testing builds
- **development**: Development builds with dev client

## Common Issues

### Missing Assets
If icon/splash screen are missing, either:
- Add `icon.png` (1024x1024) and `splash.png` to `assets/` folder
- Use [Expo Icon Generator](https://icon.kitchen/)

### Apple Server Errors
If you get "Internal Server Error" from Apple:
- Wait a few minutes and retry
- Check [Apple System Status](https://developer.apple.com/system-status/)

### TestFlight Group Creation Failed
This is not critical - you can manually create TestFlight groups in App Store Connect.

## Useful Commands

```bash
# Check build status
eas build:list

# View project info
eas project:info

# Check credentials
eas credentials

# View logs for specific build
eas build:view [build-id]
```

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
