import React from 'react';
import { ScreenWrapper } from '@/components/layout';
import { Text, Card, Button, Input } from '@/components/ui';
import { View, StyleSheet, Linking } from 'react-native';
import { Mail, MessageCircle } from 'lucide-react-native';
import { brandColors } from '@/config/theme';

export const SupportScreen = () => {
  console.log('[SupportScreen] Rendered');
  
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');

  return (
    <ScreenWrapper title="Support" showBack>
      <View style={styles.container}>
        <Text variant="h2" style={{ marginBottom: 12 }}>
          Hur kan vi hjälpa dig?
        </Text>
        <Text variant="body" className="text-muted-foreground" style={{ marginBottom: 32 }}>
          Har du frågor eller behöver hjälp med appen? Kontakta oss via någon av kanalerna nedan.
        </Text>

        <View style={styles.grid}>
          <SupportCard
            icon={Mail}
            title="E-post"
            description="Skicka ett mejl till oss"
            onPress={() => Linking.openURL('mailto:support@aiklubben.nu')}
          />
          <SupportCard
            icon={MessageCircle}
            title="Chatt"
            description="Prata med vår AI-bot"
            onPress={() => {}}
          />
        </View>

        <Card variant="glass" style={styles.formCard}>
          <Text variant="h3" weight="bold" style={{ marginBottom: 16 }}>
            Skicka ett meddelande
          </Text>
          <Input
            label="Ämne"
            placeholder="Vad gäller ditt ärende?"
            value={subject}
            onChangeText={setSubject}
          />
          <Input
            label="Meddelande"
            placeholder="Beskriv ditt problem..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            style={{ height: 100 }}
          />
          <Button variant="primary" style={{ marginTop: 16 }}>
            Skicka
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
