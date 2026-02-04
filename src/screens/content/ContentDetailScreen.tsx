import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ArrowLeft, Clock, BookOpen, Award } from 'lucide-react-native';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import Markdown from 'react-native-markdown-display';
import { Text, Badge } from '@/components/ui';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ContentDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  console.log('[ContentDetailScreen] Rendered', { contentId: id });

  // Navigate to Content screen instead of goBack to maintain correct navigation flow
  const handleGoBack = () => {
    console.log('[ContentDetailScreen] handleGoBack - going back');
    navigation.goBack();
  };

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    console.log('[ContentDetailScreen] useEffect triggered', { id });
    
    const fetchContent = async () => {
      console.log('[ContentDetailScreen] Fetching content');
      try {
        const { data, error } = await supabase.from('content').select('*').eq('id', id).single();

        if (error) {
          console.error('[ContentDetailScreen] Error fetching content:', error);
          throw error;
        }
        
        console.log('[ContentDetailScreen] Content fetched:', { title: data?.title });
        setContent(data);
      } catch (err) {
        console.error('[ContentDetailScreen] Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  // Calculate header opacity based on scroll
  const headerOpacity = Math.min(scrollY / 150, 1);

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

  if (!content) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text variant="h2">Innehållet kunde inte hittas.</Text>
          <Pressable onPress={handleGoBack} style={styles.backLink}>
            <Text variant="body" style={{ color: brandColors.purple }}>
              Gå tillbaka
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Filter out the first H1 if it's identical to the title to avoid double rendering
  const getProcessedContent = () => {
    if (!content.content) return '';
    const titleLine = `# ${content.title}`;
    if (content.content.trim().startsWith(titleLine)) {
      return content.content.trim().replace(titleLine, '').trim();
    }
    return content.content;
  };

  return (
    <View style={styles.container}>
      {/* Floating Header - appears on scroll */}
      <MotiView
        style={[
          styles.floatingHeader,
          {
            paddingTop: insets.top + 8,
            opacity: headerOpacity,
          },
        ]}
        animate={{ opacity: headerOpacity }}
      >
        <Pressable onPress={handleGoBack} style={styles.headerBackButton}>
          <ArrowLeft size={20} color="#F9FAFB" />
        </Pressable>
        <Text variant="body" numberOfLines={1} style={styles.headerTitle}>
          {content.title}
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
        {/* Hero Image - Edge to Edge */}
        <View style={styles.heroContainer}>
          {content.featured_image ? (
            <Image
              source={{ uri: content.featured_image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <BookOpen size={48} color={brandColors.purple} />
            </View>
          )}

          {/* Gradient overlay */}
          <View style={styles.heroGradient} />

          {/* Back button on image */}
          <Pressable
            onPress={handleGoBack}
            style={[styles.backButton, { top: insets.top + 16 }]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Gå tillbaka till innehåll"
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
          {/* Category Badge */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_CONFIGS.bouncy, delay: STAGGER_DELAYS.fast }}
          >
            <Badge label={content.category || 'Kurs'} variant="primary" />
          </MotiView>

          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal }}
          >
            <Text variant="h1" style={styles.title}>
              {content.title}
            </Text>
          </MotiView>

          {/* Meta info row */}
          <MotiView
            style={styles.metaRow}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 2 }}
          >
            {content.level && (
              <View style={styles.metaItem}>
                <Award size={16} color={brandColors.purple} />
                <Text variant="caption" style={styles.metaText}>
                  {content.level}
                </Text>
              </View>
            )}
            {content.duration && (
              <View style={styles.metaItem}>
                <Clock size={16} color="#9CA3AF" />
                <Text variant="caption" style={styles.metaText}>
                  {content.duration} min
                </Text>
              </View>
            )}
          </MotiView>

          {/* Excerpt/Summary Card */}
          {content.excerpt && (
            <MotiView
              style={styles.excerptCard}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 3 }}
            >
              <View style={styles.excerptAccent} />
              <Text variant="body" style={styles.excerptText}>
                {content.excerpt}
              </Text>
            </MotiView>
          )}

          {/* Main Content */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING_CONFIGS.gentle, delay: STAGGER_DELAYS.normal * 4 }}
          >
            <Markdown style={markdownStyles}>{getProcessedContent()}</Markdown>
          </MotiView>
        </MotiView>
      </ScrollView>
    </View>
  );
};

const markdownStyles = {
  body: {
    color: '#E5E7EB',
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'System',
  },
  heading1: {
    color: '#F9FAFB',
    fontSize: 26,
    fontWeight: '700' as const,
    marginTop: 32,
    marginBottom: 16,
    lineHeight: 34,
  },
  heading2: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '600' as const,
    marginTop: 28,
    marginBottom: 12,
    lineHeight: 30,
  },
  heading3: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 24,
    marginBottom: 8,
    lineHeight: 26,
  },
  paragraph: {
    marginBottom: 16,
    lineHeight: 28,
  },
  bullet_list: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  ordered_list: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  list_item: {
    color: '#E5E7EB',
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 8,
  },
  strong: {
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  em: {
    fontStyle: 'italic' as const,
    color: '#D1D5DB',
  },
  blockquote: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderLeftColor: brandColors.purple,
    borderLeftWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 16,
    borderRadius: 8,
  },
  code_inline: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: '#A78BFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 15,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#1A1625',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  fence: {
    backgroundColor: '#1A1625',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  link: {
    color: brandColors.purple,
    textDecorationLine: 'underline' as const,
  },
  hr: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    height: 1,
    marginVertical: 24,
  },
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
    height: 280,
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
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'transparent',
    // Gradient effect via overlapping views
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
    marginBottom: 12,
    lineHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#9CA3AF',
  },
  excerptCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
  },
  excerptAccent: {
    width: 4,
    backgroundColor: brandColors.purple,
    borderRadius: 2,
    marginRight: 16,
  },
  excerptText: {
    flex: 1,
    color: '#D1D5DB',
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
