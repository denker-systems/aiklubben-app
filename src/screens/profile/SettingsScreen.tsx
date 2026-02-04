import React from 'react';
import { ScreenWrapper } from '@/components/layout';
import { Text, Card } from '@/components/ui';
import { View, StyleSheet, Switch } from 'react-native';
import { brandColors } from '@/config/theme';
import { Bell, Lock, Eye, Moon, CircleUser, ChevronRight } from 'lucide-react-native';

export const SettingsScreen = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);

  return (
    <ScreenWrapper title="Inställningar" showBack>
      <View style={styles.section}>
        <Text variant="tiny" weight="bold" style={styles.sectionTitle}>
          APP-INSTÄLLNINGAR
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            icon={Bell}
            title="Aviseringar"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: brandColors.purple }}
              />
            }
          />
          <SettingsRow
            icon={Moon}
            title="Mörkt läge"
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ true: brandColors.purple }}
              />
            }
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="tiny" weight="bold" style={styles.sectionTitle}>
          KONTO & SÄKERHET
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow icon={CircleUser} title="Profilinställningar" showArrow />
          <SettingsRow icon={Lock} title="Byt lösenord" showArrow />
          <SettingsRow icon={Eye} title="Integritetsinställningar" showArrow />
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="tiny" weight="bold" style={styles.sectionTitle}>
          OM APPEN
        </Text>
        <Card variant="glass" noPadding>
          <SettingsRow
            title="Version"
            right={
              <Text variant="body-sm" className="text-muted-foreground">
                1.0.0
              </Text>
            }
          />
        </Card>
      </View>
    </ScreenWrapper>
  );
};

const SettingsRow = ({ icon: Icon, title, right, showArrow }: any) => (
  <View style={styles.row}>
    <View style={styles.rowContent}>
      {Icon && (
        <View style={styles.iconContainer}>
          <Icon size={20} color={brandColors.purple} />
        </View>
      )}
      <Text variant="body" weight="medium">
        {title}
      </Text>
    </View>
    {right}
    {showArrow && <ChevronRight size={20} color="#4B5563" />}
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#9CA3AF',
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    marginRight: 12,
  },
});
