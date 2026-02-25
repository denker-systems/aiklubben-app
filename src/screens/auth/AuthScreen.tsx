import React, { useMemo, useState } from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ScreenWrapper } from '@/components/layout';
import { Text, Button, Input } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

// Logo variants: [locale][theme]
const LOGOS: Record<string, Record<string, ImageSourcePropType>> = {
  sv: {
    dark: require('../../../assets/logo.png'),
    light: require('../../../assets/logo-light.png'),
  },
  en: {
    dark: require('../../../assets/logo-eng.png'),
    light: require('../../../assets/logo-eng-light.png'),
  },
};

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'> & {
  onGuestMode?: () => void;
};

export const AuthScreen: React.FC<Props> = ({ navigation, onGuestMode }) => {
  console.log('[AuthScreen] Rendered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const { isDark, colors } = useTheme();
  const { t, locale } = useLanguage();

  const logoSource = useMemo(
    () => LOGOS[locale]?.[isDark ? 'dark' : 'light'] ?? LOGOS.sv.dark,
    [locale, isDark],
  );

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t.auth.fillAllFields);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError(t.auth.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      noPadding
      scrollable={false}
      contentStyle={{ justifyContent: 'center', flex: 1 }}
    >
      <View style={{ paddingHorizontal: 32 }}>
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Image source={logoSource} style={{ width: 200, height: 200 }} resizeMode="contain" />
        </View>

        <View>
          <Input
            label={t.auth.email}
            value={email}
            onChangeText={setEmail}
            placeholder={t.auth.emailPlaceholder}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label={t.auth.password}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {error && (
            <Text
              variant="body-sm"
              style={{ color: colors.error || '#EF4444', textAlign: 'center', marginBottom: 16 }}
            >
              {error}
            </Text>
          )}

          <Button
            variant="primary"
            size="lg"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 24 }}
          >
            {t.auth.login}
          </Button>

          <Button
            variant="ghost"
            onPress={() => navigation.navigate('Signup')}
            style={{ marginTop: 16 }}
          >
            {t.auth.noAccount}
          </Button>

          {onGuestMode && (
            <Button variant="ghost" onPress={onGuestMode} style={{ marginTop: 8 }}>
              {t.auth.continueAsGuest}
            </Button>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};
