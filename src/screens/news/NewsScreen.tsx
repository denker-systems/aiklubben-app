import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { MotiView } from 'moti';
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
import { sv } from 'date-fns/locale';
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
  const { t } = useLanguage();

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
          .select('*, news_categories(name, emoji)')
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
      <ScreenHeader
        title={t.news.title}
        scrollY={scrollY}
        showOrbs={true}
        orbsVariant="header"
      />

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
          <Text style={styles.countText}>{news.length} {t.news.articles}</Text>
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
                const formattedDate = article.published_at
                  ? format(new Date(article.published_at), 'd MMM', { locale: sv })
                  : 'Ny';

                return (
                  <MotiView
                    key={article.id}
                    from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ ...SPRING_CONFIGS.smooth, delay: 200 + index * 100 }}
                  >
                    <TiltCard
                      onPress={() => navigation.navigate('NewsDetail', { id: article.id })}
                      tiltAmount={isFeatured ? 5 : 3}
                      scaleAmount={0.96}
                      elevation={isFeatured ? 4 : 2}
                      style={{
                        ...styles.newsCard,
                        backgroundColor: ui.card.background,
                        borderColor: ui.card.border,
                        borderWidth: 1,
                        ...getLayeredShadow(isFeatured ? 4 : 2),
                      }}
                    >
                      {/* Card Content */}
                      <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, isFeatured && styles.featuredTitle]}>
                          {article.title}
                        </Text>
                        {isFeatured && article.summary && (
                          <Text style={styles.cardSummary} numberOfLines={2}>
                            {article.summary}
                          </Text>
                        )}
                        <Text style={styles.cardDate}>{formattedDate}</Text>
                      </View>

                      {/* Featured Image in corner - like ContentScreen */}
                      {article.image_url && (
                        <Image
                          source={{ uri: article.image_url }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      )}
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
    marginBottom: 20,
  },
  countText: {
    // color set dynamically by Text component
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
    // color from Text component
    textAlign: 'center',
  },
  cardList: {
    gap: 20,
  },
  newsCard: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 120,
    zIndex: 5,
  },
  cardTitle: {
    // color from Text component
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  cardSummary: {
    // color set dynamically
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  cardDate: {
    // color set dynamically
    fontSize: 14,
    fontWeight: '600',
  },
  cardImage: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
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
