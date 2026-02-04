import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { brandColors } from '@/config/theme';

interface NewsTitleProps {
  title: string;
  category?: string;
  emoji?: string;
}

export function NewsTitle({ title, category, emoji }: NewsTitleProps) {
  return (
    <View style={styles.container}>
      {(category || emoji) && (
        <View style={styles.headerRow}>
          {emoji && <Text style={styles.emoji}>{emoji}</Text>}
          {category && (
            <Text variant="tiny" weight="bold" style={styles.category}>
              {category.toUpperCase()}
            </Text>
          )}
        </View>
      )}
      <Text variant="h1" weight="bold" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  category: {
    color: brandColors.purple,
    letterSpacing: 1.5,
  },
  title: {
    lineHeight: 34,
  },
});
