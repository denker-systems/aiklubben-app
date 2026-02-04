import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { TiltCard } from './TiltCard';
import { uiColors } from '@/config/design';

interface ContentCardProps {
  title: string;
  subtitle?: string;
  date?: string;
  emoji?: string;
  emojiGradient?: readonly [string, string];
  image?: string;
  onPress?: () => void;
  showArrow?: boolean;
  showOptions?: boolean;
  variant?: 'compact' | 'spacious';
}

export function ContentCard({
  title,
  subtitle,
  date,
  emoji,
  emojiGradient = ['#8B5CF6', '#6366f1'],
  image,
  onPress,
  showArrow = false,
  showOptions = false,
  variant = 'compact',
}: ContentCardProps) {
  const isCompact = variant === 'compact';

  return (
    <TiltCard
      onPress={onPress}
      tiltAmount={2}
      scaleAmount={0.98}
      style={[styles.card, isCompact ? styles.cardCompact : styles.cardSpacious]}
    >
      {emoji && (
        <LinearGradient
          colors={emojiGradient as [string, string]}
          style={[styles.iconGradient, isCompact ? styles.iconCompact : styles.iconSpacious]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.emoji, isCompact ? styles.emojiCompact : styles.emojiSpacious]}>
            {emoji}
          </Text>
        </LinearGradient>
      )}

      <View style={styles.content}>
        <Text
          variant="body"
          style={[styles.title, isCompact ? styles.titleCompact : styles.titleSpacious]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {date && (
          <Text variant="caption" style={styles.date}>
            {date}
          </Text>
        )}
      </View>

      {image && (
        <Image
          source={{ uri: image }}
          style={[styles.image, isCompact ? styles.imageCompact : styles.imageSpacious]}
          resizeMode="cover"
        />
      )}

      {showArrow && <Text style={styles.arrow}>›</Text>}

      {showOptions && (
        <Pressable style={styles.optionsButton}>
          <Text style={styles.optionsText}>•••</Text>
        </Pressable>
      )}
    </TiltCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: uiColors.card.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: uiColors.card.border,
    position: 'relative',
    overflow: 'hidden',
  },
  cardCompact: {
    padding: 16,
    gap: 14,
  },
  cardSpacious: {
    padding: 24,
    gap: 18,
  },
  iconGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCompact: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  iconSpacious: {
    width: 64,
    height: 64,
    borderRadius: 18,
  },
  emoji: {
    textAlign: 'center',
  },
  emojiCompact: {
    fontSize: 24,
  },
  emojiSpacious: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 120,
  },
  title: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  titleCompact: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  titleSpacious: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  date: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  image: {
    position: 'absolute',
  },
  imageCompact: {
    right: -10,
    bottom: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageSpacious: {
    right: 8,
    top: '50%',
    marginTop: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  arrow: {
    fontSize: 28,
    color: '#6B7280',
    fontWeight: '300',
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
});
