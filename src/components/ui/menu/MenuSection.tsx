import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { MenuItem } from './MenuItem';
import { useTheme } from '@/contexts/ThemeContext';

export interface MenuItemData {
  key: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  subtitle?: string;
}

interface MenuSectionProps {
  title?: string;
  items: MenuItemData[];
  onItemPress: (key: string) => void;
}

export function MenuSection({ title, items, onItemPress }: MenuSectionProps) {
  const { isDark } = useTheme();
  const sectionTitleColor = isDark ? '#4B5563' : '#9CA3AF';

  return (
    <View style={styles.section}>
      {title ? (
        <Text variant="caption" weight="bold" style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          {title}
        </Text>
      ) : null}
      {items.map((item) => (
        <MenuItem
          key={item.key}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          onPress={() => onItemPress(item.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
