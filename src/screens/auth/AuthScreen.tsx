import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { brandColors } from '@/config/theme';
import { ScreenWrapper } from '@/components/layout';
import { Text, Button, Input } from '@/components/ui';

export const AuthScreen = () => {
  console.log('[AuthScreen] Rendered');
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    console.log('[AuthScreen] handleAuth', { isLogin, email });
    
    if (!email || !password) {
      console.warn('[AuthScreen] Missing email or password');
      setError('Vänligen fyll i alla fält');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[AuthScreen] Attempting', isLogin ? 'sign in' : 'sign up');
      const { error: authError } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password, { name: email.split('@')[0] });

      if (authError) {
        console.error('[AuthScreen] Auth error:', authError.message);
        setError(authError.message);
      } else {
        console.log('[AuthScreen] Auth successful');
      }
    } catch (err) {
      console.error('[AuthScreen] Unexpected error:', err);
      setError('Ett oväntat fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper noPadding scrollable={false} contentStyle={{ justifyContent: 'center', flex: 1 }}>
      <View style={{ paddingHorizontal: 32 }}>
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Image
            source={require('../../../assets/logo.png')}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>

        <View>
          <Input
            label="E-post"
            value={email}
            onChangeText={setEmail}
            placeholder="din@epost.se"
            autoCapitalize="none"
            keyboardType="email-address"
            error={error && error.includes('e-post') ? error : undefined}
          />

          <Input
            label="Lösenord"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={error && error.includes('lösenord') ? error : undefined}
          />

          {error && !error.includes('e-post') && !error.includes('lösenord') && (
            <Text variant="body-sm" style={{ color: '#EF4444', textAlign: 'center', marginBottom: 16 }}>
              {error}
            </Text>
          )}

          <Button
            variant="primary"
            size="lg"
            onPress={handleAuth}
            loading={loading}
            style={{ marginTop: 24 }}
          >
            {isLogin ? 'Logga in' : 'Skapa konto'}
          </Button>

          <Button variant="ghost" onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 16 }}>
            {isLogin ? 'Har du inget konto? Registrera dig' : 'Har du redan ett konto? Logga in'}
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
};
