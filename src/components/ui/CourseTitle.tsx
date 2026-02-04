import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { Badge } from '../ui/Badge';

interface CourseTitleProps {
  title: string;
  level?: string;
  category?: string;
}

export function CourseTitle({ title, level, category }: CourseTitleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        {category && (
          <Badge label={category} variant="primary" style={styles.badge} />
        )}
        {level && (
          <Badge label={level} variant="outline" style={styles.badge} />
        )}
      </View>
      <Text variant="h1" weight="bold" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    marginRight: 0,
  },
  title: {
    lineHeight: 34,
  },
});
