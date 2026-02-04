import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Text,
  ScreenHeader,
  ContentCard,
  ParallaxLayer,
  getHeaderHeight,
  FloatingOrbs,
} from '@/components/ui';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { SPRING_CONFIGS } from '@/lib/animations';

type Category = 'resurser' | 'plattformar' | 'event';

interface CategoryItem {
  id: Category;
  name: string;
  emoji: string;
  gradient: readonly [string, string];
  color: string;
  description: string;
}

export const ContentScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const initialCategory = route.params?.category || 'resurser';

  console.log('[ContentScreen] Rendered', { initialCategory });

  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories: CategoryItem[] = [
    {
      id: 'resurser',
      name: 'Resurser',
      emoji: '📂',
      gradient: ['#6366f1', '#8b5cf6'],
      color: '#8B5CF6',
      description: 'Artiklar och guider',
    },
    {
      id: 'plattformar',
      name: 'Plattformar',
      emoji: '🧠',
      gradient: ['#00d8a2', '#0ea5e9'],
      color: '#10B981',
      description: 'AI-verktyg och tjänster',
    },
    {
      id: 'event',
      name: 'Event',
      emoji: '🎯',
      gradient: ['#ff3366', '#f43f5e'],
      color: '#EC4899',
      description: 'Kommande händelser',
    },
  ];

  useEffect(() => {
    console.log('[ContentScreen] useEffect triggered', { activeCategory });
    
    const fetchContent = async () => {
      setLoading(true);
      console.log('[ContentScreen] Fetching content for category:', activeCategory);
      
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('category', activeCategory)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[ContentScreen] Error fetching content:', error);
        } else {
          console.log('[ContentScreen] Content fetched:', { count: data?.length });
        }

        if (error) throw error;
        setContent(data || []);
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [activeCategory]);

  const scrollY = useSharedValue(0);
  const headerHeight = getHeaderHeight(insets);
  const activeCat = categories.find((cat) => cat.id === activeCategory);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      {/* Background Floating Orbs with Parallax */}
      <ParallaxLayer scrollY={scrollY} speed={-0.3} style={styles.backgroundOrbs}>
        <FloatingOrbs variant="default" />
      </ParallaxLayer>

      {/* Sticky Header */}
      <ScreenHeader title="Resurser" subtitle="Utforska verktyg och material" scrollY={scrollY} />

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
        {/* Category Pills */}
        <MotiView
          style={styles.categoryContainer}
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 100 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat, index) => {
              const isActive = activeCategory === cat.id;
              return (
                <MotiView
                  key={cat.id}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING_CONFIGS.bouncy, delay: 150 + index * 50 }}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={cat.gradient}
                      style={styles.categoryPillActive}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Pressable
                        onPress={() => setActiveCategory(cat.id)}
                        style={styles.categoryPillInner}
                      >
                        <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                        <Text style={styles.categoryTextActive}>{cat.name}</Text>
                      </Pressable>
                    </LinearGradient>
                  ) : (
                    <Pressable
                      onPress={() => setActiveCategory(cat.id)}
                      style={styles.categoryPill}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text style={styles.categoryText}>{cat.name}</Text>
                    </Pressable>
                  )}
                </MotiView>
              );
            })}
          </ScrollView>
        </MotiView>

        {/* Content Count */}
        <MotiView
          style={styles.countContainer}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 150 }}
        >
          <Text style={styles.countText}>
            {content.length} {activeCat?.name.toUpperCase()}
          </Text>
        </MotiView>

        {/* Content Cards - Clean Journal Style */}
        <View style={styles.contentSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={brandColors.purple} size="large" />
            </View>
          ) : content.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="body" style={styles.emptyText}>
                Inget innehåll hittades i denna kategori.
              </Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {content.map((item, index) => {
                const formattedDate = item.created_at
                  ? format(new Date(item.created_at), 'd MMM', { locale: sv })
                  : '';

                return (
                  <MotiView
                    key={item.id}
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ ...SPRING_CONFIGS.smooth, delay: 200 + index * 80 }}
                  >
                    <ContentCard
                      title={item.title}
                      date={formattedDate}
                      image={item.featured_image}
                      onPress={() => navigation.navigate('ContentDetail', { id: item.id })}
                      showOptions
                      variant="spacious"
                    />
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
    backgroundColor: '#0C0A17',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
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
  categoryContainer: {
    marginBottom: 20,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryPillActive: {
    borderRadius: 20,
  },
  categoryPillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryInfoWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
  },
  categoryInfoIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfoEmoji: {
    fontSize: 28,
  },
  categoryInfoTitle: {
    color: '#F9FAFB',
    marginBottom: 2,
  },
  categoryInfoDesc: {
    color: '#9CA3AF',
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
    color: '#6B7280',
    textAlign: 'center',
  },
  roadmapContainer: {
    position: 'relative',
    paddingLeft: 24,
  },
  roadmapLine: {
    position: 'absolute',
    left: 7,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 1,
  },
  roadmapItem: {
    marginBottom: 20,
    position: 'relative',
  },
  roadmapDot: {
    position: 'absolute',
    left: -24,
    top: 20,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  roadmapDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  largeCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  largeCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardImageBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderRadius: 24,
  },
  cardGradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    borderRadius: 24,
  },
  cardNoImage: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    borderRadius: 24,
  },
  _oldCardContent: {
    gap: 8,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  cardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBadgeLight: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardBadgeTextDark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  featuredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  _oldCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  cardExcerpt: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  cardReadMore: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // New Journal-style card styles
  countContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  countText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardList: {
    gap: 16,
  },
  journalCard: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flex: 1,
    maxWidth: '70%',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 12,
  },
  cardDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  cardImage: {
    position: 'absolute',
    right: -15,
    bottom: -15,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  optionsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  optionsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '600',
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
