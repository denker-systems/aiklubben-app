import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../ui/Text';
import { useTheme } from '@/contexts/ThemeContext';
import { useMenu } from '@/contexts/MenuContext';
import { useTabNavigationSafe } from '@/contexts/TabNavigationContext';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  backToTab?: 'Home' | 'News' | 'Courses' | 'Content' | 'Profile';
  rightContent?: React.ReactNode;
}

export function PageHeader({
  title,
  showBack = false,
  onBackPress,
  backToTab,
  rightContent,
}: PageHeaderProps) {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const menuContext = useMenu();
  const tabNavigation = useTabNavigationSafe();
  const textColor = isDark ? '#FAFAFA' : '#111827';

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (backToTab && tabNavigation) {
      tabNavigation.navigateToTab(backToTab);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: isDark ? '#0C0A17' : '#FFFFFF' }]}>
      <View style={styles.leftSection}>
        {showBack && (
          <Pressable style={styles.iconButton} onPress={handleBack}>
            <ChevronLeft size={24} color={textColor} />
          </Pressable>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text variant="h3" weight="bold" style={{ color: textColor }}>
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {rightContent || (
          <Pressable style={styles.iconButton} onPress={() => menuContext?.openMenu()}>
            <Menu size={24} color={textColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42, 36, 69, 0.3)',
  },
  leftSection: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 48,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
