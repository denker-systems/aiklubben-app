import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '../Text';
import { useTheme } from '@/contexts/ThemeContext';
import { brandColors } from '@/config/theme';

const ICON_SIZE = 44;

interface MenuItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export function MenuItem({ icon: Icon, title, subtitle, onPress }: MenuItemProps) {
  const { isDark } = useTheme();
  const textColor = isDark ? '#FAFAFA' : '#171717';
  const mutedColor = '#9CA3AF';
  const iconBgColor = isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)';
  const iconColor = brandColors.purple;

  return (
    <Pressable
      style={({ pressed }) => [pressed && { backgroundColor: isDark ? '#1D1933' : '#F3F4F6' }]}
      onPress={onPress}
    >
      <View style={styles.container}>
        <View style={[styles.icon, { backgroundColor: iconBgColor }]}>
          <Icon size={22} color={iconColor} />
        </View>

        <View style={styles.textArea}>
          <Text variant="body-lg" weight="semibold" style={{ color: textColor }} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="body-sm" style={{ color: mutedColor, marginTop: 2 }} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <ChevronRight size={20} color="#4B5563" style={styles.chevron} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 64,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  textArea: {
    flex: 1,
    justifyContent: 'center',
  },
  chevron: {
    flexShrink: 0,
    marginLeft: 8,
  },
});
