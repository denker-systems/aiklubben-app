import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { Text, Badge, FloatingOrbs, TiltCard, AppIcon } from '@/components/ui';
import { useMenu } from '@/contexts/MenuContext';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { SPRING_CONFIGS } from '@/lib/animations';
import { BADGES, getLevelForXP, getXPProgress, getNextLevel } from '@/types/gamification';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';

export const ProfileScreen = () => {
  console.log('[ProfileScreen] Rendered');
  
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const menuContext = useMenu();
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[ProfileScreen] useEffect triggered', { hasUser: !!user });
    
    const fetchProfileData = async () => {
      if (!user) {
        console.log('[ProfileScreen] No user, skipping fetch');
        return;
      }

      console.log('[ProfileScreen] Fetching profile data for user:', user.id);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('[ProfileScreen] Error fetching profile:', profileError);
          throw profileError;
        }
        
        console.log('[ProfileScreen] Profile data fetched:', { name: profileData?.name });
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

  const canGoBack = useNavigationState(state => state.routes.length > 1);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.purple} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header matching other screens */}
      <View style={[styles.headerRow, { paddingTop: insets.top + 16 }]}>
        <Text variant="h1" style={styles.headerTitle}>{t.profile.title}</Text>
        <Pressable
          onPress={() => menuContext?.openMenu()}
          style={[styles.menuButton, { backgroundColor: colors.glass.light }]}
        >
          <View style={[styles.menuLine, { backgroundColor: colors.text.secondary }]} />
          <View style={[styles.menuLine, styles.menuLineShort, { backgroundColor: colors.text.secondary }]} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <MotiView
          style={[styles.heroSection, { paddingTop: 20 }]}
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
                <AppIcon name="profile" size={80} />
              </View>
            )}
            <View style={[styles.levelBadge, { backgroundColor: level.color, borderColor: colors.background }]}>
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
                {profile?.name || t.common.user}
              </Text>
            </View>
            <Text variant="body" style={[styles.userEmail, { color: colors.text.secondary }]}>
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
                <AppIcon name="xp" size={36} />
              </LinearGradient>
              <View>
                <Text style={[styles.xpValue, { color: colors.text.primary }]}>{stats?.totalXP || 0} XP</Text>
                <Text style={[styles.xpLabel, { color: colors.text.secondary }]}>{t.profile.nextLevel} {nextLevel?.minXP || 'Max'} XP</Text>
              </View>
            </View>
            <View style={styles.xpProgressContainer}>
              <View style={[styles.xpProgressTrack, { backgroundColor: colors.glass.medium }]}>
                <View style={[styles.xpProgressFill, { width: `${xpProgress.percentage}%` }]} />
              </View>
            </View>
          </MotiView>
        </MotiView>

        {/* Stats Cards */}
        <View style={styles.content}>
          {/* Quick Stats Row */}
          <MotiView
            style={[styles.quickStatsRow, { backgroundColor: colors.glass.light }]}
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
                <AppIcon name="streak" size={36} />
              </LinearGradient>
              <View>
                <Text style={[styles.quickStatValue, { color: colors.text.primary }]}>{stats?.currentStreak || 0}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.text.secondary }]}>{t.common.days}</Text>
              </View>
            </View>
            <View style={[styles.quickStatDivider, { backgroundColor: colors.glass.medium }]} />
            <View style={styles.quickStat}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.quickStatGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AppIcon name="courses" size={36} />
              </LinearGradient>
              <View>
                <Text style={[styles.quickStatValue, { color: colors.text.primary }]}>{stats?.lessonsCompleted || 0}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.text.secondary }]}>{t.common.lessons}</Text>
              </View>
            </View>
            <View style={[styles.quickStatDivider, { backgroundColor: colors.glass.medium }]} />
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
                <Text style={[styles.quickStatValue, { color: colors.text.primary }]}>{stats?.badgesEarned?.length || 0}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.text.secondary }]}>{t.common.badges}</Text>
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
                  <AppIcon name="streak" size={36} />
                </LinearGradient>
                <View>
                  <Text style={[styles.streakCardTitle, { color: colors.text.primary }]}>{t.profile.streak}</Text>
                  <Text style={styles.streakCardSubtitle}>{t.profile.keepGoing}</Text>
                </View>
                <View style={styles.streakCardValue}>
                  <Text style={styles.streakCardNumber}>{stats?.currentStreak || 0}</Text>
                  <Text style={[styles.streakCardDays, { color: colors.text.secondary }]}>{t.common.days}</Text>
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
              <Text variant="h3" style={styles.sectionTitle}>
                {t.profile.yourBadges}
              </Text>
            </View>
            <View style={styles.badgesGrid}>
              {BADGES.slice(0, 6).map((badge, index) => {
                const isUnlocked = stats?.badgesEarned?.includes(badge.id);
                return (
                  <MotiView
                    key={badge.id}
                    style={[styles.badgeItem, { backgroundColor: ui.card.background, borderColor: ui.card.border }, !isUnlocked && styles.badgeItemLocked]}
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...SPRING_CONFIGS.bouncy, delay: 550 + index * 50 }}
                  >
                    <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                    <Text style={[styles.badgeName, { color: colors.text.primary }]} numberOfLines={1}>
                      {(t.badges as any)[badge.id]?.name || badge.name}
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
              style={[styles.actionButton, { backgroundColor: ui.card.background, borderColor: ui.card.border }]}
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
                <Text variant="body" style={[styles.actionTitle, { color: colors.text.primary }]}>
                  {t.profile.settings}
                </Text>
                <Text variant="caption" style={[styles.actionSubtitle, { color: colors.text.secondary }]}>
                  {t.profile.settingsSubtitle}
                </Text>
              </View>
              <Text style={[styles.actionArrow, { color: colors.text.muted }]}>›</Text>
            </TiltCard>

            <TiltCard
              onPress={() => signOut()}
              tiltAmount={2}
              scaleAmount={0.98}
              style={[styles.actionButton, { backgroundColor: ui.card.background, borderColor: ui.card.border }, styles.logoutButton]}
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
                  {t.profile.logout}
                </Text>
                <Text variant="caption" style={[styles.actionSubtitle, { color: colors.text.secondary }]}>
                  {t.profile.endSession}
                </Text>
              </View>
              <Text style={[styles.actionArrow, { color: colors.text.muted }]}>›</Text>
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
    // backgroundColor set dynamically
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    // color from Text component
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    // backgroundColor set dynamically
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  menuLine: {
    width: 20,
    height: 2,
    // backgroundColor set dynamically
    borderRadius: 1,
  },
  menuLineShort: {
    width: 14,
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
    // borderColor set dynamically
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
    // color from Text component
  },
  roleEmoji: {
    fontSize: 24,
  },
  userEmail: {
    // color set dynamically
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
    // color set dynamically
    fontSize: 24,
    fontWeight: '700',
  },
  xpLabel: {
    // color set dynamically
    fontSize: 13,
  },
  xpProgressContainer: {
    width: '100%',
  },
  xpProgressTrack: {
    height: 10,
    // backgroundColor set dynamically
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
    // backgroundColor set dynamically
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
    // backgroundColor set dynamically
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
    // color set dynamically
    fontSize: 18,
    fontWeight: '700',
  },
  quickStatLabel: {
    // color set dynamically
    fontSize: 12,
  },
  streakCard: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 20,
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
    // color set dynamically
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
    // color set dynamically
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
    // color set dynamically
    fontSize: 12,
    marginBottom: 4,
  },
  streakStatValue: {
    // color set dynamically
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
    // color from Text component
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: '30%',
    // backgroundColor and borderColor set dynamically
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  badgeItemLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    // color set dynamically
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
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
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
    // color set dynamically
    fontWeight: '300',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    // color set dynamically
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  actionSubtitle: {
    // color set dynamically
    fontSize: 13,
  },
});
