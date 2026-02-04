import React from 'react';
import { ScreenWrapper } from '@/components/layout';
import { Text } from '@/components/ui';
import { View } from 'react-native';

export const PrivacyScreen = () => {
  return (
    <ScreenWrapper title="Integritetspolicy" showBack>
      <View style={{ gap: 24 }}>
        <Section title="Vår inställning till integritet">
          AI Klubben värnar om din integritet. Vi samlar endast in den information som är nödvändig
          för att tillhandahålla våra tjänster och förbättra din upplevelse.
        </Section>
        <Section title="Data vi samlar in">
          Vi samlar in information som du tillhandahåller direkt, till exempel när du skapar ett
          konto eller kontaktar supporten. Detta inkluderar namn, e-postadress och
          användarstatistik.
        </Section>
        <Section title="Hur vi använder din data">
          Din data används för att personalisera ditt innehåll, skicka viktiga uppdateringar och
          analysera användningen av appen för att kunna göra förbättringar.
        </Section>
        <Section title="Dina rättigheter">
          Du har rätt att begära utdrag av din data, rätta felaktig information eller begära att din
          data raderas permanent från våra system.
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
