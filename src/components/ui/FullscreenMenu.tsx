import React from 'react';
import { ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Newspaper,
  BookOpen,
  User,
  Settings,
  LogOut,
  Info,
  ShieldCheck,
  MessageSquare
} from 'lucide-react-native';
import { MenuHeader, MenuSection } from './menu';
import type { MenuItemData } from './menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SPRING_CONFIGS, TIMING_CONFIGS } from '@/lib/animations';

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

const getMenuSections = (t: (key: string) => string): MenuSectionData[] => [
  {
    title: 'Huvudmeny',
    items: [
      {
        key: 'Home',
        icon: Home,
        title: 'Hem',
        subtitle: 'Tillbaka till startsidan',
      },
      {
        key: 'News',
        icon: Newspaper,
        title: 'Nyheter',
        subtitle: 'Senaste inom AI',
      },
      {
        key: 'Content',
        icon: BookOpen,
        title: 'Innehåll',
        subtitle: 'Kurser och resurser',
      },
    ],
  },
  {
    title: 'Mitt konto',
    items: [
      {
        key: 'Profile',
        icon: User,
        title: 'Min Profil',
        subtitle: 'Hantera ditt medlemskap',
      },
      {
        key: 'Settings',
        icon: Settings,
        title: 'Inställningar',
        subtitle: 'App- och kontoinställningar',
      },
    ],
  },
  {
    title: 'Support & Info',
    items: [
      {
        key: 'Support',
        icon: MessageSquare,
        title: 'Support',
        subtitle: 'Kontakta oss',
      },
      {
        key: 'Privacy',
        icon: ShieldCheck,
        title: 'Integritetspolicy',
        subtitle: 'Hur vi hanterar din data',
      },
      {
        key: 'About',
        icon: Info,
        title: 'Om AI Klubben',
        subtitle: 'Lär känna oss bättre',
      },
    ],
  },
  {
    title: '',
    items: [{ key: 'logout', icon: LogOut, title: 'Logga ut', subtitle: 'Avsluta din session' }],
  },
];

export function FullscreenMenu({ visible, onClose, onNavigate, onLogout }: FullscreenMenuProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const menuSections = getMenuSections(t);

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
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <MotiView
        style={[styles.overlay, { pointerEvents: visible ? 'auto' : 'none' }]}
        from={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={TIMING_CONFIGS.fast}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <MotiView
          style={[
            styles.menuContainer,
            {
              backgroundColor,
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom, 20),
              paddingLeft: insets.left,
              paddingRight: insets.right,
            },
          ]}
          from={{ translateX: 400 }}
          animate={{ translateX: visible ? 0 : 400 }}
          exit={{ translateX: 400 }}
          transition={SPRING_CONFIGS.smooth}
        >
          <MenuHeader title="Meny" onClose={onClose} />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {menuSections.map((section, index) => (
              <MenuSection
                key={section.title || `section-${index}`}
                title={section.title}
                items={section.items}
                onItemPress={handleItemPress}
              />
            ))}
          </ScrollView>
        </MotiView>
      </MotiView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});

export default FullscreenMenu;
