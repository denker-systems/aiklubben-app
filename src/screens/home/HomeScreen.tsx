import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { Text, FloatingOrbs, ContentCard, TiltCard, AppIcon } from '@/components/ui';
import { useMenu } from '@/contexts/MenuContext';
import { useAuth } from '@/hooks/useAuth';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserStats } from '@/hooks/useUserStats';
import { useTabNavigation } from '@/contexts/TabNavigationContext';
import { useLocation } from '@/hooks/useLocation';
import { MapPin } from 'lucide-react-native';

export const HomeScreen = () => {
  console.log('[HomeScreen] Rendered');

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const menuContext = useMenu();
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t, locale, l } = useLanguage();
  const { user } = useAuth();
  const { stats, level } = useUserStats();
  const { navigateToTab } = useTabNavigation();
  const { location, permissionGranted, requestLocation } = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<{
    courseId: string;
    courseName: string;
    courseNameEn: string | null;
    progress: number;
  } | null>(null);

  useEffect(() => {
    console.log('[HomeScreen] useEffect triggered', { hasUser: !!user });

    const fetchData = async () => {
      try {
        // Fetch profile
        if (user) {
          console.log('[HomeScreen] Fetching profile for user:', user.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('[HomeScreen] Error fetching profile:', profileError);
          } else {
            console.log('[HomeScreen] Profile fetched:', { name: profileData?.name });
          }
          setProfile(profileData);
        }

        // Fetch recent news (select * for i18n _en columns)
        console.log('[HomeScreen] Fetching recent news');
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(3);

        if (newsError) {
          console.error('[HomeScreen] Error fetching news:', newsError);
        } else {
          console.log('[HomeScreen] News fetched:', { count: newsData?.length });
        }
        setRecentNews(newsData || []);

        // Fetch course progress for "Continue learning"
        if (user) {
          // Step 1: Get all course lessons
          const { data: allCourseLessons } = await supabase
            .from('course_lessons')
            .select('id, course_id');

          if (allCourseLessons && allCourseLessons.length > 0) {
            const totalMap: Record<string, number> = {};
            const lessonToCourse: Record<string, string> = {};
            allCourseLessons.forEach((l: any) => {
              totalMap[l.course_id] = (totalMap[l.course_id] || 0) + 1;
              lessonToCourse[l.id] = l.course_id;
            });

            // Step 2: Get completed lessons for this user
            const lessonIds = allCourseLessons.map((l: any) => l.id);
            const { data: completed } = await supabase
              .from('user_lesson_progress')
              .select('lesson_id')
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .in('lesson_id', lessonIds);

            if (completed && completed.length > 0) {
              const completedPerCourse: Record<string, number> = {};
              completed.forEach((c: any) => {
                const cId = lessonToCourse[c.lesson_id];
                if (cId) completedPerCourse[cId] = (completedPerCourse[cId] || 0) + 1;
              });

              // Step 3: Get course titles
              const courseIds = Object.keys(completedPerCourse);
              const { data: courseData } = await supabase
                .from('content')
                .select('id, title, title_en')
                .in('id', courseIds);

              const titleMap: Record<string, { title: string; titleEn: string | null }> = {};
              courseData?.forEach((c: any) => {
                titleMap[c.id] = { title: c.title, titleEn: c.title_en };
              });

              // Find best in-progress course
              let bestCourse: {
                id: string;
                progress: number;
                title: string;
                titleEn: string | null;
              } | null = null;
              for (const cId of courseIds) {
                const total = totalMap[cId] || 1;
                const pct = Math.round((completedPerCourse[cId] / total) * 100);
                if (pct < 100 && (!bestCourse || pct > bestCourse.progress)) {
                  bestCourse = {
                    id: cId,
                    progress: pct,
                    title: titleMap[cId]?.title || '',
                    titleEn: titleMap[cId]?.titleEn || null,
                  };
                }
              }
              if (!bestCourse && courseIds.length > 0) {
                const cId = courseIds[0];
                bestCourse = {
                  id: cId,
                  progress: 100,
                  title: titleMap[cId]?.title || '',
                  titleEn: titleMap[cId]?.titleEn || null,
                };
              }
              if (bestCourse) {
                setCourseProgress({
                  courseId: bestCourse.id,
                  courseName: bestCourse.title,
                  courseNameEn: bestCourse.titleEn,
                  progress: bestCourse.progress,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('[HomeScreen] Error fetching home data:', err);
      }
    };

    fetchData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetings.morning;
    if (hour < 18) return t.greetings.afternoon;
    return t.greetings.evening;
  };

  // Daily goal: target 50 XP per day, calculate from lessons completed today
  const DAILY_XP_GOAL = 50;
  const [dailyXP, setDailyXP] = useState(0);

  useEffect(() => {
    const fetchDailyXP = async () => {
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('user_lesson_progress')
        .select('xp_earned')
        .eq('user_id', user.id)
        .gte('completed_at', today + 'T00:00:00.000Z');
      const total = data?.reduce((sum: number, r: any) => sum + (r.xp_earned || 0), 0) || 0;
      setDailyXP(total);
    };
    fetchDailyXP();
  }, [user]);

  const dailyGoalPercent = useMemo(
    () => Math.min(100, Math.round((dailyXP / DAILY_XP_GOAL) * 100)),
    [dailyXP],
  );

  const quickActions = [
    {
      id: 'courses',
      title: t.home.coursesAction,
      subtitle: t.home.coursesSubtitle,
      emoji: '📚',
      iconName: 'courses',
      gradient: ['#6366f1', '#8b5cf6'] as const,
      tab: 'Courses' as const,
    },
    {
      id: 'news',
      title: t.home.newsAction,
      subtitle: t.home.newsSubtitle,
      emoji: '📰',
      iconName: 'news',
      gradient: ['#ff3366', '#f43f5e'] as const,
      tab: 'News' as const,
    },
    {
      id: 'resources',
      title: t.home.resourcesAction,
      subtitle: t.home.resourcesSubtitle,
      emoji: '📂',
      gradient: ['#00d8a2', '#0ea5e9'] as const,
      tab: 'Content' as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          style={[styles.header, { paddingTop: insets.top + 16 }]}
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={SPRING_CONFIGS.smooth}
        >
          {/* Floating orbs for depth */}
          <FloatingOrbs variant="header" />

          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text variant="body" style={[styles.greeting, { color: colors.text.secondary }]}>
                {getGreeting()},
              </Text>
              <Text variant="h1" style={styles.userName}>
                {profile?.name?.split(' ')[0] || t.common.friend}
              </Text>
            </View>
            <Pressable
              onPress={() => menuContext?.openMenu()}
              style={[styles.menuButton, { backgroundColor: colors.glass.light }]}
            >
              <View style={[styles.menuLine, { backgroundColor: colors.text.secondary }]} />
              <View
                style={[
                  styles.menuLine,
                  styles.menuLineShort,
                  { backgroundColor: colors.text.secondary },
                ]}
              />
            </Pressable>
          </View>

          {/* Stats Row with Emojis */}
          <View style={styles.statsRow}>
            <MotiView
              style={[styles.statBadge, { backgroundColor: colors.glass.light }]}
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...SPRING_CONFIGS.bouncy, delay: 200 }}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6366f1']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AppIcon name="xp" size={52} />
              </LinearGradient>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>
                  {stats.totalXP}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>XP</Text>
              </View>
            </MotiView>

            <MotiView
              style={[styles.statBadge, { backgroundColor: colors.glass.light }]}
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...SPRING_CONFIGS.bouncy, delay: 300 }}
            >
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AppIcon name="streak" size={52} />
              </LinearGradient>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>
                  {stats.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                  {t.common.days}
                </Text>
              </View>
            </MotiView>

            <MotiView
              style={[styles.statBadge, { backgroundColor: colors.glass.light }]}
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...SPRING_CONFIGS.bouncy, delay: 400 }}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.statEmoji}>🎯</Text>
              </LinearGradient>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>
                  Lvl {level.level}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                  {(t.levels as any)[level.level] || level.name}
                </Text>
              </View>
            </MotiView>
          </View>
        </MotiView>

        {/* Daily Progress Card */}
        <Pressable onPress={() => navigateToTab('Courses')}>
          <MotiView
            style={[
              styles.dailyCard,
              { backgroundColor: ui.card.background, borderColor: ui.card.border },
            ]}
            from={{ opacity: 0, translateX: -30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 100 }}
          >
            <View style={styles.dailyCardHeader}>
              <View style={styles.dailyCardIconContainer}>
                <AppIcon name="goal" size={120} />
              </View>
              <View style={styles.dailyCardContent}>
                <Text variant="body" style={styles.dailyCardTitle}>
                  {t.home.dailyGoal}
                </Text>
                <Text variant="caption" style={styles.dailyCardSubtitle}>
                  {t.home.keepLearning}
                </Text>
              </View>
              <View style={styles.dailyCardProgress}>
                <Text style={styles.dailyCardPercent}>{dailyGoalPercent}%</Text>
              </View>
            </View>
            <View style={[styles.dailyProgressTrack, { backgroundColor: colors.glass.medium }]}>
              <MotiView
                style={styles.dailyProgressFill}
                from={{ width: '0%' }}
                animate={{ width: `${dailyGoalPercent}%` as any }}
                transition={{ ...SPRING_CONFIGS.smooth, delay: 500 }}
              />
            </View>
          </MotiView>
        </Pressable>

        {/* Quick Actions */}
        <MotiView
          style={styles.section}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 200 }}
        >
          <View style={styles.sectionHeader}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t.home.quickStart}
            </Text>
          </View>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <MotiView
                key={action.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING_CONFIGS.bouncy, delay: 300 + index * STAGGER_DELAYS.fast }}
                style={styles.quickActionWrapper}
              >
                <TiltCard
                  onPress={() => navigateToTab(action.tab)}
                  tiltAmount={3}
                  scaleAmount={0.97}
                  style={[
                    styles.quickActionCard,
                    { backgroundColor: ui.card.background, borderColor: ui.card.border },
                  ]}
                >
                  <View style={styles.quickActionIconContainer}>
                    {action.iconName ? (
                      <AppIcon name={action.iconName} size={112} />
                    ) : (
                      <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                    )}
                  </View>
                  <Text variant="body" style={styles.quickActionTitle}>
                    {action.title}
                  </Text>
                </TiltCard>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Continue Learning */}
        {courseProgress && (
          <MotiView
            style={styles.section}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 400 }}
          >
            <View style={styles.sectionHeader}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t.home.continueLearning}
              </Text>
            </View>

            <TiltCard
              onPress={() => navigation.navigate('CourseDetail', { id: courseProgress.courseId })}
              tiltAmount={2}
              scaleAmount={0.98}
              style={[
                styles.continueCard,
                { backgroundColor: ui.card.background, borderColor: ui.card.border },
              ]}
            >
              <View style={styles.continueCardContent}>
                <View style={styles.continueIconContainer}>
                  <AppIcon name="courses-example" size={96} />
                </View>
                <View style={styles.continueInfo}>
                  <Text variant="body" style={styles.continueTitle}>
                    {locale === 'en' && courseProgress.courseNameEn
                      ? courseProgress.courseNameEn
                      : courseProgress.courseName}
                  </Text>
                  <View style={styles.continueProgress}>
                    <View
                      style={[
                        styles.continueProgressTrack,
                        { backgroundColor: colors.glass.medium },
                      ]}
                    >
                      <View
                        style={[
                          styles.continueProgressFill,
                          { width: `${courseProgress.progress}%` },
                        ]}
                      />
                    </View>
                    <Text variant="caption" style={styles.continuePercent}>
                      {courseProgress.progress}%
                    </Text>
                  </View>
                </View>
              </View>
            </TiltCard>
          </MotiView>
        )}

        {/* Recent News */}
        {recentNews.length > 0 && (
          <MotiView
            style={styles.section}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 500 }}
          >
            <View style={styles.sectionHeader}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t.home.latestNews}
              </Text>
              <Pressable onPress={() => navigateToTab('News')} style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>{t.common.seeAll}</Text>
              </Pressable>
            </View>

            <View style={styles.newsList}>
              {recentNews.map((news, index) => (
                <MotiView
                  key={news.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    ...SPRING_CONFIGS.smooth,
                    delay: 600 + index * STAGGER_DELAYS.fast,
                  }}
                >
                  <ContentCard
                    title={l(news, 'title')}
                    subtitle={l(news, 'summary')}
                    image={news.image_url}
                    onPress={() => navigation.navigate('NewsDetail', { id: news.id })}
                    showArrow
                    variant="spacious"
                  />
                </MotiView>
              ))}
            </View>
          </MotiView>
        )}
        {/* Location Banner */}
        {permissionGranted === false && (
          <MotiView
            style={[styles.locationBanner, { backgroundColor: colors.glass.light }]}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={SPRING_CONFIGS.smooth}
          >
            <MapPin size={18} color={brandColors.purple} />
            <View style={styles.locationTextContainer}>
              <Text variant="body-sm" weight="medium" style={{ color: colors.text.primary }}>
                {t.home.locationTitle}
              </Text>
              <Text variant="caption" style={{ color: colors.text.secondary }}>
                {t.home.locationBody}
              </Text>
            </View>
            <Pressable onPress={requestLocation} style={styles.locationButton}>
              <Text variant="caption" weight="bold" style={{ color: brandColors.purple }}>
                {t.home.locationEnable}
              </Text>
            </Pressable>
          </MotiView>
        )}
        {location && (
          <MotiView
            style={[styles.locationBanner, { backgroundColor: colors.glass.light }]}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={SPRING_CONFIGS.smooth}
          >
            <MapPin size={18} color={brandColors.purple} />
            <Text variant="caption" style={{ color: colors.text.secondary, marginLeft: 8 }}>
              {location.city ? `${location.city}, ${location.country}` : location.country}
            </Text>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  // Removed static orbs - now using FloatingOrbs component
  _headerOrb1: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: brandColors.purple,
    opacity: 0.12,
  },
  _headerOrb2: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: brandColors.pink,
    opacity: 0.08,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    // color set dynamically
    marginBottom: 4,
  },
  userName: {
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor set dynamically
    borderRadius: 16,
    paddingRight: 14,
    gap: 10,
  },
  statGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statEmoji: {
    fontSize: 36,
  },
  statInfo: {
    alignItems: 'flex-start',
  },
  statValue: {
    // color set dynamically
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    // color set dynamically
    fontSize: 11,
  },
  dailyCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
  },
  dailyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 80,
  },
  dailyCardIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dailyCardIconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dailyCardEmoji: {
    fontSize: 26,
  },
  dailyCardContent: {
    flex: 1,
  },
  dailyCardTitle: {
    // color from Text component
    fontWeight: '600',
  },
  dailyCardSubtitle: {
    color: '#10B981',
  },
  dailyCardProgress: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Keep green tint for progress
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyCardPercent: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
  },
  dailyProgressTrack: {
    height: 6,
    // backgroundColor set dynamically
    borderRadius: 3,
    overflow: 'hidden',
  },
  dailyProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionEmoji: {
    fontSize: 22,
  },
  sectionTitle: {
    // color from Text component
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: brandColors.purple,
    fontWeight: '600',
    fontSize: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionWrapper: {
    flex: 1,
  },
  quickActionCard: {
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickActionGradient: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  quickActionIconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  quickActionEmoji: {
    fontSize: 64,
  },
  quickActionTitle: {
    // color from Text component
    fontWeight: '600',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    // color from Text component
    fontSize: 11,
  },
  continueCard: {
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  continueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueIconContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  continueIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  continueEmoji: {
    fontSize: 28,
  },
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    // color from Text component
    fontWeight: '600',
    marginBottom: 8,
  },
  continueProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  continueProgressTrack: {
    flex: 1,
    height: 6,
    // backgroundColor set dynamically
    borderRadius: 3,
    overflow: 'hidden',
  },
  continueProgressFill: {
    height: '100%',
    backgroundColor: brandColors.purple,
    borderRadius: 3,
  },
  continuePercent: {
    color: brandColors.purple,
    fontWeight: '600',
  },
  continueButtonIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonEmoji: {
    fontSize: 20,
  },
  newsList: {
    gap: 12,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
  },
  newsIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newsEmoji: {
    fontSize: 22,
  },
  newsArrow: {
    fontSize: 28,
    // color set dynamically
    fontWeight: '300',
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    // color from Text component
    fontWeight: '600',
    marginBottom: 4,
  },
  newsSummary: {
    // color from Text component
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  locationTextContainer: {
    flex: 1,
    gap: 2,
  },
  locationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
});
