import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { Text } from './Text';
import { TiltCard } from './TiltCard';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';

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
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const isCompact = variant === 'compact';

  return (
    <TiltCard
      onPress={onPress}
      tiltAmount={2}
      scaleAmount={0.98}
      style={[
        styles.card,
        { backgroundColor: ui.card.background, borderColor: ui.card.border },
        isCompact ? styles.cardCompact : styles.cardSpacious,
      ]}
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
          weight="semibold"
          style={[styles.title, isCompact ? styles.titleCompact : styles.titleSpacious]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="caption"
            style={[styles.subtitle, { color: colors.text.muted }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        {date && (
          <Text variant="caption" style={[styles.date, { color: colors.text.muted }]}>
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

      {showArrow && <ChevronRight size={20} color={colors.text.muted} style={styles.arrow} />}

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
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardCompact: {
    padding: 14,
    gap: 12,
  },
  cardSpacious: {
    padding: 16,
    gap: 14,
  },
  iconGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCompact: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  iconSpacious: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  emoji: {
    textAlign: 'center',
  },
  emojiCompact: {
    fontSize: 22,
  },
  emojiSpacious: {
    fontSize: 26,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
  titleCompact: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 2,
  },
  titleSpacious: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  image: {
    borderRadius: 12,
  },
  imageCompact: {
    width: 56,
    height: 56,
  },
  imageSpacious: {
    width: 64,
    height: 64,
  },
  arrow: {
    marginLeft: 4,
  },
  optionsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  optionsText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
