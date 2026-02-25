// Gamification Types & Interfaces

export interface UserLevel {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
}

export const LEVELS: UserLevel[] = [
  { level: 1, name: 'Nybörjare', minXP: 0, maxXP: 100, color: '#9CA3AF', icon: '🌱' },
  { level: 2, name: 'Utforskare', minXP: 100, maxXP: 300, color: '#60A5FA', icon: '🔍' },
  { level: 3, name: 'Lärling', minXP: 300, maxXP: 600, color: '#34D399', icon: '📚' },
  { level: 4, name: 'Praktikant', minXP: 600, maxXP: 1000, color: '#FBBF24', icon: '⚡' },
  { level: 5, name: 'Specialist', minXP: 1000, maxXP: 2000, color: '#F472B6', icon: '🎯' },
  { level: 6, name: 'Expert', minXP: 2000, maxXP: 4000, color: '#A78BFA', icon: '💎' },
  { level: 7, name: 'Mästare', minXP: 4000, maxXP: 8000, color: '#F59E0B', icon: '👑' },
  { level: 8, name: 'AI Guru', minXP: 8000, maxXP: Infinity, color: '#EC4899', icon: '🚀' },
];

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'explorer' | 'community' | 'special';
  requirement: number;
  color: string;
}

export const BADGES: Badge[] = [
  // Learning badges
  {
    id: 'first_lesson',
    name: 'Första Steget',
    description: 'Slutför din första lektion',
    icon: '🎓',
    category: 'learning',
    requirement: 1,
    color: '#60A5FA',
  },
  {
    id: 'lessons_10',
    name: 'Kunskapstörstande',
    description: 'Slutför 10 lektioner',
    icon: '📖',
    category: 'learning',
    requirement: 10,
    color: '#34D399',
  },
  {
    id: 'lessons_50',
    name: 'Bokmal',
    description: 'Slutför 50 lektioner',
    icon: '🦉',
    category: 'learning',
    requirement: 50,
    color: '#A78BFA',
  },
  {
    id: 'lessons_100',
    name: 'AI Akademiker',
    description: 'Slutför 100 lektioner',
    icon: '🎖️',
    category: 'learning',
    requirement: 100,
    color: '#F59E0B',
  },

  // Streak badges
  {
    id: 'streak_7',
    name: 'Veckohjälte',
    description: '7 dagars streak',
    icon: '🔥',
    category: 'streak',
    requirement: 7,
    color: '#F97316',
  },
  {
    id: 'streak_30',
    name: 'Månadsmaraton',
    description: '30 dagars streak',
    icon: '💪',
    category: 'streak',
    requirement: 30,
    color: '#EF4444',
  },
  {
    id: 'streak_100',
    name: 'Legendär Streak',
    description: '100 dagars streak',
    icon: '⚡',
    category: 'streak',
    requirement: 100,
    color: '#EC4899',
  },

  // Explorer badges
  {
    id: 'all_categories',
    name: 'Allvetare',
    description: 'Utforska alla kategorier',
    icon: '🗺️',
    category: 'explorer',
    requirement: 1,
    color: '#8B5CF6',
  },
  {
    id: 'first_article',
    name: 'Nyhetsläsare',
    description: 'Läs din första artikel',
    icon: '📰',
    category: 'explorer',
    requirement: 1,
    color: '#06B6D4',
  },
  {
    id: 'articles_20',
    name: 'Informerad',
    description: 'Läs 20 artiklar',
    icon: '🧠',
    category: 'explorer',
    requirement: 20,
    color: '#14B8A6',
  },

  // Community badges
  {
    id: 'first_share',
    name: 'Delningsglad',
    description: 'Dela ditt första innehåll',
    icon: '🤝',
    category: 'community',
    requirement: 1,
    color: '#3B82F6',
  },

  // Special badges
  {
    id: 'early_adopter',
    name: 'Tidig Användare',
    description: 'Gick med under beta',
    icon: '🌟',
    category: 'special',
    requirement: 1,
    color: '#FBBF24',
  },
  {
    id: 'beta_tester',
    name: 'Beta Testare',
    description: 'Hjälpte till att testa appen',
    icon: '🔬',
    category: 'special',
    requirement: 1,
    color: '#A855F7',
  },
];

export interface UserStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  articlesRead: number;
  coursesCompleted: number;
  badgesEarned: string[];
  lastActiveDate: string;
}

export interface XPEvent {
  type: 'lesson' | 'article' | 'quiz' | 'login' | 'streak_bonus' | 'achievement';
  amount: number;
  description: string;
}

export const XP_VALUES: Record<XPEvent['type'], number> = {
  lesson: 25,
  article: 15,
  quiz: 35,
  login: 5,
  streak_bonus: 10,
  achievement: 50,
};

// Helper functions
export function getLevelForXP(xp: number): UserLevel {
  return LEVELS.find((level) => xp >= level.minXP && xp < level.maxXP) || LEVELS[LEVELS.length - 1];
}

export function getXPProgress(xp: number): { current: number; max: number; percentage: number } {
  const level = getLevelForXP(xp);
  const current = xp - level.minXP;
  const max = level.maxXP - level.minXP;
  const percentage = Math.min((current / max) * 100, 100);
  return { current, max, percentage };
}

export function getNextLevel(xp: number): UserLevel | null {
  const currentLevel = getLevelForXP(xp);
  const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
  return nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;
}

export function getBadgesByCategory(category: Badge['category']): Badge[] {
  return BADGES.filter((badge) => badge.category === category);
}

// Daily Quest Types
export type QuestType = 'complete_lesson' | 'answer_correct' | 'maintain_streak' | 'perfect_lesson';

export interface DailyQuest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
}

export const DAILY_QUEST_TEMPLATES: Omit<DailyQuest, 'id' | 'progress' | 'completed'>[] = [
  {
    type: 'complete_lesson',
    title: 'Lektionsmästare',
    description: 'Slutför 1 lektion',
    icon: '📚',
    target: 1,
    xpReward: 10,
  },
  {
    type: 'answer_correct',
    title: 'Kunskapsjägare',
    description: 'Svara rätt på 5 frågor',
    icon: '✅',
    target: 5,
    xpReward: 15,
  },
  {
    type: 'maintain_streak',
    title: 'Streak-väktare',
    description: 'Behåll din streak',
    icon: '🔥',
    target: 1,
    xpReward: 5,
  },
  {
    type: 'perfect_lesson',
    title: 'Perfektionist',
    description: 'Slutför en lektion utan fel',
    icon: '💎',
    target: 1,
    xpReward: 25,
  },
];

// Treasure Chest Types
export type TreasureRewardType = 'xp' | 'streak_freeze' | 'badge_progress';

export interface TreasureReward {
  type: TreasureRewardType;
  amount: number;
  title: string;
  description: string;
  icon: string;
}

export const TREASURE_REWARDS: TreasureReward[] = [
  { type: 'xp', amount: 10, title: 'Bonus XP', description: '+10 XP', icon: '⚡' },
  { type: 'xp', amount: 25, title: 'XP-skatt', description: '+25 XP', icon: '💰' },
  { type: 'xp', amount: 50, title: 'XP-jackpot!', description: '+50 XP', icon: '🎉' },
  {
    type: 'streak_freeze',
    amount: 1,
    title: 'Streak Freeze',
    description: '+1 Streak Freeze',
    icon: '🧊',
  },
];

// Random treasure reward (20% chance)
export function getRandomTreasure(): TreasureReward | null {
  if (Math.random() > 0.2) return null; // 80% chance of no reward

  const weights = [50, 30, 10, 10]; // Probability weights
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < TREASURE_REWARDS.length; i++) {
    random -= weights[i];
    if (random <= 0) return TREASURE_REWARDS[i];
  }

  return TREASURE_REWARDS[0];
}

// Generate today's quests (select 3 random quests)
export function generateDailyQuests(): DailyQuest[] {
  const shuffled = [...DAILY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((template, index) => ({
    ...template,
    id: `quest_${Date.now()}_${index}`,
    progress: 0,
    completed: false,
  }));
}
