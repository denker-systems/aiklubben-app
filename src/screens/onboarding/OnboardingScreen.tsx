import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useFeedback } from '@/hooks/useFeedback';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Text, StepIndicator } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { brandColors } from '@/config/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingStep {
  icon: ImageSourcePropType;
  titleKey: string;
  subtitleKey: string;
  gradient: readonly [string, string];
  iconBg: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: require('../../../assets/icons/news.png'),
    titleKey: 'step1Title',
    subtitleKey: 'step1Subtitle',
    gradient: ['#3B82F6', '#1D4ED8'],
    iconBg: 'rgba(59, 130, 246, 0.15)',
  },
  {
    icon: require('../../../assets/icons/courses.png'),
    titleKey: 'step2Title',
    subtitleKey: 'step2Subtitle',
    gradient: [brandColors.purple, brandColors.darkPurple],
    iconBg: 'rgba(139, 92, 246, 0.15)',
  },
  {
    icon: require('../../../assets/icons/goal.png'),
    titleKey: 'step3Title',
    subtitleKey: 'step3Subtitle',
    gradient: [brandColors.teal, brandColors.darkTeal],
    iconBg: 'rgba(45, 212, 191, 0.15)',
  },
  {
    icon: require('../../../assets/icons/profile.png'),
    titleKey: 'step4Title',
    subtitleKey: 'step4Subtitle',
    gradient: [brandColors.pink, brandColors.darkPink],
    iconBg: 'rgba(236, 72, 153, 0.15)',
  },
  {
    icon: require('../../../assets/icons/xp.png'),
    titleKey: 'step5Title',
    subtitleKey: 'step5Subtitle',
    gradient: [brandColors.orange, '#DC6B09'],
    iconBg: 'rgba(249, 115, 22, 0.15)',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const { feedbackTap, feedbackCelebrate } = useFeedback();

  const isLastStep = currentStep === STEPS.length - 1;
  const stepData = STEPS[currentStep];

  const markOnboardingDone = useCallback(async () => {
    if (user) {
      await supabase.from('profiles').update({ has_done_onboarding: true }).eq('id', user.id);
    }
    onComplete();
  }, [user, onComplete]);

  const handleNext = useCallback(async () => {
    if (isLastStep) {
      feedbackCelebrate();
      await markOnboardingDone();
    } else {
      feedbackTap();
      setCurrentStep((s) => s + 1);
    }
  }, [isLastStep, markOnboardingDone, feedbackTap, feedbackCelebrate]);

  const handleSkip = useCallback(async () => {
    feedbackTap();
    await markOnboardingDone();
  }, [markOnboardingDone, feedbackTap]);

  const bg = isDark
    ? [brandColors.deepDark, '#1a1040', brandColors.darkBg]
    : ['#F8F7FF', '#EDE9FE', '#F3F0FF'];
  const textColor = colors.text.primary;
  const subtextColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  const pillBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <LinearGradient colors={bg as [string, string, string]} style={styles.container}>
      <View
        style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]}
      >
        {/* Skip button */}
        {!isLastStep && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING_CONFIGS.smooth, delay: 600 }}
            style={styles.skipRow}
          >
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text
                variant="body-sm"
                style={[
                  styles.skipText,
                  { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' },
                ]}
              >
                {t.onboarding.skip}
              </Text>
            </Pressable>
          </MotiView>
        )}

        {/* Main content area */}
        <View style={styles.mainContent}>
          <OnboardingStepView
            key={currentStep}
            step={stepData}
            t={t}
            isLast={isLastStep}
            textColor={textColor}
            subtextColor={subtextColor}
            pillBg={pillBg}
          />
        </View>

        {/* Bottom: indicator + button */}
        <View style={styles.bottomArea}>
          <StepIndicator
            total={STEPS.length}
            current={currentStep}
            inactiveColor={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
          />
          <View style={styles.buttonWrapper}>
            <Pressable onPress={handleNext}>
              <LinearGradient
                colors={stepData.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextButton}
              >
                <Text variant="body-lg" weight="bold" style={styles.nextText}>
                  {isLastStep ? t.onboarding.letsGo : t.onboarding.next}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

// --- Step View ---

interface OnboardingStepViewProps {
  step: OnboardingStep;
  t: any;
  isLast: boolean;
  textColor: string;
  subtextColor: string;
  pillBg: string;
}

const OnboardingStepView: React.FC<OnboardingStepViewProps> = ({
  step,
  t,
  isLast,
  textColor,
  subtextColor,
  pillBg,
}) => (
  <View style={styles.stepContainer}>
    {/* Decorative gradient circle behind emoji */}
    <MotiView
      from={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_CONFIGS.celebratory, delay: 100 }}
      style={styles.emojiWrapper}
    >
      <Image source={step.icon} style={styles.stepIcon} resizeMode="contain" />
    </MotiView>

    {/* Decorative floating dots */}
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ ...SPRING_CONFIGS.smooth, delay: 300 }}
      style={styles.decorDots}
    >
      {[...Array(6)].map((_, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_CONFIGS.bouncy, delay: 400 + i * 60 }}
          style={[
            styles.decorDot,
            {
              backgroundColor: step.gradient[0],
              left: `${15 + ((i * 37) % 70)}%`,
              top: `${10 + ((i * 23) % 60)}%`,
              width: 6 + (i % 3) * 4,
              height: 6 + (i % 3) * 4,
              borderRadius: 3 + (i % 3) * 2,
            },
          ]}
        />
      ))}
    </MotiView>

    {/* Title */}
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ ...SPRING_CONFIGS.smooth, delay: 250 }}
    >
      <Text variant="h1" weight="bold" style={[styles.stepTitle, { color: textColor }]}>
        {(t.onboarding as any)[step.titleKey]}
      </Text>
    </MotiView>

    {/* Subtitle */}
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ ...SPRING_CONFIGS.smooth, delay: 400 }}
    >
      <Text variant="body" style={[styles.stepSubtitle, { color: subtextColor }]}>
        {(t.onboarding as any)[step.subtitleKey]}
      </Text>
    </MotiView>

    {/* Feature pills for last step */}
    {isLast && (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ ...SPRING_CONFIGS.smooth, delay: 550 }}
        style={styles.featurePills}
      >
        {[
          require('../../../assets/icons/news.png'),
          require('../../../assets/icons/courses.png'),
          require('../../../assets/icons/goal.png'),
          require('../../../assets/icons/profile.png'),
        ].map((src, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_CONFIGS.bouncy, delay: 650 + i * 80 }}
            style={[styles.featurePill, { backgroundColor: pillBg }]}
          >
            <Image source={src} style={styles.featurePillIcon} resizeMode="contain" />
          </MotiView>
        ))}
      </MotiView>
    )}
  </View>
);

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingVertical: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {},
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  emojiWrapper: {
    marginBottom: 24,
  },
  stepIcon: {
    width: 140,
    height: 140,
  },
  decorDots: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  decorDot: {
    position: 'absolute',
    opacity: 0.3,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 32,
  },
  stepSubtitle: {
    textAlign: 'center',
    paddingHorizontal: 16,
    fontSize: 17,
    lineHeight: 26,
  },
  featurePills: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  featurePill: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featurePillIcon: {
    width: 32,
    height: 32,
  },
  bottomArea: {
    gap: 24,
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});
