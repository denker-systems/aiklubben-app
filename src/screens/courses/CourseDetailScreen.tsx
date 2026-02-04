import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
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

export const CourseDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);

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
        
        console.log('[CourseDetailScreen] Course data fetched:', { id: courseData.id, title: courseData.title });
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

        // Fetch user progress for lessons
        console.log('[CourseDetailScreen] Fetching user progress');
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, status, current_step_index, total_steps')
          .in('lesson_id', lessonsData?.map((l) => l.id) || []);

        if (progressError) {
          console.error('[CourseDetailScreen] Error fetching progress:', progressError);
        } else {
          console.log('[CourseDetailScreen] Progress data fetched:', { count: progressData?.length });
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
            locked: isLocked
          });

          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
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
  }, [id]);

  const completedLessons = lessons.filter((l) => l.completed).length;

  const handleLessonPress = useCallback(
    (lessonId: string) => {
      console.log('[CourseDetailScreen] handleLessonPress', { lessonId, courseId: id });
      navigation.navigate('Lesson', { lessonId, courseId: id });
    },
    [navigation, id]
  );

  const handleGoBack = useCallback(() => {
    console.log('[CourseDetailScreen] handleGoBack - navigating to Courses');
    navigation.navigate('Courses');
  }, [navigation]);

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Unit Header - Duolingo style */}
        <View style={{ paddingTop: insets.top }}>
          <UnitHeader
            title={course.title || 'Kurs'}
            subtitle={course.excerpt}
            lessonCount={lessons.length}
            completedCount={completedLessons}
            onBack={handleGoBack}
          />
        </View>

        {/* Lesson Path - Duolingo style zigzag */}
        <LessonPath
          lessons={lessons}
          onLessonPress={handleLessonPress}
        />
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
  backLink: {
    marginTop: 16,
    padding: 12,
  },
  scrollView: {
    flex: 1,
  },
});
