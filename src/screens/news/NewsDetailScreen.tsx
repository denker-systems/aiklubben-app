import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Linking,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ArrowLeft, Calendar, Clock, ExternalLink, Share2 } from 'lucide-react-native';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import Markdown from 'react-native-markdown-display';
import { Text, Badge, AuthorBadge } from '@/components/ui';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NewsDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const { isDark, colors } = useTheme();
  const { t, l } = useLanguage();
  const themedMarkdownStyles = useMemo(() => getMarkdownStyles(isDark), [isDark]);

  console.log('[NewsDetailScreen] Rendered', { articleId: id });

  const handleGoBack = () => {
    console.log('[NewsDetailScreen] handleGoBack - going back');
    navigation.goBack();
  };

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleShare = useCallback(async () => {
    if (!article) return;
    try {
      await Share.share({
        title: l(article, 'title'),
        message: `${l(article, 'title')}\n\n${l(article, 'summary') || ''}\n\nLäs mer i AI Klubben-appen.`,
      });
    } catch (err) {
      console.error('[NewsDetailScreen] Share error:', err);
    }
  }, [article, l]);

  useEffect(() => {
    console.log('[NewsDetailScreen] useEffect triggered', { id });

    const fetchArticle = async () => {
      console.log('[NewsDetailScreen] Fetching article');
      try {
        // Since news.author_id points to auth.users, and profiles is linked to auth.users,
        // we might not be able to join profiles directly in one go if the schema cache is stale
        // or if the relationship isn't explicitly defined in public schema.
        const { data, error } = await supabase
          .from('news')
          .select('*, news_categories(name, emoji)')
          .eq('id', id)
          .single();

        if (error) {
          console.error('[NewsDetailScreen] Error fetching article:', error);
        } else {
          console.log('[NewsDetailScreen] Article fetched:', { title: data?.title });
        }

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

  if (!article) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      >
        <View style={styles.loadingContainer}>
          <Text variant="h2">{t.newsDetail.articleNotFound}</Text>
          <Pressable onPress={handleGoBack} style={styles.backLink}>
            <Text variant="body" style={{ color: brandColors.purple }}>
              {t.newsDetail.goBack}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const getProcessedContent = () => {
    const body = l(article, 'content');
    if (!body) return '';
    const titleLine = `# ${l(article, 'title')}`;
    if (body.trim().startsWith(titleLine)) {
      return body.trim().replace(titleLine, '').trim();
    }
    return body;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Floating Header */}
      <MotiView
        style={[
          styles.floatingHeader,
          {
            paddingTop: insets.top + 8,
            opacity: headerOpacity,
            backgroundColor: isDark ? 'rgba(12, 10, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          },
        ]}
        animate={{ opacity: headerOpacity }}
      >
        <Pressable onPress={handleGoBack} style={styles.headerBackButton}>
          <ArrowLeft size={20} color="#F9FAFB" />
        </Pressable>
        <Text variant="body" numberOfLines={1} style={styles.headerTitle}>
          {l(article, 'title')}
        </Text>
        <Pressable onPress={handleShare} style={styles.headerShareButton}>
          <Share2 size={20} color={brandColors.purple} />
        </Pressable>
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
            <View
              style={[styles.heroPlaceholder, { backgroundColor: isDark ? '#1A1625' : '#F3F4F6' }]}
            >
              <Text style={styles.heroEmoji}>{article.news_categories?.emoji || '📰'}</Text>
            </View>
          )}

          <Pressable
            onPress={handleGoBack}
            style={[styles.backButton, { top: insets.top + 16 }]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={t.newsDetail.goBackAccessibility}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={[styles.shareButton, { top: insets.top + 16 }]}
            accessible={true}
            accessibilityRole="button"
          >
            <Share2 size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Content Container */}
        <MotiView
          style={[styles.contentContainer, { backgroundColor: colors.background }]}
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={SPRING_CONFIGS.smooth}
        >
          {/* Category + Format Badges */}
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
            {article.content_format && article.content_format !== 'news' && (
              <Badge
                label={
                  (t.newsDetail as any)[
                    `format${article.content_format.charAt(0).toUpperCase() + article.content_format.slice(1)}`
                  ] || article.content_format
                }
                variant="secondary"
              />
            )}
          </MotiView>

          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal }}
          >
            <Text variant="h1" style={styles.title}>
              {l(article, 'title')}
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
              <Calendar size={16} color={colors.text.muted} />
              <Text variant="caption" style={[styles.metaText, { color: colors.text.muted }]}>
                {article.published_at
                  ? format(new Date(article.published_at), 'd MMMM yyyy', { locale: sv })
                  : 'Opublicerad'}
              </Text>
            </View>
            {article.read_time && (
              <View style={styles.metaItem}>
                <Clock size={16} color={colors.text.muted} />
                <Text variant="caption" style={[styles.metaText, { color: colors.text.muted }]}>
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
          {l(article, 'summary') && (
            <MotiView
              style={styles.summaryCard}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 3 }}
            >
              <View style={styles.summaryAccent} />
              <Text variant="body" style={[styles.summaryText, { color: colors.text.secondary }]}>
                {l(article, 'summary')}
              </Text>
            </MotiView>
          )}

          {/* Main Content */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING_CONFIGS.gentle, delay: STAGGER_DELAYS.normal * 4 }}
          >
            <Markdown style={themedMarkdownStyles}>{getProcessedContent()}</Markdown>
          </MotiView>

          {/* AI Analysis Section */}
          {l(article, 'analysis') && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 4.5 }}
              style={styles.analysisCard}
            >
              <View style={styles.analysisHeader}>
                <Text style={styles.analysisEmoji}>🤖</Text>
                <Text variant="body-sm" weight="bold" style={{ color: brandColors.purple }}>
                  {t.newsDetail.aiAnalysis || 'AI-analys'}
                </Text>
              </View>
              <Text variant="body" style={[styles.analysisText, { color: colors.text.secondary }]}>
                {l(article, 'analysis')}
              </Text>
            </MotiView>
          )}

          {/* Sources Section */}
          {article.sources && article.sources.length > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 5 }}
              style={styles.sourcesSection}
            >
              <Text variant="h3" style={[styles.sourcesTitle, { color: colors.text.primary }]}>
                {t.newsDetail.sources || 'Källor'}
              </Text>
              {article.sources.map((source: any, index: number) => (
                <Pressable
                  key={index}
                  onPress={() => source.url && Linking.openURL(source.url)}
                  style={styles.sourceItem}
                >
                  <View style={styles.sourceInfo}>
                    <Text variant="body-sm" weight="bold" style={{ color: brandColors.purple }}>
                      {source.name}
                    </Text>
                    {source.title && (
                      <Text
                        variant="caption"
                        numberOfLines={1}
                        style={{ color: colors.text.muted }}
                      >
                        {source.title}
                      </Text>
                    )}
                  </View>
                  <ExternalLink size={16} color={brandColors.purple} />
                </Pressable>
              ))}
            </MotiView>
          )}
        </MotiView>
      </ScrollView>
    </View>
  );
};

const getMarkdownStyles = (isDark: boolean) => ({
  body: {
    color: isDark ? '#E5E7EB' : '#374151',
    fontSize: 17,
    lineHeight: 28,
  },
  heading1: {
    color: isDark ? '#F9FAFB' : '#111827',
    fontSize: 26,
    fontWeight: '700' as const,
    marginTop: 32,
    marginBottom: 16,
  },
  heading2: {
    color: isDark ? '#F9FAFB' : '#111827',
    fontSize: 22,
    fontWeight: '600' as const,
    marginTop: 28,
    marginBottom: 12,
  },
  heading3: {
    color: isDark ? '#F9FAFB' : '#111827',
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: { marginBottom: 16 },
  bullet_list: { marginBottom: 16 },
  ordered_list: { marginBottom: 16 },
  list_item: {
    color: isDark ? '#E5E7EB' : '#374151',
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 8,
  },
  strong: { fontWeight: '700' as const, color: isDark ? '#FFFFFF' : '#111827' },
  em: { fontStyle: 'italic' as const, color: isDark ? '#D1D5DB' : '#6B7280' },
  blockquote: {
    backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)',
    borderLeftColor: brandColors.purple,
    borderLeftWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 16,
    borderRadius: 8,
  },
  code_inline: {
    backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
    color: isDark ? '#A78BFA' : '#7C3AED',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  link: {
    color: brandColors.purple,
    textDecorationLine: 'underline' as const,
  },
});

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
    // backgroundColor set dynamically
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
  headerShareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    // color from Text component
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
    // backgroundColor set dynamically
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
  shareButton: {
    position: 'absolute',
    right: 16,
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
    // backgroundColor set dynamically
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
    // color from Text component
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
    // color set dynamically
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
    // color set dynamically
    fontStyle: 'italic',
    lineHeight: 24,
  },
  sourcesSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.15)',
  },
  sourcesTitle: {
    marginBottom: 16,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderRadius: 12,
    marginBottom: 8,
  },
  sourceInfo: {
    flex: 1,
    marginRight: 12,
  },
  analysisCard: {
    marginTop: 24,
    padding: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: brandColors.purple,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  analysisEmoji: {
    fontSize: 18,
  },
  analysisText: {
    lineHeight: 24,
  },
});
