import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import { Text, FloatingOrbs, AppIcon } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useMenu } from '@/contexts/MenuContext';
import { getLevelForXP } from '@/types/gamification';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

interface Course {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  level: string;
  duration: number;
  lessons_count: number;
  category: string;
}

// Type-safe navigation (Rule 08)
type CoursesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Courses'>;

export const CoursesScreen = () => {
  const navigation = useNavigation<CoursesNavigationProp>();
  const insets = useSafeAreaInsets();
  const menuContext = useMenu();
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('category', 'kurser')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCourses(data || []);

        // Mock progress data for now
        const mockProgress: Record<string, number> = {};
        (data || []).forEach((course: Course, index: number) => {
          mockProgress[course.id] = index === 0 ? 35 : 0;
        });
        setUserProgress(mockProgress);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // useMemo for expensive computations (Rule 10)
  const getLevelInfo = useCallback((level: string) => {
    switch (level?.toLowerCase()) {
      case 'nybörjare':
        return { color: '#10B981', gradient: ['#10B981', '#059669'] as const, emoji: '🌱' };
      case 'mellan':
        return { color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] as const, emoji: '💪' };
      case 'avancerad':
        return { color: '#EF4444', gradient: ['#EF4444', '#DC2626'] as const, emoji: '🚀' };
      default:
        return {
          color: brandColors.purple,
          gradient: ['#6366f1', '#8b5cf6'] as const,
          emoji: '📚',
        };
    }
  }, []);

  // useCallback for navigation (Rule 10)
  const handleCoursePress = useCallback(
    (courseId: string) => {
      navigation.navigate('CourseDetail', { id: courseId });
    },
    [navigation],
  );

  const handleOpenMenu = useCallback(() => {
    menuContext?.openMenu();
  }, [menuContext]);

  const userStats = { totalXP: 150, currentStreak: 3 };
  const level = getLevelForXP(userStats.totalXP);

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
            <View>
              <Text variant="h1" style={styles.headerTitle}>
                {t.courses.title}
              </Text>
            </View>
            <Pressable
              onPress={handleOpenMenu}
              style={[styles.menuButton, { backgroundColor: colors.glass.light }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t.menu.openMenu}
              accessibilityHint={t.menu.openMenuHint}
            >
              <View style={[styles.menuLine, { backgroundColor: colors.text.secondary }]} />
              <View style={[styles.menuLine, styles.menuLineShort, { backgroundColor: colors.text.secondary }]} />
            </Pressable>
          </View>

          {/* Quick Stats with Emojis */}
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
                <Text style={[styles.statValue, { color: colors.text.primary }]}>{userStats.totalXP}</Text>
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
                <Text style={[styles.statValue, { color: colors.text.primary }]}>{userStats.currentStreak}</Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>dagar</Text>
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
                <Text style={styles.statEmoji}>🌟</Text>
              </LinearGradient>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>Lvl {level.level}</Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{level.name.split(' ')[0]}</Text>
              </View>
            </MotiView>
          </View>
        </MotiView>

        {/* Continue Learning Section */}
        {courses.length > 0 && userProgress[courses[0]?.id] > 0 && (
          <MotiView
            style={styles.section}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 200 }}
          >
            <View style={styles.sectionHeader}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t.courses.continueLearning}
              </Text>
            </View>

            <Pressable
              style={[styles.continueCard, { backgroundColor: ui.card.background, borderColor: ui.card.border }]}
              onPress={() => handleCoursePress(courses[0].id)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${t.common.continue} ${courses[0].title}`}
              accessibilityHint=""
            >
              <View style={styles.continueContent}>
                <View style={styles.continueIconContainer}>
                  <AppIcon name="courses-example" size={96} />
                </View>
                <View style={styles.continueTextContent}>
                  <Text variant="body" style={styles.continueTitle} numberOfLines={2}>
                    {courses[0].title}
                  </Text>
                  <View style={styles.continueProgressRow}>
                    <View style={[styles.continueProgressTrack, { backgroundColor: colors.glass.medium }]}>
                      <View
                        style={[
                          styles.continueProgressFill,
                          { width: `${userProgress[courses[0].id]}%` },
                        ]}
                      />
                    </View>
                    <Text variant="caption" style={styles.continueProgressText}>
                      {userProgress[courses[0].id]}%
                    </Text>
                  </View>
                </View>
              </View>
              <LinearGradient
                colors={['#8B5CF6', '#a855f7']}
                style={styles.continueButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.continueButtonText}>{t.lessons.continueButton}</Text>
              </LinearGradient>
            </Pressable>
          </MotiView>
        )}

        {/* All Courses Carousel */}
        <MotiView
          style={styles.carouselSection}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 300 }}
        >
          <View style={styles.sectionHeaderPadded}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t.courses.allCourses}
            </Text>
            <Text variant="caption" style={[styles.carouselHint, { color: colors.text.muted }]}>
              {t.courses.swipeForMore}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={brandColors.purple} />
            </View>
          ) : courses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="body" style={styles.emptyText}>
                Inga kurser tillgängliga just nu.
              </Text>
            </View>
          ) : (
            <FlatList
              data={courses}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 16}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              keyExtractor={(item) => item.id}
              initialNumToRender={3}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={true}
              renderItem={({ item: course, index }) => (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    ...SPRING_CONFIGS.smooth,
                    delay: 400 + index * 100,
                  }}
                >
                  <View style={[styles.carouselCard, { backgroundColor: ui.card.background, borderColor: ui.card.border }]}>
                  <Pressable
                    onPress={() => handleCoursePress(course.id)}
                    style={styles.carouselCardPressable}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${course.title}, ${course.level || t.courses.allLevels}`}
                    accessibilityHint={t.courses.tapToOpenCourse}
                  >
                    <View style={styles.carouselIconContainer}>
                      <AppIcon name="courses-example" size={160} />
                    </View>

                    <Text variant="body" style={styles.carouselTitle} numberOfLines={2}>
                      {course.title}
                    </Text>

                    <Text variant="caption" style={styles.carouselExcerpt} numberOfLines={3}>
                      {course.excerpt}
                    </Text>

                    <View style={styles.carouselMeta}>
                      <View style={styles.carouselMetaRow}>
                        <Text style={styles.carouselMetaIcon}>⏱</Text>
                        <Text variant="caption" style={[styles.carouselMetaText, { color: colors.text.secondary }]}>
                          {course.duration || 30} min
                        </Text>
                      </View>
                      <View style={styles.carouselMetaRow}>
                        <Text style={styles.carouselMetaIcon}>⚡</Text>
                        <Text variant="caption" style={[styles.carouselMetaText, { color: colors.text.secondary }]}>
                          +50 XP
                        </Text>
                      </View>
                    </View>

                    {userProgress[course.id] > 0 && (
                      <View style={[styles.carouselProgress, { borderTopColor: colors.border.default }]}>
                        <View style={[styles.carouselProgressTrack, { backgroundColor: colors.glass.medium }]}>
                          <View
                            style={[
                              styles.carouselProgressFill,
                              { width: `${userProgress[course.id]}%` },
                            ]}
                          />
                        </View>
                        <Text variant="caption" style={styles.carouselProgressText}>
                          {userProgress[course.id]}%
                        </Text>
                      </View>
                    )}
                  </Pressable>
                  </View>
                </MotiView>
              )}
            />
          )}
        </MotiView>
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
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    // color from Text component
    marginBottom: 4,
  },
  headerSubtitle: {
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
    fontSize: 22,
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
  dailyGoalCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dailyGoalIconGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dailyGoalEmoji: {
    fontSize: 26,
  },
  fireEmoji: {
    fontSize: 24,
  },
  dailyGoalContent: {
    flex: 1,
  },
  dailyGoalTitle: {
    color: '#F9FAFB',
    fontWeight: '600',
    marginBottom: 8,
  },
  dailyGoalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dailyGoalTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dailyGoalFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  dailyGoalText: {
    color: '#10B981',
    fontWeight: '600',
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
  },
  continueCard: {
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 80,
  },
  continueIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  continueIconContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  continueEmoji: {
    fontSize: 28,
  },
  continueTextContent: {
    flex: 1,
  },
  continueTitle: {
    // color from Text component
    fontWeight: '600',
    marginBottom: 8,
  },
  continueProgressRow: {
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
  continueProgressText: {
    color: brandColors.purple,
    fontWeight: '600',
  },
  continueButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    // color from Text component
    textAlign: 'center',
  },
  coursesList: {
    gap: 12,
  },
  courseCard: {
    // backgroundColor and borderColor set dynamically
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  courseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  courseIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  courseEmoji: {
    fontSize: 28,
  },
  courseArrow: {
    fontSize: 32,
    // color set dynamically
    fontWeight: '300',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    // color from Text component
    fontWeight: '600',
    marginBottom: 4,
  },
  courseExcerpt: {
    // color from Text component
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaEmoji: {
    fontSize: 12,
  },
  metaText: {
    // color set dynamically
  },
  courseProgressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  courseProgressFill: {
    height: '100%',
    backgroundColor: brandColors.purple,
  },
  // Carousel styles
  carouselSection: {
    marginBottom: 24,
  },
  sectionHeaderPadded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  carouselHint: {
    // color set dynamically
    fontStyle: 'italic',
  },
  carouselContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  carouselCard: {
    width: CARD_WIDTH,
    // backgroundColor and borderColor set dynamically
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    minHeight: 280,
  },
  carouselCardPressable: {
    flex: 1,
  },
  carouselCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  carouselIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  carouselIconContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  carouselEmoji: {
    fontSize: 42,
  },
  carouselTitle: {
    // color from Text component
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  carouselExcerpt: {
    // color from Text component
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    flex: 1,
  },
  carouselMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 'auto',
  },
  carouselMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  carouselMetaIcon: {
    fontSize: 14,
  },
  carouselMetaText: {
    // color set dynamically
    fontSize: 13,
  },
  carouselProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    // borderTopColor set dynamically
  },
  carouselProgressTrack: {
    flex: 1,
    height: 6,
    // backgroundColor set dynamically
    borderRadius: 3,
    overflow: 'hidden',
  },
  carouselProgressFill: {
    height: '100%',
    backgroundColor: brandColors.purple,
    borderRadius: 3,
  },
  carouselProgressText: {
    color: brandColors.purple,
    fontWeight: '600',
    fontSize: 13,
  },
});
