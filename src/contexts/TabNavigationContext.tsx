import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type TabKey = 'Home' | 'News' | 'Courses' | 'Content' | 'Profile';

interface TabNavigationContextType {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  navigateToTab: (tab: TabKey) => void;
}

const TabNavigationContext = createContext<TabNavigationContextType | null>(null);

interface TabNavigationProviderProps {
  children: ReactNode;
}

export const TabNavigationProvider: React.FC<TabNavigationProviderProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');

  const navigateToTab = useCallback((tab: TabKey) => {
    console.log('[TabNavigationContext] Navigating to tab:', tab);
    setActiveTab(tab);
  }, []);

  return (
    <TabNavigationContext.Provider value={{ activeTab, setActiveTab, navigateToTab }}>
      {children}
    </TabNavigationContext.Provider>
  );
};

export const useTabNavigation = (): TabNavigationContextType => {
  const context = useContext(TabNavigationContext);
  if (!context) {
    throw new Error('useTabNavigation must be used within a TabNavigationProvider');
  }
  return context;
};

export const useTabNavigationSafe = (): TabNavigationContextType | null => {
  return useContext(TabNavigationContext);
};
