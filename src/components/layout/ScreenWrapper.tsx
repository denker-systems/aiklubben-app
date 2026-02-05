import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import { PageHeader } from './PageHeader';

interface ScreenWrapperProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  headerRight?: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle | ViewStyle[];
  noPadding?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ScreenWrapper({
  children,
  title,
  showBack = false,
  onBackPress,
  headerRight,
  scrollable = true,
  style,
  contentStyle,
  noPadding = false,
  onRefresh,
  refreshing = false,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const backgroundColor = isDark ? '#0C0A17' : '#F9FAFB';

  const containerStyle = [styles.container, { backgroundColor, paddingTop: insets.top }, style];

  const innerStyle = [
    !noPadding && styles.padding,
    { paddingBottom: insets.bottom + 100 },
  ];

  const content = (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={[styles.flex, contentStyle]}
    >
      {children}
    </MotiView>
  );

  return (
    <View style={containerStyle}>
      {title && (
        <PageHeader
          title={title}
          showBack={showBack}
          onBackPress={onBackPress}
          rightContent={headerRight}
        />
      )}
      {scrollable ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[{ flexGrow: 1 }, innerStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
            ) : undefined
          }
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.flex, innerStyle]}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: 20,
  },
});
