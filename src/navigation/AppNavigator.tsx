import React, { useState, useEffect } from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
// ... rest of imports
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { NewsScreen } from '@/screens/news/NewsScreen';
import { ContentScreen } from '@/screens/content/ContentScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';
import { SupportScreen } from '@/screens/SupportScreen';
import { PrivacyScreen } from '@/screens/PrivacyScreen';
import { AboutScreen } from '@/screens/AboutScreen';
import { NewsDetailScreen } from '@/screens/news/NewsDetailScreen';
import { ContentDetailScreen } from '@/screens/content/ContentDetailScreen';
import { CoursesScreen, CourseDetailScreen } from '@/screens/courses';
import { LessonScreen } from '@/screens/lessons';
import { FloatingTabBar } from '@/components/ui/FloatingTabBar';
import { FullscreenMenu } from '@/components/ui/FullscreenMenu';
import { MenuProvider, useMenu } from '@/contexts/MenuContext';
import { TabNavigationProvider, useTabNavigation } from '@/contexts/TabNavigationContext';
import { RootStackParamList } from '@/types/navigation';
import { brandColors } from '@/config/theme';

const navigationRef = createNavigationContainerRef<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigatorContent = () => {
  const { user, loading, signOut } = useAuth();
  const { activeTab, setActiveTab } = useTabNavigation();
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const menuContext = useMenu();

  console.log('[AppNavigator] Rendered', { hasUser: !!user, loading, activeTab });

  useEffect(() => {
    console.log('[AppNavigator] Setting up navigation listener');
    
    const unsubscribe = navigationRef.addListener('state', () => {
      if (navigationRef.isReady()) {
        const routeName = navigationRef.getCurrentRoute()?.name;
        console.log('[AppNavigator] Navigation state changed', { routeName });
        
        // Dölj tab bar på specifika screens
        const hideOnScreens = ['Lesson', 'CourseDetail', 'NewsDetail', 'ContentDetail', 'Auth'];
        const shouldHide = hideOnScreens.includes(routeName || '');
        console.log('[AppNavigator] Tab bar visibility', { routeName, shouldHide });
        setIsTabBarVisible(!shouldHide);
      }
    });

    return () => {
      console.log('[AppNavigator] Cleaning up navigation listener');
      unsubscribe();
    };
  }, []);

  if (loading) {
    console.log('[AppNavigator] Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brandColors.purple} />
      </View>
    );
  }

  const handleTabPress = (key: string) => {
    console.log('[AppNavigator] handleTabPress', { key });
    const validTabs = ['Home', 'News', 'Courses', 'Content', 'Profile'] as const;
    if (validTabs.includes(key as (typeof validTabs)[number])) {
      console.log('[AppNavigator] Setting active tab:', key);
      
      // Reset navigation stack to the tab screen when switching tabs
      if (navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute()?.name;
        const tabScreens = ['Home', 'News', 'Courses', 'Content', 'Profile'];
        
        // If we're on a detail/settings screen, navigate to the tab screen first
        if (currentRoute && !tabScreens.includes(currentRoute)) {
          console.log('[AppNavigator] Resetting to tab screen from:', currentRoute);
          navigationRef.navigate(key as any);
        }
      }
      
      setActiveTab(key as (typeof validTabs)[number]);
    } else {
      console.warn('[AppNavigator] Invalid tab key:', key);
    }
  };

  const handleNavigate = (screen: any) => {
    console.log('[AppNavigator] handleNavigate', { screen });
    menuContext?.closeMenu();
    if (['Home', 'News', 'Courses', 'Content', 'Profile'].includes(screen)) {
      console.log('[AppNavigator] Navigating to tab:', screen);
      setActiveTab(screen);
    } else if (navigationRef.isReady()) {
      console.log('[AppNavigator] Navigating to screen:', screen);
      navigationRef.navigate(screen);
    } else {
      console.warn('[AppNavigator] Navigation not ready');
    }
  };

  const navigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: brandColors.purple,
      background: brandColors.deepDark,
      card: brandColors.darkBg,
      text: '#F9FAFB',
      border: brandColors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme} ref={navigationRef}>
      <View style={styles.container}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          {!user ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              {activeTab === 'Home' && <Stack.Screen name="Home" component={HomeScreen} />}
              {activeTab === 'News' && <Stack.Screen name="News" component={NewsScreen} />}
              {activeTab === 'Courses' && <Stack.Screen name="Courses" component={CoursesScreen} />}
              {activeTab === 'Content' && <Stack.Screen name="Content" component={ContentScreen} />}
              {activeTab === 'Profile' && <Stack.Screen name="Profile" component={ProfileScreen} />}
              <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
              <Stack.Screen name="ContentDetail" component={ContentDetailScreen} />
              <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
              <Stack.Screen name="Lesson" component={LessonScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Support" component={SupportScreen} />
              <Stack.Screen name="Privacy" component={PrivacyScreen} />
              <Stack.Screen name="About" component={AboutScreen} />
            </>
          )}
        </Stack.Navigator>

        {user && isTabBarVisible && (
          <FloatingTabBar activeTab={activeTab} onTabPress={handleTabPress} />
        )}

        <FullscreenMenu
          visible={menuContext?.menuVisible || false}
          onClose={() => menuContext?.closeMenu()}
          onNavigate={handleNavigate}
          onLogout={() => signOut()}
        />
      </View>
    </NavigationContainer>
  );
};

export const AppNavigator = () => (
  <TabNavigationProvider>
    <MenuProvider>
      <AppNavigatorContent />
    </MenuProvider>
  </TabNavigationProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: brandColors.deepDark,
  },
});
