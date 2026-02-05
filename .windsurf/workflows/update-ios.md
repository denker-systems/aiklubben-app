---
description: Quick guide for updating the iOS app
---

# Update iOS App

Quick reference for pushing updates to the App Store.

## Step 1: Update Version

Edit `app.json`:
```json
"version": "1.0.1"  // Increment: 1.0.0 -> 1.0.1 -> 1.1.0 -> 2.0.0
```

(buildNumber auto-increments automatically)

## Step 2: Build

// turbo
```bash
eas build --platform ios --profile production
```

Wait ~10-20 minutes for build to complete.

## Step 3: Submit

// turbo
```bash
eas submit --platform ios --latest
```

## Step 4: App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Update "What's New" section with release notes
3. Submit for review

---

## Quick OTA Update (No App Store Review)

For JS/UI changes only (no native dependencies):

// turbo
```bash
eas update --branch production --message "Bug fixes and improvements"
```

Users get update instantly, no review needed.
