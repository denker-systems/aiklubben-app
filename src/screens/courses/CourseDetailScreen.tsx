import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import {
  ArrowLeft,
  Clock,
  Award,
  BookOpen,
  CheckCircle,
  Lock,
  Play,
  Zap,
} from 'lucide-react-native';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import { Text, Badge } from '@/components/ui';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Lesson {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  locked: boolean;
}

export const CourseDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const headerOpacity = Math.min(scrollY / 150, 1);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase.from('content').select('*').eq('id', id).single();

        if (error) throw error;
        setCourse(data);

        // Mock lessons for now - in real app, fetch from course_lessons table
        setLessons([
          { id: '1', title: 'Introduktion till AI', duration: 5, completed: true, locked: false },
          {
            id: '2',
            title: 'Vad är maskininlärning?',
            duration: 8,
            completed: true,
            locked: false,
          },
          {
            id: '3',
            title: 'Neurala nätverk förklarade',
            duration: 10,
            completed: false,
            locked: false,
          },
          {
            id: '4',
            title: 'Praktiska tillämpningar',
            duration: 12,
            completed: false,
            locked: true,
          },
          { id: '5', title: 'Framtidens AI', duration: 7, completed: false, locked: true },
        ]);
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const completedLessons = lessons.filter((l) => l.completed).length;
  const progressPercentage = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;
  const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);
  const xpReward = lessons.length * 10;


  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_CONFIGS.bouncy}
          >
            <ActivityIndicator size="large" color={brandColors.purple} />
          </MotiView>
        </View>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text variant="h2">Kursen kunde inte hittas.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text variant="body" style={{ color: brandColors.purple }}>
              Gå tillbaka
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <MotiView
        style={[styles.floatingHeader, { paddingTop: insets.top + 8, opacity: headerOpacity }]}
        animate={{ opacity: headerOpacity }}
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <ArrowLeft size={20} color="#F9FAFB" />
        </Pressable>
        <Text variant="body" numberOfLines={1} style={styles.headerTitle}>
          {course.title}
        </Text>
        <View style={{ width: 40 }} />
      </MotiView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          {course.featured_image ? (
            <Image
              source={{ uri: course.featured_image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <BookOpen size={64} color={brandColors.purple} />
            </View>
          )}

          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { top: insets.top + 16 }]}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Content Container */}
        <MotiView
          style={styles.contentContainer}
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={SPRING_CONFIGS.smooth}
        >
          {/* Level Badge */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_CONFIGS.bouncy, delay: STAGGER_DELAYS.fast }}
          >
            <Badge label={course.level || 'Kurs'} variant="primary" />
          </MotiView>

          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal }}
          >
            <Text variant="h1" style={styles.title}>
              {course.title}
            </Text>
          </MotiView>

          {/* Course Stats */}
          <MotiView
            style={styles.statsRow}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 2 }}
          >
            <View style={styles.statItem}>
              <BookOpen size={18} color="#9CA3AF" />
              <Text variant="body" style={styles.statText}>
                {lessons.length} lektioner
              </Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={18} color="#9CA3AF" />
              <Text variant="body" style={styles.statText}>
                {totalDuration} min
              </Text>
            </View>
            <View style={styles.statItem}>
              <Award size={18} color="#FBBF24" />
              <Text variant="body" style={styles.statText}>
                +{xpReward} XP
              </Text>
            </View>
          </MotiView>

          {/* Progress Card */}
          <MotiView
            style={styles.progressCard}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 3 }}
          >
            <View style={styles.progressHeader}>
              <Text variant="h3" style={styles.progressTitle}>
                Din framsteg
              </Text>
              <Text variant="body" style={styles.progressPercent}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <MotiView
                style={[styles.progressFill]}
                from={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ ...SPRING_CONFIGS.smooth, delay: 500 }}
              />
            </View>
            <Text variant="caption" style={styles.progressSubtext}>
              {completedLessons} av {lessons.length} lektioner avklarade
            </Text>
          </MotiView>

          {/* Description */}
          {course.excerpt && (
            <MotiView
              style={styles.descriptionCard}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 4 }}
            >
              <Text variant="h3" style={styles.sectionTitle}>
                Om kursen
              </Text>
              <Text variant="body" style={styles.descriptionText}>
                {course.excerpt}
              </Text>
            </MotiView>
          )}

          {/* Lessons List */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 5 }}
          >
            <Text variant="h3" style={styles.sectionTitle}>
              Lektioner
            </Text>
            <View style={styles.lessonsList}>
              {lessons.map((lesson, index) => (
                <MotiView
                  key={lesson.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    ...SPRING_CONFIGS.smooth,
                    delay: 600 + index * STAGGER_DELAYS.fast,
                  }}
                >
                  <Pressable
                    onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id, courseId: id })}
                    style={[
                      styles.lessonCard,
                      lesson.locked && styles.lessonCardLocked,
                      lesson.completed && styles.lessonCardCompleted,
                    ]}
                    disabled={lesson.locked}
                  >
                    <View
                      style={[
                        styles.lessonNumber,
                        lesson.completed && styles.lessonNumberCompleted,
                        lesson.locked && styles.lessonNumberLocked,
                      ]}
                    >
                      {lesson.completed ? (
                        <CheckCircle size={20} color="#FFFFFF" />
                      ) : lesson.locked ? (
                        <Lock size={16} color="#6B7280" />
                      ) : (
                        <Text style={styles.lessonNumberText}>{index + 1}</Text>
                      )}
                    </View>

                    <View style={styles.lessonContent}>
                      <Text
                        variant="body"
                        style={[styles.lessonTitle, lesson.locked && styles.lessonTitleLocked]}
                      >
                        {lesson.title}
                      </Text>
                      <View style={styles.lessonMeta}>
                        <Clock size={12} color={lesson.locked ? '#4B5563' : '#9CA3AF'} />
                        <Text
                          variant="caption"
                          style={[
                            styles.lessonDuration,
                            lesson.locked && styles.lessonDurationLocked,
                          ]}
                        >
                          {lesson.duration} min
                        </Text>
                        {!lesson.locked && (
                          <>
                            <Zap size={12} color="#FBBF24" />
                            <Text variant="caption" style={styles.lessonXP}>
                              +10 XP
                            </Text>
                          </>
                        )}
                      </View>
                    </View>

                    {!lesson.locked && !lesson.completed && (
                      <View style={styles.playButton}>
                        <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                      </View>
                    )}
                    {lesson.completed && <Text style={styles.completedBadge}>✓</Text>}
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </MotiView>
        </MotiView>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={[styles.bottomCTA, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable style={styles.startButton}>
          <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.startButtonText}>
            {progressPercentage > 0 ? 'Fortsätt kursen' : 'Starta kursen'}
          </Text>
        </Pressable>
      </View>
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
  backLink: {
    marginTop: 16,
    padding: 12,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(12, 10, 23, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#F9FAFB',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1625',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginTop: -40,
    backgroundColor: '#0C0A17',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    color: '#F9FAFB',
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 36,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#9CA3AF',
  },
  progressCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#F9FAFB',
  },
  progressPercent: {
    color: brandColors.purple,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: brandColors.purple,
    borderRadius: 4,
  },
  progressSubtext: {
    color: '#9CA3AF',
  },
  descriptionCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F9FAFB',
    marginBottom: 12,
  },
  descriptionText: {
    color: '#D1D5DB',
    lineHeight: 24,
  },
  lessonsList: {
    gap: 12,
    marginBottom: 100,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonCardCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  lessonNumberCompleted: {
    backgroundColor: '#10B981',
  },
  lessonNumberLocked: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  lessonNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    color: '#F9FAFB',
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: '#6B7280',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonDuration: {
    color: '#9CA3AF',
    marginRight: 8,
  },
  lessonDurationLocked: {
    color: '#4B5563',
  },
  lessonXP: {
    color: '#FBBF24',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(12, 10, 23, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.1)',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.purple,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
