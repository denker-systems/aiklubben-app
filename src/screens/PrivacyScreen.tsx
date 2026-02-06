import React from 'react';
import { ScreenWrapper } from '@/components/layout';
import { Text } from '@/components/ui';
import { View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export const PrivacyScreen = () => {
  console.log('[PrivacyScreen] Rendered');
  const { t } = useLanguage();
  
  return (
    <ScreenWrapper title={t.privacy.title} showBack>
      <View style={{ gap: 24 }}>
        <Section title={t.privacy.privacyTitle}>
          {t.privacy.privacyText}
        </Section>
        <Section title={t.privacy.dataTitle}>
          {t.privacy.dataText}
        </Section>
        <Section title={t.privacy.usageTitle}>
          {t.privacy.usageText}
        </Section>
        <Section title={t.privacy.rightsTitle}>
          {t.privacy.rightsText}
        </Section>
      </View>
    </ScreenWrapper>
  );
};

const Section = ({ title, children }: any) => (
  <View>
    <Text variant="h3" weight="bold" style={{ marginBottom: 8 }}>
      {title}
    </Text>
    <Text variant="body" className="text-muted-foreground" style={{ lineHeight: 22 }}>
      {children}
    </Text>
  </View>
);
