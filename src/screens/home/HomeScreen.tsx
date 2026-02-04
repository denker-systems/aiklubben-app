import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { Text, FloatingOrbs, ContentCard, TiltCard } from '@/components/ui';
import { useMenu } from '@/contexts/MenuContext';
import { useAuth } from '@/hooks/useAuth';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';
import { getLevelForXP } from '@/types/gamification';
import { uiColors } from '@/config/design';

export const HomeScreen = () => {
  console.log('[HomeScreen] Rendered');
  
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const menuContext = useMenu();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats] = useState({ totalXP: 150, currentStreak: 3 });
  const [recentNews, setRecentNews] = useState<any[]>([]);

  const level = getLevelForXP(stats.totalXP);

  useEffect(() => {
    console.log('[HomeScreen] useEffect triggered', { hasUser: !!user });
    
    const fetchData = async () => {
      try {
        // Fetch profile
        if (user) {
          console.log('[HomeScreen] Fetching profile for user:', user.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error('[HomeScreen] Error fetching profile:', profileError);
          } else {
            console.log('[HomeScreen] Profile fetched:', { name: profileData?.name });
          }
          setProfile(profileData);
        }

        // Fetch recent news
        console.log('[HomeScreen] Fetching recent news');
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('id, title, summary, image_url')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(3);
        
        if (newsError) {
          console.error('[HomeScreen] Error fetching news:', newsError);
        } else {
          console.log('[HomeScreen] News fetched:', { count: newsData?.length });
        }
        setRecentNews(newsData || []);
      } catch (err) {
        console.error('[HomeScreen] Error fetching home data:', err);
      }
    };

    fetchData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'God morgon';
    if (hour < 18) return 'God eftermiddag';
    return 'God kväll';
  };

  const quickActions = [
    {
      id: 'courses',
      title: 'Kurser',
      subtitle: 'Lär dig AI',
      emoji: '📚',
      gradient: ['#6366f1', '#8b5cf6'] as const,
      screen: 'Courses',
    },
    {
      id: 'news',
      title: 'Nyheter',
      subtitle: 'Senaste nytt',
      emoji: '📰',
      gradient: ['#ff3366', '#f43f5e'] as const,
      screen: 'News',
    },
    {
      id: 'resources',
      title: 'Resurser',
      subtitle: 'Verktyg & guider',
      emoji: '📂',
      gradient: ['#00d8a2', '#0ea5e9'] as const,
      screen: 'Content',
    },
  ];

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
            <View style={styles.headerLeft}>
              <Text variant="body" style={styles.greeting}>
                {getGreeting()},
              </Text>
              <Text variant="h1" style={styles.userName}>
                {profile?.name?.split(' ')[0] || 'Vännen'} {level.icon}
              </Text>
            </View>
            <Pressable onPress={() => menuContext?.openMenu()} style={styles.menuButton}>
              <View style={styles.menuLine} />
              <View style={[styles.menuLine, styles.menuLineShort]} />
            </Pressable>
          </View>

          {/* Stats Row with Emojis */}
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
                <Text style={styles.statValue}>{stats.totalXP}</Text>
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
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
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
                <Text style={styles.statEmoji}>🎯</Text>
              </LinearGradient>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>Lvl {level.level}</Text>
                <Text style={styles.statLabel}>{level.name.split(' ')[0]}</Text>
              </View>
            </MotiView>
          </View>
        </MotiView>

        {/* Daily Progress Card */}
        <Pressable onPress={() => navigation.navigate('Courses')}>
          <MotiView
            style={styles.dailyCard}
            from={{ opacity: 0, translateX: -30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 100 }}
          >
            <View style={styles.dailyCardHeader}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.dailyCardIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.dailyCardEmoji}>🎯</Text>
            </LinearGradient>
            <View style={styles.dailyCardContent}>
              <Text variant="body" style={styles.dailyCardTitle}>
                Dagens mål
              </Text>
              <Text variant="caption" style={styles.dailyCardSubtitle}>
                Fortsätt lära dig!
              </Text>
            </View>
            <View style={styles.dailyCardProgress}>
              <Text style={styles.dailyCardPercent}>40%</Text>
            </View>
          </View>
            <View style={styles.dailyProgressTrack}>
              <MotiView
                style={styles.dailyProgressFill}
                from={{ width: '0%' }}
                animate={{ width: '40%' }}
                transition={{ ...SPRING_CONFIGS.smooth, delay: 500 }}
              />
            </View>
          </MotiView>
        </Pressable>

        {/* Quick Actions */}
        <MotiView
          style={styles.section}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 200 }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>✨</Text>
            <Text variant="h3" style={styles.sectionTitle}>
              Snabbstart
            </Text>
          </View>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <MotiView
                key={action.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING_CONFIGS.bouncy, delay: 300 + index * STAGGER_DELAYS.fast }}
                style={styles.quickActionWrapper}
              >
                <TiltCard
                  onPress={() => navigation.navigate(action.screen)}
                  tiltAmount={3}
                  scaleAmount={0.97}
                  style={styles.quickActionCard}
                >
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.quickActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                  </LinearGradient>
                  <Text variant="body" style={styles.quickActionTitle}>
                    {action.title}
                  </Text>
                  <Text variant="caption" style={styles.quickActionSubtitle}>
                    {action.subtitle}
                  </Text>
                </TiltCard>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Continue Learning */}
        <MotiView
          style={styles.section}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 400 }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>📊</Text>
            <Text variant="h3" style={styles.sectionTitle}>
              Fortsätt lära
            </Text>
          </View>

          <TiltCard
            onPress={() => navigation.navigate('Courses')}
            tiltAmount={2}
            scaleAmount={0.98}
            style={styles.continueCard}
          >
            <View style={styles.continueCardContent}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.continueIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.continueEmoji}>📚</Text>
              </LinearGradient>
              <View style={styles.continueInfo}>
                <Text variant="body" style={styles.continueTitle}>
                  Grundkurs i AI
                </Text>
                <View style={styles.continueProgress}>
                  <View style={styles.continueProgressTrack}>
                    <View style={[styles.continueProgressFill, { width: '35%' }]} />
                  </View>
                  <Text variant="caption" style={styles.continuePercent}>
                    35%
                  </Text>
                </View>
              </View>
              <LinearGradient
                colors={['#8B5CF6', '#a855f7']}
                style={styles.continueButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.continueButtonEmoji}>⚡</Text>
              </LinearGradient>
            </View>
          </TiltCard>
        </MotiView>

        {/* Recent News */}
        {recentNews.length > 0 && (
          <MotiView
            style={styles.section}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 500 }}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>📰</Text>
              <Text variant="h3" style={styles.sectionTitle}>
                Senaste nytt
              </Text>
              <Pressable onPress={() => navigation.navigate('News')} style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Se alla →</Text>
              </Pressable>
            </View>

            <View style={styles.newsList}>
              {recentNews.map((news, index) => (
                <MotiView
                  key={news.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    ...SPRING_CONFIGS.smooth,
                    delay: 600 + index * STAGGER_DELAYS.fast,
                  }}
                >
                  <ContentCard
                    title={news.title}
                    subtitle={news.summary}
                    image={news.image_url}
                    onPress={() => navigation.navigate('NewsDetail', { id: news.id })}
                    showArrow
                    variant="spacious"
                  />
                </MotiView>
              ))}
            </View>
          </MotiView>
        )}
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
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  // Removed static orbs - now using FloatingOrbs component
  _headerOrb1: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: brandColors.purple,
    opacity: 0.12,
  },
  _headerOrb2: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: brandColors.pink,
    opacity: 0.08,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: '#9CA3AF',
    marginBottom: 4,
  },
  userName: {
    color: '#F9FAFB',
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
  dailyCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: uiColors.card.background,
    borderRadius: uiColors.card.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981', // Keep green accent border
  },
  dailyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyCardIconGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dailyCardEmoji: {
    fontSize: 26,
  },
  dailyCardContent: {
    flex: 1,
  },
  dailyCardTitle: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  dailyCardSubtitle: {
    color: '#10B981',
  },
  dailyCardProgress: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Keep green tint for progress
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyCardPercent: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
  },
  dailyProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dailyProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
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
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: brandColors.purple,
    fontWeight: '600',
    fontSize: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionWrapper: {
    flex: 1,
  },
  quickActionCard: {
    backgroundColor: uiColors.card.background,
    borderRadius: uiColors.card.radius,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: uiColors.card.border,
  },
  quickActionGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  quickActionEmoji: {
    fontSize: 32,
  },
  quickActionTitle: {
    color: '#F9FAFB',
    fontWeight: '600',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  continueCard: {
    backgroundColor: uiColors.card.background,
    borderRadius: uiColors.card.radius,
    padding: 18,
    borderWidth: 1,
    borderColor: '#8B5CF6', // Keep purple accent border
  },
  continueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    color: '#F9FAFB',
    fontWeight: '600',
    marginBottom: 8,
  },
  continueProgress: {
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
  continuePercent: {
    color: brandColors.purple,
    fontWeight: '600',
  },
  continueButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonEmoji: {
    fontSize: 20,
  },
  newsList: {
    gap: 12,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: uiColors.card.background,
    borderRadius: uiColors.card.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: uiColors.card.border,
  },
  newsIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newsEmoji: {
    fontSize: 22,
  },
  newsArrow: {
    fontSize: 28,
    color: '#6B7280',
    fontWeight: '300',
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    color: '#F9FAFB',
    fontWeight: '600',
    marginBottom: 4,
  },
  newsSummary: {
    color: '#9CA3AF',
  },
});
