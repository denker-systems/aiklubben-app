# AI Klubben - Component Library

## Architecture Overview

This component library follows **Atomic Design** principles for React Native, ensuring consistent, reusable, and maintainable code across the application.

### Directory Structure

```
src/components/
├── ui/                    # Reusable UI components (atoms & molecules)
│   ├── Text.tsx          # Typography component
│   ├── Button.tsx        # Button variants
│   ├── Badge.tsx         # Status/category badges
│   ├── Card.tsx          # Basic card container
│   ├── Input.tsx         # Form inputs
│   ├── MenuButton.tsx    # Hamburger menu trigger
│   ├── ScreenHeader.tsx  # Page header with title/subtitle
│   ├── SectionHeader.tsx # Section titles with icons
│   ├── GradientIconBadge.tsx # Emoji with gradient background
│   ├── StatBadge.tsx     # Stats display (XP, streak, etc.)
│   ├── LargeCard.tsx     # Feature cards with images
│   ├── FloatingOrbs.tsx  # Decorative background elements
│   ├── FloatingTabBar.tsx # Bottom navigation
│   └── index.ts          # Barrel exports
├── layout/               # Layout wrappers
│   └── ScreenWrapper.tsx
└── menu/                 # Menu-specific components
    └── MenuItem.tsx
```

---

## Component Catalog

### Atoms (Building Blocks)

#### `MenuButton`

Hamburger menu trigger button.

```tsx
import { MenuButton } from '@/components/ui';

<MenuButton size="medium" />
<MenuButton size="small" onPress={customHandler} />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'small' \| 'medium' \| 'large' | 'medium' | Button size |
| onPress | () => void | Opens menu | Custom handler |
| style | ViewStyle | - | Additional styles |

---

#### `GradientIconBadge`

Emoji displayed inside a gradient circle.

```tsx
import { GradientIconBadge } from '@/components/ui';

<GradientIconBadge emoji="🚀" gradient={['#8B5CF6', '#6366f1']} size="large" delay={200} />;
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| emoji | string | required | Emoji to display |
| gradient | [string, string] | required | Gradient colors |
| size | 'small' \| 'medium' \| 'large' \| 'xlarge' | 'medium' | Badge size |
| animated | boolean | true | Enable entrance animation |
| delay | number | 0 | Animation delay (ms) |

---

#### `StatBadge`

Compact stat display with emoji, value, and label.

```tsx
import { StatBadge } from '@/components/ui';

<StatBadge emoji="⚡" value={150} label="XP" gradient={['#8B5CF6', '#6366f1']} delay={200} />;
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| emoji | string | required | Icon emoji |
| value | string \| number | required | Main value |
| label | string | required | Description label |
| gradient | [string, string] | required | Icon gradient |
| animated | boolean | true | Enable animation |
| delay | number | 0 | Animation delay |

---

### Molecules (Combinations)

#### `ScreenHeader`

Full-width header with title, subtitle, orbs, and menu button.

```tsx
import { ScreenHeader } from '@/components/ui';

<ScreenHeader title="Kurser" subtitle="Lär dig AI steg för steg" showMenu={true} showOrbs={true} />;
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | required | Main heading |
| subtitle | string | - | Subheading |
| showMenu | boolean | true | Show hamburger |
| showOrbs | boolean | true | Show floating orbs |
| orbsVariant | 'default' \| 'header' \| 'menu' \| 'profile' | 'header' | Orb configuration |
| rightContent | ReactNode | - | Custom right content |
| leftContent | ReactNode | - | Custom left content |
| animated | boolean | true | Enable animation |

---

#### `SectionHeader`

Section title with optional emoji icon and action button.

```tsx
import { SectionHeader } from '@/components/ui';

<SectionHeader
  title="Fortsätt lära"
  subtitle="Där du slutade"
  emoji="📚"
  gradient={['#6366f1', '#8b5cf6']}
  action="Visa alla"
  onActionPress={() => navigate('Courses')}
/>;
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | required | Section title |
| subtitle | string | - | Description |
| emoji | string | - | Icon emoji |
| gradient | [string, string] | purple | Icon gradient |
| action | string | - | Action button text |
| onActionPress | () => void | - | Action handler |

---

#### `LargeCard`

Feature card with image background, gradient overlay, and content.

```tsx
import { LargeCard } from '@/components/ui';

<LargeCard
  title="Introduction to AI"
  subtitle="Learn the basics of artificial intelligence"
  imageUrl="https://example.com/image.jpg"
  badge="📚 Kurser"
  badgeColor="#8B5CF6"
  height={220}
  featured={true}
  onPress={() => navigate('CourseDetail', { id: 1 })}
  delay={300}
/>;
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | required | Card title |
| subtitle | string | - | Card description |
| imageUrl | string \| null | - | Background image |
| badge | string | - | Badge text |
| badgeColor | string | '#8B5CF6' | Badge background |
| gradient | [string, string] | purple | Fallback gradient |
| height | number | 180 | Card height |
| featured | boolean | false | Show star badge |
| onPress | () => void | - | Tap handler |
| animated | boolean | true | Enable animation |
| delay | number | 0 | Animation delay |

---

#### `FloatingOrbs`

Decorative background blobs for visual depth.

```tsx
import { FloatingOrbs } from '@/components/ui';

<FloatingOrbs variant="header" visible={true} />;
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'header' \| 'menu' \| 'profile' | 'default' | Orb configuration |
| visible | boolean | true | Control visibility |
| animated | boolean | true | Enable animation |

---

## Design Tokens

### Colors (Brand)

```typescript
const brandColors = {
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F59E0B',
  green: '#10B981',
  blue: '#3B82F6',
};
```

### Gradients

```typescript
const gradients = {
  purple: ['#6366f1', '#8b5cf6'],
  pink: ['#ff3366', '#f43f5e'],
  green: ['#00d8a2', '#0ea5e9'],
  orange: ['#f97316', '#ea580c'],
};
```

### Animation Configs

```typescript
import { SPRING_CONFIGS, TIMING_CONFIGS } from '@/lib/animations';

// Usage with Moti
<MotiView transition={SPRING_CONFIGS.bouncy} />
<MotiView transition={SPRING_CONFIGS.smooth} />
<MotiView transition={TIMING_CONFIGS.fast} />
```

---

## Usage Guidelines

### 1. Always import from barrel

```tsx
// ✅ Good
import { ScreenHeader, LargeCard, StatBadge } from '@/components/ui';

// ❌ Bad
import { ScreenHeader } from '@/components/ui/ScreenHeader';
```

### 2. Use consistent animation delays

```tsx
// Stagger items by 100ms
{
  items.map((item, index) => <LargeCard delay={300 + index * 100} />);
}
```

### 3. Prefer composition over customization

```tsx
// ✅ Good - compose components
<ScreenHeader title="Page" rightContent={<CustomButton />} />

// ❌ Bad - add props for every use case
<ScreenHeader customButtonType="special" customButtonColor="red" />
```

### 4. Keep screens thin

Screens should primarily:

- Fetch data
- Manage local state
- Compose components

Business logic and complex UI should live in components/hooks.

---

## Migration Guide

To refactor an existing screen to use the new components:

1. Replace manual headers with `<ScreenHeader />`
2. Replace section titles with `<SectionHeader />`
3. Replace custom cards with `<LargeCard />`
4. Replace stat displays with `<StatBadge />`
5. Replace emoji+gradient combinations with `<GradientIconBadge />`
6. Remove duplicate style definitions

**Before:**

```tsx
<View style={styles.header}>
  <FloatingOrbs variant="header" />
  <Text style={styles.title}>Kurser</Text>
  <Pressable onPress={openMenu}>...</Pressable>
</View>
```

**After:**

```tsx
<ScreenHeader title="Kurser" subtitle="Lär dig AI" />
```
