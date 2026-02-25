import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { ChevronRight } from 'lucide-react-native';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { useNavigation } from '@react-navigation/native';
import {
  Text,
  ScreenHeader,
  TiltCard,
  ParallaxLayer,
  getHeaderHeight,
  FloatingOrbs,
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import { SPRING_CONFIGS } from '@/lib/animations';
import { getLayeredShadow } from '@/hooks/use3DEffects';

export const NewsScreen = () => {
  console.log('[NewsScreen] Rendered');

  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t, l, locale } = useLanguage();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    console.log('[NewsScreen] useEffect triggered');

    const fetchNews = async () => {
      setLoading(true);
      console.log('[NewsScreen] Fetching news articles');

      try {
        const { data, error } = await supabase
          .from('news')
          .select('*, news_categories(name, name_en, emoji)')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) {
          console.error('[NewsScreen] Error fetching news:', error);
        } else {
          console.log('[NewsScreen] News articles fetched:', { count: data?.length });
        }

        if (error) throw error;

        // Fetch authors for all articles in a separate batch to avoid join issues
        const authorIds = data?.map((item) => item.author_id).filter(Boolean) || [];
        if (authorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', authorIds);

          if (profiles) {
            data?.forEach((item) => {
              item.profiles = profiles.find((p) => p.id === item.author_id);
            });
          }
        }

        setNews(data || []);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const headerHeight = getHeaderHeight(insets);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Floating Orbs with Parallax */}
      <ParallaxLayer scrollY={scrollY} speed={-0.3} style={styles.backgroundOrbs}>
        <FloatingOrbs variant="default" />
      </ParallaxLayer>

      {/* Sticky Header */}
      <ScreenHeader title={t.news.title} scrollY={scrollY} showOrbs={true} orbsVariant="header" />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Content count */}
        <MotiView
          style={styles.countContainer}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 150 }}
        >
          <Text style={styles.countText}>
            {news.length} {t.news.articles}
          </Text>
        </MotiView>

        {/* News Cards */}
        <View style={styles.contentSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={brandColors.purple} size="large" />
            </View>
          ) : news.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Inga nyheter hittades.</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {news.map((article, index) => {
                const isFeatured = index === 0;
                const dateLocale = locale === 'en' ? enUS : sv;
                const formattedDate = article.published_at
                  ? format(new Date(article.published_at), 'd MMM yyyy', { locale: dateLocale })
                  : locale === 'en'
                    ? 'New'
                    : 'Ny';
                const categoryName = article.news_categories
                  ? l(article.news_categories, 'name')
                  : null;
                const categoryEmoji = article.news_categories?.emoji;
                const authorName = article.profiles?.name;

                if (isFeatured) {
                  return (
                    <MotiView
                      key={article.id}
                      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                      animate={{ opacity: 1, translateY: 0, scale: 1 }}
                      transition={{ ...SPRING_CONFIGS.smooth, delay: 200 }}
                    >
                      <TiltCard
                        onPress={() => navigation.navigate('NewsDetail', { id: article.id })}
                        tiltAmount={4}
                        scaleAmount={0.97}
                        elevation={3}
                        style={{
                          ...styles.featuredCard,
                          backgroundColor: ui.card.background,
                          borderColor: ui.card.border,
                          ...getLayeredShadow(3),
                        }}
                      >
                        {article.image_url && (
                          <Image
                            source={{ uri: article.image_url }}
                            style={styles.featuredImage}
                            resizeMode="cover"
                          />
                        )}
                        <View style={styles.featuredContent}>
                          {categoryName && (
                            <View style={styles.categoryBadge}>
                              <Text style={styles.categoryText}>
                                {categoryEmoji ? `${categoryEmoji} ` : ''}
                                {categoryName}
                              </Text>
                            </View>
                          )}
                          <Text
                            variant="h3"
                            weight="bold"
                            style={styles.featuredTitle}
                            numberOfLines={3}
                          >
                            {l(article, 'title')}
                          </Text>
                          {l(article, 'summary') && (
                            <Text
                              variant="body-sm"
                              style={[styles.featuredSummary, { color: colors.text.muted }]}
                              numberOfLines={2}
                            >
                              {l(article, 'summary')}
                            </Text>
                          )}
                          <View style={styles.metaRow}>
                            {authorName && (
                              <Text
                                variant="caption"
                                style={[styles.metaText, { color: colors.text.muted }]}
                              >
                                {authorName}
                              </Text>
                            )}
                            {authorName && (
                              <Text style={[styles.metaDot, { color: colors.text.muted }]}>·</Text>
                            )}
                            <Text
                              variant="caption"
                              style={[styles.metaText, { color: colors.text.muted }]}
                            >
                              {formattedDate}
                            </Text>
                          </View>
                        </View>
                      </TiltCard>
                    </MotiView>
                  );
                }

                return (
                  <MotiView
                    key={article.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ ...SPRING_CONFIGS.smooth, delay: 200 + index * 80 }}
                  >
                    <TiltCard
                      onPress={() => navigation.navigate('NewsDetail', { id: article.id })}
                      tiltAmount={2}
                      scaleAmount={0.98}
                      elevation={1}
                      style={{
                        ...styles.listCard,
                        backgroundColor: ui.card.background,
                        borderColor: ui.card.border,
                      }}
                    >
                      <View style={styles.listContent}>
                        <Text
                          variant="body"
                          weight="semibold"
                          style={styles.listTitle}
                          numberOfLines={2}
                        >
                          {l(article, 'title')}
                        </Text>
                        {l(article, 'summary') && (
                          <Text
                            variant="caption"
                            style={[styles.listSummary, { color: colors.text.muted }]}
                            numberOfLines={1}
                          >
                            {l(article, 'summary')}
                          </Text>
                        )}
                        <View style={styles.metaRow}>
                          {categoryName && (
                            <Text
                              variant="caption"
                              style={[styles.listCategory, { color: brandColors.purple }]}
                            >
                              {categoryEmoji ? `${categoryEmoji} ` : ''}
                              {categoryName}
                            </Text>
                          )}
                          {categoryName && (
                            <Text style={[styles.metaDot, { color: colors.text.muted }]}>·</Text>
                          )}
                          <Text
                            variant="caption"
                            style={[styles.metaText, { color: colors.text.muted }]}
                          >
                            {formattedDate}
                          </Text>
                        </View>
                      </View>

                      {article.image_url && (
                        <Image
                          source={{ uri: article.image_url }}
                          style={styles.listImage}
                          resizeMode="cover"
                        />
                      )}

                      <ChevronRight size={18} color={colors.text.muted} />
                    </TiltCard>
                  </MotiView>
                );
              })}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  countContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  contentSection: {
    paddingHorizontal: 20,
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
    textAlign: 'center',
  },
  cardList: {
    gap: 14,
  },
  // --- Featured card (first article) ---
  featuredCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredContent: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '700',
  },
  featuredTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 8,
  },
  featuredSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  // --- List cards (rest) ---
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 4,
  },
  listSummary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  listCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  // --- Shared meta ---
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
  },
  backgroundOrbs: {
    position: 'absolute',
    top: 300,
    left: 0,
    right: 0,
    height: 800,
    zIndex: 0,
    pointerEvents: 'none',
  },
});
