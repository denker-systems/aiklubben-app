import React, { useCallback } from 'react';
import { View, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { ScreenWrapper } from '@/components/layout';
import { Text, Card } from '@/components/ui';
import { brandColors } from '@/config/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import {
  Bell,
  Lock,
  Moon,
  Globe,
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
  const { t, locale, setLocale } = useLanguage();
  const { signOut } = useAuth();

  const handleProfileSettings = useCallback(() => {
    console.log('[SettingsScreen] handleProfileSettings - navigating to Profile');
    navigation.navigate('Profile');
  }, [navigation]);

  const handleChangePassword = useCallback(() => {
    console.log('[SettingsScreen] handleChangePassword');
    Alert.alert(
      t.settings.changePassword,
      t.settings.changePasswordMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.settings.changePasswordSendLink,
          onPress: () => {
            Alert.alert(t.settings.changePasswordSent, t.settings.changePasswordSentMessage);
          },
        },
      ]
    );
  }, [t]);

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
    Alert.alert(t.settings.logoutConfirmTitle, t.settings.logoutConfirmMessage, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.settings.logoutConfirmTitle,
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }, [signOut, t]);

  return (
    <ScreenWrapper title={t.settings.title} showBack={canGoBack}>
      {/* App Settings */}
      <View style={styles.section}>
        <Text variant="tiny" weight="bold" style={[styles.sectionTitle, { color: colors.text.muted }]}>
          {t.settings.appSettings}
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            icon={Bell}
            title={t.settings.notifications}
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
            title={t.settings.darkMode}
            colors={colors}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.glass.strong, true: brandColors.purple }}
                thumbColor={isDark ? '#FFFFFF' : '#F4F3F4'}
              />
            }
          />
          <SettingsRow
            icon={Globe}
            title={t.settings.language}
            colors={colors}
            isLast
            right={
              <Pressable
                onPress={() => setLocale(locale === 'sv' ? 'en' : 'sv')}
                style={styles.languageToggle}
              >
                <Text variant="body" style={{ color: brandColors.purple, fontWeight: '600' }}>
                  {locale === 'sv' ? t.settings.swedish : t.settings.english}
                </Text>
              </Pressable>
            }
          />
        </Card>
      </View>

      {/* Account & Security */}
      <View style={styles.section}>
        <Text variant="tiny" weight="bold" style={[styles.sectionTitle, { color: colors.text.muted }]}>
          {t.settings.accountSecurity}
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            icon={CircleUser}
            title={t.settings.profileSettings}
            colors={colors}
            showArrow
            onPress={handleProfileSettings}
          />
          <SettingsRow
            icon={Lock}
            title={t.settings.changePassword}
            colors={colors}
            showArrow
            onPress={handleChangePassword}
          />
          <SettingsRow
            icon={Shield}
            title={t.settings.privacySettings}
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
          {t.settings.helpSupport}
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            icon={HelpCircle}
            title={t.settings.support}
            colors={colors}
            showArrow
            onPress={handleSupport}
          />
          <SettingsRow
            icon={Info}
            title={t.settings.aboutApp}
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
          {t.settings.aboutSection}
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            title={t.common.version}
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
            title={t.profile.logout}
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
  languageToggle: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
