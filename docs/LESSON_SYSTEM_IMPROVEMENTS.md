# Lesson System Improvements

Based on research from Duolingo, Brilliant, and Khan Academy.

## Research Summary

### Duolingo - Key Insights

| Feature | Impact | Implementation |
|---------|--------|----------------|
| **Streaks** | +60% retention, 3.6x more likely to stay engaged after 7 days | ✅ Already implemented |
| **Streak Freeze** | -21% churn for at-risk users | ❌ Missing |
| **XP Leaderboards** | +40% more lessons completed | ❌ Missing |
| **Leagues** | +25% lesson completion | ❌ Missing |
| **Double XP Events** | +50% activity surge | ❌ Missing |
| **Badges** | +30% course completion, +116% referrals | ⚠️ Partial |
| **Daily Quests** | +25% DAU | ❌ Missing |
| **Treasure Chests** | +15% lesson completion (random rewards) | ❌ Missing |
| **Mascot Notifications** | +5% DAU | ❌ Missing |
| **Instant Feedback** | Higher motivation through positive reinforcement | ✅ Already implemented |

### Brilliant - Key Insights

| Feature | Benefit |
|---------|---------|
| **Bite-sized lessons** | 5-15 min, fits in daily routine | ✅ Already implemented |
| **Visual & Interactive** | Complex concepts feel intuitive | ⚠️ Partial (need more) |
| **Targeted practice** | Adapts to user skill level | ❌ Missing |
| **Custom feedback** | Catches mistakes as you learn | ✅ Already implemented |
| **Progress tracking** | See mastered concepts | ⚠️ Partial |
| **Learning by doing** | Problem-solving over passive reading | ✅ Already implemented |

### Khan Academy - Key Insights

| Feature | Benefit |
|---------|---------|
| **Mastery Levels** | Practiced → Level 1 → Level 2 → Mastered | ❌ Missing |
| **Unit Challenges** | Test knowledge, earn extra XP | ❌ Missing |
| **Progress Bars per Skill** | Clear visual of skill progress | ⚠️ Partial |
| **Personalized Learning Paths** | Adapts to knowledge gaps | ❌ Missing |
| **Energy Points** | Points for all activities | ⚠️ Partial |
| **Challenge Mode** | Test yourself against previous scores | ❌ Missing |

---

## Prioritized Improvements

### Phase 1: High Impact, Low Effort (Immediate)

#### 1. Streak Freeze Feature
**Impact:** -21% churn  
**Effort:** Low

- Allow users to "freeze" their streak for 1 day
- Cost: 50 gems/coins OR earned through 7-day streak
- Max 2 freezes stored at a time

#### 2. Daily Quests System
**Impact:** +25% DAU  
**Effort:** Medium

Quests refresh daily at midnight:
- Complete 1 lesson (+10 XP bonus)
- Answer 5 questions correctly (+15 XP bonus)
- Maintain streak (+5 XP bonus)
- Complete a perfect lesson (+25 XP bonus)

#### 3. Random Treasure Rewards
**Impact:** +15% lesson completion  
**Effort:** Low

- 20% chance of bonus reward after lesson completion
- Rewards: Extra XP (10-50), Streak Freeze, Badge progress

### Phase 2: Engagement Boosters (Short-term)

#### 4. Weekly Leaderboard
**Impact:** +40% lessons completed  
**Effort:** Medium

- Top 10 learners per week
- Leagues: Bronze → Silver → Gold → Platinum → Diamond
- Promotion/demotion based on weekly XP

#### 5. Skill Mastery Levels
**Impact:** Higher long-term retention  
**Effort:** Medium

Progress per lesson topic:
```
Familiar (1 completion) → Proficient (3 completions, >70% avg)
→ Master (5 completions, >85% avg) → Expert (10 completions, >95% avg)
```

#### 6. Achievement System Expansion
**Impact:** +30% course completion  
**Effort:** Medium

New badge categories:
- **Speed Demon**: Complete 3 lessons in one day
- **Perfect Week**: 7-day streak with all perfect scores
- **Night Owl**: Complete lesson after 10 PM
- **Early Bird**: Complete lesson before 8 AM
- **Comeback Kid**: Return after 7+ days inactive
- **Course Champion**: 100% completion on a course

### Phase 3: Advanced Features (Long-term)

#### 7. Double XP Events
**Impact:** +50% activity  
**Effort:** Medium

- Weekend events (Saturday-Sunday)
- Special holiday events
- Push notifications to announce events

#### 8. Personalized Learning Path
**Impact:** Higher skill acquisition  
**Effort:** High

- Diagnostic quiz at course start
- Skip lessons user already knows
- Recommend review based on weak areas

#### 9. Challenge Mode
**Impact:** Increased replayability  
**Effort:** Medium

- Replay completed lessons for better score
- Time-attack mode (faster = more XP)
- Compare scores with previous attempts

---

## Database Schema Updates Required

```sql
-- Daily quests
CREATE TABLE user_daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  quest_type TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streak freezes
ALTER TABLE profiles ADD COLUMN streak_freezes INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN streak_freeze_used_today BOOLEAN DEFAULT FALSE;

-- Skill mastery
CREATE TABLE user_skill_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  skill_id TEXT NOT NULL,
  completions INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  mastery_level TEXT DEFAULT 'none',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard (weekly snapshot)
CREATE TABLE weekly_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  week_start DATE NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  league TEXT DEFAULT 'bronze',
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements/Badges
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  achievement_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

---

## UI/UX Components Needed

### New Screens
1. **DailyQuestsCard** - Shows today's quests on HomeScreen
2. **LeaderboardScreen** - Weekly rankings with leagues
3. **AchievementsScreen** - All badges with progress
4. **SkillMasteryView** - Mastery levels per topic

### New Modals
1. **StreakFreezeModal** - Offer streak freeze when about to lose streak
2. **TreasureChestModal** - Random reward animation
3. **LevelUpModal** - League promotion celebration
4. **AchievementUnlockedModal** - Badge earned popup

### Enhanced Components
1. **LessonNode** - Show mastery level indicator
2. **CelebrationScreen** - Add quest completion, treasure chest
3. **ProfileScreen** - Add achievements section, league badge

---

## Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 P0 | Streak Freeze | 2h | High |
| 🔴 P0 | Daily Quests | 4h | High |
| 🟠 P1 | Treasure Rewards | 2h | Medium |
| 🟠 P1 | Achievement Expansion | 4h | Medium |
| 🟡 P2 | Weekly Leaderboard | 6h | High |
| 🟡 P2 | Skill Mastery | 4h | Medium |
| 🟢 P3 | Double XP Events | 3h | Medium |
| 🟢 P3 | Challenge Mode | 6h | Low |

---

## Success Metrics

Track these KPIs after implementation:

- **DAU/MAU ratio** (target: >25%)
- **7-day retention** (target: >40%)
- **30-day retention** (target: >20%)
- **Avg lessons/user/week** (target: >5)
- **Course completion rate** (target: >30%)
- **Streak length distribution**
