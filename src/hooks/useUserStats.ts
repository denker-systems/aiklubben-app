import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/hooks/useAuth';
import { getLevelForXP, getXPProgress, getNextLevel } from '@/types/gamification';
import type { UserLevel } from '@/types/gamification';

export interface UserStatsData {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  articlesRead: number;
  badgesEarned: string[];
  lastActivityDate: string | null;
}

interface UseUserStatsReturn {
  stats: UserStatsData;
  level: UserLevel;
  nextLevel: UserLevel | null;
  xpProgress: { current: number; max: number; percentage: number };
  loading: boolean;
  refetch: () => Promise<void>;
}

// Calculate which badges the user has earned based on their stats
function computeEarnedBadges(stats: UserStatsData): string[] {
  const earned: string[] = [];

  // Learning badges - based on lessons_completed
  if (stats.lessonsCompleted >= 1) earned.push('first_lesson');
  if (stats.lessonsCompleted >= 10) earned.push('lessons_10');
  if (stats.lessonsCompleted >= 50) earned.push('lessons_50');
  if (stats.lessonsCompleted >= 100) earned.push('lessons_100');

  // Streak badges - based on longest_streak
  if (stats.longestStreak >= 7) earned.push('streak_7');
  if (stats.longestStreak >= 30) earned.push('streak_30');
  if (stats.longestStreak >= 100) earned.push('streak_100');

  // Explorer badges - based on articles_read
  if (stats.articlesRead >= 1) earned.push('first_article');
  if (stats.articlesRead >= 20) earned.push('articles_20');

  // Special badges - always earned for beta users (all current users)
  earned.push('early_adopter');

  return earned;
}

const DEFAULT_STATS: UserStatsData = {
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  lessonsCompleted: 0,
  articlesRead: 0,
  badgesEarned: [],
  lastActivityDate: null,
};

export function useUserStats(): UseUserStatsReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStatsData>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(DEFAULT_STATS);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'total_xp, current_streak, longest_streak, lessons_completed, articles_read, last_activity_date',
        )
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.warn('[useUserStats] No profile data found, using defaults');
        const defaultWithBadges = { ...DEFAULT_STATS };
        defaultWithBadges.badgesEarned = computeEarnedBadges(defaultWithBadges);
        setStats(defaultWithBadges);
      } else {
        const rawStats: UserStatsData = {
          totalXP: data.total_xp || 0,
          currentStreak: data.current_streak || 0,
          longestStreak: data.longest_streak || 0,
          lessonsCompleted: data.lessons_completed || 0,
          articlesRead: data.articles_read || 0,
          badgesEarned: [],
          lastActivityDate: data.last_activity_date || null,
        };
        // Compute badges from actual stats
        rawStats.badgesEarned = computeEarnedBadges(rawStats);
        setStats(rawStats);
      }
    } catch (err) {
      console.error('[useUserStats] Error fetching stats:', err);
      const defaultWithBadges = { ...DEFAULT_STATS };
      defaultWithBadges.badgesEarned = computeEarnedBadges(defaultWithBadges);
      setStats(defaultWithBadges);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const level = getLevelForXP(stats.totalXP);
  const nextLevel = getNextLevel(stats.totalXP);
  const xpProgress = getXPProgress(stats.totalXP);

  return { stats, level, nextLevel, xpProgress, loading, refetch: fetchStats };
}
