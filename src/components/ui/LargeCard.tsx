import React, { memo, useMemo } from 'react';
import { View, Pressable, StyleSheet, ImageBackground, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';

type GradientColors = readonly [string, string, ...string[]];

interface LargeCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  badge?: string;
  badgeColor?: string;
  gradient?: GradientColors;
  height?: number;
  featured?: boolean;
  onPress?: () => void;
  animated?: boolean;
  delay?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const LargeCardComponent = memo(function LargeCard({
  title,
  subtitle,
  imageUrl,
  badge,
  badgeColor = '#8B5CF6',
  gradient = ['#6366f1', '#8b5cf6'],
  height = 180,
  featured = false,
  onPress,
  animated = true,
  delay = 0,
  style,
  children,
}: LargeCardProps) {
  const { isDark } = useTheme();
  const ui = getUiColors(isDark);

  const cardContent = (
    <View style={[styles.card, { height, backgroundColor: ui.card.background, borderColor: ui.card.border }, style]}>
    <Pressable
      style={styles.cardPressable}
      onPress={onPress}
      disabled={!onPress}
    >
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBg}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(12, 10, 23, 0.7)', 'rgba(12, 10, 23, 0.95)']}
            style={styles.gradientOverlay}
            locations={[0, 0.5, 1]}
          >
            <View style={styles.cardContent}>
              <View style={styles.badgeRow}>
                {badge && (
                  <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
                {featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>⭐ Utvald</Text>
                  </View>
                )}
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              )}
              {children}
              {onPress && (
                <View style={styles.footer}>
                  <Text style={styles.readMore}>Läs mer →</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={gradient}
          style={styles.noImageGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            <View style={styles.badgeRow}>
              {badge && (
                <View style={styles.badgeLight}>
                  <Text style={styles.badgeTextDark}>{badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { opacity: 0.9 }]} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
            {children}
            {onPress && (
              <View style={styles.footer}>
                <Text style={styles.readMore}>Läs mer →</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      )}
    </Pressable>
    </View>
  );

  // Memoize transition config to prevent recreation
  const transitionConfig = useMemo(
    () => ({
      ...SPRING_CONFIGS.smooth,
      delay,
    }),
    [delay],
  );

  if (!animated) return cardContent;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={transitionConfig}
    >
      {cardContent}
    </MotiView>
  );
});

export const LargeCard = LargeCardComponent;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    // backgroundColor and borderColor set dynamically
    borderWidth: 1,
  },
  cardPressable: {
    flex: 1,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  imageBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 24,
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    borderRadius: 24,
  },
  noImageGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    borderRadius: 24,
  },
  cardContent: {
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeLight: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeTextDark: {
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
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  readMore: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LargeCardComponent;
