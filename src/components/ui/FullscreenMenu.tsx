import React, { useState, useEffect } from 'react';
import { ScrollView, Pressable, Modal, StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';
import { Text } from './Text';
import { FloatingOrbs } from './FloatingOrbs';

interface MenuItemData {
  key: string;
  emoji: string;
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

const menuSections: MenuSectionData[] = [
  {
    title: 'Huvudmeny',
    items: [
      {
        key: 'Home',
        emoji: '🏠',
        title: 'Hem',
        subtitle: 'Tillbaka till startsidan',
        gradient: ['#6366f1', '#8b5cf6'],
      },
      {
        key: 'News',
        emoji: '📰',
        title: 'Nyheter',
        subtitle: 'Senaste inom AI',
        gradient: ['#f97316', '#ea580c'],
      },
      {
        key: 'Content',
        emoji: '📚',
        title: 'Innehåll',
        subtitle: 'Kurser och resurser',
        gradient: ['#10B981', '#059669'],
      },
    ],
  },
  {
    title: 'Mitt konto',
    items: [
      {
        key: 'Profile',
        emoji: '👤',
        title: 'Min Profil',
        subtitle: 'Hantera ditt medlemskap',
        gradient: ['#8B5CF6', '#a855f7'],
      },
      {
        key: 'Settings',
        emoji: '⚙️',
        title: 'Inställningar',
        subtitle: 'App- och kontoinställningar',
        gradient: ['#6B7280', '#4B5563'],
      },
    ],
  },
  {
    title: 'Support & Info',
    items: [
      {
        key: 'Support',
        emoji: '💬',
        title: 'Support',
        subtitle: 'Kontakta oss',
        gradient: ['#3B82F6', '#2563EB'],
      },
      {
        key: 'Privacy',
        emoji: '🔒',
        title: 'Integritetspolicy',
        subtitle: 'Hur vi hanterar din data',
        gradient: ['#14B8A6', '#0D9488'],
      },
      {
        key: 'About',
        emoji: 'ℹ️',
        title: 'Om AI Klubben',
        subtitle: 'Lär känna oss bättre',
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
        title: 'Logga ut',
        subtitle: 'Avsluta din session',
        gradient: ['#EF4444', '#DC2626'],
      },
    ],
  },
];

export function FullscreenMenu({ visible, onClose, onNavigate, onLogout }: FullscreenMenuProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
    }
  }, [visible, showContent]);

  const handleItemPress = (key: string) => {
    if (key === 'logout') {
      onLogout?.();
      onClose();
    } else {
      onNavigate?.(key);
      onClose();
    }
  };

  const backgroundColor = isDark ? '#0C0A17' : '#FFFFFF';

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
              <Text style={styles.logoEmoji}>✨</Text>
              <Text variant="h2" style={styles.menuTitle}>
                Meny
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Text style={styles.closeEmoji}>✕</Text>
            </Pressable>
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
                <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
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
                    <Pressable
                      style={({ pressed }) => [
                        styles.menuItem,
                        item.key === 'logout' && styles.logoutItem,
                        pressed && styles.menuItemPressed,
                      ]}
                      onPress={() => handleItemPress(item.key)}
                    >
                      <LinearGradient
                        colors={item.gradient || ['#6366f1', '#8b5cf6']}
                        style={styles.menuItemIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
                      </LinearGradient>
                      <View style={styles.menuItemContent}>
                        <Text
                          style={[styles.menuItemTitle, item.key === 'logout' && styles.logoutText]}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                      </View>
                      <Text style={styles.menuItemArrow}>›</Text>
                    </Pressable>
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
    color: '#F9FAFB',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ scale: 0.95 }],
  },
  closeEmoji: {
    fontSize: 18,
    color: '#9CA3AF',
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
    color: '#6B7280',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 14,
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
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutText: {
    color: '#EF4444',
  },
  menuItemSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  menuItemArrow: {
    fontSize: 28,
    color: '#4B5563',
    fontWeight: '300',
  },
});

export default FullscreenMenu;
