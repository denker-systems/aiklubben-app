import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import { Text, FloatingOrbs, TiltCard } from '@/components/ui';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';
import { useMenu } from '@/contexts/MenuContext';
import { getLevelForXP } from '@/types/gamification';
import { uiColors } from '@/config/design';

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

export const CoursesScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const menuContext = useMenu();
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

  const getLevelInfo = (level: string) => {
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
  };

  const userStats = { totalXP: 150, currentStreak: 3 };
  const level = getLevelForXP(userStats.totalXP);

  return (
    <View style={styles.container}>
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
                Kurser
              </Text>
              <Text variant="body" style={styles.headerSubtitle}>
                Lär dig AI steg för steg
              </Text>
            </View>
            <Pressable onPress={() => menuContext?.openMenu()} style={styles.menuButton}>
              <View style={styles.menuLine} />
              <View style={[styles.menuLine, styles.menuLineShort]} />
            </Pressable>
          </View>

          {/* Quick Stats with Emojis */}
          <View style={styles.statsRow}>
            <MotiView
              style={styles.statBadge}
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
                <Text style={styles.statEmoji}>⚡</Text>
              </LinearGradient>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{userStats.totalXP}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
            </MotiView>

            <MotiView
              style={styles.statBadge}
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
                <Text style={styles.statEmoji}>🔥</Text>
              </LinearGradient>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{userStats.currentStreak}</Text>
                <Text style={styles.statLabel}>dagar</Text>
              </View>
            </MotiView>

            <MotiView
              style={styles.statBadge}
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
                <Text style={styles.statValue}>Lvl {level.level}</Text>
                <Text style={styles.statLabel}>{level.name.split(' ')[0]}</Text>
              </View>
            </MotiView>
          </View>
        </MotiView>

        {/* Daily Goal Card */}
        <MotiView
          style={styles.dailyGoalCard}
          from={{ opacity: 0, translateX: -30 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 100 }}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.dailyGoalIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.dailyGoalEmoji}>🎯</Text>
          </LinearGradient>
          <View style={styles.dailyGoalContent}>
            <Text variant="body" style={styles.dailyGoalTitle}>
              Dagligt mål
            </Text>
            <View style={styles.dailyGoalProgress}>
              <View style={styles.dailyGoalTrack}>
                <MotiView
                  style={[styles.dailyGoalFill, { width: '40%' }]}
                  from={{ width: '0%' }}
                  animate={{ width: '40%' }}
                  transition={{ ...SPRING_CONFIGS.smooth, delay: 500 }}
                />
              </View>
              <Text variant="caption" style={styles.dailyGoalText}>
                2/5 lektioner
              </Text>
            </View>
          </View>
          <Text style={styles.fireEmoji}>🔥</Text>
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
              <Text style={styles.sectionEmoji}>✨</Text>
              <Text variant="h3" style={styles.sectionTitle}>
                Fortsätt lära
              </Text>
            </View>

            <Pressable
              style={styles.continueCard}
              onPress={() => navigation.navigate('CourseDetail', { id: courses[0].id })}
            >
              <View style={styles.continueContent}>
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.continueIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.continueEmoji}>📚</Text>
                </LinearGradient>
                <View style={styles.continueTextContent}>
                  <Text variant="body" style={styles.continueTitle} numberOfLines={2}>
                    {courses[0].title}
                  </Text>
                  <View style={styles.continueProgressRow}>
                    <View style={styles.continueProgressTrack}>
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
                <Text style={styles.continueButtonText}>Fortsätt →</Text>
              </LinearGradient>
            </Pressable>
          </MotiView>
        )}

        {/* All Courses Section */}
        <MotiView
          style={styles.section}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 300 }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>📚</Text>
            <Text variant="h3" style={styles.sectionTitle}>
              Alla kurser
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
            <View style={styles.coursesList}>
              {courses.map((course, index) => (
                <MotiView
                  key={course.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    ...SPRING_CONFIGS.smooth,
                    delay: 400 + index * STAGGER_DELAYS.fast,
                  }}
                >
                  <TiltCard
                    onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
                    tiltAmount={2}
                    scaleAmount={0.98}
                    style={styles.courseCard}
                  >
                    <View style={styles.courseCardContent}>
                      <LinearGradient
                        colors={getLevelInfo(course.level).gradient}
                        style={styles.courseIconGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.courseEmoji}>{getLevelInfo(course.level).emoji}</Text>
                      </LinearGradient>

                      <View style={styles.courseInfo}>
                        <Text variant="body" style={styles.courseTitle} numberOfLines={2}>
                          {course.title}
                        </Text>
                        <Text variant="caption" style={styles.courseExcerpt} numberOfLines={2}>
                          {course.excerpt}
                        </Text>

                        <View style={styles.courseMeta}>
                          {course.level && (
                            <View
                              style={[
                                styles.levelBadge,
                                { backgroundColor: getLevelInfo(course.level).color + '20' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.levelText,
                                  { color: getLevelInfo(course.level).color },
                                ]}
                              >
                                {course.level}
                              </Text>
                            </View>
                          )}
                          <View style={styles.metaItem}>
                            <Text style={styles.metaEmoji}>⏱️</Text>
                            <Text variant="caption" style={styles.metaText}>
                              {course.duration || 30} min
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Text style={styles.metaEmoji}>⚡</Text>
                            <Text variant="caption" style={styles.metaText}>
                              +50 XP
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text style={styles.courseArrow}>›</Text>
                    </View>

                    {userProgress[course.id] > 0 && (
                      <View style={styles.courseProgressBar}>
                        <View
                          style={[
                            styles.courseProgressFill,
                            { width: `${userProgress[course.id]}%` },
                          ]}
                        />
                      </View>
                    )}
                  </TiltCard>
                </MotiView>
              ))}
            </View>
          )}
        </MotiView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0A17',
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
    color: '#F9FAFB',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#9CA3AF',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: '#9CA3AF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingRight: 14,
    gap: 10,
  },
  statGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9CA3AF',
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
    color: '#F9FAFB',
  },
  continueCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  continueTextContent: {
    flex: 1,
  },
  continueTitle: {
    color: '#F9FAFB',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#6B7280',
    textAlign: 'center',
  },
  coursesList: {
    gap: 12,
  },
  courseCard: {
    backgroundColor: uiColors.card.background,
    borderRadius: uiColors.card.radius,
    borderColor: uiColors.card.border,
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
    color: '#6B7280',
    fontWeight: '300',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    color: '#F9FAFB',
    fontWeight: '600',
    marginBottom: 4,
  },
  courseExcerpt: {
    color: '#9CA3AF',
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
    color: '#9CA3AF',
  },
  courseProgressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  courseProgressFill: {
    height: '100%',
    backgroundColor: brandColors.purple,
  },
});
