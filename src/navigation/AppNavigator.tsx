import React, { useState, useEffect, useCallback } from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/config/supabase';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { SignupScreen } from '@/screens/auth/SignupScreen';
import { StartScreen } from '@/screens/start/StartScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
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
import { useTheme } from '@/contexts/ThemeContext';
import { registerPushToken } from '@/hooks/useNotifications';

const navigationRef = createNavigationContainerRef<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigatorContent = () => {
  const { user, loading, signOut } = useAuth();
  const { activeTab, setActiveTab } = useTabNavigation();
  const { isDark, colors } = useTheme();
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState<boolean | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const menuContext = useMenu();

  // Check AsyncStorage for start completion (device-level, before auth)
  useEffect(() => {
    AsyncStorage.getItem('@aiklubben_has_started').then((val) => {
      setHasStarted(val === 'true');
    });
  }, []);

  // Check Supabase profiles for onboarding completion (account-level, after auth)
  useEffect(() => {
    if (!user) {
      setHasOnboarded(null);
      return;
    }
    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('has_done_onboarding')
        .eq('id', user.id)
        .single();
      setHasOnboarded(data?.has_done_onboarding ?? false);
    };
    checkOnboarding();
    registerPushToken(user.id);
  }, [user]);

  const handleStartComplete = useCallback(() => {
    setHasStarted(true);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setHasOnboarded(true);
  }, []);

  const handleGuestMode = useCallback(() => {
    if (isGuest) {
      // Already in guest mode - just navigate back to News
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'News' as any }] });
      }
      setActiveTab('News');
      setIsTabBarVisible(true);
      return;
    }
    setIsGuest(true);
    setIsTabBarVisible(true);
    setActiveTab('News');
  }, [isGuest, setActiveTab]);

  const handleGuestSignIn = useCallback(() => {
    setIsGuest(false);
  }, []);

  // Guest mode resets if user logs in
  useEffect(() => {
    if (user && isGuest) {
      setIsGuest(false);
    }
  }, [user, isGuest]);

  console.log('[AppNavigator] Rendered', {
    hasUser: !!user,
    loading,
    activeTab,
    hasStarted,
    hasOnboarded,
    isGuest,
  });

  useEffect(() => {
    console.log('[AppNavigator] Setting up navigation listener');

    const unsubscribe = navigationRef.addListener('state', () => {
      if (navigationRef.isReady()) {
        const routeName = navigationRef.getCurrentRoute()?.name;
        console.log('[AppNavigator] Navigation state changed', { routeName });

        // Visa tab bar bara på bas-skärmar
        const tabBaseScreens = ['Home', 'News', 'Courses', 'Content', 'Profile'];
        const shouldHide = !tabBaseScreens.includes(routeName || '');
        console.log('[AppNavigator] Tab bar visibility', { routeName, shouldHide });
        setIsTabBarVisible(!shouldHide);
      }
    });

    return () => {
      console.log('[AppNavigator] Cleaning up navigation listener');
      unsubscribe();
    };
  }, [isGuest]);

  if (loading || hasStarted === null || (!isGuest && user && hasOnboarded === null)) {
    console.log('[AppNavigator] Showing loading screen');
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={brandColors.purple} />
      </View>
    );
  }

  // Show Start screen before auth (language/region selection)
  if (!hasStarted) {
    return <StartScreen onComplete={handleStartComplete} />;
  }

  // Show Onboarding after first login
  if (user && !hasOnboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const handleTabPress = (key: string) => {
    console.log('[AppNavigator] handleTabPress', { key });
    const validTabs = ['Home', 'News', 'Courses', 'Content', 'Profile'] as const;
    if (validTabs.includes(key as (typeof validTabs)[number])) {
      console.log('[AppNavigator] Setting active tab:', key);

      if (navigationRef.isReady()) {
        // For guest mode: navigate directly since all screens are registered in the stack
        if (isGuest) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: key as any }],
          });
        } else {
          // For logged-in users: pop detail screens first, then switch tab
          const state = navigationRef.getState();
          if (state && state.routes.length > 1) {
            const baseRoute = state.routes[0].name;
            navigationRef.reset({
              index: 0,
              routes: [{ name: baseRoute as any }],
            });
          }
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
    const userTabScreens = ['Home', 'News', 'Courses', 'Content', 'Profile'];
    const guestTabScreens = ['News', 'Content'];
    const tabScreens = isGuest ? guestTabScreens : userTabScreens;
    if (tabScreens.includes(screen)) {
      console.log('[AppNavigator] Navigating to tab:', screen);
      // Reset stack when navigating to a tab from the menu
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: screen }],
        });
      }
      setActiveTab(screen);
    } else if (navigationRef.isReady()) {
      console.log('[AppNavigator] Navigating to screen:', screen);
      navigationRef.navigate(screen);
    } else {
      console.warn('[AppNavigator] Navigation not ready');
    }
  };

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: brandColors.purple,
      background: colors.background,
      card: colors.surface,
      text: colors.text.primary,
      border: colors.border.default,
    },
  };

  // Determine auth mode key - forces NavigationContainer remount on auth state change
  const authMode = user ? 'user' : isGuest ? 'guest' : 'anon';

  return (
    <NavigationContainer key={authMode} theme={navigationTheme} ref={navigationRef}>
      <View style={styles.container}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          {authMode === 'anon' ? (
            <>
              <Stack.Screen name="Auth">
                {(props) => <AuthScreen {...props} onGuestMode={handleGuestMode} />}
              </Stack.Screen>
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          ) : authMode === 'guest' ? (
            <>
              <Stack.Screen name="News" component={NewsScreen} />
              <Stack.Screen name="Content" component={ContentScreen} />
              <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
              <Stack.Screen name="ContentDetail" component={ContentDetailScreen} />
              <Stack.Screen name="Auth">
                {(props) => <AuthScreen {...props} onGuestMode={handleGuestMode} />}
              </Stack.Screen>
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Support" component={SupportScreen} />
              <Stack.Screen name="Privacy" component={PrivacyScreen} />
              <Stack.Screen name="About" component={AboutScreen} />
            </>
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

        {authMode !== 'anon' && isTabBarVisible && (
          <FloatingTabBar
            activeTab={activeTab}
            onTabPress={handleTabPress}
            isGuest={isGuest}
            onGuestSignIn={handleGuestSignIn}
          />
        )}

        <FullscreenMenu
          visible={menuContext?.menuVisible || false}
          onClose={() => menuContext?.closeMenu()}
          onNavigate={handleNavigate}
          onLogout={() => signOut()}
          isGuest={isGuest}
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
  },
});
