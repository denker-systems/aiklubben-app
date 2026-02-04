import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Text } from './Text';
import { ChevronRight } from 'lucide-react-native';

interface ImageCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  image?: string;
  emoji?: string;
  emojiBgColor?: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
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
        <View style={[
          isHorizontal ? styles.horizontalEmoji : styles.verticalEmoji, 
          { backgroundColor: emojiBgColor }
        ]}>
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
            <Text variant="tiny" weight="bold" style={styles.actionText}>LÄS MER</Text>
            <ChevronRight size={12} color="#8B5CF6" strokeWidth={3} />
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  verticalContainer: {
    width: '100%',
  },
  horizontalContainer: {
    flexDirection: 'row',
    height: 120,
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
    color: '#8B5CF6',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    marginBottom: 6,
  },
  date: {
    color: '#9CA3AF',
    marginBottom: 8,
  },
  description: {
    color: '#9CA3AF',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#8B5CF6',
    marginRight: 4,
  },
});
