import React, { useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { NewsScreen } from '@/screens/news/NewsScreen';
import { ContentScreen } from '@/screens/content/ContentScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { NewsDetailScreen } from '@/screens/news/NewsDetailScreen';
import { ContentDetailScreen } from '@/screens/content/ContentDetailScreen';
import { FloatingTabBar } from '@/components/ui/FloatingTabBar';
import { FullscreenMenu } from '@/components/ui/FullscreenMenu';
import { MenuProvider, useMenu } from '@/contexts/MenuContext';
import { RootStackParamList } from '@/types/navigation';
import { brandColors } from '@/config/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigatorContent = () => {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('Home');
  const menuContext = useMenu();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brandColors.purple} />
      </View>
    );
  }

  const handleTabPress = (key: string) => {
    setActiveTab(key);
  };

  const handleNavigate = (screen: string) => {
    setActiveTab(screen);
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
    <NavigationContainer theme={navigationTheme}>
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
              {activeTab === 'Content' && <Stack.Screen name="Content" component={ContentScreen} />}
              {activeTab === 'Profile' && <Stack.Screen name="Profile" component={ProfileScreen} />}
              <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
              <Stack.Screen name="ContentDetail" component={ContentDetailScreen} />
            </>
          )}
        </Stack.Navigator>

        {user && <FloatingTabBar activeTab={activeTab} onTabPress={handleTabPress} />}
        
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
  <MenuProvider>
    <AppNavigatorContent />
  </MenuProvider>
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
