import React from 'react';
import { ScreenWrapper } from '@/components/layout';
import { Text, Card } from '@/components/ui';
import { View, StyleSheet } from 'react-native';
import { brandColors } from '@/config/theme';
import { useLanguage } from '@/contexts/LanguageContext';

export const AboutScreen = () => {
  console.log('[AboutScreen] Rendered');
  const { t } = useLanguage();

  return (
    <ScreenWrapper title={t.about.title} showBack>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text variant="h1" style={styles.logoText}>
            AI
          </Text>
        </View>
        <Text variant="h1" weight="bold">
          {t.about.appName}
        </Text>
        <Text variant="body" className="text-muted-foreground">
          Version 1.0.0
        </Text>
      </View>

      <Card variant="glass" style={styles.card}>
        <Text variant="h3" weight="bold" style={{ marginBottom: 12 }}>
          {t.about.visionTitle}
        </Text>
        <Text variant="body" className="text-muted-foreground" style={{ lineHeight: 24 }}>
          {t.about.visionText}
        </Text>
      </Card>

      <Card variant="glass" style={styles.card}>
        <Text variant="h3" weight="bold" style={{ marginBottom: 12 }}>
          {t.about.offerTitle}
        </Text>
        <Text variant="body" className="text-muted-foreground" style={{ lineHeight: 24 }}>
          {t.about.offerText}
        </Text>
      </Card>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  logoText: {
    color: brandColors.purple,
    fontSize: 40,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
    padding: 24,
  },
});
