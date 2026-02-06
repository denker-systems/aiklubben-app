import React from 'react';
import { ScreenWrapper } from '@/components/layout';
import { Text, Card, Button, Input } from '@/components/ui';
import { View, StyleSheet, Linking } from 'react-native';
import { Mail, MessageCircle } from 'lucide-react-native';
import { brandColors } from '@/config/theme';
import { useLanguage } from '@/contexts/LanguageContext';

export const SupportScreen = () => {
  console.log('[SupportScreen] Rendered');
  const { t } = useLanguage();
  
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');

  return (
    <ScreenWrapper title={t.supportScreen.title} showBack>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>
          {t.supportScreen.heading}
        </Text>
        <Text variant="body" className="text-muted-foreground" style={{ marginBottom: 32 }}>
          {t.supportScreen.description}
        </Text>

        <View style={styles.grid}>
          <SupportCard
            icon={Mail}
            title={t.supportScreen.emailTitle}
            description={t.supportScreen.emailDescription}
            onPress={() => Linking.openURL('mailto:support@aiklubben.nu')}
          />
          <SupportCard
            icon={MessageCircle}
            title={t.supportScreen.chatTitle}
            description={t.supportScreen.chatDescription}
            onPress={() => {}}
          />
        </View>

        <Card variant="glass" style={styles.formCard}>
          <Text variant="h3" weight="bold" style={{ marginBottom: 16 }}>
            {t.supportScreen.sendMessage}
          </Text>
          <Input
            label={t.supportScreen.subject}
            placeholder={t.supportScreen.subjectPlaceholder}
            value={subject}
            onChangeText={setSubject}
          />
          <Input
            label={t.supportScreen.message}
            placeholder={t.supportScreen.messagePlaceholder}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            style={{ height: 100 }}
          />
          <Button variant="primary" style={{ marginTop: 16 }}>
            {t.common.send}
          </Button>
        </Card>
      </View>
    </ScreenWrapper>
  );
};

const SupportCard = ({ icon: Icon, title, description, onPress }: any) => (
  <Card variant="glass" onPress={onPress} style={styles.card}>
    <View style={styles.iconBox}>
      <Icon size={24} color={brandColors.purple} />
    </View>
    <Text variant="body" weight="bold">
      {title}
    </Text>
    <Text
      variant="tiny"
      className="text-muted-foreground"
      style={{ textAlign: 'center', marginTop: 4 }}
    >
      {description}
    </Text>
  </Card>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  formCard: {
    padding: 24,
  },
});
