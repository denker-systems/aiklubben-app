import React from 'react';
import { ScreenWrapper } from '@/components/layout';
import { Text, Card } from '@/components/ui';
import { View, StyleSheet } from 'react-native';
import { brandColors } from '@/config/theme';

export const AboutScreen = () => {
  return (
    <ScreenWrapper title="Om AI Klubben" showBack>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text variant="h1" style={styles.logoText}>
            AI
          </Text>
        </View>
        <Text variant="h1" weight="bold">
          AI Klubben
        </Text>
        <Text variant="body" className="text-muted-foreground">
          Version 1.0.0
        </Text>
      </View>

      <Card variant="glass" style={styles.card}>
        <Text variant="h3" weight="bold" style={{ marginBottom: 12 }}>
          Vår Vision
        </Text>
        <Text variant="body" className="text-muted-foreground" style={{ lineHeight: 24 }}>
          AI Klubben skapades med målet att demokratisera tillgången till kunskap om artificiell
          intelligens. Vi tror att AI är ett kraftfullt verktyg som bör vara tillgängligt för alla,
          inte bara tekniska experter.
        </Text>
      </Card>

      <Card variant="glass" style={styles.card}>
        <Text variant="h3" weight="bold" style={{ marginBottom: 12 }}>
          Vad vi erbjuder
        </Text>
        <Text variant="body" className="text-muted-foreground" style={{ lineHeight: 24 }}>
          Genom vår plattform erbjuder vi kurerat innehåll, utbildningsmaterial och ett community
          för alla som vill utforska möjligheterna med AI i sin vardag och sitt arbete.
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
