import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text, Input, StepIndicator } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { brandColors } from '@/config/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { usePrivacyAgreement } from '@/hooks/usePrivacyAgreement';
import type { PrivacySection } from '@/hooks/usePrivacyAgreement';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const TOTAL_STEPS = 4;

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { t, locale } = useLanguage();
  const { signUp } = useAuth();
  const privacy = usePrivacyAgreement(locale);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showFullAgreement, setShowFullAgreement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bg = isDark
    ? [brandColors.deepDark, '#1a1040', brandColors.darkBg]
    : ['#F8F7FF', '#EDE9FE', '#F3F0FF'];
  const textColor = colors.text.primary;
  const subtextColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';

  const goBack = useCallback(() => {
    if (step === 0) {
      navigation.goBack();
    } else {
      setError(null);
      setStep((s) => s - 1);
    }
  }, [step, navigation]);

  const goNext = useCallback(() => {
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step === 0 && !name.trim()) {
      setError(t.auth.nameRequired);
      return;
    }
    if (step === 1 && !email.trim()) {
      setError(t.auth.emailRequired);
      return;
    }
    if (step === 2 && password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }
    setStep((s) => s + 1);
  }, [step, name, email, password, t]);

  const handleSignup = useCallback(async () => {
    if (!agreed) {
      setError(t.auth.mustAgreePrivacy);
      return;
    }
    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const { error: authError } = await signUp(email.trim(), password, {
        name: name.trim(),
      });
      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError(t.auth.unexpectedError);
    } finally {
      setLoading(false);
    }
  }, [agreed, email, password, name, signUp, t]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepContent
            key="name"
            icon={require('../../../assets/icons/profile.png')}
            title={t.auth.whatsYourName}
            textColor={textColor}
          >
            <Input
              value={name}
              onChangeText={setName}
              placeholder={t.auth.namePlaceholder}
              autoCapitalize="words"
              autoFocus
              error={error ?? undefined}
              onSubmitEditing={goNext}
              returnKeyType="next"
            />
          </StepContent>
        );
      case 1:
        return (
          <StepContent key="email" emoji="📧" title={t.auth.whatsYourEmail} textColor={textColor}>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder={t.auth.emailPlaceholder}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
              error={error ?? undefined}
              onSubmitEditing={goNext}
              returnKeyType="next"
            />
          </StepContent>
        );
      case 2:
        return (
          <StepContent
            key="password"
            emoji="🔒"
            title={t.auth.choosePassword}
            textColor={textColor}
          >
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoFocus
              error={error ?? undefined}
              onSubmitEditing={goNext}
              returnKeyType="next"
            />
            <Text variant="body-sm" style={[styles.hint, { color: subtextColor }]}>
              {t.auth.passwordHint}
            </Text>
          </StepContent>
        );
      case 3:
        return (
          <PrivacyStep
            t={t}
            agreed={agreed}
            setAgreed={setAgreed}
            showFull={showFullAgreement}
            setShowFull={setShowFullAgreement}
            error={error}
            textColor={textColor}
            subtextColor={subtextColor}
            cardBg={cardBg}
            isDark={isDark}
            colors={colors}
            sections={privacy.sections}
            lastUpdated={privacy.lastUpdated}
            privacyLoading={privacy.loading}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <LinearGradient colors={bg as [string, string, string]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={goBack} style={styles.backButton}>
              <ChevronLeft size={24} color={textColor} />
            </Pressable>
            <StepIndicator
              total={TOTAL_STEPS}
              current={step}
              inactiveColor={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
            />
            <View style={styles.backButton} />
          </View>

          {/* Step content */}
          <View style={styles.stepArea}>{renderStep()}</View>

          {/* Bottom button */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 300 }}
          >
            <View style={styles.buttonWrapper}>
              <Pressable onPress={isLastStep ? handleSignup : goNext} disabled={loading}>
                <LinearGradient
                  colors={[brandColors.purple, brandColors.darkPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.nextButton, loading && styles.buttonDisabled]}
                >
                  <Text variant="body-lg" weight="bold" style={styles.nextText}>
                    {isLastStep ? t.auth.createAccount : t.start.next}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// --- Step Content Wrapper ---

interface StepContentProps {
  emoji?: string;
  icon?: ImageSourcePropType;
  title: string;
  textColor: string;
  children: React.ReactNode;
}

const StepContent: React.FC<StepContentProps> = ({ emoji, icon, title, textColor, children }) => (
  <MotiView
    from={{ opacity: 0, translateY: 30 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={SPRING_CONFIGS.smooth}
    style={styles.stepInner}
  >
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_CONFIGS.bouncy, delay: 100 }}
    >
      {icon ? (
        <Image source={icon} style={styles.stepIcon} resizeMode="contain" />
      ) : (
        <Text style={styles.emoji}>{emoji}</Text>
      )}
    </MotiView>
    <Text variant="h2" weight="bold" style={[styles.stepTitle, { color: textColor }]}>
      {title}
    </Text>
    <View style={styles.inputArea}>{children}</View>
  </MotiView>
);

// --- Privacy Step ---

interface PrivacyStepProps {
  t: any;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
  showFull: boolean;
  setShowFull: (v: boolean) => void;
  error: string | null;
  textColor: string;
  subtextColor: string;
  cardBg: string;
  isDark: boolean;
  colors: any;
  sections: PrivacySection[];
  lastUpdated: string | null;
  privacyLoading: boolean;
}

const PrivacyStep: React.FC<PrivacyStepProps> = ({
  t,
  agreed,
  setAgreed,
  showFull,
  setShowFull,
  error,
  textColor,
  subtextColor,
  cardBg,
  isDark,
  colors,
  sections,
  lastUpdated,
  privacyLoading,
}) => (
  <MotiView
    from={{ opacity: 0, translateY: 30 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={SPRING_CONFIGS.smooth}
    style={styles.privacyContainer}
  >
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_CONFIGS.bouncy, delay: 100 }}
      style={styles.shieldIcon}
    >
      <Image
        source={require('../../../assets/icons/profile.png')}
        style={styles.stepIcon}
        resizeMode="contain"
      />
    </MotiView>
    <Text variant="h2" weight="bold" style={[styles.stepTitle, { color: textColor }]}>
      {t.auth.privacyTitle}
    </Text>
    <Text variant="body" style={[styles.privacyIntro, { color: subtextColor }]}>
      {t.auth.privacyIntro}
    </Text>

    {/* Agreement from DB */}
    <View style={[styles.agreementCard, { backgroundColor: cardBg }]}>
      {privacyLoading ? (
        <View style={styles.loadingAgreement}>
          <ActivityIndicator size="small" color={brandColors.purple} />
        </View>
      ) : (
        <ScrollView
          style={showFull ? styles.agreementScrollFull : styles.agreementScrollPreview}
          showsVerticalScrollIndicator
        >
          {sections.map((section, i) => (
            <View key={i} style={styles.agreementSection}>
              <Text variant="body-sm" weight="bold" style={{ color: textColor, marginBottom: 4 }}>
                {section.title}
              </Text>
              <Text variant="body-sm" style={{ color: subtextColor, lineHeight: 20 }}>
                {section.body}
              </Text>
            </View>
          ))}
          {lastUpdated && (
            <Text variant="caption" style={[styles.lastUpdated, { color: subtextColor }]}>
              {lastUpdated}
            </Text>
          )}
        </ScrollView>
      )}
    </View>

    {!showFull && !privacyLoading && (
      <Pressable onPress={() => setShowFull(true)}>
        <Text variant="body-sm" weight="bold" style={styles.readMoreLink}>
          {t.auth.privacyReadMore}
        </Text>
      </Pressable>
    )}

    {/* Checkbox */}
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setAgreed(!agreed);
      }}
      style={styles.checkboxRow}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: agreed
              ? brandColors.purple
              : isDark
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(0,0,0,0.15)',
            backgroundColor: agreed ? brandColors.purple : 'transparent',
          },
        ]}
      >
        {agreed && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
      </View>
      <Text variant="body-sm" style={[styles.checkboxLabel, { color: textColor }]}>
        {t.auth.privacyAgree}
      </Text>
    </Pressable>

    {error && (
      <Text variant="body-sm" style={[styles.errorText, { color: colors.error || '#EF4444' }]}>
        {error}
      </Text>
    )}
  </MotiView>
);

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepArea: {
    flex: 1,
    justifyContent: 'center',
  },
  stepInner: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepIcon: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 24,
  },
  inputArea: {
    width: '100%',
  },
  hint: {
    textAlign: 'center',
    marginTop: 8,
  },
  buttonWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  // Privacy step
  privacyContainer: {
    flex: 1,
  },
  shieldIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  privacyIntro: {
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  agreementCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  loadingAgreement: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreementScrollPreview: {
    maxHeight: 160,
  },
  agreementScrollFull: {
    maxHeight: 300,
  },
  agreementSection: {
    marginBottom: 14,
  },
  lastUpdated: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  readMoreLink: {
    color: brandColors.purple,
    textAlign: 'center',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
});
