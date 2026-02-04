import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Image, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { Text, Badge, FloatingOrbs, TiltCard } from '@/components/ui';
import { useNavigation } from '@react-navigation/native';
import { SPRING_CONFIGS } from '@/lib/animations';
import { BADGES, getLevelForXP, getXPProgress, getNextLevel } from '@/types/gamification';

import { uiColors } from '@/config/design';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!statsError && statsData) {
          setStats({
            totalXP: statsData.total_xp || 150,
            currentStreak: statsData.current_streak || 3,
            longestStreak: statsData.longest_streak || 7,
            lessonsCompleted: statsData.lessons_completed || 5,
            articlesRead: statsData.articles_read || 12,
            badgesEarned: statsData.badges_earned || ['first_lesson', 'first_article'],
          });
        } else {
          // Demo data for development
          setStats({
            totalXP: 150,
            currentStreak: 3,
            longestStreak: 7,
            lessonsCompleted: 5,
            articlesRead: 12,
            badgesEarned: ['first_lesson', 'first_article'],
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const level = getLevelForXP(stats?.totalXP || 0);
  const nextLevel = getNextLevel(stats?.totalXP || 0);
  const xpProgress = getXPProgress(stats?.totalXP || 0);
  const roleEmoji = profile?.role === 'admin' ? '👑' : level.icon;

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.purple} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <MotiView
          style={[styles.heroSection, { paddingTop: insets.top + 20 }]}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={SPRING_CONFIGS.smooth}
        >
          {/* Floating orbs for depth */}
          <FloatingOrbs variant="profile" />

          {/* Avatar */}
          <MotiView
            style={styles.avatarContainer}
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING_CONFIGS.bouncy}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
              <Text style={styles.levelBadgeText}>{level.level}</Text>
            </View>
          </MotiView>

          {/* Name & Info */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 100 }}
            style={styles.userInfo}
          >
            <View style={styles.nameRow}>
              <Text variant="h2" style={styles.userName}>
                {profile?.name || 'Användare'}
              </Text>
              <Text style={styles.roleEmoji}>{roleEmoji}</Text>
            </View>
            <Text variant="body" style={styles.userEmail}>
              {user?.email}
            </Text>

            <View style={styles.badgeRow}>
              <Badge label={level.name} variant="primary" />
              {profile?.role === 'admin' && <Badge label="Admin" variant="secondary" />}
            </View>
          </MotiView>

          {/* XP Display with Emoji */}
          <MotiView
            style={styles.xpSection}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 200 }}
          >
            <View style={styles.xpDisplay}>
              <LinearGradient
                colors={['#8B5CF6', '#6366f1']}
                style={styles.xpIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.xpEmoji}>⚡</Text>
              </LinearGradient>
              <View>
                <Text style={styles.xpValue}>{stats?.totalXP || 0} XP</Text>
                <Text style={styles.xpLabel}>Nästa nivå: {nextLevel?.minXP || 'Max'} XP</Text>
              </View>
            </View>
            <View style={styles.xpProgressContainer}>
              <View style={styles.xpProgressTrack}>
                <View style={[styles.xpProgressFill, { width: `${xpProgress.percentage}%` }]} />
              </View>
            </View>
          </MotiView>
        </MotiView>

        {/* Stats Cards */}
        <View style={styles.content}>
          {/* Quick Stats Row */}
          <MotiView
            style={styles.quickStatsRow}
            from={{ opacity: 0, translateX: -30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 300 }}
          >
            <View style={styles.quickStat}>
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                style={styles.quickStatGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.quickStatEmoji}>🔥</Text>
              </LinearGradient>
              <View>
                <Text style={styles.quickStatValue}>{stats?.currentStreak || 0}</Text>
                <Text style={styles.quickStatLabel}>dagar</Text>
              </View>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.quickStatGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.quickStatEmoji}>📚</Text>
              </LinearGradient>
              <View>
                <Text style={styles.quickStatValue}>{stats?.lessonsCompleted || 0}</Text>
                <Text style={styles.quickStatLabel}>lektioner</Text>
              </View>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.quickStatGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.quickStatEmoji}>🏆</Text>
              </LinearGradient>
              <View>
                <Text style={styles.quickStatValue}>{stats?.badgesEarned?.length || 0}</Text>
                <Text style={styles.quickStatLabel}>badges</Text>
              </View>
            </View>
          </MotiView>

          {/* Streak Card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 400 }}
          >
            <TiltCard tiltAmount={2} scaleAmount={0.98} style={styles.streakCard}>
              <View style={styles.streakCardHeader}>
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  style={styles.streakCardIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.streakCardEmoji}>🔥</Text>
                </LinearGradient>
                <View>
                  <Text style={styles.streakCardTitle}>Streak</Text>
                  <Text style={styles.streakCardSubtitle}>Håll igång!</Text>
                </View>
                <View style={styles.streakCardValue}>
                  <Text style={styles.streakCardNumber}>{stats?.currentStreak || 0}</Text>
                  <Text style={styles.streakCardDays}>dagar</Text>
                </View>
              </View>
              <View style={styles.streakCardStats}>
                <View style={styles.streakCardStat}>
                  <Text style={styles.streakStatLabel}>Längsta streak</Text>
                  <Text style={styles.streakStatValue}>{stats?.longestStreak || 0} dagar 🌟</Text>
                </View>
                <View style={styles.streakCardStat}>
                  <Text style={styles.streakStatLabel}>Nästa milstolpe</Text>
                  <Text style={styles.streakStatValue}>7 dagar 🎯</Text>
                </View>
              </View>
            </TiltCard>
          </MotiView>

          {/* Badges Section */}
          <MotiView
            style={styles.section}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 500 }}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>✨</Text>
              <Text variant="h3" style={styles.sectionTitle}>
                Dina Badges
              </Text>
            </View>
            <View style={styles.badgesGrid}>
              {BADGES.slice(0, 6).map((badge, index) => {
                const isUnlocked = stats?.badgesEarned?.includes(badge.id);
                return (
                  <MotiView
                    key={badge.id}
                    style={[styles.badgeItem, !isUnlocked && styles.badgeItemLocked]}
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...SPRING_CONFIGS.bouncy, delay: 550 + index * 50 }}
                  >
                    <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                    <Text style={styles.badgeName} numberOfLines={1}>
                      {badge.name}
                    </Text>
                  </MotiView>
                );
              })}
            </View>
          </MotiView>

          {/* Actions */}
          <MotiView
            style={styles.actionsSection}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 600 }}
          >
            <TiltCard
              onPress={() => navigation.navigate('Settings')}
              tiltAmount={2}
              scaleAmount={0.98}
              style={styles.actionButton}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6366f1']}
                style={styles.actionIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.actionEmoji}>⚙️</Text>
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text variant="body" style={styles.actionTitle}>
                  Inställningar
                </Text>
                <Text variant="caption" style={styles.actionSubtitle}>
                  Konto och app-inställningar
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TiltCard>

            <TiltCard
              onPress={() => signOut()}
              tiltAmount={2}
              scaleAmount={0.98}
              style={[styles.actionButton, styles.logoutButton]}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.actionIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.actionEmoji}>🚪</Text>
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text variant="body" style={[styles.actionTitle, { color: '#EF4444' }]}>
                  Logga ut
                </Text>
                <Text variant="caption" style={styles.actionSubtitle}>
                  Avsluta din session
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TiltCard>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0A17',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  // Removed static orbs - now using FloatingOrbs component
  _heroOrb1: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: brandColors.purple,
    opacity: 0.15,
  },
  _heroOrb2: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: brandColors.pink,
    opacity: 0.1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: brandColors.purple,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 3,
    borderColor: brandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: brandColors.purple,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0C0A17',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: '#F9FAFB',
  },
  roleEmoji: {
    fontSize: 24,
  },
  userEmail: {
    color: '#9CA3AF',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  xpSection: {
    width: '100%',
  },
  xpDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  xpIconGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpEmoji: {
    fontSize: 26,
  },
  xpValue: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
  },
  xpLabel: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  xpProgressContainer: {
    width: '100%',
  },
  xpProgressTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: brandColors.purple,
    borderRadius: 5,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  quickStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatEmoji: {
    fontSize: 22,
  },
  quickStatValue: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },
  quickStatLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  streakCard: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: uiColors.card.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
    overflow: 'hidden',
  },
  streakCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakCardIconGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  streakCardEmoji: {
    fontSize: 26,
  },
  streakCardTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },
  streakCardSubtitle: {
    color: '#F97316',
    fontSize: 13,
  },
  streakCardValue: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  streakCardNumber: {
    color: '#F97316',
    fontSize: 32,
    fontWeight: '800',
  },
  streakCardDays: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  streakCardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  streakCardStat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  streakStatLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  streakStatValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionEmoji: {
    fontSize: 22,
  },
  sectionTitle: {
    color: '#F9FAFB',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: '30%',
    backgroundColor: uiColors.card.background,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: uiColors.card.border,
  },
  badgeItemLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    color: '#F9FAFB',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsSection: {
    gap: 16,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: uiColors.card.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: uiColors.card.border,
    gap: 16,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEmoji: {
    fontSize: 26,
  },
  actionArrow: {
    fontSize: 28,
    color: '#6B7280',
    fontWeight: '300',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: '#F9FAFB',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  actionSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
  },
});
