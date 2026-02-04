import React from 'react';
import { View, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Card } from './Card';
import { Text } from './Text';
import { ChevronRight } from 'lucide-react-native';
import { brandColors } from '@/config/theme';
import { uiColors } from '@/config/design';

interface ImageCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  image?: string;
  emoji?: string;
  emojiBgColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'vertical' | 'horizontal';
}

export function ImageCard({
  title,
  subtitle,
  description,
  date,
  image,
  emoji,
  emojiBgColor = 'rgba(139, 92, 246, 0.1)',
  onPress,
  style,
  variant = 'vertical',
}: ImageCardProps) {
  const isHorizontal = variant === 'horizontal';

  return (
    <Card
      onPress={onPress}
      variant="elevated"
      noPadding
      style={[isHorizontal ? styles.horizontalContainer : styles.verticalContainer, style]}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={isHorizontal ? styles.horizontalImage : styles.verticalImage}
          resizeMode="cover"
        />
      ) : emoji ? (
        <View
          style={[
            isHorizontal ? styles.horizontalEmoji : styles.verticalEmoji,
            { backgroundColor: emojiBgColor },
          ]}
        >
          <Text style={styles.emojiText}>{emoji}</Text>
        </View>
      ) : null}

      <View style={styles.content}>
        {subtitle && (
          <Text variant="tiny" weight="bold" style={styles.subtitle}>
            {subtitle.toUpperCase()}
          </Text>
        )}
        <Text variant="body-lg" weight="bold" numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        {date && (
          <Text variant="tiny" style={styles.date}>
            {date}
          </Text>
        )}
        {description && (
          <Text variant="body-sm" numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        )}
        {onPress && (
          <View style={styles.footer}>
            <Text variant="tiny" weight="bold" style={styles.actionText}>
              LÄS MER
            </Text>
            <ChevronRight size={12} color={brandColors.purple} strokeWidth={3} />
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  verticalContainer: {
    width: '100%',
    backgroundColor: uiColors.card.background,
    borderColor: uiColors.card.border,
  },
  horizontalContainer: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: uiColors.card.background,
    borderColor: uiColors.card.border,
  },
  verticalImage: {
    width: '100%',
    height: 180,
  },
  horizontalImage: {
    width: 120,
    height: '100%',
  },
  verticalEmoji: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalEmoji: {
    width: 120,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 48,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    color: brandColors.purple,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    marginBottom: 6,
    color: uiColors.text.primary,
  },
  date: {
    color: uiColors.text.secondary,
    marginBottom: 8,
  },
  description: {
    color: uiColors.text.secondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: brandColors.purple,
    marginRight: 4,
  },
});
