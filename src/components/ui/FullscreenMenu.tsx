import React, { useState, useEffect } from 'react';
import { ScrollView, Pressable, Modal, StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';
import { Text } from './Text';
import { FloatingOrbs } from './FloatingOrbs';
import { AppIcon } from './AppIcon';

interface MenuItemData {
  key: string;
  emoji: string;
  iconName?: string;
  title: string;
  subtitle: string;
  gradient?: readonly [string, string];
}

interface MenuSectionData {
  title: string;
  items: MenuItemData[];
}

interface FullscreenMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export function FullscreenMenu({ visible, onClose, onNavigate, onLogout }: FullscreenMenuProps) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const menuSections: MenuSectionData[] = [
    {
      title: t.menu.mainMenu,
      items: [
        {
          key: 'Home',
          emoji: '🏠',
          iconName: 'home',
          title: t.nav.home,
          subtitle: t.menu.homeSubtitle,
          gradient: ['#6366f1', '#8b5cf6'],
        },
        {
          key: 'News',
          emoji: '📰',
          iconName: 'news',
          title: t.nav.news,
          subtitle: t.menu.newsSubtitle,
          gradient: ['#f97316', '#ea580c'],
        },
        {
          key: 'Content',
          emoji: '📚',
          title: t.menu.contentTitle,
          subtitle: t.menu.contentSubtitle,
          gradient: ['#10B981', '#059669'],
        },
      ],
    },
    {
      title: t.menu.myAccount,
      items: [
        {
          key: 'Profile',
          emoji: '👤',
          iconName: 'profile',
          title: t.menu.myProfile,
          subtitle: t.menu.myProfileSubtitle,
          gradient: ['#8B5CF6', '#a855f7'],
        },
        {
          key: 'Settings',
          emoji: '⚙️',
          title: t.settings.title,
          subtitle: t.menu.settingsSubtitle,
          gradient: ['#6B7280', '#4B5563'],
        },
      ],
    },
    {
      title: t.menu.supportInfo,
      items: [
        {
          key: 'Support',
          emoji: '💬',
          title: t.supportScreen.title,
          subtitle: t.menu.supportSubtitle,
          gradient: ['#3B82F6', '#2563EB'],
        },
        {
          key: 'Privacy',
          emoji: '🔒',
          title: t.privacy.title,
          subtitle: t.menu.privacySubtitle,
          gradient: ['#14B8A6', '#0D9488'],
        },
        {
          key: 'About',
          emoji: 'ℹ️',
          title: t.about.title,
          subtitle: t.menu.aboutSubtitle,
          gradient: ['#8B5CF6', '#6366f1'],
        },
      ],
    },
    {
      title: '',
      items: [
        {
          key: 'logout',
          emoji: '🚪',
          title: t.profile.logout,
          subtitle: t.menu.logoutSubtitle,
          gradient: ['#EF4444', '#DC2626'],
        },
      ],
    },
  ];
  const [showContent, setShowContent] = useState(false);

  console.log('[FullscreenMenu] Rendered', { visible, showContent });

  useEffect(() => {
    if (visible) {
      console.log('[FullscreenMenu] Menu opened');
      setShowContent(true);
    } else if (showContent) {
      // Delay hiding the modal to allow the close animation to finish
      console.log('[FullscreenMenu] Menu closing, waiting for animation...');
      const timer = setTimeout(() => {
        console.log('[FullscreenMenu] Animation done, hiding modal');
        setShowContent(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleItemPress = (key: string) => {
    console.log('[FullscreenMenu] Item pressed:', key);
    if (key === 'logout') {
      console.log('[FullscreenMenu] Logout pressed');
      onLogout?.();
      onClose();
    } else {
      console.log('[FullscreenMenu] Navigating to:', key);
      onNavigate?.(key);
      onClose();
    }
  };

  const backgroundColor = colors.background;

  return (
    <Modal
      visible={visible || showContent}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Fullscreen overlay with fade */}
      <MotiView
        style={[styles.overlay, { pointerEvents: visible ? 'auto' : 'none' }]}
        from={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={SPRING_CONFIGS.smooth}
      >
        {/* Background */}
        <MotiView
          style={[styles.fullscreenBg, { backgroundColor }]}
          from={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={SPRING_CONFIGS.smooth}
        >
          {/* Floating orbs for depth */}
          <FloatingOrbs variant="menu" visible={visible} />
        </MotiView>

        {/* Header with close button */}
        <MotiView
          style={[styles.header, { paddingTop: insets.top + 16 }]}
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: visible ? 1 : 0, translateY: visible ? 0 : -30 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: visible ? 50 : 0 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Text variant="h2" style={[styles.menuTitle, { color: colors.text.primary }]}>
                {t.menu.title}
              </Text>
            </View>
            <View style={[styles.closeButton, { backgroundColor: colors.glass.medium }]}>
              <Pressable
                onPress={() => {
                  console.log('[FullscreenMenu] Close button pressed');
                  onClose();
                }}
                style={styles.closeButtonPressable}
              >
                <Text style={[styles.closeEmoji, { color: colors.text.secondary }]}>✕</Text>
              </Pressable>
            </View>
          </View>
        </MotiView>

        {/* Scrollable menu content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {menuSections.map((section, sectionIndex) => (
            <MotiView
              key={section.title || `section-${sectionIndex}`}
              from={{ opacity: 0, translateX: -40 }}
              animate={{
                opacity: visible ? 1 : 0,
                translateX: visible ? 0 : -40,
              }}
              transition={{
                ...SPRING_CONFIGS.smooth,
                delay: visible ? 80 + sectionIndex * STAGGER_DELAYS.normal : 0,
              }}
            >
              {section.title && (
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{section.title.toUpperCase()}</Text>
              )}
              <View style={styles.sectionItems}>
                {section.items.map((item, itemIndex) => (
                  <MotiView
                    key={item.key}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{
                      opacity: visible ? 1 : 0,
                      translateX: visible ? 0 : -20,
                    }}
                    transition={{
                      ...SPRING_CONFIGS.smooth,
                      delay: visible ? 120 + sectionIndex * 80 + itemIndex * 40 : 0,
                    }}
                  >
                    <View
                      style={[
                        styles.menuItem,
                        { backgroundColor: colors.glass.strong },
                        item.key === 'logout' && styles.logoutItem,
                      ]}
                    >
                    <Pressable
                      style={styles.menuItemPressable}
                      onPress={() => handleItemPress(item.key)}
                    >
                      <LinearGradient
                        colors={item.gradient || ['#6366f1', '#8b5cf6']}
                        style={styles.menuItemIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {item.iconName ? (
                          <AppIcon name={item.iconName} size={52} />
                        ) : (
                          <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
                        )}
                      </LinearGradient>
                      <View style={styles.menuItemContent}>
                        <Text
                          style={[styles.menuItemTitle, item.key === 'logout' && styles.logoutText]}
                        >
                          {item.title}
                        </Text>
                        <Text style={[styles.menuItemSubtitle, { color: colors.text.muted }]}>{item.subtitle}</Text>
                      </View>
                      <Text style={[styles.menuItemArrow, { color: colors.text.secondary }]}>›</Text>
                    </Pressable>
                    </View>
                  </MotiView>
                ))}
              </View>
            </MotiView>
          ))}
        </ScrollView>
      </MotiView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  fullscreenBg: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoEmoji: {
    fontSize: 26,
  },
  menuTitle: {
    // color set dynamically by Text component
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    // backgroundColor set dynamically
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressable: {
    flex: 1,
    width: '100%' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ scale: 0.95 }],
  },
  closeEmoji: {
    fontSize: 18,
    // color set dynamically
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    // color set dynamically
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
  },
  sectionItems: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor set dynamically
    borderRadius: 16,
    padding: 14,
  },
  menuItemPressable: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ scale: 0.98 }],
  },
  logoutItem: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemEmoji: {
    fontSize: 22,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    // color set dynamically by Text component
    fontSize: 16,
    fontWeight: '600',
  },
  logoutText: {
    color: '#EF4444',
  },
  menuItemSubtitle: {
    // color set dynamically
    fontSize: 13,
    marginTop: 2,
  },
  menuItemArrow: {
    fontSize: 28,
    // color set dynamically
    fontWeight: '300',
  },
});

export default FullscreenMenu;
