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
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import Markdown from 'react-native-markdown-display';
import { Text, Badge, AuthorBadge } from '@/components/ui';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';
import { useTabNavigation } from '@/contexts/TabNavigationContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NewsDetailScreen = () => {
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { navigateToTab } = useTabNavigation();
  const { id } = route.params;

  // Navigate to News tab instead of goBack to maintain correct navigation flow
  const handleGoBack = () => {
    navigateToTab('News');
  };

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Since news.author_id points to auth.users, and profiles is linked to auth.users,
        // we might not be able to join profiles directly in one go if the schema cache is stale
        // or if the relationship isn't explicitly defined in public schema.
        const { data, error } = await supabase
          .from('news')
          .select('*, news_categories(name, emoji)')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Fetch author profile separately if author_id exists
        if (data.author_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, role, avatar_url')
            .eq('id', data.author_id)
            .single();

          if (profileData) {
            data.profiles = profileData;
          }
        }

        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const [scrollY, setScrollY] = useState(0);
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

  if (!article) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text variant="h2">Artikeln kunde inte hittas.</Text>
          <Pressable onPress={handleGoBack} style={styles.backLink}>
            <Text variant="body" style={{ color: brandColors.purple }}>
              Gå tillbaka
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const getProcessedContent = () => {
    if (!article.content) return '';
    const titleLine = `# ${article.title}`;
    if (article.content.trim().startsWith(titleLine)) {
      return article.content.trim().replace(titleLine, '').trim();
    }
    return article.content;
  };

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <MotiView
        style={[styles.floatingHeader, { paddingTop: insets.top + 8, opacity: headerOpacity }]}
        animate={{ opacity: headerOpacity }}
      >
        <Pressable onPress={handleGoBack} style={styles.headerBackButton}>
          <ArrowLeft size={20} color="#F9FAFB" />
        </Pressable>
        <Text variant="body" numberOfLines={1} style={styles.headerTitle}>
          {article.title}
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
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {article.image_url ? (
            <Image
              source={{ uri: article.image_url }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroEmoji}>{article.news_categories?.emoji || '📰'}</Text>
            </View>
          )}

          <Pressable
            onPress={handleGoBack}
            style={[styles.backButton, { top: insets.top + 16 }]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Gå tillbaka till nyheter"
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
            style={styles.categoryRow}
          >
            {article.news_categories?.emoji && (
              <Text style={styles.categoryEmoji}>{article.news_categories.emoji}</Text>
            )}
            <Badge label={article.news_categories?.name || 'Nyhet'} variant="primary" />
          </MotiView>

          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal }}
          >
            <Text variant="h1" style={styles.title}>
              {article.title}
            </Text>
          </MotiView>

          {/* Meta Row */}
          <MotiView
            style={styles.metaRow}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 2 }}
          >
            <View style={styles.metaItem}>
              <Calendar size={16} color="#9CA3AF" />
              <Text variant="caption" style={styles.metaText}>
                {article.published_at
                  ? format(new Date(article.published_at), 'd MMMM yyyy', { locale: sv })
                  : 'Opublicerad'}
              </Text>
            </View>
            {article.read_time && (
              <View style={styles.metaItem}>
                <Clock size={16} color="#9CA3AF" />
                <Text variant="caption" style={styles.metaText}>
                  {article.read_time} min läsning
                </Text>
              </View>
            )}
          </MotiView>

          {/* Author */}
          {article.profiles && (
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 2.5 }}
              style={styles.authorSection}
            >
              <AuthorBadge
                name={article.profiles.name}
                role={article.profiles.role}
                avatar={article.profiles.avatar_url}
              />
            </MotiView>
          )}

          {/* Summary Card */}
          {article.summary && (
            <MotiView
              style={styles.summaryCard}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 3 }}
            >
              <View style={styles.summaryAccent} />
              <Text variant="body" style={styles.summaryText}>
                {article.summary}
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
  },
  heading1: {
    color: '#F9FAFB',
    fontSize: 26,
    fontWeight: '700' as const,
    marginTop: 32,
    marginBottom: 16,
  },
  heading2: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '600' as const,
    marginTop: 28,
    marginBottom: 12,
  },
  heading3: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: { marginBottom: 16 },
  bullet_list: { marginBottom: 16 },
  ordered_list: { marginBottom: 16 },
  list_item: { color: '#E5E7EB', fontSize: 17, lineHeight: 28, marginBottom: 8 },
  strong: { fontWeight: '700' as const, color: '#FFFFFF' },
  em: { fontStyle: 'italic' as const, color: '#D1D5DB' },
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
    borderRadius: 4,
  },
  link: {
    color: brandColors.purple,
    textDecorationLine: 'underline' as const,
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
    height: 300,
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
  heroEmoji: {
    fontSize: 64,
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  title: {
    color: '#F9FAFB',
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#9CA3AF',
  },
  authorSection: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
  },
  summaryAccent: {
    width: 4,
    backgroundColor: brandColors.purple,
    borderRadius: 2,
    marginRight: 16,
  },
  summaryText: {
    flex: 1,
    color: '#D1D5DB',
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
