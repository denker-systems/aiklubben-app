import React, { useCallback } from 'react';
import { View, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { ScreenWrapper } from '@/components/layout';
import { Text, Card } from '@/components/ui';
import { brandColors } from '@/config/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import {
  Bell,
  Lock,
  Moon,
  CircleUser,
  ChevronRight,
  Info,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react-native';

export const SettingsScreen = () => {
  console.log('[SettingsScreen] Rendered');
  
  const navigation = useNavigation<any>();
  const canGoBack = useNavigationState(state => state.routes.length > 1);
  const { isDark, toggleTheme, notificationsEnabled, setNotificationsEnabled, colors } = useTheme();
  const { signOut } = useAuth();

  const handleProfileSettings = useCallback(() => {
    console.log('[SettingsScreen] handleProfileSettings - navigating to Profile');
    navigation.navigate('Profile');
  }, [navigation]);

  const handleChangePassword = useCallback(() => {
    console.log('[SettingsScreen] handleChangePassword');
    Alert.alert(
      'Byt lösenord',
      'Vi skickar en länk till din e-post för att återställa ditt lösenord.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Skicka länk',
          onPress: () => {
            Alert.alert('Skickat!', 'Kolla din e-post för att återställa lösenordet.');
          },
        },
      ]
    );
  }, []);

  const handlePrivacySettings = useCallback(() => {
    navigation.navigate('Privacy');
  }, [navigation]);

  const handleSupport = useCallback(() => {
    navigation.navigate('Support');
  }, [navigation]);

  const handleAbout = useCallback(() => {
    navigation.navigate('About');
  }, [navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert('Logga ut', 'Är du säker på att du vill logga ut?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Logga ut',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }, [signOut]);

  return (
    <ScreenWrapper title="Inställningar" showBack={canGoBack}>
      {/* App Settings */}
      <View style={styles.section}>
        <Text variant="tiny" weight="bold" style={[styles.sectionTitle, { color: colors.text.muted }]}>
          APP-INSTÄLLNINGAR
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            icon={Bell}
            title="Aviseringar"
            colors={colors}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.glass.strong, true: brandColors.purple }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#F4F3F4'}
              />
            }
          />
          <SettingsRow
            icon={Moon}
            title="Mörkt läge"
            colors={colors}
            isLast
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.glass.strong, true: brandColors.purple }}
                thumbColor={isDark ? '#FFFFFF' : '#F4F3F4'}
              />
            }
          />
        </Card>
      </View>

      {/* Account & Security */}
      <View style={styles.section}>
        <Text variant="tiny" weight="bold" style={[styles.sectionTitle, { color: colors.text.muted }]}>
          KONTO & SÄKERHET
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            icon={CircleUser}
            title="Profilinställningar"
            colors={colors}
            showArrow
            onPress={handleProfileSettings}
          />
          <SettingsRow
            icon={Lock}
            title="Byt lösenord"
            colors={colors}
            showArrow
            onPress={handleChangePassword}
          />
          <SettingsRow
            icon={Shield}
            title="Integritetsinställningar"
            colors={colors}
            showArrow
            isLast
            onPress={handlePrivacySettings}
          />
        </Card>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text variant="tiny" weight="bold" style={[styles.sectionTitle, { color: colors.text.muted }]}>
          HJÄLP & SUPPORT
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            icon={HelpCircle}
            title="Support"
            colors={colors}
            showArrow
            onPress={handleSupport}
          />
          <SettingsRow
            icon={Info}
            title="Om appen"
            colors={colors}
            showArrow
            isLast
            onPress={handleAbout}
          />
        </Card>
      </View>

      {/* About App */}
      <View style={styles.section}>
        <Text variant="tiny" weight="bold" style={[styles.sectionTitle, { color: colors.text.muted }]}>
          OM APPEN
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            title="Version"
            colors={colors}
            isLast
            right={
              <Text variant="body" style={{ color: colors.text.muted }}>
                1.0.0
              </Text>
            }
          />
        </Card>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Card variant="glass" noPadding>
          <SettingsRow
            icon={LogOut}
            title="Logga ut"
            colors={colors}
            isLast
            onPress={handleLogout}
            destructive
          />
        </Card>
      </View>
    </ScreenWrapper>
  );
};

interface SettingsRowProps {
  icon?: React.ComponentType<any>;
  title: string;
  right?: React.ReactNode;
  showArrow?: boolean;
  onPress?: () => void;
  isLast?: boolean;
  destructive?: boolean;
  colors: any;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon: Icon,
  title,
  right,
  showArrow,
  onPress,
  isLast,
  destructive,
  colors,
}) => {
  const content = (
    <View
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
      ]}
    >
      <View style={styles.rowContent}>
        {Icon && (
          <View style={styles.iconContainer}>
            <Icon size={20} color={destructive ? '#EF4444' : brandColors.purple} />
          </View>
        )}
        <Text
          variant="body"
          weight="medium"
          style={{ color: destructive ? '#EF4444' : colors.text.primary }}
        >
          {title}
        </Text>
      </View>
      {right}
      {showArrow && <ChevronRight size={20} color={colors.text.muted} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: 0.7, backgroundColor: colors.glass.pressed }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    marginRight: 12,
    alignItems: 'center',
  },
});
