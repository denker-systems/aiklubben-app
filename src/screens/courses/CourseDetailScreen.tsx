import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Pressable, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import { Text, Button } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { UnitHeader, LessonPath } from './components';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  completed: boolean;
  locked: boolean;
  progress?: number;
}

interface Props {
  isGuest?: boolean;
  onSignIn?: () => void;
}

export const CourseDetailScreen = ({ isGuest, onSignIn }: Props) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const { colors } = useTheme();
  const { l, t } = useLanguage();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  useEffect(() => {
    console.log('[CourseDetailScreen] useEffect triggered', { courseId: id });

    const fetchCourseAndLessons = async () => {
      try {
        // Fetch course
        console.log('[CourseDetailScreen] Fetching course data');
        const { data: courseData, error: courseError } = await supabase
          .from('content')
          .select('*')
          .eq('id', id)
          .single();

        if (courseError) {
          console.error('[CourseDetailScreen] Error fetching course:', courseError);
          throw courseError;
        }

        console.log('[CourseDetailScreen] Course data fetched:', {
          id: courseData.id,
          title: courseData.title,
        });
        setCourse(courseData);

        // Fetch lessons for this course
        console.log('[CourseDetailScreen] Fetching lessons for course');
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('course_id', id)
          .order('order_index', { ascending: true });

        if (lessonsError) {
          console.error('[CourseDetailScreen] Error fetching lessons:', lessonsError);
          throw lessonsError;
        }

        console.log('[CourseDetailScreen] Lessons fetched:', { count: lessonsData?.length });

        // Fetch user progress for lessons (skip for guests)
        let progressData: any[] = [];
        if (!isGuest) {
          console.log('[CourseDetailScreen] Fetching user progress');
          const { data: pd, error: progressError } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, status, current_step_index, total_steps')
            .in('lesson_id', lessonsData?.map((l) => l.id) || []);

          if (progressError) {
            console.error('[CourseDetailScreen] Error fetching progress:', progressError);
          } else {
            console.log('[CourseDetailScreen] Progress data fetched:', { count: pd?.length });
            progressData = pd || [];
          }
        }

        // Map lessons with progress and lock status
        const mappedLessons: Lesson[] = (lessonsData || []).map((lesson, index) => {
          const progress = progressData?.find((p) => p.lesson_id === lesson.id);
          const isCompleted = progress?.status === 'completed';

          // First lesson is always unlocked, others need previous to be completed
          const previousLesson = index > 0 ? lessonsData[index - 1] : null;
          const previousProgress = previousLesson
            ? progressData?.find((p) => p.lesson_id === previousLesson.id)
            : null;
          const isLocked = index > 0 && previousProgress?.status !== 'completed';

          console.log(`[CourseDetailScreen] Lesson ${index + 1}:`, {
            id: lesson.id,
            title: lesson.title,
            completed: isCompleted,
            locked: isLocked,
          });

          return {
            id: lesson.id,
            title: l(lesson, 'title'),
            description: l(lesson, 'description'),
            duration: lesson.duration_minutes,
            completed: isCompleted,
            locked: isLocked,
            progress: progress?.total_steps
              ? Math.round((progress.current_step_index / progress.total_steps) * 100)
              : 0,
          };
        });

        console.log('[CourseDetailScreen] Mapped lessons:', { count: mappedLessons.length });
        setLessons(mappedLessons);
      } catch (err) {
        console.error('[CourseDetailScreen] Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const completedLessons = lessons.filter((l) => l.completed).length;

  const handleLessonPress = useCallback(
    (lessonId: string) => {
      console.log('[CourseDetailScreen] handleLessonPress', { lessonId, courseId: id, isGuest });
      if (isGuest) {
        setShowGuestPrompt(true);
        return;
      }
      navigation.navigate('Lesson', { lessonId, courseId: id });
    },
    [navigation, id, isGuest],
  );

  const handleGoBack = useCallback(() => {
    console.log('[CourseDetailScreen] handleGoBack - navigating to Courses');
    navigation.navigate('Courses');
  }, [navigation]);

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      >
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
      <View
        style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      >
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal
        visible={showGuestPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGuestPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text variant="h3" style={{ marginBottom: 8 }}>
              {t.auth.guestLoginPromptTitle}
            </Text>
            <Text
              variant="body"
              style={{ color: colors.text.secondary, marginBottom: 24, textAlign: 'center' }}
            >
              {t.auth.guestLoginPromptBody}
            </Text>
            <Button
              variant="primary"
              onPress={() => {
                setShowGuestPrompt(false);
                navigation.navigate('Auth');
              }}
              style={{ marginBottom: 12 }}
            >
              {t.auth.guestLoginButton}
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                setShowGuestPrompt(false);
                navigation.navigate('Signup');
              }}
              style={{ marginBottom: 12 }}
            >
              {t.auth.guestSignupButton}
            </Button>
            <Button variant="ghost" onPress={() => setShowGuestPrompt(false)}>
              {t.common.cancel}
            </Button>
          </View>
        </View>
      </Modal>

      {/* Sticky Unit Header */}
      <View style={{ paddingTop: insets.top }}>
        <UnitHeader
          title={l(course, 'title') || 'Kurs'}
          subtitle={l(course, 'excerpt')}
          lessonCount={lessons.length}
          completedCount={completedLessons}
          onBack={handleGoBack}
        />
      </View>

      {/* Scrollable Lesson Path */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <LessonPath lessons={lessons} onLessonPress={handleLessonPress} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
});
